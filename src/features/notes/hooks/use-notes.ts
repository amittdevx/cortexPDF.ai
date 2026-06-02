/**
 * useNotes — feature hook bound to one document. Owns the note list state and
 * exposes intent-named actions; all work delegates to the notes service (RULE 1).
 * Page navigation stays in the reader hook — this only manages saved notes.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { haptics } from '@/services/haptics';

import * as notesService from '../services/notes.service';
import type { Note } from '../services/notes.service';

export interface UseNotesResult {
  notes: Note[];
  loading: boolean;
  /** Total notes saved on a given page. */
  countForPage: (page: number) => number;
  /** Add a note to a page; no-op on empty text. */
  add: (page: number, text: string) => Promise<void>;
  /** Replace an existing note's text. */
  update: (id: string, text: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotes(pdfId: string | undefined): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!pdfId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    const result = await notesService.listForDocument(pdfId);
    if (result.ok) setNotes(result.value);
    setLoading(false);
  }, [pdfId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const countByPage = useMemo(() => {
    const map = new Map<number, number>();
    for (const n of notes) map.set(n.page, (map.get(n.page) ?? 0) + 1);
    return map;
  }, [notes]);

  const countForPage = useCallback((page: number) => countByPage.get(page) ?? 0, [countByPage]);

  const add = useCallback(
    async (page: number, text: string) => {
      const trimmed = text.trim();
      if (!pdfId || !trimmed) return;
      haptics.success();
      await notesService.add(pdfId, page, trimmed);
      await refresh();
    },
    [pdfId, refresh],
  );

  const update = useCallback(
    async (id: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text: trimmed } : n))); // optimistic
      haptics.light();
      await notesService.update(id, trimmed);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id)); // optimistic
      haptics.light();
      await notesService.remove(id);
      await refresh();
    },
    [refresh],
  );

  return { notes, loading, countForPage, add, update, remove, refresh };
}
