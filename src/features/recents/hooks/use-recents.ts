/**
 * useRecents — the feature hook the UI binds to. Owns the React state (list,
 * loading, error) and exposes intent-named actions. All real work delegates to
 * the recents service (RULE 1: no business logic in the UI).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { PdfFile } from '@/types/domain';
import { fileNameToTitle } from '@/utils/format';

import * as recentsService from '../services/recents.service';

interface UseRecentsResult {
  /** Files matching the current search query (all files when the query is empty). */
  items: PdfFile[];
  /** Total recents on file, regardless of the search query. */
  totalCount: number;
  loading: boolean;
  error: string | null;
  /** Current search query. */
  query: string;
  setQuery: (query: string) => void;
  refresh: () => Promise<void>;
  /** Pick a PDF and add it to recents. Returns the imported file, or null. */
  importPdf: () => Promise<PdfFile | null>;
  /** Mark a file opened (bumps it to the top). Reader navigation is layered on at the screen. */
  open: (file: PdfFile) => Promise<void>;
  togglePin: (file: PdfFile) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  /** Share a document through the OS share sheet. */
  share: (file: PdfFile) => Promise<void>;
}

export function useRecents(): UseRecentsResult {
  const [items, setItems] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (f) => fileNameToTitle(f.name).toLowerCase().includes(q) || f.name.toLowerCase().includes(q),
    );
  }, [items, query]);

  const refresh = useCallback(async () => {
    const result = await recentsService.listRecents();
    if (result.ok) {
      setItems(result.value);
      setError(null);
    } else {
      setError(result.error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const importPdf = useCallback(async (): Promise<PdfFile | null> => {
    const result = await recentsService.importPdf();
    if (!result.ok) {
      setError(result.error.message);
      return null;
    }
    if (!result.value) return null; // cancelled

    // Re-list and locate the imported record from fresh data (avoids a stale
    // `items` closure: setItems from refresh wouldn't be visible here yet).
    const refreshed = await recentsService.listRecents();
    const list = refreshed.ok ? refreshed.value : [];
    if (refreshed.ok) setItems(list);
    return list.find((f) => f.uri === result.value!.uri) ?? null;
  }, []);

  const open = useCallback(
    async (file: PdfFile) => {
      await recentsService.recordOpen(file);
      await refresh();
    },
    [refresh],
  );

  const togglePin = useCallback(
    async (file: PdfFile) => {
      // Optimistic update for snappy feedback; refresh reconciles with the DB.
      setItems((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, isPinned: !f.isPinned } : f)),
      );
      await recentsService.togglePin(file);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((f) => f.id !== id));
      await recentsService.remove(id);
      await refresh();
    },
    [refresh],
  );

  const clear = useCallback(async () => {
    await recentsService.clearUnpinned();
    await refresh();
  }, [refresh]);

  const share = useCallback(async (file: PdfFile) => {
    await recentsService.share(file);
  }, []);

  return {
    items: filtered,
    totalCount: items.length,
    loading,
    error,
    query,
    setQuery,
    refresh,
    importPdf,
    open,
    togglePin,
    remove,
    clear,
    share,
  };
}
