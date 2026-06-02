/**
 * Ordered SQLite migrations. Append new entries — never edit or reorder existing
 * ones. The client applies any whose index is beyond the DB's `user_version`.
 *
 * Schema follows the plan's tables (recent_files, bookmarks, ai_summaries,
 * annotations) with stronger typing: TEXT primary keys, INTEGER epoch-millis
 * timestamps, and indexes for the queries each feature actually runs.
 */

export const migrations: string[] = [
  // v1 — initial schema
  `
  CREATE TABLE IF NOT EXISTS recent_files (
    id              TEXT PRIMARY KEY NOT NULL,
    uri             TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    size            INTEGER NOT NULL DEFAULT 0,
    page_count      INTEGER,
    last_opened_at  INTEGER NOT NULL,
    is_pinned       INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_recent_last_opened ON recent_files (last_opened_at DESC);

  CREATE TABLE IF NOT EXISTS bookmarks (
    id          TEXT PRIMARY KEY NOT NULL,
    pdf_id      TEXT NOT NULL,
    page        INTEGER NOT NULL,
    label       TEXT NOT NULL DEFAULT '',
    created_at  INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_bookmarks_pdf ON bookmarks (pdf_id);

  CREATE TABLE IF NOT EXISTS ai_summaries (
    id          TEXT PRIMARY KEY NOT NULL,
    file_hash   TEXT NOT NULL UNIQUE,
    summary     TEXT NOT NULL,
    created_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS annotations (
    id          TEXT PRIMARY KEY NOT NULL,
    pdf_id      TEXT NOT NULL,
    page        INTEGER NOT NULL,
    type        TEXT NOT NULL,
    data        TEXT NOT NULL DEFAULT '{}',
    created_at  INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_annotations_pdf_page ON annotations (pdf_id, page);
  `,

  // v2 — AI text cache (extract-once) + generic AI result cache
  `
  CREATE TABLE IF NOT EXISTS doc_text_meta (
    file_hash     TEXT PRIMARY KEY NOT NULL,
    total_pages   INTEGER NOT NULL DEFAULT 0,
    scanned       INTEGER NOT NULL DEFAULT 0,
    extracted_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS page_text (
    file_hash   TEXT NOT NULL,
    page        INTEGER NOT NULL,
    text        TEXT NOT NULL,
    PRIMARY KEY (file_hash, page)
  );

  CREATE TABLE IF NOT EXISTS ai_results (
    cache_key   TEXT PRIMARY KEY NOT NULL,
    task        TEXT NOT NULL,
    content     TEXT NOT NULL,
    created_at  INTEGER NOT NULL
  );
  `,
];
