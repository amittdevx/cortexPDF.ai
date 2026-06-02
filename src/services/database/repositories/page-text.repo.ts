/** Page-text repository — the extract-once cache of per-page document text. */

import type { ExtractedPage } from '@/services/ai';

import { getDatabase } from '../client';

export interface DocTextMeta {
  totalPages: number;
  scanned: boolean;
}

interface MetaRow {
  total_pages: number;
  scanned: number;
}

interface PageRow {
  page: number;
  text: string;
}

/** Extraction metadata for a document, or null if it hasn't been extracted yet. */
export async function getMeta(fileHash: string): Promise<DocTextMeta | null> {
  const db = await getDatabase();
  if (!db) return null;
  const row = await db.getFirstAsync<MetaRow>(
    'SELECT total_pages, scanned FROM doc_text_meta WHERE file_hash = ?',
    fileHash,
  );
  return row ? { totalPages: row.total_pages, scanned: row.scanned === 1 } : null;
}

/** All cached pages for a document, ordered by page. */
export async function getPages(fileHash: string): Promise<ExtractedPage[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows = await db.getAllAsync<PageRow>(
    'SELECT page, text FROM page_text WHERE file_hash = ? ORDER BY page ASC',
    fileHash,
  );
  return rows.map((r) => ({ page: r.page, text: r.text }));
}

/** A single page's cached text, or null. */
export async function getPage(fileHash: string, page: number): Promise<string | null> {
  const db = await getDatabase();
  if (!db) return null;
  const row = await db.getFirstAsync<PageRow>(
    'SELECT page, text FROM page_text WHERE file_hash = ? AND page = ?',
    fileHash,
    page,
  );
  return row ? row.text : null;
}

/** Persist a document's extracted text + metadata in one transaction. */
export async function save(
  fileHash: string,
  meta: DocTextMeta,
  pages: ExtractedPage[],
  extractedAt: number,
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO doc_text_meta (file_hash, total_pages, scanned, extracted_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(file_hash) DO UPDATE SET
         total_pages = excluded.total_pages,
         scanned = excluded.scanned,
         extracted_at = excluded.extracted_at`,
      fileHash,
      meta.totalPages,
      meta.scanned ? 1 : 0,
      extractedAt,
    );
    await db.runAsync('DELETE FROM page_text WHERE file_hash = ?', fileHash);
    for (const p of pages) {
      await db.runAsync(
        'INSERT INTO page_text (file_hash, page, text) VALUES (?, ?, ?)',
        fileHash,
        p.page,
        p.text,
      );
    }
  });
}
