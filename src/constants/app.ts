/** App-wide constant values. Centralized so magic strings/numbers live in one place. */

/** Keys used in the key-value store. Namespaced to avoid collisions. */
export const StorageKeys = {
  themePreference: 'settings.themePreference',
  onboardingComplete: 'app.onboardingComplete',
  readerSettings: 'reader.settings',
  lastOpenedAt: 'app.lastOpenedAt',
} as const;

/** Current schema version of the SQLite database. Bump when adding migrations. */
export const DATABASE_VERSION = 1;
export const DATABASE_NAME = 'cortexpdf.db';

/** Caps to keep local data lightweight. */
export const Limits = {
  maxRecentFiles: 100,
  maxSearchResults: 50,
} as const;

/** Accepted document MIME types for the picker. */
export const PDF_MIME_TYPE = 'application/pdf';
