/**
 * PdfViewport — the document rendering surface, backed by react-native-pdf-light
 * (per-page native views we lay out ourselves, so we own scroll offset, page rects
 * and the zoom transform). Concrete implementation behind the reader's rendering
 * seam; the screen/hook/store/controls drive it through PdfViewportProps.
 *
 * Requires a dev build (native module) — does NOT run in Expo Go.
 *
 * Zoom model: a center-anchored scale + screen-space pan, driven by the SAME
 * `zoom`/`pan` the +/- buttons and the two-finger pinch/pan gestures feed. The
 * exact-same transform is mirrored onto the Skia stroke overlay (DrawingCanvas) so
 * saved strokes track the page under zoom + pan. One-finger drags stay with the
 * native scroller (scroll / page-turn); two fingers zoom and move — no conflict.
 *
 * Continuous = the library's vertical `Pdf` scroller (horizontal pan only — vertical
 * is the scroll axis); horizontal/book = a paged horizontal FlatList of single
 * `PdfView` pages (2-D pan); draw mode (frozen) = a single fit page beneath the
 * stroke overlay (center zoom, no pan — the overlay owns the pinch there).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Pdf, PdfUtil, PdfView, type PageMeasurement, type PdfRef } from 'react-native-pdf-light';

import { useTheme } from '@/hooks/use-theme';
import type { ReaderScrollMode } from '@/store/reader.store';
import type { PdfFile } from '@/types/domain';
import { clamp } from '@/utils/format';

import { ZOOM } from '../hooks/use-reader';

export interface PdfViewportProps {
  document: PdfFile;
  /** Controlled page (1-based) — jumps the renderer when changed via controls. */
  page: number;
  /** Controlled zoom (1..3) — driven by the zoom controls + pinch gesture. */
  zoom: number;
  /** Controlled pan offset (screen px) of the zoomed page. */
  panX: number;
  panY: number;
  scrollMode: ReaderScrollMode;
  /** Freeze scrolling (draw mode) so the stroke overlay maps to a stable page. */
  frozen?: boolean;
  /** Renderer reported a new zoom (pinch). */
  onZoomChange: (zoom: number) => void;
  /** Two-finger pan moved the zoomed page. */
  onPanChange: (x: number, y: number) => void;
  /** Renderer scrolled/paged to a different page. */
  onPageChange: (page: number) => void;
  /** Renderer finished loading and knows the page count. */
  onLoadComplete: (pageCount: number) => void;
  /** Single tap on the page — used to toggle the reader chrome. */
  onTap?: () => void;
  onError?: (message: string) => void;
}

export function PdfViewport({
  document,
  page,
  zoom,
  panX,
  panY,
  scrollMode,
  frozen = false,
  onZoomChange,
  onPanChange,
  onPageChange,
  onLoadComplete,
  onTap,
  onError,
}: PdfViewportProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const source = document.uri;

  const pdfRef = useRef<PdfRef>(null);
  const listRef = useRef<FlatList<number>>(null);
  const measurements = useRef<PageMeasurement[]>([]);
  // Guards the deliberate-jump vs reported-scroll feedback loop.
  const reportedPage = useRef(page);

  const [pageCount, setPageCount] = useState(document.pageCount ?? 0);

  const isVertical = scrollMode === 'continuous' && !frozen;

  // How far the magnified page may be dragged before its edges enter the frame.
  const maxPanX = Math.max(0, ((zoom - 1) * width) / 2);
  const maxPanY = Math.max(0, ((zoom - 1) * height) / 2);

  // Latest values for the gesture worklets/JS callbacks (read synchronously).
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const pinchStart = useRef(zoom);
  const panRef = useRef({ x: panX, y: panY });
  panRef.current = { x: panX, y: panY };
  const panStart = useRef({ x: panX, y: panY });
  const boundsRef = useRef({ x: maxPanX, y: maxPanY, vertical: isVertical });
  boundsRef.current = { x: maxPanX, y: maxPanY, vertical: isVertical };

  // Page count for the paged renderer (vertical's <Pdf> learns it via onLoadComplete).
  useEffect(() => {
    let active = true;
    void PdfUtil.getPageCount(source)
      .then((count) => {
        if (!active || !count) return;
        setPageCount(count);
        onLoadComplete(count);
      })
      .catch((e: unknown) => onError?.(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, [source, onLoadComplete, onError]);

  // Keep the stored pan within bounds as zoom changes — snaps back to 0 at zoom 1
  // (no panning an un-zoomed page) and re-clamps when zooming out.
  useEffect(() => {
    const cx = clamp(panX, -maxPanX, maxPanX);
    const cy = isVertical ? 0 : clamp(panY, -maxPanY, maxPanY);
    if (cx !== panX || cy !== panY) onPanChange(cx, cy);
  }, [zoom, maxPanX, maxPanY, panX, panY, isVertical, onPanChange]);

  const reportPage = useCallback(
    (next: number) => {
      if (next >= 1 && next !== reportedPage.current) {
        reportedPage.current = next;
        onPageChange(next);
      }
    },
    [onPageChange],
  );

  // Deliberate jump (controls/bookmarks) → scroll the active renderer there.
  useEffect(() => {
    if (page === reportedPage.current) return;
    reportedPage.current = page;
    if (isVertical) pdfRef.current?.scrollToIndex(page - 1);
    else listRef.current?.scrollToIndex({ index: page - 1, animated: false });
  }, [page, isVertical]);

  // Vertical: derive current page from scroll offset vs measured page offsets.
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const pages = measurements.current;
      if (!pages.length) return;
      let current = 1;
      for (let i = 0; i < pages.length; i++) {
        if (y + 1 >= pages[i].offset) current = i + 1;
        else break;
      }
      reportPage(current);
    },
    [reportPage],
  );

  // Paged: current page from the settled horizontal offset.
  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      reportPage(Math.round(e.nativeEvent.contentOffset.x / width) + 1);
    },
    [reportPage, width],
  );

  const onPdfError = useCallback(
    (e: Error) => onError?.(e.message),
    [onError],
  );

  // Two-finger pinch (zoom) + two-finger pan (move), composed simultaneously. Both
  // need 2 pointers, so 1-finger scroll / page-turn / tap pass straight through to
  // the native scroller and the Pressable. Pinch and pan feed the SAME shared
  // zoom/pan the controls use and the stroke overlay mirrors.
  const gesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onStart(() => {
        pinchStart.current = zoomRef.current;
      })
      .onUpdate((e) => {
        onZoomChange(clamp(pinchStart.current * e.scale, ZOOM.min, ZOOM.max));
      });

    const pan = Gesture.Pan()
      .runOnJS(true)
      .minPointers(2)
      .onStart(() => {
        panStart.current = panRef.current;
      })
      .onUpdate((e) => {
        const b = boundsRef.current;
        const nx = clamp(panStart.current.x + e.translationX, -b.x, b.x);
        const ny = b.vertical ? 0 : clamp(panStart.current.y + e.translationY, -b.y, b.y);
        onPanChange(nx, ny);
      });

    return Gesture.Simultaneous(pinch, pan);
  }, [onZoomChange, onPanChange]);

  const background = { backgroundColor: colors.background };
  // Center-anchored scale (RN's default transform origin) + screen-space pan — the
  // exact transform DrawingCanvas mirrors so the page and strokes move together.
  // Continuous pans horizontally only (vertical is the scroll axis).
  const verticalZoomStyle = { transform: [{ translateX: panX }, { scale: zoom }] };
  const pageZoomStyle = { transform: [{ translateX: panX }, { translateY: panY }, { scale: zoom }] };

  // Draw mode: a single fit page beneath the stroke overlay (rendered by the screen).
  // The overlay owns the pinch here; the page just mirrors `zoom` (center-anchored,
  // no pan) so the two stay aligned while drawing.
  if (frozen) {
    return (
      <View style={[styles.viewport, background]}>
        <PdfView source={source} page={page - 1} resizeMode="contain" style={{ flex: 1, transform: [{ scale: zoom }] }} />
      </View>
    );
  }

  if (isVertical) {
    return (
      <GestureDetector gesture={gesture}>
        <Pressable style={[styles.viewport, background, verticalZoomStyle]} onPress={onTap}>
          <Pdf
            ref={pdfRef}
            source={source}
            onLoadComplete={onLoadComplete}
            onMeasurePages={(m) => (measurements.current = m)}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onError={onPdfError}
          />
        </Pressable>
      </GestureDetector>
    );
  }

  // Paged (horizontal / book): one page per screen, swipe to turn. The zoom lives on
  // the per-page content (not the FlatList) so paging snaps stay 1:1 with `width`.
  return (
    <GestureDetector gesture={gesture}>
      <Pressable style={[styles.viewport, background]} onPress={onTap}>
        <FlatList
          ref={listRef}
          data={Array.from({ length: pageCount }, (_, i) => i)}
          keyExtractor={(i) => String(i)}
          horizontal
          pagingEnabled
          // Lock page-turning while zoomed so a two-finger pan moves within the
          // page instead of racing the pager; zoom back to 1x to navigate.
          scrollEnabled={zoom <= 1}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.max(0, page - 1)}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onMomentumScrollEnd={onMomentumEnd}
          renderItem={({ item }) => (
            <View style={{ width, height }}>
              <PdfView source={source} page={item} resizeMode="contain" style={{ flex: 1, ...pageZoomStyle }} />
            </View>
          )}
        />
      </Pressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1 },
});
