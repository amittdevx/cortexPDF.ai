/**
 * AI service — the centralized facade feature hooks call. It composes prompts and
 * delegates to the active provider adapter. Swapping providers happens here only.
 */

import { AppConfig } from '@/config';
import { type Result } from '@/utils/result';

import { ProxyProvider } from './providers/proxy-provider';
import type { AiCompletionOptions, AiDocument, AiProvider } from './types';

export type { AiMessage, AiProvider, AiCompletionOptions, AiDocument } from './types';

let provider: AiProvider = new ProxyProvider();

/** Override the active provider (e.g. a mock in tests). */
export function setAiProvider(next: AiProvider) {
  provider = next;
}

/** Whether a backend is wired — features use this to show a graceful state. */
export function isConfigured(): boolean {
  return AppConfig.aiProxyUrl.length > 0;
}

/** Summarize a whole document (backend extracts the text server-side). */
export function summarizeDocument(
  doc: AiDocument,
  options?: AiCompletionOptions,
): Promise<Result<string>> {
  return provider.summarizeDocument(doc, options);
}

/** Answer a question grounded in a document (backend extracts the text). */
export function askDocument(
  doc: AiDocument,
  question: string,
  options?: AiCompletionOptions,
): Promise<Result<string>> {
  return provider.askDocument(doc, question, options);
}

/** Summarize document text into a concise overview. */
export function summarize(text: string, options?: AiCompletionOptions): Promise<Result<string>> {
  return provider.complete(
    [
      {
        role: 'system',
        content:
          'You are a concise assistant. Summarize the document into clear key points a reader can scan in under a minute.',
      },
      { role: 'user', content: text },
    ],
    options,
  );
}

/** Answer a question grounded in the provided document context. */
export function ask(
  context: string,
  question: string,
  options?: AiCompletionOptions,
): Promise<Result<string>> {
  return provider.complete(
    [
      { role: 'system', content: 'Answer using only the provided document context.' },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
    ],
    options,
  );
}
