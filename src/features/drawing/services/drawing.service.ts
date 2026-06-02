/**
 * Drawing service — feature-layer orchestration over the centralized annotations
 * repository, covering both freehand `drawing` (pen) and `highlight` (marker)
 * strokes. One annotation == one stroke (so undo/redo and removal are per-stroke).
 * Points are stored NORMALIZED (0..1) relative to the page viewport so they survive
 * re-render and device-size changes. Returns Result; no React state, no SQL (RULE 1).
 */

import { annotationsRepo } from '@/services/database';
import type { Annotation } from '@/types/domain';
import { safeAsync, type Result } from '@/utils/result';

/** Which pen laid the stroke down — controls how it renders. */
export type PenTool = 'pen' | 'highlighter';

/** A point normalized to the drawing surface (0..1 on each axis). */
export interface NormPoint {
  x: number;
  y: number;
}

/** A single stroke. A view over an `Annotation` of type `drawing` or `highlight`. */
export interface DrawStroke {
  id: string;
  tool: PenTool;
  color: string;
  /** Stroke width as a fraction of the surface width (resolution-independent). */
  width: number;
  points: NormPoint[];
}

const DEFAULT_COLOR = '#FF3B30';
const DEFAULT_WIDTH = 0.008;

const toolToType = (tool: PenTool): Annotation['type'] =>
  tool === 'highlighter' ? 'highlight' : 'drawing';

const toStroke = (a: Annotation): DrawStroke => ({
  id: a.id,
  tool: a.type === 'highlight' ? 'highlighter' : 'pen',
  color: typeof a.data.color === 'string' ? a.data.color : DEFAULT_COLOR,
  width: typeof a.data.width === 'number' ? a.data.width : DEFAULT_WIDTH,
  points: Array.isArray(a.data.points) ? (a.data.points as NormPoint[]) : [],
});

/** All pen + marker strokes on a page, oldest first (paint order). */
export function listForPage(pdfId: string, page: number): Promise<Result<DrawStroke[]>> {
  return safeAsync(async () => {
    const annotations = await annotationsRepo.listAnnotations(pdfId, page);
    return annotations
      .filter((a) => a.type === 'drawing' || a.type === 'highlight')
      .map(toStroke);
  }, 'drawing/list');
}

/** Persist one stroke; returns it with its generated id. */
export function add(
  pdfId: string,
  page: number,
  stroke: Omit<DrawStroke, 'id'>,
): Promise<Result<DrawStroke>> {
  return safeAsync(async () => {
    const { tool, ...data } = stroke;
    const annotation = await annotationsRepo.addAnnotation(
      { pdfId, page, type: toolToType(tool), data: { ...data } },
      Date.now(),
    );
    return toStroke(annotation);
  }, 'drawing/add');
}

export function remove(id: string): Promise<Result<void>> {
  return safeAsync(() => annotationsRepo.removeAnnotation(id), 'drawing/remove');
}
