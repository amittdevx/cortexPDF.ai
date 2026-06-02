/**
 * AI summary service — feature-layer orchestration: resolve a stable content hash,
 * check the durable cache (summaries repo), and on a miss read the file bytes and
 * ask the AI service to summarize the whole document (extraction is server-side).
 * Returns Result; holds no React state (RULE 1 / layering). The AI layer is reached
 * ONLY through `@/services/ai` — never a provider directly.
 */

import * as aiService from '@/services/ai';
import { summariesRepo } from '@/services/database';
import * as fileService from '@/services/file';
import type { AiSummary, PdfFile } from '@/types/domain';
import { err, ok, safeAsync, type Result } from '@/utils/result';

/** Above this, base64-uploading the whole file is too heavy for v1. */
const MAX_AI_BYTES = 12 * 1024 * 1024;

/** Stable content hash used as the cache key (md5, with a uri+size fallback). */
export function resolveHash(file: PdfFile): Promise<Result<string>> {
  return fileService.getContentHash(file.uri, file.size);
}

/** Look up a cached summary for a hash (null when absent). */
export function getCached(fileHash: string): Promise<Result<AiSummary | null>> {
  return safeAsync(() => summariesRepo.getSummaryByHash(fileHash), 'aiSummary/getCached');
}

/**
 * Generate (and cache) a summary for a document. Skips the cache when `force`.
 * Surfaces typed errors for the not-configured and file-too-large cases so the UI
 * can show a calm state instead of a failure.
 */
export async function generate(file: PdfFile, force = false): Promise<Result<AiSummary>> {
  if (!aiService.isConfigured()) {
    return err({ code: 'ai/not-configured', message: 'AI backend is not configured yet.' });
  }
  if (file.size > MAX_AI_BYTES) {
    return err({
      code: 'ai/too-large',
      message: 'This document is too large to summarize yet.',
    });
  }

  const hashResult = await resolveHash(file);
  if (!hashResult.ok) return hashResult;
  const fileHash = hashResult.value;

  if (!force) {
    const cached = await getCached(fileHash);
    if (cached.ok && cached.value) return ok(cached.value);
  }

  const base64Result = await fileService.readBase64(file.uri);
  if (!base64Result.ok) return base64Result;

  const completion = await aiService.summarizeDocument({
    name: file.name,
    base64: base64Result.value,
  });
  if (!completion.ok) return completion;

  return safeAsync(
    () => summariesRepo.saveSummary(fileHash, completion.value, Date.now()),
    'aiSummary/save',
  );
}
