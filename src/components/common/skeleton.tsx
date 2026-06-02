/**
 * Skeleton — a placeholder shown while content loads, so screens never flash
 * empty. A specular highlight sweeps across it (a moving gradient) over a calm
 * base tint — premium "shimmer" rather than a flat pulse. Driven on the UI thread
 * (Reanimated), so it stays smooth.
 */

import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';
import { Radii, type RadiusToken } from '@/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: RadiusToken;
}

export function Skeleton({ width = '100%', height = 16, radius = 'sm' }: SkeletonProps) {
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [progress]);

  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-w, w]) }],
  }));

  return (
    <Animated.View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{
        width,
        height,
        borderRadius: Radii[radius],
        backgroundColor: colors.skeleton,
        overflow: 'hidden',
      }}>
      {w > 0 ? (
        <Animated.View style={[StyleSheet.absoluteFill, sweep]}>
          <LinearGradient
            colors={['transparent', colors.glassHighlight, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
