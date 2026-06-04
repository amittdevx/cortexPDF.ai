/**
 * OCR service — on-device text recognition for scanned PDFs.
 *
 * Pipeline (Android `PdfRenderer` / iOS PDFKit → ML Kit Text Recognition v2):
 *   render each PDF page to a JPEG (expo-pdf-to-image) → recognize text with the
 *   Devanagari model (which also covers Latin/English, so it handles mixed
 *   Hindi/English documents) → return per-page text, then delete the temp page
 *   images. Runs fully on-device: no network, no API tokens, no truncation cap.
 *
 * Used ONLY for scanned PDFs (no text layer). Text-layer PDFs are read server-side
 * by the proxy's `unpdf` path. Requires a dev build (native modules) — not Expo Go.
 * Returns `Result` and never throws, honoring "NEVER CRASH APP".
 */

import TextRecognition, { TextRecognitionScript } from '@react-native-ml-kit/text-recognition';
import PdfToImage from 'expo-pdf-to-image';

import type { ExtractedPage } from '@/services/ai';
import * as fileService from '@/services/file';
import { safeAsync, type Result } from '@/utils/result';

/**
 * The renderer returns scheme-less absolute paths; ML Kit's `InputImage.fromFilePath`
 * opens them via the ContentResolver, which needs a real URI scheme. Leave existing
 * `file://` / `content://` URIs untouched.
 */
const asFileUri = (path: string): string =>
  /^[a-z]+:\/\//i.test(path) ? path : `file://${path}`;

/**
 * OCR a scanned PDF on-device, one rendered page at a time. Pages that yield no
 * text come back as empty strings — callers decide what's usable. Temp page JPEGs
 * are cleaned up afterward whether OCR succeeds or fails.
 */
export async function ocrPdf(uri: string): Promise<Result<ExtractedPage[]>> {
  return safeAsync(async () => {
    const imagePaths = await PdfToImage.convertPdfToImages(uri);
    const perPage: ExtractedPage[] = [];
    try {
      for (let i = 0; i < imagePaths.length; i++) {
        const result = await TextRecognition.recognize(
          asFileUri(imagePaths[i]),
          TextRecognitionScript.DEVANAGARI,
        );
        perPage.push({ page: i + 1, text: result.text.trim() });
      }
    } finally {
      await Promise.all(imagePaths.map((p) => fileService.deleteFile(asFileUri(p))));
    }
    return perPage;
  }, 'ocr/ocrPdf');
}
