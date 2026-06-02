/**
 * Proxy provider — reaches OpenAI / Gemini through our own backend so secrets
 * stay server-side (security strategy: "NEVER EXPOSE API KEYS"). Until
 * `AppConfig.aiProxyUrl` is set, it reports a typed "not configured" error so the
 * UI can show a graceful state rather than crash.
 *
 * Full streaming + token handling is implemented in the AI phase; the seam exists
 * now so feature code can already depend on the `AiProvider` interface.
 */

import { AppConfig } from '@/config';
import { err, safeAsync, type Result } from '@/utils/result';

import type { AiCompletionOptions, AiDocument, AiMessage, AiProvider } from '../types';

const NOT_CONFIGURED = {
  code: 'ai/not-configured',
  message: 'AI backend is not configured yet.',
} as const;

export class ProxyProvider implements AiProvider {
  readonly id = 'proxy';

  /** POST a JSON body to a proxy endpoint and unwrap `{ content }`. */
  private post(
    path: string,
    body: unknown,
    context: string,
    signal?: AbortSignal,
  ): Promise<Result<string>> {
    if (!AppConfig.aiProxyUrl) return Promise.resolve(err({ ...NOT_CONFIGURED }));
    return safeAsync(async () => {
      const res = await fetch(`${AppConfig.aiProxyUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });
      if (!res.ok) throw new Error(`AI proxy returned ${res.status}`);
      const json = (await res.json()) as { content: string };
      return json.content;
    }, context);
  }

  complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<Result<string>> {
    return this.post('/complete', { messages }, 'ai/complete', options?.signal);
  }

  summarizeDocument(doc: AiDocument, options?: AiCompletionOptions): Promise<Result<string>> {
    return this.post('/summarize', { document: doc }, 'ai/summarize', options?.signal);
  }

  askDocument(
    doc: AiDocument,
    question: string,
    options?: AiCompletionOptions,
  ): Promise<Result<string>> {
    return this.post('/ask', { document: doc, question }, 'ai/ask', options?.signal);
  }
}
