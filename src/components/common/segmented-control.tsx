/**
 * SegmentedControl — a compact multi-option selector. The selected segment's pill
 * springs in (opacity + scale on the UI thread); switching fires a selection
 * haptic. Generic over the option value type.
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
  const { colors, shadows } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.backgroundElement }]}>
      {segments.map((segment) => (
        <SegmentItem
          key={segment.value}
          label={segment.label}
          selected={segment.value === value}
          surface={colors.surface}
          shadow={shadows.sm}
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
  surface,
  shadow,
  onPress,
}: {
  label: string;
  selected: boolean;
  surface: string;
  shadow: object;
  onPress: () => void;
}) {
  const progress = useDerivedValue(() => withSpring(selected ? 1 : 0, Springs.snappy));
  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.92 + progress.value * 0.08 }],
  }));

  return (
    <PressScale style={styles.segment} scaleTo={0.97} haptic="none" onPress={onPress}>
      <Animated.View
        pointerEvents="none"
        style={[styles.pill, { backgroundColor: surface }, shadow, pillStyle]}
      />
      <Text variant="smallBold" color={selected ? 'text' : 'textSecondary'}>
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
  },
  pill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radii.sm,
  },
});
