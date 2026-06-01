/**
 * Haptics service — centralized, fail-safe wrapper over expo-haptics.
 *
 * Every tactile cue in the app routes through here so it can be globally toggled
 * (a settings preference) and so a platform without haptics simply no-ops. Calls
 * are fire-and-forget; we never await or surface errors for feedback.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let enabled = Platform.OS !== 'web';

/** Toggle haptics globally (driven by the settings store). */
export function setHapticsEnabled(value: boolean) {
  enabled = value && Platform.OS !== 'web';
}

const run = (fn: () => Promise<void>) => {
  if (!enabled) return;
  fn().catch(() => {});
};

export const haptics = {
  /** Light tap — selection, toggles, small confirmations. */
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Medium tap — primary button presses, opening sheets. */
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Selection tick — moving through segmented controls / pickers. */
  selection: () => run(() => Haptics.selectionAsync()),
  /** Success notification — completed actions. */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Warning notification. */
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  /** Error notification — failed actions. */
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
