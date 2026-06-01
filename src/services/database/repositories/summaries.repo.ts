/** AI summaries repository — content-hash-keyed cache for generated summaries. */

import type { AiSummary } from '@/types/domain';
import { createId } from '@/utils/id';

import { getDatabase } from '../client';

interface SummaryRow {
  id: string;
  file_hash: string;
  summary: string;
  created_at: number;
}

const toDomain = (r: SummaryRow): AiSummary => ({
  id: r.id,
  fileHash: r.file_hash,
  summary: r.summary,
  createdAt: r.created_at,
});

/** Look up a cached summary by the file's content hash. */
export async function getSummaryByHash(fileHash: string): Promise<AiSummary | null> {
  const db = await getDatabase();
  if (!db) return null;
  const row = await db.getFirstAsync<SummaryRow>(
    'SELECT * FROM ai_summaries WHERE file_hash = ?',
    fileHash,
  );
  return row ? toDomain(row) : null;
}

/** Cache (or replace) a summary for a file hash. */
export async function saveSummary(
  fileHash: string,
  summary: string,
  createdAt: number,
): Promise<AiSummary> {
  const record: AiSummary = { id: createId('sum'), fileHash, summary, createdAt };
  const db = await getDatabase();
  if (!db) return record;
  await db.runAsync(
    `INSERT INTO ai_summaries (id, file_hash, summary, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(file_hash) DO UPDATE SET summary = excluded.summary, created_at = excluded.created_at`,
    record.id,
    record.fileHash,
    record.summary,
    record.createdAt,
  );
  return record;
}
