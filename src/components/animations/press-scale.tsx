/**
 * PressScale — an interactive wrapper that springs slightly down on press and
 * fires a haptic. The base for every tappable surface (buttons, cards, list rows)
 * so touch feedback is uniform and native-driven (runs on the UI thread).
 */

import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { haptics } from '@/services/haptics';
import { PressScale as PressScaleTokens, Springs } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type HapticKind = 'none' | 'light' | 'medium' | 'selection';

export interface PressScaleProps extends Omit<PressableProps, 'style'> {
  /** Target scale while pressed. Defaults to the card press scale. */
  scaleTo?: number;
  /** Haptic fired on press-in. */
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
}

export function PressScale({
  scaleTo = PressScaleTokens.card,
  haptic = 'light',
  onPressIn,
  onPressOut,
  disabled,
  style,
  children,
  ...rest
}: PressScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, Springs.snappy);
        if (haptic !== 'none') haptics[haptic]();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, Springs.gentle);
        onPressOut?.(e);
      }}
      style={[animatedStyle, style]}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
}
