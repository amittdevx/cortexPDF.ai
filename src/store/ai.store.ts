/**
 * AI store — in-memory cache of generated summaries (keyed by file content hash)
 * plus per-key loading/error state. The durable cache lives in SQLite; this store
 * is the fast UI-facing layer the AI feature hooks read and write.
 */

import { create } from 'zustand';

import type { AiSummary } from '@/types/domain';

interface AiState {
  summaries: Record<string, AiSummary>;
  loadingHashes: Record<string, boolean>;
  errorHashes: Record<string, string | undefined>;

  setSummary: (summary: AiSummary) => void;
  setLoading: (fileHash: string, loading: boolean) => void;
  setError: (fileHash: string, error?: string) => void;
}

export const useAiStore = create<AiState>((set) => ({
  summaries: {},
  loadingHashes: {},
  errorHashes: {},

  setSummary: (summary) =>
    set((state) => ({ summaries: { ...state.summaries, [summary.fileHash]: summary } })),

  setLoading: (fileHash, loading) =>
    set((state) => ({ loadingHashes: { ...state.loadingHashes, [fileHash]: loading } })),

  setError: (fileHash, error) =>
    set((state) => ({ errorHashes: { ...state.errorHashes, [fileHash]: error } })),
}));
