/**
 * Glass — the liquid-glass surface primitive (the glass analog of `Surface`), and
 * the ONLY place `expo-glass-effect` / `expo-blur` are imported.
 *
 * Performance contract (target device is a mid-range Android phone):
 * - `card` / `search` / `sheet` are ALWAYS cheap translucent fills — never blur
 *   (they live in scrolling lists / list headers / a Modal window).
 * - `chrome` is the only variant that may live-blur, and only where the caller
 *   allows it (not `flat`) on a capable platform. iOS 26 → real liquid glass;
 *   iOS<26 / Android≥31 → BlurView; otherwise → translucent fill.
 * Net effect on the mid-range Android device: exactly one live blur (the tab bar);
 * everything else is a translucent frosted fill over the screen's backdrop wash.
 */

import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Glass as GlassParams, Radii, Spacing, type ElevationLevel, type RadiusToken } from '@/theme';

const IOS = Platform.OS === 'ios';
const LIQUID = IOS && isLiquidGlassAvailable(); // iOS 26+ only
// Live blur only on iOS. expo-blur's Android 'dimezis' method needs a `blurTarget`
// ref (else it silently falls back to 'none') and is costly on mid-range devices,
// so Android chrome uses the translucent fill instead — same frosted look, no cost.
const CAN_LIVE_BLUR = IOS;

export type GlassVariant = 'card' | 'chrome' | 'sheet' | 'search';

export interface GlassProps extends ViewProps {
  /** card/search/sheet = faux-glass fill (never blurs). chrome = may live-blur. */
  variant?: GlassVariant;
  radius?: RadiusToken;
  padding?: keyof typeof Spacing;
  /** Draw the specular top highlight + hairline rim. Default true. */
  rim?: boolean;
  elevation?: ElevationLevel;
  /** Force the cheap fill path (e.g. reader chrome on Android over the PDF SurfaceView). */
  flat?: boolean;
}

export function Glass({
  variant = 'card',
  radius = 'lg',
  padding,
  rim = true,
  elevation,
  flat,
  style,
  children,
  ...rest
}: GlassProps) {
  const { scheme, colors, shadows } = useTheme();
  const r = Radii[radius];
  const elev: ElevationLevel =
    elevation ??
    (variant === 'chrome' || variant === 'sheet'
      ? 'lg'
      : scheme === 'dark' && variant === 'card'
        ? 'none' // avoid Android elevation-halo overdraw on many dark rows
        : 'sm');
  const pad = padding ? { padding: Spacing[padding] } : null;
  const rimBorder = rim
    ? { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glassBorder }
    : null;

  const Rim = rim ? (
    <LinearGradient
      colors={[colors.glassHighlight, 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      pointerEvents="none"
      style={[
        styles.rim,
        { height: GlassParams.highlightHeight, borderTopLeftRadius: r, borderTopRightRadius: r },
      ]}
    />
  ) : null;

  const wantsBlur = !flat && variant === 'chrome' && CAN_LIVE_BLUR;

  // (1) iOS 26 real liquid glass — chrome only
  if (variant === 'chrome' && LIQUID && !flat) {
    return (
      <GlassView
        glassEffectStyle="regular"
        tintColor={colors.glassTint}
        colorScheme={scheme}
        style={[{ borderRadius: r, overflow: 'hidden' }, shadows[elev], rimBorder, style]}
        {...rest}>
        {Rim}
        <View style={pad}>{children}</View>
      </GlassView>
    );
  }

  // (2) live BlurView — chrome only, on capable platforms
  if (wantsBlur) {
    return (
      <View style={[{ borderRadius: r, overflow: 'hidden' }, shadows[elev], rimBorder, style]} {...rest}>
        <BlurView
          intensity={GlassParams.intensityChrome}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {Rim}
        <View style={pad}>{children}</View>
      </View>
    );
  }

  // (3) faux-glass fill — cards, search, sheet, and chrome fallback
  const fillRole = variant === 'sheet' || variant === 'chrome' ? 'glassFillStrong' : 'glassFill';
  return (
    <View
      style={[{ backgroundColor: colors[fillRole], borderRadius: r }, shadows[elev], rimBorder, pad, style]}
      {...rest}>
      {Rim}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  rim: { position: 'absolute', top: 0, left: 0, right: 0 },
});
