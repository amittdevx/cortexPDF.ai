/**
 * Recents service — orchestration for the recent-files feature. Coordinates the
 * file service (picking documents) and the recents repository (persistence).
 *
 * This is the FEATURE layer: it composes lower-level services and returns typed
 * Results. It holds no React state and no SQL — that lives in the hook and repo
 * respectively.
 */

import { annotationsRepo, bookmarksRepo, recentsRepo } from '@/services/database';
import { pickPdf, shareFile, type PickedDocument } from '@/services/file';
import type { PdfFile } from '@/types/domain';
import { err, ok, safeAsync, type Result } from '@/utils/result';

/** Load all recent files, pinned first. */
export function listRecents(): Promise<Result<PdfFile[]>> {
  return safeAsync(() => recentsRepo.listRecents(), 'recents/list');
}

/** Record (or bump) a file in recents — call when a document is opened. */
export function recordOpen(
  input: Pick<PdfFile, 'uri' | 'name' | 'size'> & Partial<Pick<PdfFile, 'pageCount'>>,
): Promise<Result<void>> {
  return safeAsync(() => recentsRepo.upsertRecent(input, Date.now()), 'recents/record');
}

/**
 * Open the picker, and on selection persist the document to recents.
 * Returns the picked document, or `null` if the user cancelled.
 */
export async function importPdf(): Promise<Result<PickedDocument | null>> {
  const picked = await pickPdf();
  if (!picked.ok) return picked;
  if (!picked.value) return ok(null);

  const recorded = await recordOpen(picked.value);
  if (!recorded.ok) return err(recorded.error);

  return ok(picked.value);
}

export function togglePin(file: PdfFile): Promise<Result<void>> {
  return safeAsync(() => recentsRepo.setPinned(file.id, !file.isPinned), 'recents/togglePin');
}

/**
 * Remove a document and cascade-delete everything saved against it — notes,
 * drawings/highlights (all annotations) and bookmarks. Data lives only while the
 * file is in the list; deleting the file purges its sets too.
 */
export function remove(id: string): Promise<Result<void>> {
  return safeAsync(async () => {
    await recentsRepo.removeRecent(id);
    await annotationsRepo.removeForPdf(id);
    await bookmarksRepo.removeForPdf(id);
  }, 'recents/remove');
}

export function clearUnpinned(): Promise<Result<void>> {
  return safeAsync(() => recentsRepo.clearRecents(), 'recents/clear');
}

/** Share a document through the OS share sheet. */
export function share(file: PdfFile): Promise<Result<void>> {
  return shareFile(file.uri);
}
