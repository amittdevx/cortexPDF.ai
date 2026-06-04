/**
 * AI layer contracts.
 *
 * Architecture (per the plan):  UI → Feature Hook → AI Service → Provider Adapter → backend.
 * UI/features NEVER touch a provider directly. Concrete adapters (OpenAI / Gemini)
 * are reached only through a backend proxy so API keys are never bundled.
 */

import type { Result } from '@/utils/result';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  /** Stream tokens as they arrive (when the provider supports it). */
  onToken?: (chunk: string) => void;
  signal?: AbortSignal;
}

/** Options for document text extraction. */
export interface ExtractOptions extends AiCompletionOptions {
  /**
   * Skip the backend's (token-burning, output-capped) Gemini OCR fallback for
   * scanned PDFs. The app OCRs those on-device instead; the backend then only
   * reports the text layer + `scanned` flag. Defaults to false.
   */
  skipServerOcr?: boolean;
}

/**
 * A document handed to the backend for analysis. Text extraction happens
 * SERVER-SIDE (the native PDF renderer can't extract text, and we keep parsing
 * off the client), so we send the raw bytes — never an API key.
 */
export interface AiDocument {
  /** Display/file name, used for prompts and logging. */
  name: string;
  /** Base64-encoded file bytes. */
  base64: string;
}

/** The named reading-assistant tasks the backend knows how to run over text. */
export type AiTask =
  | 'summary'
  | 'page-summary'
  | 'key-points'
  | 'quiz'
  | 'flashcards'
  | 'notes'
  | 'ask'
  | 'explain'
  | 'translate';

/** Task inputs — only the keys a given task needs are read. */
export interface AiTaskParams {
  /** How many items (quiz questions / flashcards). */
  n?: number;
  /** The user's question (ask) — also carries the target language (translate). */
  question?: string;
  /** Target language (translate); falls back to `question` if unset. */
  language?: string;
  /** 1-based page number (page-summary). */
  page?: number;
}

/** One page's extracted text. */
export interface ExtractedPage {
  page: number;
  text: string;
}

/** Result of extracting a document's text on the backend. */
export interface ExtractResult {
  totalPages: number;
  /** True when the PDF had no text layer and was OCR'd. */
  scanned: boolean;
  perPage: ExtractedPage[];
}

/** A provider adapter — the boundary an LLM backend is reached through. */
export interface AiProvider {
  readonly id: string;
  complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<Result<string>>;
  /** Summarize a whole document (backend extracts the text). */
  summarizeDocument(doc: AiDocument, options?: AiCompletionOptions): Promise<Result<string>>;
  /** Answer a question grounded in a document (backend extracts the text). */
  askDocument(
    doc: AiDocument,
    question: string,
    options?: AiCompletionOptions,
  ): Promise<Result<string>>;
  /** Extract per-page text from a document (sent ONCE per file). */
  extract(doc: AiDocument, options?: ExtractOptions): Promise<Result<ExtractResult>>;
  /** Run a named task over already-extracted text. */
  runTask(
    task: AiTask,
    text: string,
    params?: AiTaskParams,
    options?: AiCompletionOptions,
  ): Promise<Result<string>>;
}
