/**
 * PDF service contracts.
 *
 * Rendering itself happens in a native view (react-native-pdf), which lands in
 * the reader phase's dev build. This contract lets the feature/UI layers code
 * against a stable interface now; the concrete renderer slots in behind it later
 * with zero changes upstream.
 */

/** Where a PDF comes from. */
export interface PdfSource {
  uri: string;
  /** Optional password for protected documents. */
  password?: string;
}

/** Lightweight metadata extracted from a document. */
export interface PdfDocumentInfo {
  pageCount?: number;
  title?: string;
  author?: string;
}

/** Extracts text for AI / search features. Implemented in the AI phase. */
export interface PdfTextExtractor {
  extractText(source: PdfSource): Promise<string>;
}
