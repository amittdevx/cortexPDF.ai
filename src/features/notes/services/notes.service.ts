/**
 * Notes service — feature-layer orchestration over the centralized annotations
 * repository, narrowed to the `note` annotation type. Returns Result; holds no
 * React state and no SQL (RULE 1 / layering). The text payload lives in the
 * annotation's JSON `data` as `{ text }`.
 */

import { annotationsRepo } from '@/services/database';
import type { Annotation } from '@/types/domain';
import { safeAsync, type Result } from '@/utils/result';

/** A page-level text note. A view over an `Annotation` of type `note`. */
export interface Note {
  id: string;
  page: number;
  text: string;
  createdAt: number;
}

const toNote = (a: Annotation): Note => ({
  id: a.id,
  page: a.page,
  text: typeof a.data.text === 'string' ? a.data.text : '',
  createdAt: a.createdAt,
});

/** All notes for a document, ordered by page then creation time. */
export function listForDocument(pdfId: string): Promise<Result<Note[]>> {
  return safeAsync(async () => {
    const annotations = await annotationsRepo.listAnnotations(pdfId);
    return annotations.filter((a) => a.type === 'note').map(toNote);
  }, 'notes/list');
}

/** Add a note to a page. */
export function add(pdfId: string, page: number, text: string): Promise<Result<Note>> {
  return safeAsync(async () => {
    const annotation = await annotationsRepo.addAnnotation(
      { pdfId, page, type: 'note', data: { text } },
      Date.now(),
    );
    return toNote(annotation);
  }, 'notes/add');
}

/** Replace a note's text. */
export function update(id: string, text: string): Promise<Result<void>> {
  return safeAsync(() => annotationsRepo.updateAnnotationData(id, { text }), 'notes/update');
}

export function remove(id: string): Promise<Result<void>> {
  return safeAsync(() => annotationsRepo.removeAnnotation(id), 'notes/remove');
}
