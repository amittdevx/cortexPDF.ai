/**
 * TabButton — the custom, animated tab item rendered inside the headless
 * `TabTrigger asChild`. When focused, a glowing brand-gradient pill springs in
 * behind the icon, the icon swaps to its filled variant and turns white, and the
 * label brightens to the brand color — "felt, not noticed" motion on the UI
 * thread. Forwards its ref so the router can drive navigation.
 */

import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import { GradientView } from '@/components/common/gradient';
import { Icon, type IconName } from '@/components/common/icon';
import { Text } from '@/components/common/text';
import { Spacing, Springs } from '@/theme';

export interface TabButtonProps {
  icon: IconName;
  iconFocused: IconName;
  label: string;
  /** Injected by `TabTrigger asChild`. */
  isFocused?: boolean;
  onPress?: (e: any) => void;
  onLongPress?: (e: any) => void;
}

export const TabButton = forwardRef<View, TabButtonProps>(function TabButton(
  { icon, iconFocused, label, isFocused = false, ...pressProps },
  ref,
) {
  const progress = useDerivedValue(() => withSpring(isFocused ? 1 : 0, Springs.gentle));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.55 + progress.value * 0.45 }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -progress.value * 2 }, { scale: 0.94 + progress.value * 0.06 }],
  }));

  return (
    <Pressable
      ref={ref}
      {...pressProps}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={styles.item}>
      <View style={styles.iconWrap}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, pillStyle]}>
          <GradientView gradient="gradientBrand" radius="pill" style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={iconStyle}>
          <Icon
            name={isFocused ? iconFocused : icon}
            size="md"
            color={isFocused ? 'textOnPrimary' : 'textTertiary'}
          />
        </Animated.View>
      </View>
      <Text variant="caption" color={isFocused ? 'primary' : 'textTertiary'}>
        {label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
    paddingTop: Spacing.two,
  },
  iconWrap: {
    width: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
