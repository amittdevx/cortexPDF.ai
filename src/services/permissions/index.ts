/**
 * Permissions service — centralized permission requests.
 *
 * Per the security strategy, permissions are requested only when a feature needs
 * them, through this single facade. The document picker and SAF-based file access
 * used in the foundation phase require no runtime permission, so those resolve
 * `granted` immediately. Camera / media-library permissions (OCR, scanning) slot
 * in here later without touching feature code.
 */

import { safeAsync, type Result } from '@/utils/result';

export type PermissionType = 'fileAccess' | 'camera' | 'mediaLibrary';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

const ALWAYS_GRANTED: PermissionStatus = { granted: true, canAskAgain: true };

/** Request a permission. Returns its resulting status (never throws). */
export async function requestPermission(type: PermissionType): Promise<Result<PermissionStatus>> {
  return safeAsync(async () => {
    switch (type) {
      case 'fileAccess':
        // Document picker grants scoped access without a runtime prompt.
        return ALWAYS_GRANTED;
      case 'camera':
      case 'mediaLibrary':
        // Wired to expo-camera / expo-media-library in a later phase.
        return ALWAYS_GRANTED;
      default:
        return ALWAYS_GRANTED;
    }
  }, `requestPermission:${type}`);
}
