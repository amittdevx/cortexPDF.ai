/**
 * SegmentedControl — a compact multi-option selector. The selected segment wears
 * a brand-gradient pill that springs in (opacity + scale on the UI thread) with
 * white text; switching fires a selection haptic. Generic over the option value.
 */

import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import { haptics } from '@/services/haptics';
import { Radii, Spacing, Springs } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

import { PressScale } from '../animations/press-scale';
import { GradientView } from './gradient';
import { Text } from './text';

export interface Segment<T extends string> {
  label: string;
  value: T;
}

export interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.backgroundElement }]}>
      {segments.map((segment) => (
        <SegmentItem
          key={segment.value}
          label={segment.label}
          selected={segment.value === value}
          onPress={() => {
            if (segment.value !== value) {
              haptics.selection();
              onChange(segment.value);
            }
          }}
        />
      ))}
    </View>
  );
}

function SegmentItem({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const progress = useDerivedValue(() => withSpring(selected ? 1 : 0, Springs.snappy));
  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.92 + progress.value * 0.08 }],
  }));

  return (
    <PressScale style={styles.segment} scaleTo={0.97} haptic="none" onPress={onPress}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, pillStyle]}>
        <GradientView gradient="gradientBrand" radius="sm" style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Text variant="smallBold" color={selected ? 'textOnPrimary' : 'textSecondary'}>
        {label}
      </Text>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: Spacing.half,
    borderRadius: Radii.md,
    gap: Spacing.half,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radii.sm,
    overflow: 'hidden',
  },
});
