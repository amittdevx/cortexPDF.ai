/**
 * Reader store — the currently-open document and its view state.
 * Reader display preferences persist; transient view state (page, zoom) doesn't.
 */

import { create } from 'zustand';

import { StorageKeys } from '@/constants/app';
import { storage } from '@/services/storage';
import type { PdfFile } from '@/types/domain';

export type ReaderScrollMode = 'paged' | 'continuous';

export interface ReaderSettings {
  scrollMode: ReaderScrollMode;
  /** Keep the screen awake while reading. */
  keepAwake: boolean;
}

const DEFAULT_SETTINGS: ReaderSettings = { scrollMode: 'continuous', keepAwake: true };

interface ReaderState {
  currentPdf: PdfFile | null;
  currentPage: number;
  zoom: number;
  settings: ReaderSettings;

  hydrate: () => void;
  openDocument: (pdf: PdfFile) => void;
  closeDocument: () => void;
  setPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  updateSettings: (patch: Partial<ReaderSettings>) => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentPdf: null,
  currentPage: 1,
  zoom: 1,
  settings: DEFAULT_SETTINGS,

  hydrate: () => {
    const saved = storage.getObject<ReaderSettings>(StorageKeys.readerSettings);
    if (saved) set({ settings: { ...DEFAULT_SETTINGS, ...saved } });
  },

  openDocument: (pdf) => set({ currentPdf: pdf, currentPage: 1, zoom: 1 }),
  closeDocument: () => set({ currentPdf: null }),
  setPage: (currentPage) => set({ currentPage }),
  setZoom: (zoom) => set({ zoom }),

  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    storage.setObject(StorageKeys.readerSettings, next);
    set({ settings: next });
  },
}));
