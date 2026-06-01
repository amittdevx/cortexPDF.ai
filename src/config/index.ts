/**
 * App configuration — environment-derived, centralized.
 *
 * Reads from Expo `extra` / public env vars. NEVER put secrets (API keys) here;
 * per the security strategy those live behind a backend proxy and are fetched at
 * runtime, never bundled.
 */

import Constants from 'expo-constants';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface AppConfigShape {
  /** App display name. */
  appName: string;
  /** Whether we're in a development build. */
  isDev: boolean;
  /** Minimum level the logger will emit. */
  logLevel: LogLevel;
  /** Base URL for the AI proxy backend (no keys client-side). Empty until configured. */
  aiProxyUrl: string;
  /** Optional global error sink (wired to Sentry later). */
  onError?: (scope: string, message: string, data?: unknown) => void;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

export const AppConfig: AppConfigShape = {
  appName: 'CortexPDF',
  isDev: __DEV__,
  logLevel: __DEV__ ? 'debug' : 'warn',
  aiProxyUrl: typeof extra.aiProxyUrl === 'string' ? extra.aiProxyUrl : '',
};
