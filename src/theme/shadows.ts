/**
 * Elevation presets.
 *
 * The design language is now FLAT & CLEAN: no drop shadows, no Android elevation,
 * no glow anywhere. These presets are intentionally empty so that existing
 * call-sites (`shadows[level]`, `glowShadow(...)`) keep compiling while rendering
 * nothing. Depth/definition comes from solid surfaces + hairline borders instead.
 */

import { type ViewStyle } from 'react-native';

export type ElevationLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

const flat: Record<ElevationLevel, ShadowStyle> = {
  none: {},
  sm: {},
  md: {},
  lg: {},
  xl: {},
};

export const Shadows = {
  light: flat,
  dark: flat,
} as const;

/**
 * Retained for API compatibility — returns no shadow. The UI is flat by design,
 * so "glow" resolves to nothing.
 */
export function glowShadow(_color?: string, _strength?: 'sm' | 'md' | 'lg'): ShadowStyle {
  return {};
}
