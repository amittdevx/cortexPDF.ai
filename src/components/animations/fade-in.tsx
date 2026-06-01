/**
 * FadeIn — a declarative entrance animation. Wrap any view to have it fade + rise
 * into place on mount. Pass `index` for automatic staggering down a list, so
 * content arrives as a gentle cascade rather than all at once.
 */

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Duration } from '@/theme';

export interface FadeInProps {
  children: ReactNode;
  /** Base delay in ms before the animation starts. */
  delay?: number;
  /** List position — adds a per-item stagger on top of `delay`. */
  index?: number;
  /** Per-item stagger step in ms. */
  stagger?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeIn({ children, delay = 0, index = 0, stagger = 55, style }: FadeInProps) {
  const totalDelay = delay + index * stagger;
  return (
    <Animated.View
      entering={FadeInDown.duration(Duration.base).delay(totalDelay).springify().damping(20)}
      style={style}>
      {children}
    </Animated.View>
  );
}
