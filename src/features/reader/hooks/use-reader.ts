/**
 * useReader — the feature hook the reader screen binds to. Owns the reader's
 * React state (loading, error, page count) on top of the persistent reader store,
 * and exposes intent-named actions for page navigation and zoom. All real work
 * delegates to the reader store / reader service (RULE 1: no business logic in UI).
 *
 * Page and zoom are transient view state (live in the store, not persisted);
 * scroll mode + keep-awake are reader preferences (persisted by the store).
 */

import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useState } from 'react';

import { useReaderStore, type ReaderScrollMode } from '@/store/reader.store';
import type { PdfFile } from '@/types/domain';
import { clamp } from '@/utils/format';

import * as readerService from '../services/reader.service';

/** Zoom bounds + step shared by the controls and the pinch gesture. */
export const ZOOM = { min: 1, max: 3, step: 0.25 } as const;

const KEEP_AWAKE_TAG = 'cortexpdf-reader';

export interface UseReaderResult {
  document: PdfFile | null;
  page: number;
  /** Total pages once known (renderer-reported or persisted), else `null`. */
  totalPages: number | null;
  zoom: number;
  /** Pan offset (screen px) of the zoomed page. */
  panX: number;
  panY: number;
  scrollMode: ReaderScrollMode;
  /** Immersive reading mode (per-document, persisted). */
  readingMode: boolean;
  loading: boolean;
  error: string | null;

  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetZoom: () => void;
  setScrollMode: (mode: ReaderScrollMode) => void;
  setReadingMode: (on: boolean) => void;
  /** Called by the renderer once it knows the page count; persists it. */
  reportPageCount: (count: number) => void;
  share: () => void;
  close: () => void;
}

export function useReader(id: string | undefined): UseReaderResult {
  const document = useReaderStore((s) => s.currentPdf);
  const page = useReaderStore((s) => s.currentPage);
  const zoom = useReaderStore((s) => s.zoom);
  const panX = useReaderStore((s) => s.panX);
  const panY = useReaderStore((s) => s.panY);
  const scrollMode = useReaderStore((s) => s.scrollMode);
  const readingMode = useReaderStore((s) => s.readingMode);
  const keepAwake = useReaderStore((s) => s.keepAwake);

  const openDocument = useReaderStore((s) => s.openDocument);
  const closeDocument = useReaderStore((s) => s.closeDocument);
  const setPage = useReaderStore((s) => s.setPage);
  const setZoomState = useReaderStore((s) => s.setZoom);
  const setPanState = useReaderStore((s) => s.setPan);
  const setScrollModeState = useReaderStore((s) => s.setScrollMode);
  const setReadingModeState = useReaderStore((s) => s.setReadingMode);

  const [loading, setLoading] = useState(!document || document.id !== id);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(document?.pageCount ?? null);

  // Resolve the document when the store doesn't already hold the requested id
  // (cold start / deep link). When navigated from the Library, the store is
  // already primed and this short-circuits.
  useEffect(() => {
    if (!id) {
      setError('No document specified');
      setLoading(false);
      return;
    }
    if (document?.id === id) {
      setTotalPages(document.pageCount ?? null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void readerService.getDocument(id).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error.message);
      } else if (!result.value) {
        setError('Document not found');
      } else {
        openDocument(result.value);
        setTotalPages(result.value.pageCount ?? null);
        setError(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id, document, openDocument]);

  // Keep the screen awake while reading — when the preference is on, or always in
  // immersive reading mode.
  useEffect(() => {
    if (!keepAwake && !readingMode) return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [keepAwake, readingMode]);

  const goToPage = useCallback(
    (next: number) => {
      const upper = totalPages ?? Number.MAX_SAFE_INTEGER;
      setPage(clamp(Math.round(next), 1, upper));
    },
    [setPage, totalPages],
  );

  const nextPage = useCallback(() => goToPage(page + 1), [goToPage, page]);
  const prevPage = useCallback(() => goToPage(page - 1), [goToPage, page]);

  const setZoom = useCallback(
    (next: number) => setZoomState(clamp(next, ZOOM.min, ZOOM.max)),
    [setZoomState],
  );
  const setPan = useCallback((x: number, y: number) => setPanState(x, y), [setPanState]);
  const zoomIn = useCallback(() => setZoom(zoom + ZOOM.step), [setZoom, zoom]);
  const zoomOut = useCallback(() => setZoom(zoom - ZOOM.step), [setZoom, zoom]);
  const resetZoom = useCallback(() => {
    setZoomState(1);
    setPanState(0, 0);
  }, [setZoomState, setPanState]);

  const setScrollMode = useCallback(
    (mode: ReaderScrollMode) => setScrollModeState(mode),
    [setScrollModeState],
  );
  const setReadingMode = useCallback(
    (on: boolean) => setReadingModeState(on),
    [setReadingModeState],
  );

  const reportPageCount = useCallback(
    (count: number) => {
      if (!count || count < 1) return;
      setTotalPages(count);
      if (document && document.pageCount !== count) {
        void readerService.persistPageCount(document.id, count);
      }
    },
    [document],
  );

  const share = useCallback(() => {
    if (document) void readerService.share(document);
  }, [document]);

  const close = useCallback(() => closeDocument(), [closeDocument]);

  return {
    document,
    page,
    totalPages,
    zoom,
    panX,
    panY,
    scrollMode,
    readingMode,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    setZoom,
    setPan,
    resetZoom,
    setScrollMode,
    setReadingMode,
    reportPageCount,
    share,
    close,
  };
}
