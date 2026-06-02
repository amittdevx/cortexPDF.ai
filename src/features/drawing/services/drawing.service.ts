/**
 * Drawing service — feature-layer orchestration over the centralized annotations
 * repository, narrowed to the `drawing` annotation type. One annotation == one
 * freehand stroke (so undo/redo and removal are per-stroke). Points are stored
 * NORMALIZED (0..1) relative to the page viewport so they survive re-render and
 * device-size changes. Returns Result; holds no React state and no SQL (RULE 1).
 */

import { annotationsRepo } from '@/services/database';
import type { Annotation } from '@/types/domain';
import { safeAsync, type Result } from '@/utils/result';

/** A point normalized to the drawing surface (0..1 on each axis). */
export interface NormPoint {
  x: number;
  y: number;
}

/** A single freehand stroke. A view over an `Annotation` of type `drawing`. */
export interface DrawStroke {
  id: string;
  color: string;
  /** Stroke width as a fraction of the surface width (resolution-independent). */
  width: number;
  points: NormPoint[];
}

const DEFAULT_COLOR = '#FF3B30';
const DEFAULT_WIDTH = 0.008;

const toStroke = (a: Annotation): DrawStroke => ({
  id: a.id,
  color: typeof a.data.color === 'string' ? a.data.color : DEFAULT_COLOR,
  width: typeof a.data.width === 'number' ? a.data.width : DEFAULT_WIDTH,
  points: Array.isArray(a.data.points) ? (a.data.points as NormPoint[]) : [],
});

/** All strokes on a page, oldest first (paint order). */
export function listForPage(pdfId: string, page: number): Promise<Result<DrawStroke[]>> {
  return safeAsync(async () => {
    const annotations = await annotationsRepo.listAnnotations(pdfId, page);
    return annotations.filter((a) => a.type === 'drawing').map(toStroke);
  }, 'drawing/list');
}

/** Persist one stroke; returns it with its generated id. */
export function add(
  pdfId: string,
  page: number,
  stroke: Omit<DrawStroke, 'id'>,
): Promise<Result<DrawStroke>> {
  return safeAsync(async () => {
    const annotation = await annotationsRepo.addAnnotation(
      { pdfId, page, type: 'drawing', data: { ...stroke } },
      Date.now(),
    );
    return toStroke(annotation);
  }, 'drawing/add');
}

export function remove(id: string): Promise<Result<void>> {
  return safeAsync(() => annotationsRepo.removeAnnotation(id), 'drawing/remove');
}
