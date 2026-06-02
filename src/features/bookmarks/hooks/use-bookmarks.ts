/**
 * useBookmarks — feature hook bound to one document. Owns the bookmark list state
 * and exposes intent-named actions; all work delegates to the bookmarks service
 * (RULE 1). Page/zoom navigation stays in the reader hook — this only manages the
 * saved locations.
 */

import { useCallback, useEffect, useState } from 'react';

import { haptics } from '@/services/haptics';
import type { Bookmark } from '@/types/domain';

import * as bookmarksService from '../services/bookmarks.service';

export interface UseBookmarksResult {
  bookmarks: Bookmark[];
  loading: boolean;
  /** Is the given page already bookmarked? */
  isBookmarked: (page: number) => boolean;
  /** Add the page if unsaved, else remove its bookmark. */
  toggle: (page: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useBookmarks(pdfId: string | undefined): UseBookmarksResult {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!pdfId) {
      setBookmarks([]);
      setLoading(false);
      return;
    }
    const result = await bookmarksService.listForDocument(pdfId);
    if (result.ok) setBookmarks(result.value);
    setLoading(false);
  }, [pdfId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isBookmarked = useCallback(
    (page: number) => bookmarks.some((b) => b.page === page),
    [bookmarks],
  );

  const toggle = useCallback(
    async (page: number) => {
      if (!pdfId) return;
      const existing = bookmarks.find((b) => b.page === page);
      if (existing) {
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id)); // optimistic
        haptics.light();
        await bookmarksService.remove(existing.id);
      } else {
        haptics.success();
        await bookmarksService.add(pdfId, page);
      }
      await refresh();
    },
    [pdfId, bookmarks, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      await bookmarksService.remove(id);
      await refresh();
    },
    [refresh],
  );

  return { bookmarks, loading, isBookmarked, toggle, remove, refresh };
}
