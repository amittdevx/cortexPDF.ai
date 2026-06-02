/** AI results repository — durable cache of task outputs keyed by a composite key. */

import { getDatabase } from '../client';

interface ResultRow {
  content: string;
}

/** Cached content for a composite cache key, or null on a miss. */
export async function get(cacheKey: string): Promise<string | null> {
  const db = await getDatabase();
  if (!db) return null;
  const row = await db.getFirstAsync<ResultRow>(
    'SELECT content FROM ai_results WHERE cache_key = ?',
    cacheKey,
  );
  return row ? row.content : null;
}

/** Cache (or replace) a task result. */
export async function save(
  cacheKey: string,
  task: string,
  content: string,
  createdAt: number,
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.runAsync(
    `INSERT INTO ai_results (cache_key, task, content, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET content = excluded.content, created_at = excluded.created_at`,
    cacheKey,
    task,
    content,
    createdAt,
  );
}
