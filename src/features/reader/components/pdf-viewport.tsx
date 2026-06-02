/**
 * PdfViewport — the document rendering surface, backed by react-native-pdf
 * (native, New-Architecture/Fabric). Concrete implementation behind the reader's
 * rendering seam; the screen/hook/store/controls are unchanged.
 *
 * Requires a dev build (native module) — does NOT run in Expo Go.
 *
 * IMPORTANT — feedback-loop avoidance: react-native-pdf re-jumps whenever its
 * `page`/`scale` props CHANGE. If we fed every `onPageChanged`/`onScaleChanged`
 * straight back into those props, scrolling/pinching would push the prop back,
 * snap the view, and spin a redraw storm → ANR/crash. So we push a value to the
 * native view ONLY when the store changed for a reason OTHER than the view itself
 * reporting it (i.e. a deliberate jump from the controls), tracked via the
 * `reported*` refs. Scroll/pinch echoes update the indicator but never the prop.
 */

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';

import { useTheme } from '@/hooks/use-theme';
import type { ReaderScrollMode } from '@/store/reader.store';
import type { PdfFile } from '@/types/domain';

import { ZOOM } from '../hooks/use-reader';

/** Approx height of the reader's top bar — vertical scroll starts below it so the
 *  first page isn't hidden behind the chrome. */
const TOP_BAR_HEIGHT = 52;

export interface PdfViewportProps {
  document: PdfFile;
  /** Controlled page (1-based) — jumps the renderer when changed via controls. */
  page: number;
  /** Controlled zoom — driven by the zoom controls. */
  zoom: number;
  scrollMode: ReaderScrollMode;
  /** Freeze scrolling (draw mode) so an overlay maps to a stable page rect. */
  frozen?: boolean;
  /** Renderer reported a new zoom (pinch). */
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
  zoom,
  scrollMode,
  frozen = false,
  onZoomChange,
  onPageChange,
  onLoadComplete,
  onTap,
  onError,
}: PdfViewportProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  // continuous → vertical scroll; horizontal & book → one page at a time
  // (page-snap). While frozen (draw mode) we also force a single snapped page so
  // the drawing overlay maps to a stable rect.
  const isVertical = scrollMode === 'continuous' && !frozen;
  const horizontal = !isVertical;
  const enablePaging = !isVertical;

  // Page prop fed to <Pdf>: only changes on a deliberate jump, never on scroll.
  const [targetPage, setTargetPage] = useState(page);
  const reportedPage = useRef(page);
  useEffect(() => {
    if (page !== reportedPage.current) {
      reportedPage.current = page;
      setTargetPage(page);
    }
  }, [page]);

  // Scale prop fed to <Pdf>: only changes on a deliberate (button) zoom, never on pinch.
  const [targetScale, setTargetScale] = useState(zoom);
  const reportedScale = useRef(zoom);
  useEffect(() => {
    if (Math.abs(zoom - reportedScale.current) > 0.001) {
      reportedScale.current = zoom;
      setTargetScale(zoom);
    }
  }, [zoom]);

  return (
    <View
      style={[
        styles.viewport,
        { backgroundColor: colors.background },
        // In vertical scroll, start the page below the status bar AND the top bar
        // so the first page isn't hidden behind the chrome.
        isVertical && { paddingTop: insets.top + TOP_BAR_HEIGHT },
      ]}>
      <Pdf
        source={{ uri: document.uri, cache: true }}
        page={targetPage}
        scale={targetScale}
        minScale={ZOOM.min}
        maxScale={ZOOM.max}
        horizontal={horizontal}
        enablePaging={enablePaging}
        scrollEnabled={!frozen}
        spacing={enablePaging ? 0 : 8}
        fitPolicy={0 /* fit width */}
        enableAntialiasing
        enableDoubleTapZoom={false /* single-tap toggles chrome; controls own zoom */}
        style={[styles.pdf, { backgroundColor: colors.background }]}
        onLoadComplete={(numberOfPages) => onLoadComplete(numberOfPages)}
        onPageChanged={(currentPage) => {
          if (currentPage !== reportedPage.current) {
            reportedPage.current = currentPage;
            onPageChange(currentPage);
          }
        }}
        onScaleChanged={(scale) => {
          if (Math.abs(scale - reportedScale.current) > 0.005) {
            reportedScale.current = scale;
            onZoomChange(scale);
          }
        }}
        onPageSingleTap={() => onTap?.()}
        onError={(error) => onError?.(error instanceof Error ? error.message : String(error))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1 },
  pdf: { flex: 1, width: '100%' },
});
