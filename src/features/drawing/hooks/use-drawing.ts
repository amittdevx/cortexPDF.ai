/**
 * useDrawing — feature hook bound to one document page. Owns the committed-stroke
 * list plus an in-memory undo/redo stack; all persistence delegates to the drawing
 * service (RULE 1). Strokes reload whenever the page changes. Undo deletes the most
 * recent stroke (parking it for redo); redo re-persists it (new id). `clear` wipes
 * the page and is not itself undoable (v1).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { haptics } from '@/services/haptics';

import * as drawingService from '../services/drawing.service';
import type { DrawStroke } from '../services/drawing.service';

export interface UseDrawingResult {
  strokes: DrawStroke[];
  loading: boolean;
  canUndo: boolean;
  canRedo: boolean;
  /** Commit a new stroke (clears the redo stack). */
  addStroke: (stroke: Omit<DrawStroke, 'id'>) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  clear: () => Promise<void>;
}

export function useDrawing(pdfId: string | undefined, page: number): UseDrawingResult {
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [loading, setLoading] = useState(true);
  // Parked strokes available for redo (most-recently-undone last).
  const [redoStack, setRedoStack] = useState<Omit<DrawStroke, 'id'>[]>([]);
  // Guards against a stale async list-load overwriting newer state after a page flip.
  const loadToken = useRef(0);

  useEffect(() => {
    const token = ++loadToken.current;
    setRedoStack([]);
    if (!pdfId) {
      setStrokes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void drawingService.listForPage(pdfId, page).then((result) => {
      if (token !== loadToken.current) return; // a newer page load superseded us
      if (result.ok) setStrokes(result.value);
      setLoading(false);
    });
  }, [pdfId, page]);

  const addStroke = useCallback(
    async (stroke: Omit<DrawStroke, 'id'>) => {
      if (!pdfId || stroke.points.length === 0) return;
      setRedoStack([]);
      const result = await drawingService.add(pdfId, page, stroke);
      if (result.ok) setStrokes((prev) => [...prev, result.value]);
    },
    [pdfId, page],
  );

  const undo = useCallback(async () => {
    const last = strokes[strokes.length - 1];
    if (!last) return;
    haptics.light();
    setStrokes((prev) => prev.slice(0, -1));
    const { id: _id, ...parked } = last;
    setRedoStack((prev) => [...prev, parked]);
    await drawingService.remove(last.id);
  }, [strokes]);

  const redo = useCallback(async () => {
    const stroke = redoStack[redoStack.length - 1];
    if (!stroke || !pdfId) return;
    haptics.light();
    setRedoStack((prev) => prev.slice(0, -1));
    const result = await drawingService.add(pdfId, page, stroke);
    if (result.ok) setStrokes((prev) => [...prev, result.value]);
  }, [redoStack, pdfId, page]);

  const clear = useCallback(async () => {
    if (strokes.length === 0) return;
    haptics.warning();
    const removing = strokes;
    setStrokes([]);
    setRedoStack([]);
    await Promise.all(removing.map((s) => drawingService.remove(s.id)));
  }, [strokes]);

  return {
    strokes,
    loading,
    canUndo: strokes.length > 0,
    canRedo: redoStack.length > 0,
    addStroke,
    undo,
    redo,
    clear,
  };
}
