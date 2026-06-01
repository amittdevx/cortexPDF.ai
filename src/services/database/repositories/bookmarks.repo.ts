/** Bookmarks repository — owns all `bookmarks` SQL. */

import type { Bookmark } from '@/types/domain';
import { createId } from '@/utils/id';

import { getDatabase } from '../client';

interface BookmarkRow {
  id: string;
  pdf_id: string;
  page: number;
  label: string;
  created_at: number;
}

const toDomain = (r: BookmarkRow): Bookmark => ({
  id: r.id,
  pdfId: r.pdf_id,
  page: r.page,
  label: r.label,
  createdAt: r.created_at,
});

export async function listBookmarks(pdfId: string): Promise<Bookmark[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows = await db.getAllAsync<BookmarkRow>(
    'SELECT * FROM bookmarks WHERE pdf_id = ? ORDER BY page ASC',
    pdfId,
  );
  return rows.map(toDomain);
}

export async function addBookmark(
  input: Pick<Bookmark, 'pdfId' | 'page' | 'label'>,
  createdAt: number,
): Promise<Bookmark> {
  const bookmark: Bookmark = { id: createId('bm'), createdAt, ...input };
  const db = await getDatabase();
  if (!db) return bookmark;
  await db.runAsync(
    'INSERT INTO bookmarks (id, pdf_id, page, label, created_at) VALUES (?, ?, ?, ?, ?)',
    bookmark.id,
    bookmark.pdfId,
    bookmark.page,
    bookmark.label,
    bookmark.createdAt,
  );
  return bookmark;
}

export async function removeBookmark(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.runAsync('DELETE FROM bookmarks WHERE id = ?', id);
}
