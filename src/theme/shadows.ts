/**
 * Elevation presets. Soft, minimal shadows per the design language ("minimal shadows").
 *
 * Shadows are scheme-aware: in dark mode we lean on elevated surface colors and a
 * very subtle shadow rather than the heavy drop shadows that work in light mode.
 */

import { Platform, type ViewStyle } from 'react-native';

export type ElevationLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

function shadow(opacity: number, radius: number, y: number, elevation: number): ShadowStyle {
  return Platform.select<ShadowStyle>({
    ios: {
      shadowColor: '#0B0C12',
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {
      shadowColor: '#0B0C12',
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
  })!;
}

const lightShadows: Record<ElevationLevel, ShadowStyle> = {
  none: shadow(0, 0, 0, 0),
  sm: shadow(0.06, 8, 2, 2),
  md: shadow(0.08, 16, 6, 5),
  lg: shadow(0.1, 28, 12, 10),
  xl: shadow(0.14, 40, 20, 18),
};

// Dark mode: shadows read poorly on near-black, so keep them faint.
const darkShadows: Record<ElevationLevel, ShadowStyle> = {
  none: shadow(0, 0, 0, 0),
  sm: shadow(0.2, 8, 2, 2),
  md: shadow(0.28, 16, 6, 5),
  lg: shadow(0.34, 28, 12, 10),
  xl: shadow(0.4, 40, 20, 18),
};

export const Shadows = {
  light: lightShadows,
  dark: darkShadows,
} as const;

/**
 * A colored "glow" shadow for premium accent elements (the FAB, active tab,
 * primary buttons). iOS renders the colored shadow directly; Android elevation
 * can't be tinted, so callers should pair this with a gradient rim/border for a
 * comparable halo. `strength` scales the spread + opacity.
 */
export function glowShadow(color: string, strength: 'sm' | 'md' | 'lg' = 'md'): ShadowStyle {
  const r = strength === 'sm' ? 12 : strength === 'lg' ? 28 : 20;
  const y = strength === 'sm' ? 4 : strength === 'lg' ? 12 : 8;
  const elevation = strength === 'sm' ? 4 : strength === 'lg' ? 14 : 9;
  return Platform.select<ShadowStyle>({
    ios: { shadowColor: color, shadowOffset: { width: 0, height: y }, shadowOpacity: 0.9, shadowRadius: r },
    android: { elevation, shadowColor: color },
    default: { shadowColor: color, shadowOffset: { width: 0, height: y }, shadowOpacity: 0.9, shadowRadius: r },
  })!;
}
