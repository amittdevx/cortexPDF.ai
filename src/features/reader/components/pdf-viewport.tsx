/**
 * PdfViewport — the document rendering surface, backed by react-native-pdf-light
 * (per-page native views we lay out ourselves, so we own scroll offset, page rects
 * and — in later stages — a shared-value zoom + glued stroke overlay). Concrete
 * implementation behind the reader's rendering seam; the screen/hook/store/controls
 * are unchanged (same PdfViewportProps).
 *
 * Requires a dev build (native module) — does NOT run in Expo Go.
 *
 * STAGE 1 (rendering parity): continuous = the library's vertical `Pdf` scroller;
 * horizontal/book = a paged horizontal FlatList of single `PdfView` pages; draw mode
 * (frozen) = a single fit page for the stroke overlay. Smooth shared-value zoom, the
 * glued per-page stroke overlay, and the page-curl land in stages 2-3.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Pdf, PdfUtil, PdfView, type PageMeasurement, type PdfRef } from 'react-native-pdf-light';

import { useTheme } from '@/hooks/use-theme';
import type { ReaderScrollMode } from '@/store/reader.store';
import type { PdfFile } from '@/types/domain';

export interface PdfViewportProps {
  document: PdfFile;
  /** Controlled page (1-based) — jumps the renderer when changed via controls. */
  page: number;
  /** Controlled zoom — driven by the zoom controls (applied in a later stage). */
  zoom: number;
  scrollMode: ReaderScrollMode;
  /** Freeze scrolling (draw mode) so the stroke overlay maps to a stable page. */
  frozen?: boolean;
  /** Renderer reported a new zoom (pinch) — wired in a later stage. */
  onZoomChange: (zoom: number) => void;
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
  scrollMode,
  frozen = false,
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

  const background = { backgroundColor: colors.background };

  // Draw mode: a single fit page beneath the stroke overlay (rendered by the screen).
  if (frozen) {
    return (
      <View style={[styles.viewport, background]}>
        <PdfView source={source} page={page - 1} resizeMode="contain" style={styles.page} />
      </View>
    );
  }

  if (isVertical) {
    return (
      <Pressable style={[styles.viewport, background]} onPress={onTap}>
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
    );
  }

  // Paged (horizontal / book): one page per screen, swipe to turn.
  return (
    <Pressable style={[styles.viewport, background]} onPress={onTap}>
      <FlatList
        ref={listRef}
        data={Array.from({ length: pageCount }, (_, i) => i)}
        keyExtractor={(i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={Math.max(0, page - 1)}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <PdfView source={source} page={item} resizeMode="contain" style={styles.page} />
          </View>
        )}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1 },
  page: { flex: 1 },
});
