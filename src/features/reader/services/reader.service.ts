/**
 * Reader service — feature-layer orchestration for the reader experience.
 *
 * Resolves a document by id (for deep links / cold starts where the in-memory
 * store is empty), pulls metadata from the centralized PDF service, persists a
 * newly-discovered page count back onto the recents row, and shares the file.
 *
 * Both this and the recents feature rest on the same centralized `database` and
 * `file` services — neither feature imports the other (keeps features decoupled).
 * Holds no React state and no SQL.
 */

import { recentsRepo } from '@/services/database';
import { shareFile } from '@/services/file';
import { getDocumentInfo, type PdfDocumentInfo } from '@/services/pdf';
import type { PdfFile } from '@/types/domain';
import { safeAsync, type Result } from '@/utils/result';

/** Resolve a document from its recents id. `null` value means "not found". */
export function getDocument(id: string): Promise<Result<PdfFile | null>> {
  return safeAsync(() => recentsRepo.getRecentById(id), 'reader/getDocument');
}

/** Read document metadata (page count, title) from the PDF service. */
export function loadInfo(file: PdfFile): Promise<Result<PdfDocumentInfo>> {
  return getDocumentInfo({ uri: file.uri });
}

/** Persist a page count once the renderer reports it for a document. */
export function persistPageCount(id: string, pageCount: number): Promise<Result<void>> {
  return safeAsync(() => recentsRepo.setPageCount(id, pageCount), 'reader/persistPageCount');
}

/** Share the open document through the OS share sheet. */
export function share(file: PdfFile): Promise<Result<void>> {
  return shareFile(file.uri);
}
