/**
 * Recent-files repository — the only place that knows the `recent_files` SQL.
 * Maps between snake_case rows and the camelCase `PdfFile` domain type.
 */

import { Limits } from '@/constants/app';
import type { PdfFile } from '@/types/domain';
import { createId } from '@/utils/id';

import { getDatabase } from '../client';

interface RecentRow {
  id: string;
  uri: string;
  name: string;
  size: number;
  page_count: number | null;
  last_opened_at: number;
  is_pinned: number;
}

const toDomain = (r: RecentRow): PdfFile => ({
  id: r.id,
  uri: r.uri,
  name: r.name,
  size: r.size,
  pageCount: r.page_count ?? undefined,
  lastOpenedAt: r.last_opened_at,
  isPinned: r.is_pinned === 1,
});

/** All recents, pinned first then most-recently-opened. */
export async function listRecents(): Promise<PdfFile[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows = await db.getAllAsync<RecentRow>(
    `SELECT * FROM recent_files
     ORDER BY is_pinned DESC, last_opened_at DESC
     LIMIT ?`,
    Limits.maxRecentFiles,
  );
  return rows.map(toDomain);
}

/** Fetch a single recent by id (used by the reader on deep links / cold start). */
export async function getRecentById(id: string): Promise<PdfFile | null> {
  const db = await getDatabase();
  if (!db) return null;
  const row = await db.getFirstAsync<RecentRow>('SELECT * FROM recent_files WHERE id = ?', id);
  return row ? toDomain(row) : null;
}

/** Persist a page count once the renderer reports it for a document. */
export async function setPageCount(id: string, pageCount: number): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.runAsync('UPDATE recent_files SET page_count = ? WHERE id = ?', pageCount, id);
}

/**
 * Record that a file was opened. Upserts on `uri` so re-opening bumps the
 * timestamp instead of creating a duplicate.
 */
export async function upsertRecent(
  input: Pick<PdfFile, 'uri' | 'name' | 'size'> & Partial<Pick<PdfFile, 'pageCount'>>,
  openedAt: number,
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;

  // Dedup by content identity (name + size). expo-document-picker copies each
  // import to a fresh cache URI, so re-importing the same PDF would otherwise
  // insert a duplicate under a new URI (the ON CONFLICT(uri) guard never fires).
  // If a row with the same name+size exists, bump it (refresh URI/page-count/time)
  // instead of inserting a duplicate.
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM recent_files WHERE name = ? AND size = ? LIMIT 1',
    input.name,
    input.size,
  );
  if (existing) {
    await db.runAsync(
      `UPDATE recent_files
         SET uri = ?, page_count = COALESCE(?, page_count), last_opened_at = ?
       WHERE id = ?`,
      input.uri,
      input.pageCount ?? null,
      openedAt,
      existing.id,
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO recent_files (id, uri, name, size, page_count, last_opened_at, is_pinned)
     VALUES (?, ?, ?, ?, ?, ?, 0)
     ON CONFLICT(uri) DO UPDATE SET
       name = excluded.name,
       size = excluded.size,
       page_count = COALESCE(excluded.page_count, recent_files.page_count),
       last_opened_at = excluded.last_opened_at`,
    createId('pdf'),
    input.uri,
    input.name,
    input.size,
    input.pageCount ?? null,
    openedAt,
  );
}

export async function setPinned(id: string, pinned: boolean): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.runAsync('UPDATE recent_files SET is_pinned = ? WHERE id = ?', pinned ? 1 : 0, id);
}

export async function removeRecent(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.runAsync('DELETE FROM recent_files WHERE id = ?', id);
}

export async function clearRecents(): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.runAsync('DELETE FROM recent_files WHERE is_pinned = 0');
}
