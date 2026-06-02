/**
 * File service — the single, centralized wrapper over document picking, the
 * filesystem, and sharing. Features never import expo-* file modules directly;
 * they go through here, so swapping implementations or adding validation/caching
 * happens in one place.
 *
 * All methods return `Result` and never throw — honoring "NEVER CRASH APP".
 */

import * as DocumentPicker from 'expo-document-picker';

import { PDF_MIME_TYPE } from '@/constants/app';
import { err, ok, safeAsync, type Result } from '@/utils/result';

/** A document the user selected from the picker. */
export interface PickedDocument {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

/**
 * Open the system picker for a single PDF. Returns `null` value when the user
 * cancels (a non-error outcome).
 */
export async function pickPdf(): Promise<Result<PickedDocument | null>> {
  return safeAsync(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: PDF_MIME_TYPE,
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.length) return null;
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.name,
      size: asset.size ?? 0,
      mimeType: asset.mimeType ?? PDF_MIME_TYPE,
    };
  }, 'pickPdf');
}

/** Stat a local file: whether it exists and its size in bytes. */
export async function getFileInfo(uri: string): Promise<Result<{ exists: boolean; size: number }>> {
  return safeAsync(async () => {
    const { File } = await import('expo-file-system');
    const file = new File(uri);
    return { exists: file.exists, size: file.size ?? 0 };
  }, 'getFileInfo');
}

/** Read a local file as a base64 string (e.g. to upload to the AI proxy). */
export async function readBase64(uri: string): Promise<Result<string>> {
  return safeAsync(async () => {
    const { File } = await import('expo-file-system');
    return await new File(uri).base64();
  }, 'readBase64');
}

/**
 * A stable content hash for a file (md5). Used to key caches across re-imports of
 * the same document. Falls back to a uri+size key when the platform can't hash.
 */
export async function getContentHash(uri: string, size = 0): Promise<Result<string>> {
  return safeAsync(async () => {
    const { File } = await import('expo-file-system');
    return new File(uri).md5 ?? `uri:${uri}:${size}`;
  }, 'getContentHash');
}

/** Share a local file through the OS share sheet. */
export async function shareFile(uri: string, mimeType = PDF_MIME_TYPE): Promise<Result<void>> {
  return safeAsync(async () => {
    const Sharing = await import('expo-sharing');
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('Sharing is not available on this device');
    }
    await Sharing.shareAsync(uri, { mimeType, UTI: 'com.adobe.pdf' });
  }, 'shareFile');
}

/** Delete a local file. Succeeds quietly if it's already gone. */
export async function deleteFile(uri: string): Promise<Result<void>> {
  return safeAsync(async () => {
    const { File } = await import('expo-file-system');
    const file = new File(uri);
    if (file.exists) file.delete();
  }, 'deleteFile');
}

export { err, ok };
