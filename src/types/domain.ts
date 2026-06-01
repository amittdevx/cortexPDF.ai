/**
 * Centralized domain types shared across features and the persistence layer.
 * Feature-specific types live inside their feature folder; cross-cutting ones live here.
 */

/** A document the user has opened. Mirrors the `recent_files` table. */
export interface PdfFile {
  id: string;
  /** Local file URI / path. */
  uri: string;
  /** Display name (with extension). */
  name: string;
  /** Size in bytes (0 if unknown). */
  size: number;
  /** Total page count if known. */
  pageCount?: number;
  /** Epoch millis the file was last opened. */
  lastOpenedAt: number;
  /** Pinned to the top of the library. */
  isPinned: boolean;
}

/** A saved location within a document. Mirrors the `bookmarks` table. */
export interface Bookmark {
  id: string;
  pdfId: string;
  page: number;
  label: string;
  createdAt: number;
}

/** A cached AI summary keyed by the file's content hash. Mirrors `ai_summaries`. */
export interface AiSummary {
  id: string;
  fileHash: string;
  summary: string;
  createdAt: number;
}

export type AnnotationType = 'highlight' | 'note' | 'drawing';

/** A user annotation on a page. Mirrors the `annotations` table. */
export interface Annotation {
  id: string;
  pdfId: string;
  page: number;
  type: AnnotationType;
  /** Type-specific payload (color, rects, path, text) serialized as JSON. */
  data: Record<string, unknown>;
  createdAt: number;
}

/** Resolved color scheme. */
export type ColorSchemeName = 'light' | 'dark';

/** User-selectable theme preference. */
export type ThemePreference = 'system' | 'light' | 'dark';
