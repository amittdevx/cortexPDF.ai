/**
 * Parallax header kit — the premium large-title pattern used by the primary
 * screens.
 *
 * - `useScrollHeader()` gives a `scrollY` shared value + an animated scroll
 *   handler to wire onto an `Animated.FlatList`/`Animated.ScrollView`.
 * - `LargeTitleHeader` is the big in-flow title (render it as the list header). It
 *   drifts up a touch and fades as it scrolls away (parallax).
 * - `CollapsingHeaderBar` is a glass bar that slides down from off-screen and
 *   fades in once the large title has scrolled past — like iOS large titles.
 *
 * The screens own the list + scrollY and compose all three, so these stay pure
 * presentation (RULE 1).
 */

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { FontWeight, ScreenPadding, Spacing } from '@/theme';

import { Glass } from './glass';
import { Text } from './text';

/** Shared scroll position + the handler to attach to an Animated scroller. */
export function useScrollHeader() {
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  return { scrollY, scrollHandler };
}

export interface LargeTitleHeaderProps {
  title: string;
  subtitle?: string;
  /** Small tinted label above the title (editorial accent). */
  eyebrow?: string;
  /** Right-aligned action, e.g. an IconButton. */
  trailing?: ReactNode;
  scrollY?: SharedValue<number>;
}

export function LargeTitleHeader({
  title,
  subtitle,
  eyebrow,
  trailing,
  scrollY,
}: LargeTitleHeaderProps) {
  const drift = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const translateY = interpolate(scrollY.value, [-120, 0, 140], [40, 0, -28], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 70, 120], [1, 1, 0], Extrapolation.CLAMP);
    return { transform: [{ translateY }], opacity };
  });

  return (
    <Animated.View style={[styles.large, drift]}>
      <View style={styles.largeText}>
        {eyebrow ? (
          <Text variant="captionBold" color="primary" style={styles.eyebrow}>
            {eyebrow.toUpperCase()}
          </Text>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text variant="callout" color="textSecondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.largeTrailing}>{trailing}</View> : null}
    </Animated.View>
  );
}

export interface CollapsingHeaderBarProps {
  title: string;
  trailing?: ReactNode;
  scrollY: SharedValue<number>;
  /** Scroll range over which the bar slides in. Default [40, 104]. */
  range?: [number, number];
}

export function CollapsingHeaderBar({
  title,
  trailing,
  scrollY,
  range = [40, 104],
}: CollapsingHeaderBarProps) {
  const insets = useSafeAreaInsets();
  const barHeight = insets.top + 52;

  const anim = useAnimatedStyle(() => {
    const t = interpolate(scrollY.value, range, [0, 1], Extrapolation.CLAMP);
    return {
      // Parked fully off-screen (above) at the top, so it never blocks the
      // large title's controls; slides into place as you scroll.
      transform: [{ translateY: -barHeight * (1 - t) }],
      opacity: t,
    };
  });

  return (
    <View pointerEvents="box-none" style={styles.barContainer}>
      <Animated.View style={anim}>
        <Glass variant="chrome" radius="none" elevation="sm" style={[styles.bar, { paddingTop: insets.top + 6 }]}>
          <Text variant="bodyMedium" numberOfLines={1} style={styles.barTitle}>
            {title}
          </Text>
          {trailing ? <View style={styles.barTrailing}>{trailing}</View> : null}
        </Glass>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  large: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  largeText: { flex: 1, gap: Spacing.one },
  eyebrow: { letterSpacing: 1.2 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: FontWeight.bold, letterSpacing: -0.6 },
  subtitle: {},
  largeTrailing: { paddingBottom: Spacing.half },
  barContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  bar: {
    minHeight: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.two,
    paddingHorizontal: ScreenPadding,
  },
  barTitle: { flex: 1, textAlign: 'center' },
  barTrailing: { position: 'absolute', right: ScreenPadding, bottom: Spacing.two },
});
