/**
 * CortexPDF AI proxy — a stateless Cloudflare Worker that keeps the Gemini API key
 * server-side (never in the app) and does the work the mobile client can't:
 *   • POST /extract — decode a base64 PDF, pull per-page text with unpdf; if the PDF
 *     is scanned (no text layer) fall back to Gemini's native PDF OCR.
 *   • POST /ai      — run a named task (summary, quiz, ask, …) over TEXT the app sends.
 *   • POST /complete | /summarize | /ask — back-compat with the app's ProxyProvider.
 *
 * Contract: success → 200 { content } (or the /extract shape); failure → non-2xx
 * { error: { code, message } }. Every response carries permissive CORS headers.
 *
 * Deploy: see README.md. Set the key with `npx wrangler secret put GEMINI_API_KEY`.
 */

import { extractText, getDocumentProxy } from 'unpdf';

interface Env {
  GEMINI_API_KEY: string;
}

/** Current stable free-tier Flash model. One-line change if the id ever drifts. */
const MODEL = 'gemini-3.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
/** Below this average chars/page the PDF is treated as scanned → OCR fallback. */
const SPARSE_CHARS_PER_PAGE = 24;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });

const fail = (code: string, message: string, status: number): Response =>
  json({ error: { code, message } }, status);

// ---------------------------------------------------------------------------
// Prompt catalog — authoritative server copy (the app keeps a parallel copy for
// slice sizing). systemInstruction forbids preamble so output tokens stay tight.
// ---------------------------------------------------------------------------

interface TaskSpec {
  system: string;
  /** `{text}`, `{question}`, `{n}` are substituted from the request. */
  user: string;
  maxOutputTokens: number;
  temperature: number;
}

const TASKS: Record<string, TaskSpec> = {
  summary: {
    system:
      'You are a precise reading assistant. Summarize the provided document text into a tight, scannable overview a reader can absorb in under a minute. Use ONLY the supplied text — never invent facts. Open with a one-sentence thesis, then 3-6 short bullets in document order. No preamble or closing remarks. If the text is too short, reply exactly: "Not enough text to summarize."',
    user: 'Summarize this document text:\n\n{text}',
    maxOutputTokens: 400,
    temperature: 0.3,
  },
  'page-summary': {
    system:
      'You are a precise reading assistant. Summarize a SINGLE page into 2-4 crisp sentences capturing only what is on this page. Use ONLY the supplied text. Do not reference other pages. No preamble. If the page has too little text, reply exactly: "This page has little text to summarize."',
    user: 'Summarize page {n} of the document. Page text:\n\n{text}',
    maxOutputTokens: 220,
    temperature: 0.3,
  },
  'key-points': {
    system:
      'You are a precise reading assistant. Extract the most important takeaways as a flat bullet list. Use ONLY the supplied text. Each point is one self-contained sentence, ordered by importance, no nesting or duplication. Aim for 5-8 points. No preamble. If there is not enough text, return nothing.',
    user: 'Extract the key points from this document text:\n\n{text}',
    maxOutputTokens: 350,
    temperature: 0.3,
  },
  quiz: {
    system:
      'You are an assessment generator. From the provided text write {n} multiple-choice questions testing comprehension. Use ONLY facts in the text. Each has exactly 4 options, exactly one correct, plausible distractors, and a one-sentence explanation grounded in the text. Output STRICT JSON ONLY — no markdown, no code fences, no prose. If the text cannot support {n}, return as many valid ones as it supports.',
    user: 'Generate {n} multiple-choice questions from this document text:\n\n{text}',
    maxOutputTokens: 1100,
    temperature: 0.4,
  },
  flashcards: {
    system:
      'You are a flashcard generator for spaced repetition. From the provided text create {n} flashcards on the most testable concepts. Use ONLY the supplied text. Fronts are short prompts; backs are concise answers (1-2 sentences). One idea per card, no duplicates. Output STRICT JSON ONLY — no markdown, no code fences, no prose.',
    user: 'Create {n} flashcards from this document text:\n\n{text}',
    maxOutputTokens: 1000,
    temperature: 0.4,
  },
  notes: {
    system:
      'You are a study-notes assistant. Turn the provided text into clean hierarchical study notes. Use ONLY the supplied text. Short topic headings with nested bullets; bold key terms. Terse, no filler, no preamble or conclusion. Preserve the document order.',
    user: 'Write study notes from this document text:\n\n{text}',
    maxOutputTokens: 800,
    temperature: 0.3,
  },
  ask: {
    system:
      'You are a grounded document Q&A assistant. Answer the question using ONLY the provided context. No outside knowledge. Be direct and concise. If the answer is not in the context, reply exactly: "The document does not cover this." Never fabricate.',
    user: 'Document context:\n\n{text}\n\nQuestion: {question}',
    maxOutputTokens: 450,
    temperature: 0.2,
  },
  explain: {
    system:
      'You are a patient explainer. Re-explain the provided text in plain, simple language a non-expert can follow. Use ONLY the ideas in the text — clarify, do not add facts. Replace jargon with everyday words. Short sentences. No preamble.',
    user: 'Explain this in simple terms:\n\n{text}',
    maxOutputTokens: 500,
    temperature: 0.4,
  },
  translate: {
    system:
      'You are a faithful translator. Translate the provided text into {question} (the target language). Preserve meaning, tone, and formatting. Do NOT summarize, explain, omit, or add. Output ONLY the translation. If already in the target language, return it unchanged.',
    user: 'Translate the following text into {question}:\n\n{text}',
    maxOutputTokens: 1200,
    temperature: 0.2,
  },
};

interface TaskParams {
  n?: number;
  question?: string;
  language?: string;
  page?: number;
}

function fillTemplate(template: string, text: string, params: TaskParams): string {
  return template
    .replace('{text}', text)
    .replace('{question}', params.question ?? params.language ?? '')
    .replace(/\{n\}/g, String(params.n ?? 5));
}

// ---------------------------------------------------------------------------
// Base64 <-> bytes (Workers-safe, chunked to avoid V8 call-stack overflow)
// ---------------------------------------------------------------------------

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------

interface GeminiPart {
  text?: string;
}

function readGeminiText(data: unknown): string {
  const parts = (data as { candidates?: { content?: { parts?: GeminiPart[] } }[] })?.candidates?.[0]
    ?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p) => p.text ?? '')
    .join('')
    .trim();
}

async function callGemini(
  env: Env,
  body: Record<string, unknown>,
): Promise<{ ok: true; text: string } | { ok: false; status: number; message: string }> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ?? `Gemini returned ${res.status}`;
    return { ok: false, status: 502, message };
  }
  const text = readGeminiText(data);
  if (!text) return { ok: false, status: 502, message: 'The model returned no text.' };
  return { ok: true, text };
}

/** Run a text task through Gemini. */
async function runTask(env: Env, task: string, text: string, params: TaskParams): Promise<Response> {
  const spec = TASKS[task];
  if (!spec) return fail('ai/bad-request', `Unknown task: ${task}`, 400);
  if (!text || !text.trim()) return fail('ai/bad-request', 'No text provided.', 400);

  const result = await callGemini(env, {
    systemInstruction: { parts: [{ text: fillTemplate(spec.system, '', params) }] },
    contents: [{ role: 'user', parts: [{ text: fillTemplate(spec.user, text, params) }] }],
    generationConfig: { maxOutputTokens: spec.maxOutputTokens, temperature: spec.temperature },
  });
  if (!result.ok) return fail('ai/upstream', result.message, result.status);
  return json({ content: result.text });
}

/** Run free-form messages (back-compat /complete). */
async function runMessages(
  env: Env,
  messages: { role: string; content: string }[],
): Promise<Response> {
  const system = messages.find((m) => m.role === 'system')?.content;
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const body: Record<string, unknown> = { contents };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  const result = await callGemini(env, body);
  if (!result.ok) return fail('ai/upstream', result.message, result.status);
  return json({ content: result.text });
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

interface ExtractedPage {
  page: number;
  text: string;
}

async function extractDocument(env: Env, base64: string): Promise<Response> {
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(base64);
  } catch {
    return fail('ai/bad-request', 'Invalid base64 document.', 400);
  }

  let perPage: ExtractedPage[] = [];
  let totalPages = 0;
  try {
    const pdf = await getDocumentProxy(bytes);
    const { totalPages: count, text } = await extractText(pdf);
    totalPages = count;
    perPage = (text as string[]).map((t, i) => ({ page: i + 1, text: t ?? '' }));
  } catch (e) {
    return fail('ai/extract-failed', e instanceof Error ? e.message : 'Could not read the PDF.', 422);
  }

  const totalChars = perPage.reduce((sum, p) => sum + p.text.trim().length, 0);
  const sparse = totalPages > 0 && totalChars < totalPages * SPARSE_CHARS_PER_PAGE;

  // Scanned / image PDF → let Gemini OCR it natively.
  if (sparse) {
    const result = await callGemini(env, {
      contents: [
        {
          role: 'user',
          parts: [
            { inline_data: { mime_type: 'application/pdf', data: bytesToBase64(bytes) } },
            { text: 'Extract all text from this document, preserving page order. Separate pages with a line containing only "\f".' },
          ],
        },
      ],
      generationConfig: { maxOutputTokens: 8192, temperature: 0 },
    });
    if (result.ok) {
      const chunks = result.text.split('\f');
      const ocrPages = chunks.map((t, i) => ({ page: i + 1, text: t.trim() }));
      return json({ totalPages: ocrPages.length || totalPages || 1, scanned: true, perPage: ocrPages });
    }
    // OCR failed — return whatever (sparse) text we have rather than erroring.
  }

  return json({ totalPages, scanned: sparse, perPage });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

interface AiBody {
  task?: string;
  text?: string;
  params?: TaskParams;
  messages?: { role: string; content: string }[];
  document?: { name?: string; base64?: string };
  question?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
    if (request.method !== 'POST') return fail('ai/bad-request', 'Use POST.', 405);
    if (!env.GEMINI_API_KEY) return fail('ai/not-configured', 'Server is missing GEMINI_API_KEY.', 500);

    const path = new URL(request.url).pathname.replace(/\/$/, '');
    let body: AiBody;
    try {
      body = (await request.json()) as AiBody;
    } catch {
      return fail('ai/bad-request', 'Invalid JSON body.', 400);
    }

    try {
      switch (path) {
        case '/extract': {
          if (!body.document?.base64) return fail('ai/bad-request', 'Missing document.base64.', 400);
          return await extractDocument(env, body.document.base64);
        }
        case '/ai': {
          if (!body.task) return fail('ai/bad-request', 'Missing task.', 400);
          return await runTask(env, body.task, body.text ?? '', body.params ?? {});
        }
        case '/complete': {
          if (!Array.isArray(body.messages)) return fail('ai/bad-request', 'Missing messages.', 400);
          return await runMessages(env, body.messages);
        }
        case '/summarize':
        case '/ask': {
          // Back-compat: extract then run the matching task in one call.
          if (!body.document?.base64) return fail('ai/bad-request', 'Missing document.base64.', 400);
          const extracted = await extractDocument(env, body.document.base64);
          const data = (await extracted.clone().json()) as { perPage?: ExtractedPage[] };
          if (!data.perPage) return extracted; // it was an error response
          const text = data.perPage.map((p) => p.text).join('\n\n');
          return await runTask(env, path === '/ask' ? 'ask' : 'summary', text, {
            question: body.question,
          });
        }
        default:
          return fail('ai/bad-request', `Unknown route: ${path}`, 404);
      }
    } catch (e) {
      return fail('ai/worker', e instanceof Error ? e.message : 'Unexpected worker error.', 500);
    }
  },
};
