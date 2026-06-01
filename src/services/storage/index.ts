/**
 * Storage service — centralized key-value persistence for settings, preferences,
 * theme, and lightweight cache (the role MMKV plays in the plan).
 *
 *   import { storage } from '@/services/storage';
 *   storage.set(StorageKeys.themePreference, 'dark');
 */

export type { KeyValueStore, KeyValuePersistence } from './types';
export { kvStore as storage, hydrateStorage } from './key-value-store';
