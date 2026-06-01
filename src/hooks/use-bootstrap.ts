/**
 * App bootstrap — runs once on launch: hydrate persisted storage, load stores
 * from it, and open/migrate the database. Returns readiness so the root layout
 * can hold the splash until the app is genuinely ready.
 *
 * Each step is independently guarded (services never throw), so a failure in one
 * subsystem still lets the app start in a degraded-but-usable state.
 */

import { useEffect } from 'react';

import { initDatabase } from '@/services/database';
import { hydrateStorage } from '@/services/storage';
import { useAppStore } from '@/store/app.store';
import { useReaderStore } from '@/store/reader.store';
import { useSettingsStore } from '@/store/settings.store';
import { createLogger } from '@/utils/logger';

const log = createLogger('bootstrap');

export function useBootstrap(): boolean {
  const isReady = useAppStore((s) => s.isReady);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // 1. Load persisted key-value storage into memory (synchronous reads after).
      await hydrateStorage();

      // 2. Seed stores from storage.
      useSettingsStore.getState().hydrate();
      useAppStore.getState().hydrate();
      useReaderStore.getState().hydrate();

      // 3. Open + migrate the database (non-fatal if unavailable).
      await initDatabase();

      if (mounted) {
        useAppStore.getState().setReady(true);
        log.info('bootstrap complete');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return isReady;
}
