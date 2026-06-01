/**
 * Storage contracts.
 *
 * `KeyValueStore` intentionally mirrors react-native-mmkv's synchronous API so
 * that swapping the in-memory/file-backed fallback for a real MMKV instance later
 * (in the dev-build phase) is a one-line change with zero call-site impact.
 */

export interface KeyValueStore {
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean | undefined;
  getObject<T>(key: string): T | undefined;

  set(key: string, value: string | number | boolean): void;
  setObject<T>(key: string, value: T): void;

  delete(key: string): void;
  contains(key: string): boolean;
  getAllKeys(): string[];
  clearAll(): void;
}

/**
 * Durable backing for the key-value store. The store keeps a synchronous
 * in-memory cache and delegates durability here. A backend that's already
 * synchronous + persistent (MMKV) makes the cache redundant but still conforms.
 */
export interface KeyValuePersistence {
  /** Load the full snapshot once at boot. */
  load(): Promise<Record<string, string>>;
  /** Persist the full snapshot. Implementations may debounce internally. */
  save(snapshot: Record<string, string>): void;
}
