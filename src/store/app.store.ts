/**
 * App store — global app status: bootstrap readiness, onboarding, and a global
 * loading flag. Kept deliberately small; feature state lives in feature stores.
 */

import { create } from 'zustand';

import { StorageKeys } from '@/constants/app';
import { storage } from '@/services/storage';

interface AppState {
  /** True once bootstrap (storage hydrate + db init) has finished. */
  isReady: boolean;
  /** Whether the user has completed onboarding. */
  onboardingComplete: boolean;
  /** A coarse global loading indicator for app-level async work. */
  globalLoading: boolean;

  setReady: (ready: boolean) => void;
  hydrate: () => void;
  completeOnboarding: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isReady: false,
  onboardingComplete: false,
  globalLoading: false,

  setReady: (isReady) => set({ isReady }),

  hydrate: () => {
    set({ onboardingComplete: storage.getBoolean(StorageKeys.onboardingComplete) ?? false });
  },

  completeOnboarding: () => {
    storage.set(StorageKeys.onboardingComplete, true);
    set({ onboardingComplete: true });
  },

  setGlobalLoading: (globalLoading) => set({ globalLoading }),
}));
