/**
 * Bookmarks service — feature-layer orchestration over the centralized bookmarks
 * repository. Returns Result; holds no React state and no SQL (RULE 1 / layering).
 */

import { bookmarksRepo } from '@/services/database';
import type { Bookmark } from '@/types/domain';
import { safeAsync, type Result } from '@/utils/result';

/** All bookmarks for a document, ordered by page. */
export function listForDocument(pdfId: string): Promise<Result<Bookmark[]>> {
  return safeAsync(() => bookmarksRepo.listBookmarks(pdfId), 'bookmarks/list');
}

/** Add a bookmark on a page (optional label). */
export function add(pdfId: string, page: number, label = ''): Promise<Result<Bookmark>> {
  return safeAsync(
    () => bookmarksRepo.addBookmark({ pdfId, page, label }, Date.now()),
    'bookmarks/add',
  );
}

export function remove(id: string): Promise<Result<void>> {
  return safeAsync(() => bookmarksRepo.removeBookmark(id), 'bookmarks/remove');
}
