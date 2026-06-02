/**
 * Reader store — the currently-open document and its view state.
 *
 * View preferences are PER-DOCUMENT and persist locally: each file remembers its
 * scroll mode and whether reading mode was left on, so reopening it restores that
 * exact setup. A global default scroll mode + keep-awake live alongside. Transient
 * view state (page, zoom) does not persist.
 */

import { create } from 'zustand';

import { StorageKeys } from '@/constants/app';
import { storage } from '@/services/storage';
import type { PdfFile } from '@/types/domain';

export type ReaderScrollMode = 'continuous' | 'horizontal' | 'book';

/** Per-document, locally-persisted reading preferences. */
interface DocPrefs {
  scrollMode: ReaderScrollMode;
  readingMode: boolean;
}

interface GlobalSettings {
  defaultScrollMode: ReaderScrollMode;
  /** Keep the screen awake while reading. */
  keepAwake: boolean;
}

const DEFAULT_GLOBAL: GlobalSettings = { defaultScrollMode: 'continuous', keepAwake: true };

const docKey = (id: string) => `reader.doc.${id}`;

/** Coerce any stored/legacy value to a valid mode (old 'paged' → 'horizontal'). */
function normalizeMode(value: unknown): ReaderScrollMode {
  if (value === 'continuous' || value === 'horizontal' || value === 'book') return value;
  if (value === 'paged') return 'horizontal';
  return DEFAULT_GLOBAL.defaultScrollMode;
}

interface ReaderState {
  currentPdf: PdfFile | null;
  currentPage: number;
  zoom: number;
  /** Effective scroll mode for the open document. */
  scrollMode: ReaderScrollMode;
  /** Immersive reading mode for the open document. */
  readingMode: boolean;
  keepAwake: boolean;
  defaultScrollMode: ReaderScrollMode;

  hydrate: () => void;
  openDocument: (pdf: PdfFile) => void;
  closeDocument: () => void;
  setPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  setScrollMode: (mode: ReaderScrollMode) => void;
  setReadingMode: (on: boolean) => void;
  setKeepAwake: (on: boolean) => void;
}

export const useReaderStore = create<ReaderState>((set, get) => {
  const persistDoc = (patch: Partial<DocPrefs>) => {
    const { currentPdf, scrollMode, readingMode } = get();
    if (!currentPdf) return;
    const next: DocPrefs = { scrollMode, readingMode, ...patch };
    storage.setObject(docKey(currentPdf.id), next);
  };

  return {
    currentPdf: null,
    currentPage: 1,
    zoom: 1,
    scrollMode: DEFAULT_GLOBAL.defaultScrollMode,
    readingMode: false,
    keepAwake: DEFAULT_GLOBAL.keepAwake,
    defaultScrollMode: DEFAULT_GLOBAL.defaultScrollMode,

    hydrate: () => {
      const saved = storage.getObject<Partial<GlobalSettings>>(StorageKeys.readerSettings);
      if (saved) {
        set({
          defaultScrollMode: normalizeMode(saved.defaultScrollMode),
          keepAwake: saved.keepAwake ?? DEFAULT_GLOBAL.keepAwake,
        });
      }
    },

    openDocument: (pdf) => {
      const prefs = storage.getObject<DocPrefs>(docKey(pdf.id));
      set({
        currentPdf: pdf,
        currentPage: 1,
        zoom: 1,
        scrollMode: prefs ? normalizeMode(prefs.scrollMode) : get().defaultScrollMode,
        readingMode: prefs?.readingMode ?? false,
      });
    },
    closeDocument: () => set({ currentPdf: null }),
    setPage: (currentPage) => set({ currentPage }),
    setZoom: (zoom) => set({ zoom }),

    // Per-document only: changing one file's layout must NOT change the app
    // default or any other file. Others stay vertical until individually changed.
    setScrollMode: (mode) => {
      set({ scrollMode: mode });
      persistDoc({ scrollMode: mode });
    },

    setReadingMode: (on) => {
      set({ readingMode: on });
      persistDoc({ readingMode: on });
    },

    setKeepAwake: (on) => {
      set({ keepAwake: on });
      storage.setObject(StorageKeys.readerSettings, {
        defaultScrollMode: get().defaultScrollMode,
        keepAwake: on,
      } satisfies GlobalSettings);
    },
  };
});
