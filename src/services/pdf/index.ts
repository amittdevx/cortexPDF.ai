/**
 * PDF service — centralized facade for PDF operations.
 *
 * In the foundation phase this provides metadata stubs; the reader phase wires
 * the native renderer (react-native-pdf) and a real text extractor behind the
 * same surface. UI/feature code depends only on this module.
 */

import { ok, type Result } from '@/utils/result';

import type { PdfDocumentInfo, PdfSource } from './types';

export type { PdfDocumentInfo, PdfSource, PdfTextExtractor } from './types';

/**
 * Read basic document info. Page count is `undefined` until the native renderer
 * reports it (the reader surfaces `onLoadComplete(pageCount)` and persists it
 * back onto the recent-file record).
 */
export async function getDocumentInfo(_source: PdfSource): Promise<Result<PdfDocumentInfo>> {
  return ok({ pageCount: undefined });
}
