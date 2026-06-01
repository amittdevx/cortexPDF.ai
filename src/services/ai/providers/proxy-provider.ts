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

import type { AiCompletionOptions, AiMessage, AiProvider } from '../types';

export class ProxyProvider implements AiProvider {
  readonly id = 'proxy';

  async complete(messages: AiMessage[], _options?: AiCompletionOptions): Promise<Result<string>> {
    if (!AppConfig.aiProxyUrl) {
      return err({ code: 'ai/not-configured', message: 'AI backend is not configured yet.' });
    }
    return safeAsync(async () => {
      const res = await fetch(`${AppConfig.aiProxyUrl}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) throw new Error(`AI proxy returned ${res.status}`);
      const json = (await res.json()) as { content: string };
      return json.content;
    }, 'ai/complete');
  }
}
