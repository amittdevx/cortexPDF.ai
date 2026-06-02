/**
 * useAiSummary — feature hook bound to one document. Resolves the file's content
 * hash, hydrates any cached summary from the durable store, and exposes
 * generate/regenerate. Reads/writes the AI store (the fast UI-facing cache); all
 * real work delegates to the ai-summary service (RULE 1). AI never blocks the UI:
 * generation is async and failures surface as `error`, never a throw.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import * as aiService from '@/services/ai';
import { useAiStore } from '@/store/ai.store';
import type { AiSummary, PdfFile } from '@/types/domain';

import * as aiSummaryService from '../services/ai-summary.service';

export interface UseAiSummaryResult {
  summary: AiSummary | null;
  loading: boolean;
  error: string | undefined;
  /** Whether the AI backend is wired (drives the not-configured state). */
  configured: boolean;
  /** Generate a summary (uses the cache unless one already exists). */
  generate: () => Promise<void>;
  /** Force a fresh summary, ignoring the cache. */
  regenerate: () => Promise<void>;
}

export function useAiSummary(file: PdfFile | null | undefined): UseAiSummaryResult {
  const [hash, setHash] = useState<string | null>(null);
  const fileRef = useRef(file);
  fileRef.current = file;

  const setSummary = useAiStore((s) => s.setSummary);
  const setLoading = useAiStore((s) => s.setLoading);
  const setError = useAiStore((s) => s.setError);
  const summary = useAiStore((s) => (hash ? s.summaries[hash] ?? null : null));
  const loading = useAiStore((s) => (hash ? !!s.loadingHashes[hash] : false));
  const error = useAiStore((s) => (hash ? s.errorHashes[hash] : undefined));

  // Resolve the content hash for the current file, then hydrate the cache.
  useEffect(() => {
    let active = true;
    setHash(null);
    const current = fileRef.current;
    if (!current) return;
    void (async () => {
      const hashResult = await aiSummaryService.resolveHash(current);
      if (!active || !hashResult.ok) return;
      setHash(hashResult.value);
      const cached = await aiSummaryService.getCached(hashResult.value);
      if (active && cached.ok && cached.value) setSummary(cached.value);
    })();
    return () => {
      active = false;
    };
  }, [file?.id, file?.uri, setSummary]);

  const run = useCallback(
    async (force: boolean) => {
      const current = fileRef.current;
      if (!current) return;
      let key = hash;
      if (!key) {
        const hashResult = await aiSummaryService.resolveHash(current);
        if (!hashResult.ok) return;
        key = hashResult.value;
        setHash(key);
      }
      setLoading(key, true);
      setError(key, undefined);
      const result = await aiSummaryService.generate(current, force);
      if (result.ok) setSummary(result.value);
      else setError(key, result.error.message);
      setLoading(key, false);
    },
    [hash, setLoading, setError, setSummary],
  );

  const generate = useCallback(() => run(false), [run]);
  const regenerate = useCallback(() => run(true), [run]);

  return {
    summary,
    loading,
    error,
    configured: aiService.isConfigured(),
    generate,
    regenerate,
  };
}
