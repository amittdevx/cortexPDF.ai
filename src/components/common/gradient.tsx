/**
 * Gradient primitives — the flat "Aurora" color building blocks.
 *
 * - `GradientView`: a rounded surface filled with a flat theme gradient (no rim
 *   sheen, no glow — clean and flat by design).
 * - `GradientMedallion`: an icon centered on a gradient tile (tools, settings,
 *   empty states).
 * - `GradientThumb`: a document tile whose gradient is derived from the file, so
 *   every document gets a distinct, recognizable color identity.
 *
 * These are the only place (besides `AuroraBackground`) that paints brand
 * gradients, so the look stays consistent and tunable from here.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing, type Gradient, type GradientColor, type RadiusToken } from '@/theme';

import { Icon, type IconName } from './icon';

type Vec = { x: number; y: number };

export interface GradientViewProps extends ViewProps {
  /** Explicit gradient stops. Takes precedence over `gradient`. */
  colors?: Gradient;
  /** Theme gradient role. Default `gradientBrand`. */
  gradient?: GradientColor;
  radius?: RadiusToken;
  start?: Vec;
  end?: Vec;
  padding?: keyof typeof Spacing;
}

export function GradientView({
  colors,
  gradient = 'gradientBrand',
  radius = 'lg',
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  padding,
  style,
  children,
  ...rest
}: GradientViewProps) {
  const { colors: theme } = useTheme();
  const stops = colors ?? theme[gradient];
  const r = Radii[radius];
  const pad = padding ? { padding: Spacing[padding] } : null;

  return (
    // backgroundColor backs the gradient so there's never a sub-pixel gap.
    <View style={[{ borderRadius: r, backgroundColor: stops[0] }, style]} {...rest}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: r, overflow: 'hidden' }]}>
        <LinearGradient colors={stops} start={start} end={end} style={StyleSheet.absoluteFill} />
      </View>
      <View style={pad}>{children}</View>
    </View>
  );
}

export interface GradientMedallionProps {
  icon: IconName;
  colors?: Gradient;
  gradient?: GradientColor;
  /** Square side length. Default 48. */
  size?: number;
  radius?: RadiusToken;
  /** Ionicon size. Default derived from `size`. */
  iconSize?: number;
}

export function GradientMedallion({
  icon,
  colors,
  gradient = 'gradientBrand',
  size = 48,
  radius = 'md',
  iconSize,
}: GradientMedallionProps) {
  return (
    <GradientView colors={colors} gradient={gradient} radius={radius} style={{ width: size, height: size }}>
      <View style={[styles.center, { width: size, height: size }]}>
        <Icon name={icon} size={iconSize ?? Math.round(size * 0.46)} rawColor="#FFFFFF" />
      </View>
    </GradientView>
  );
}

/** A curated set of vivid gradient pairs that read well on light AND dark. */
const THUMB_GRADIENTS: Gradient[] = [
  ['#6366F1', '#9B5CF5'],
  ['#8B5CF6', '#EC4899'],
  ['#3B82F6', '#06B6D4'],
  ['#0EA5E9', '#10B981'],
  ['#F97316', '#EF4444'],
  ['#EC4899', '#F43F5E'],
  ['#14B8A6', '#22C55E'],
  ['#6366F1', '#3B82F6'],
];

/** Stable hash → gradient index, so a given file always gets the same colors. */
export function gradientForSeed(seed: string): Gradient {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return THUMB_GRADIENTS[h % THUMB_GRADIENTS.length];
}

export interface GradientThumbProps {
  /** Stable seed (e.g. file id) used to pick the gradient. */
  seed: string;
  size?: number;
  radius?: RadiusToken;
  icon?: IconName;
}

export function GradientThumb({
  seed,
  size = 48,
  radius = 'md',
  icon = 'document-text',
}: GradientThumbProps) {
  const stops = gradientForSeed(seed);
  return (
    <GradientView colors={stops} radius={radius} style={{ width: size, height: size }}>
      <View style={[styles.center, { width: size, height: size }]}>
        <Icon name={icon} size={Math.round(size * 0.44)} rawColor="#FFFFFF" />
      </View>
      {/* Folded paper corner — a subtle document cue. */}
      <View
        pointerEvents="none"
        style={[
          styles.fold,
          {
            borderTopWidth: size * 0.24,
            borderLeftWidth: size * 0.24,
            borderTopRightRadius: Radii[radius],
          },
        ]}
      />
    </GradientView>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  fold: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderTopColor: 'rgba(255,255,255,0.30)',
    borderLeftColor: 'transparent',
  },
});
