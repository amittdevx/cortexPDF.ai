/**
 * TabButton — the custom, animated tab item rendered inside the headless
 * `TabTrigger asChild`. When focused, a soft pill springs in behind the icon and
 * the icon swaps to its filled variant — "felt, not noticed" motion on the UI
 * thread. Forwards its ref so the router can drive navigation.
 */

import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/common/icon';
import { Text } from '@/components/common/text';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing, Springs } from '@/theme';

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
  const { colors } = useTheme();
  const progress = useDerivedValue(() => withSpring(isFocused ? 1 : 0, Springs.gentle));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -progress.value * 2 }, { scale: 0.96 + progress.value * 0.04 }],
  }));

  return (
    <Pressable
      ref={ref}
      {...pressProps}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={styles.item}>
      <View style={styles.iconWrap}>
        <Animated.View
          pointerEvents="none"
          style={[styles.pill, { backgroundColor: colors.glassFillPrimary }, pillStyle]}
        />
        <Animated.View style={iconStyle}>
          <Icon
            name={isFocused ? iconFocused : icon}
            size="lg"
            color={isFocused ? 'primary' : 'textTertiary'}
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
    width: 60,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radii.pill,
  },
});
