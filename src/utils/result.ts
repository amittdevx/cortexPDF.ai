/**
 * Result type + safe async wrappers.
 *
 * Per the error-handling strategy ("NEVER CRASH APP"), service-layer calls return
 * a typed Result instead of throwing, so feature hooks can handle failure as data.
 */

import { createLogger } from './logger';

const log = createLogger('safe');

export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };

export interface AppError {
  code: string;
  message: string;
  cause?: unknown;
}

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E = AppError>(error: E): Result<never, E> => ({ ok: false, error });

export function toAppError(cause: unknown, code = 'unknown'): AppError {
  if (cause && typeof cause === 'object' && 'message' in cause) {
    return { code, message: String((cause as Error).message), cause };
  }
  return { code, message: String(cause), cause };
}

/** Run an async fn, never throw — returns a Result. Logs failures. */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  context = 'operation',
): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (cause) {
    const error = toAppError(cause, context);
    log.error(`${context} failed: ${error.message}`, cause);
    return err(error);
  }
}

/** Run a sync fn, never throw — returns a Result. */
export function safeSync<T>(fn: () => T, context = 'operation'): Result<T> {
  try {
    return ok(fn());
  } catch (cause) {
    const error = toAppError(cause, context);
    log.error(`${context} failed: ${error.message}`, cause);
    return err(error);
  }
}

/** Resolve a Result to its value or a fallback (swallowing the error). */
export function unwrapOr<T>(result: Result<T>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
