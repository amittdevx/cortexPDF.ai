/**
 * Settings store — theme preference, haptics, and other lightweight prefs.
 * Persisted through the centralized key-value storage service.
 *
 * `hydrate()` is called once during bootstrap (after storage is loaded) to pull
 * persisted values into the store. Mutations write through to storage immediately.
 */

import { create } from 'zustand';

import { StorageKeys } from '@/constants/app';
import { setHapticsEnabled } from '@/services/haptics';
import { storage } from '@/services/storage';
import type { ThemePreference } from '@/types/domain';

interface SettingsState {
  themePreference: ThemePreference;
  hapticsEnabled: boolean;
  /** Load persisted values into the store (call after storage hydration). */
  hydrate: () => void;
  setThemePreference: (preference: ThemePreference) => void;
  setHapticsEnabled: (enabled: boolean) => void;
}

const HAPTICS_KEY = 'settings.hapticsEnabled';

export const useSettingsStore = create<SettingsState>((set) => ({
  themePreference: 'system',
  hapticsEnabled: true,

  hydrate: () => {
    const themePreference =
      (storage.getString(StorageKeys.themePreference) as ThemePreference | undefined) ?? 'system';
    const hapticsEnabled = storage.getBoolean(HAPTICS_KEY) ?? true;
    setHapticsEnabled(hapticsEnabled);
    set({ themePreference, hapticsEnabled });
  },

  setThemePreference: (preference) => {
    storage.set(StorageKeys.themePreference, preference);
    set({ themePreference: preference });
  },

  setHapticsEnabled: (enabled) => {
    storage.set(HAPTICS_KEY, enabled);
    setHapticsEnabled(enabled);
    set({ hapticsEnabled: enabled });
  },
}));
