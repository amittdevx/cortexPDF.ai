/**
 * Tabs store — open document "tabs" for a multi-document reading workspace.
 * Lightweight metadata only; the heavy reader state lives in the reader store.
 */

import { create } from 'zustand';

import type { PdfFile } from '@/types/domain';

export interface ReaderTab {
  id: string;
  pdf: PdfFile;
  /** Last page the user was on in this tab. */
  page: number;
}

interface TabsState {
  tabs: ReaderTab[];
  activeTabId: string | null;

  openTab: (pdf: PdfFile) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabPage: (id: string, page: number) => void;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (pdf) => {
    // Reuse an existing tab for the same document instead of duplicating.
    const existing = get().tabs.find((t) => t.pdf.uri === pdf.uri);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }
    const tab: ReaderTab = { id: pdf.id, pdf, page: 1 };
    set((state) => ({ tabs: [...state.tabs, tab], activeTabId: tab.id }));
  },

  closeTab: (id) =>
    set((state) => {
      const tabs = state.tabs.filter((t) => t.id !== id);
      const activeTabId =
        state.activeTabId === id ? (tabs[tabs.length - 1]?.id ?? null) : state.activeTabId;
      return { tabs, activeTabId };
    }),

  setActiveTab: (activeTabId) => set({ activeTabId }),

  updateTabPage: (id, page) =>
    set((state) => ({ tabs: state.tabs.map((t) => (t.id === id ? { ...t, page } : t)) })),
}));
