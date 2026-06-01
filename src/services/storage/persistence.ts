/**
 * Platform-aware persistence adapters for the key-value store.
 *
 * - web:    localStorage (synchronous, single JSON blob)
 * - native: a JSON file in the document directory via expo-file-system
 *
 * Both are write-through; the store debounces calls to `save`, so writing the
 * whole (small) settings snapshot each time is cheap and simple.
 */

import { Platform } from 'react-native';

import { createLogger } from '@/utils/logger';

import type { KeyValuePersistence } from './types';

const log = createLogger('storage');
const STORE_FILE = 'cortex-kv.json';
const WEB_KEY = 'cortexpdf.kv';

class WebPersistence implements KeyValuePersistence {
  async load(): Promise<Record<string, string>> {
    try {
      const raw = globalThis.localStorage?.getItem(WEB_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch (e) {
      log.warn('web load failed, starting empty', e);
      return {};
    }
  }

  save(snapshot: Record<string, string>): void {
    try {
      globalThis.localStorage?.setItem(WEB_KEY, JSON.stringify(snapshot));
    } catch (e) {
      log.warn('web save failed', e);
    }
  }
}

class FilePersistence implements KeyValuePersistence {
  async load(): Promise<Record<string, string>> {
    try {
      const { File, Paths } = await import('expo-file-system');
      const file = new File(Paths.document, STORE_FILE);
      if (!file.exists) return {};
      return JSON.parse(file.textSync()) as Record<string, string>;
    } catch (e) {
      log.warn('file load failed, starting empty', e);
      return {};
    }
  }

  save(snapshot: Record<string, string>): void {
    // Fire-and-forget; the store already debounces calls into here.
    void (async () => {
      try {
        const { File, Paths } = await import('expo-file-system');
        const file = new File(Paths.document, STORE_FILE);
        if (!file.exists) file.create();
        file.write(JSON.stringify(snapshot));
      } catch (e) {
        log.warn('file save failed', e);
      }
    })();
  }
}

export function createPersistence(): KeyValuePersistence {
  return Platform.OS === 'web' ? new WebPersistence() : new FilePersistence();
}
