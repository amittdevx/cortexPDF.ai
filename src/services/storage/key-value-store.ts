/**
 * In-memory-cached, write-through key-value store implementing `KeyValueStore`.
 *
 * Values are stored as strings (like MMKV) so the cache shape matches the
 * persisted shape exactly. Reads are synchronous off the cache; writes update
 * the cache and schedule a debounced snapshot save.
 */

import { debounce } from '@/utils/async';

import { createPersistence } from './persistence';
import type { KeyValuePersistence, KeyValueStore } from './types';

class MemoryKeyValueStore implements KeyValueStore {
  private cache = new Map<string, string>();
  private hydrated = false;
  private readonly scheduleSave: () => void;

  constructor(private readonly persistence: KeyValuePersistence) {
    const flush = debounce(() => {
      this.persistence.save(this.snapshot());
    }, 150);
    this.scheduleSave = flush;
  }

  /** Load persisted values into the cache. Safe to call multiple times. */
  async hydrate(): Promise<void> {
    if (this.hydrated) return;
    const snapshot = await this.persistence.load();
    for (const [key, value] of Object.entries(snapshot)) this.cache.set(key, value);
    this.hydrated = true;
  }

  private snapshot(): Record<string, string> {
    return Object.fromEntries(this.cache.entries());
  }

  getString(key: string): string | undefined {
    return this.cache.get(key);
  }

  getNumber(key: string): number | undefined {
    const raw = this.cache.get(key);
    if (raw === undefined) return undefined;
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  }

  getBoolean(key: string): boolean | undefined {
    const raw = this.cache.get(key);
    if (raw === undefined) return undefined;
    return raw === 'true';
  }

  getObject<T>(key: string): T | undefined {
    const raw = this.cache.get(key);
    if (raw === undefined) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }

  set(key: string, value: string | number | boolean): void {
    this.cache.set(key, String(value));
    this.scheduleSave();
  }

  setObject<T>(key: string, value: T): void {
    this.cache.set(key, JSON.stringify(value));
    this.scheduleSave();
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.scheduleSave();
  }

  contains(key: string): boolean {
    return this.cache.has(key);
  }

  getAllKeys(): string[] {
    return [...this.cache.keys()];
  }

  clearAll(): void {
    this.cache.clear();
    this.scheduleSave();
  }
}

/** The app-wide key-value store singleton. */
export const kvStore = new MemoryKeyValueStore(createPersistence());

/** Hydrate persisted values into the store. Call once during app bootstrap. */
export const hydrateStorage = () => kvStore.hydrate();
