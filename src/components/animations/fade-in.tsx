/**
 * FadeIn — a calm entrance: fade in (opacity) with a subtle scale-settle
 * (0.96 → 1) and NO vertical travel, so content arrives softly instead of
 * "jumping" up. Stagger is small and capped so long lists don't cascade. Runs
 * entirely on the UI thread (opacity + transform only).
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { EntranceScaleFrom, Springs, Timings } from '@/theme';

export interface FadeInProps {
  children: ReactNode;
  /** Base delay in ms before the animation starts. */
  delay?: number;
  /** List position — adds a small, capped per-item stagger on top of `delay`. */
  index?: number;
  /** Per-item stagger step in ms. */
  stagger?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeIn({ children, delay = 0, index = 0, stagger = 14, style }: FadeInProps) {
  const total = delay + Math.min(index, 4) * stagger; // cap the cascade on long lists
  const opacity = useSharedValue(0);
  const scale = useSharedValue(EntranceScaleFrom);

  useEffect(() => {
    opacity.value = withDelay(total, withTiming(1, Timings.fade));
    scale.value = withDelay(total, withSpring(1, Springs.gentle));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
