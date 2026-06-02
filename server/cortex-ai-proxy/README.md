# CortexPDF AI proxy (Cloudflare Worker)

Keeps the Gemini API key **server-side** (never in the app) and does the work the
mobile client can't: PDF text extraction (via `unpdf`, with a Gemini OCR fallback
for scanned PDFs) and the Gemini calls for every AI task.

The app reaches it through `AppConfig.aiProxyUrl`. Free on the Cloudflare Workers
free plan + the Gemini free tier.

## Endpoints

All responses are JSON. Success → `200`; failure → non-2xx `{ error: { code, message } }`.

| Route | Body | Returns |
|-------|------|---------|
| `POST /extract` | `{ document: { name, base64 } }` | `{ totalPages, scanned, perPage: [{ page, text }] }` |
| `POST /ai` | `{ task, text, params }` | `{ content }` |
| `POST /complete` | `{ messages: [{ role, content }] }` | `{ content }` |
| `POST /summarize` | `{ document }` | `{ content }` |
| `POST /ask` | `{ document, question }` | `{ content }` |

`task` ∈ `summary · page-summary · key-points · quiz · flashcards · notes · ask · explain · translate`.
`params` carries `{ n?, question?, language?, page? }` (only what a task needs).

## Deploy (one-time)

```bash
cd server/cortex-ai-proxy
npm install

# local dev: put your key in .dev.vars (gitignored), then:
echo 'GEMINI_API_KEY="YOUR_AI_STUDIO_KEY"' > .dev.vars
npx wrangler dev          # http://localhost:8787

# go live:
npx wrangler login                       # first time only
npx wrangler secret put GEMINI_API_KEY   # paste your key when prompted
npx wrangler deploy                      # → https://cortex-ai-proxy.<you>.workers.dev
```

Then put that URL into the app's `app.json` under `expo.extra.aiProxyUrl` and restart
Expo with `npx expo start --tunnel -c`.

## Notes

- **Model:** `gemini-3.5-flash` (see `MODEL` in `src/index.ts` — one-line change if the
  id drifts; fall back to `gemini-2.5-flash`). Never use `gemini-2.0-*` (shut down).
- **Key:** get it free at [aistudio.google.com](https://aistudio.google.com) → *Get API key*.
  **Restrict it** (unrestricted keys stop working June 19, 2026), and note the Worker URL
  is public — anyone with it can spend your quota, so consider a shared-secret header later.
- **Size:** the app guards uploads at 12 MB; base64 inflates ~33% but stays well under the
  100 MB free body cap. Big/scanned PDFs are the main cost — text PDFs extract for free.
