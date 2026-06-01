/**
 * Centralized logger. The single place app diagnostics flow through, so we can
 * later route to Sentry (per the plan) without touching call-sites.
 */

import { AppConfig } from '@/config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[AppConfig.logLevel];
}

function emit(level: LogLevel, scope: string, message: string, data?: unknown) {
  if (!shouldLog(level)) return;
  const tag = `[${scope}]`;
  // eslint-disable-next-line no-console
  const fn = console[level] ?? console.log;
  if (data !== undefined) fn(tag, message, data);
  else fn(tag, message);

  // Hook for remote crash reporting (Sentry) — wired up in a later phase.
  if (level === 'error') AppConfig.onError?.(scope, message, data);
}

/** Create a namespaced logger, e.g. `const log = createLogger('db')`. */
export function createLogger(scope: string) {
  return {
    debug: (message: string, data?: unknown) => emit('debug', scope, message, data),
    info: (message: string, data?: unknown) => emit('info', scope, message, data),
    warn: (message: string, data?: unknown) => emit('warn', scope, message, data),
    error: (message: string, data?: unknown) => emit('error', scope, message, data),
  };
}

export type Logger = ReturnType<typeof createLogger>;
