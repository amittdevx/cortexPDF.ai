/**
 * AI service (feature layer) — the text-based flow. Extracts a document's text
 * ONCE (via the proxy), caches it per-page in SQLite, then runs every task over a
 * trimmed text slice and caches the result by a composite key so repeats cost zero
 * tokens. Returns Result; no React state, no SQL (RULE 1). The AI backend is reached
 * only through `@/services/ai`.
 */

import * as aiService from '@/services/ai';
import type { AiTask, AiTaskParams, ExtractedPage } from '@/services/ai';
import { aiResultsRepo, pageTextRepo } from '@/services/database';
import * as fileService from '@/services/file';
import * as ocrService from '@/services/ocr';
import type { PdfFile } from '@/types/domain';
import { err, ok, safeAsync, type Result } from '@/utils/result';
import { hashString } from '@/utils/id';

import { getTask } from '../ai-tasks';

/** Above this, base64-uploading the whole file for extraction is too heavy (v1). */
const MAX_AI_BYTES = 12 * 1024 * 1024;

const notConfigured = () =>
  err({ code: 'ai/not-configured', message: 'AI backend is not configured yet.' });

/** Stable content hash for the cache (md5, with a uri+size fallback). */
export function resolveHash(file: PdfFile): Promise<Result<string>> {
  return fileService.getContentHash(file.uri, file.size);
}

/**
 * Ensure a document's text is extracted + cached. Returns the content hash. On a
 * cache hit this is a cheap metadata read; on a miss it uploads the PDF once.
 */
export async function ensureExtracted(file: PdfFile): Promise<Result<string>> {
  if (!aiService.isConfigured()) return notConfigured();

  const hashResult = await resolveHash(file);
  if (!hashResult.ok) return hashResult;
  const fileHash = hashResult.value;

  const meta = await pageTextRepo.getMeta(fileHash);
  if (meta) return ok(fileHash);

  if (file.size > MAX_AI_BYTES) {
    return err({ code: 'ai/too-large', message: 'This document is too large for AI yet.' });
  }

  const base64Result = await fileService.readBase64(file.uri);
  if (!base64Result.ok) return base64Result;

  const doc = { name: file.name, base64: base64Result.value };

  // Pull the text layer server-side, but skip its Gemini OCR — scanned PDFs are
  // OCR'd on-device below (no tokens, no output cap, works offline once cached).
  const extracted = await aiService.extractDocument(doc, { skipServerOcr: true });
  if (!extracted.ok) return extracted;

  let { totalPages, scanned, perPage } = extracted.value;

  if (scanned) {
    const ocr = await ocrService.ocrPdf(file.uri);
    if (ocr.ok && hasText(ocr.value)) {
      perPage = ocr.value;
      totalPages = ocr.value.length || totalPages;
    } else {
      // On-device OCR unavailable/empty → fall back to the server's Gemini OCR.
      const serverOcr = await aiService.extractDocument(doc, { skipServerOcr: false });
      if (serverOcr.ok) ({ totalPages, scanned, perPage } = serverOcr.value);
    }
  }

  const saved = await safeAsync(
    () => pageTextRepo.save(fileHash, { totalPages, scanned }, perPage, Date.now()),
    'ai/saveText',
  );
  if (!saved.ok) return saved;
  return ok(fileHash);
}

/** Whether an extraction produced any usable text at all. */
const hasText = (pages: ExtractedPage[]): boolean => pages.some((p) => p.text.trim().length > 0);

/** Build the trimmed text slice a task reads. */
async function buildSlice(
  fileHash: string,
  task: AiTask,
  params: AiTaskParams,
): Promise<string> {
  const def = getTask(task);
  let text = '';
  if (def.scope === 'page') {
    text = (await pageTextRepo.getPage(fileHash, params.page ?? 1)) ?? '';
  } else {
    const pages = await pageTextRepo.getPages(fileHash);
    text = pages.map((p) => p.text).join('\n\n');
  }
  return text.length > def.charBudget ? text.slice(0, def.charBudget) : text;
}

const cacheKeyFor = (fileHash: string, task: AiTask, params: AiTaskParams, slice: string) =>
  hashString(`${fileHash}:${task}:${JSON.stringify(params)}:${hashString(slice)}`);

export interface TaskResult {
  /** Composite cache key — the hook uses it to key store state. */
  key: string;
  content: string;
}

/**
 * Run a task for a document. Extracts if needed, builds the slice, checks the
 * durable cache, and only then calls the model. `force` ignores the cache.
 */
export async function run(
  file: PdfFile,
  task: AiTask,
  params: AiTaskParams = {},
  force = false,
): Promise<Result<TaskResult>> {
  const ensured = await ensureExtracted(file);
  if (!ensured.ok) return ensured;
  const fileHash = ensured.value;

  const slice = await buildSlice(fileHash, task, params);
  if (!slice.trim()) {
    return err({ code: 'ai/no-text', message: 'No readable text found for this selection.' });
  }
  const key = cacheKeyFor(fileHash, task, params, slice);

  if (!force) {
    const cached = await aiResultsRepo.get(key);
    if (cached !== null) return ok({ key, content: cached });
  }

  const completion = await aiService.runTask(task, slice, params);
  if (!completion.ok) return completion;

  await safeAsync(() => aiResultsRepo.save(key, task, completion.value, Date.now()), 'ai/saveResult');
  return ok({ key, content: completion.value });
}
