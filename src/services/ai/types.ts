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

/** A provider adapter — the boundary an LLM backend is reached through. */
export interface AiProvider {
  readonly id: string;
  complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<Result<string>>;
}
