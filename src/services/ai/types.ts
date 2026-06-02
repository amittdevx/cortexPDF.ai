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
}
