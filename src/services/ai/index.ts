/**
 * AI service — the centralized facade feature hooks call. It composes prompts and
 * delegates to the active provider adapter. Swapping providers happens here only.
 */

import { type Result } from '@/utils/result';

import { ProxyProvider } from './providers/proxy-provider';
import type { AiCompletionOptions, AiProvider } from './types';

export type { AiMessage, AiProvider, AiCompletionOptions } from './types';

let provider: AiProvider = new ProxyProvider();

/** Override the active provider (e.g. a mock in tests). */
export function setAiProvider(next: AiProvider) {
  provider = next;
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
