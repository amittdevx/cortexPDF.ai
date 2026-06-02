/**
 * useAiTasks — feature hook bound to the open document + current page. Drives the
 * AI menu: prepares (extracts) text once, runs a chosen task, and surfaces
 * loading/error/result for the active task. All work delegates to the ai service
 * (RULE 1); the durable SQLite cache makes repeat runs instant, so this keeps only
 * lightweight view state. AI never blocks the UI — failures surface as `error`.
 */

import { useCallback, useState } from 'react';

import * as aiService from '@/services/ai';
import type { AiTask, AiTaskParams } from '@/services/ai';
import type { PdfFile } from '@/types/domain';

import * as featureAiService from '../services/ai.service';

export interface UseAiTasksResult {
  configured: boolean;
  /** First-run text extraction is in flight. */
  extracting: boolean;
  loading: boolean;
  error: string | undefined;
  content: string | undefined;
  activeTask: AiTask | null;
  /** Kick off extraction (cheap on a cache hit) — call when the menu opens. */
  prepare: () => void;
  runTask: (task: AiTask, params?: AiTaskParams) => Promise<void>;
  regenerate: () => Promise<void>;
  /** Return to the task list. */
  reset: () => void;
}

export function useAiTasks(
  file: PdfFile | null | undefined,
  currentPage: number,
): UseAiTasksResult {
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [content, setContent] = useState<string | undefined>(undefined);
  const [activeTask, setActiveTask] = useState<AiTask | null>(null);
  const [activeParams, setActiveParams] = useState<AiTaskParams>({});

  const prepare = useCallback(() => {
    if (!file || !aiService.isConfigured()) return;
    setExtracting(true);
    void featureAiService.ensureExtracted(file).finally(() => setExtracting(false));
  }, [file]);

  const execute = useCallback(
    async (task: AiTask, params: AiTaskParams, force: boolean) => {
      if (!file) return;
      setActiveTask(task);
      setActiveParams(params);
      setLoading(true);
      setError(undefined);
      setContent(undefined);
      const result = await featureAiService.run(file, task, { ...params, page: currentPage }, force);
      if (result.ok) setContent(result.value.content);
      else setError(result.error.message);
      setLoading(false);
    },
    [file, currentPage],
  );

  const runTask = useCallback(
    (task: AiTask, params: AiTaskParams = {}) => execute(task, params, false),
    [execute],
  );

  const regenerate = useCallback(() => {
    if (!activeTask) return Promise.resolve();
    return execute(activeTask, activeParams, true);
  }, [execute, activeTask, activeParams]);

  const reset = useCallback(() => {
    setActiveTask(null);
    setError(undefined);
    setContent(undefined);
    setLoading(false);
  }, []);

  return {
    configured: aiService.isConfigured(),
    extracting,
    loading,
    error,
    content,
    activeTask,
    prepare,
    runTask,
    regenerate,
    reset,
  };
}
