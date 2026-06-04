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

import type {
  AiCompletionOptions,
  AiDocument,
  AiMessage,
  AiProvider,
  AiTask,
  AiTaskParams,
  ExtractOptions,
  ExtractResult,
} from '../types';

const NOT_CONFIGURED = {
  code: 'ai/not-configured',
  message: 'AI backend is not configured yet.',
} as const;

export class ProxyProvider implements AiProvider {
  readonly id = 'proxy';

  /** POST a JSON body to a proxy endpoint and return the parsed JSON as `T`. */
  private postJson<T>(
    path: string,
    body: unknown,
    context: string,
    signal?: AbortSignal,
  ): Promise<Result<T>> {
    if (!AppConfig.aiProxyUrl) return Promise.resolve(err({ ...NOT_CONFIGURED }));
    return safeAsync(async () => {
      const res = await fetch(`${AppConfig.aiProxyUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });
      if (!res.ok) {
        const detail = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(detail?.error?.message ?? `AI proxy returned ${res.status}`);
      }
      return (await res.json()) as T;
    }, context);
  }

  /** POST and unwrap `{ content }`. */
  private async postContent(
    path: string,
    body: unknown,
    context: string,
    signal?: AbortSignal,
  ): Promise<Result<string>> {
    const result = await this.postJson<{ content: string }>(path, body, context, signal);
    return result.ok ? { ok: true, value: result.value.content } : result;
  }

  complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<Result<string>> {
    return this.postContent('/complete', { messages }, 'ai/complete', options?.signal);
  }

  summarizeDocument(doc: AiDocument, options?: AiCompletionOptions): Promise<Result<string>> {
    return this.postContent('/summarize', { document: doc }, 'ai/summarize', options?.signal);
  }

  askDocument(
    doc: AiDocument,
    question: string,
    options?: AiCompletionOptions,
  ): Promise<Result<string>> {
    return this.postContent('/ask', { document: doc, question }, 'ai/ask', options?.signal);
  }

  extract(doc: AiDocument, options?: ExtractOptions): Promise<Result<ExtractResult>> {
    return this.postJson<ExtractResult>(
      '/extract',
      { document: doc, skipOcr: options?.skipServerOcr ?? false },
      'ai/extract',
      options?.signal,
    );
  }

  runTask(
    task: AiTask,
    text: string,
    params?: AiTaskParams,
    options?: AiCompletionOptions,
  ): Promise<Result<string>> {
    return this.postContent('/ai', { task, text, params: params ?? {} }, 'ai/runTask', options?.signal);
  }
}
