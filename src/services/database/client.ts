/**
 * SQLite client — lazy singleton connection with automatic migrations.
 *
 * The whole app shares one connection, opened on first use. Migrations run inside
 * a transaction and advance `PRAGMA user_version`. If the platform can't provide
 * SQLite (e.g. web without the wasm asset), the client degrades gracefully:
 * `getDatabase()` resolves to `null` and repositories return safe empties rather
 * than crashing — honoring "NEVER CRASH APP".
 */

import * as SQLite from 'expo-sqlite';

import { DATABASE_NAME } from '@/constants/app';
import { createLogger } from '@/utils/logger';

import { migrations } from './migrations';

const log = createLogger('db');

let dbPromise: Promise<SQLite.SQLiteDatabase | null> | null = null;

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  if (current >= migrations.length) return;

  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  for (let version = current; version < migrations.length; version++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(migrations[version]);
    });
    log.info(`migrated to v${version + 1}`);
  }

  // user_version doesn't accept bound params.
  await db.execAsync(`PRAGMA user_version = ${migrations.length}`);
}

async function open(): Promise<SQLite.SQLiteDatabase | null> {
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await runMigrations(db);
    return db;
  } catch (e) {
    log.error('failed to open database — running without persistence', e);
    return null;
  }
}

/** Get the shared database connection (opening + migrating on first call). */
export function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (!dbPromise) dbPromise = open();
  return dbPromise;
}

/** Eagerly initialize the database during app bootstrap. */
export const initDatabase = () => getDatabase();
