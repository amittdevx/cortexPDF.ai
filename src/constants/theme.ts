/**
 * Backward-compatibility shim.
 *
 * The canonical design system now lives in `@/theme`. This file re-exports the
 * tokens the original starter referenced so existing imports keep working.
 * Prefer importing from `@/theme` in new code.
 */

export {
  Colors,
  Fonts,
  Spacing,
  BottomTabInset,
  MaxContentWidth,
  type ThemeColor,
} from '@/theme';
