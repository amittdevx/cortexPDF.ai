/**
 * AuroraBackground — the soft, glowing indigo→violet wash that sits behind every
 * screen and gives the app its "Aurora" identity. It layers a vertical base
 * gradient with three low-alpha color blobs near the top (faked radially via
 * `expo-linear-gradient` + circular clipping — cheap, no live blur, fine on
 * mid-range Android).
 *
 * Pass a `scrollY` shared value to make the blobs drift up slower than the
 * content (parallax) and stretch on pull-to-overscroll — the "smooth & premium"
 * motion signature. Purely decorative: always `pointerEvents="none"`.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

export interface AuroraBackgroundProps {
  /** Drives a gentle parallax: blobs drift up slower than content + stretch on pull. */
  scrollY?: SharedValue<number>;
}

export function AuroraBackground({ scrollY }: AuroraBackgroundProps) {
  const { colors } = useTheme();

  const parallax = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const translateY = interpolate(scrollY.value, [-220, 0, 400], [70, 0, -150], Extrapolation.CLAMP);
    const scale = interpolate(scrollY.value, [-220, 0], [1.3, 1], Extrapolation.CLAMP);
    return { transform: [{ translateY }, { scale }] };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base vertical wash — fades to the canvas color so the bottom blends out. */}
      <LinearGradient
        colors={[colors.backdropTop, colors.backdropBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Aurora blobs, concentrated up top, drifting on scroll. */}
      <Animated.View style={[styles.field, parallax]}>
        <Blob colors={colors.auroraOne} style={styles.blobA} />
        <Blob colors={colors.auroraTwo} style={styles.blobB} />
        <Blob colors={colors.auroraThree} style={styles.blobC} />
      </Animated.View>
    </View>
  );
}

function Blob({
  colors,
  style,
}: {
  colors: readonly [string, string, ...string[]];
  style: object;
}) {
  return (
    <View style={[styles.blob, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.85, y: 0.95 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { position: 'absolute', top: 0, left: 0, right: 0, height: 520 },
  blob: { position: 'absolute', overflow: 'hidden' },
  blobA: { width: 460, height: 460, borderRadius: 460, top: -160, right: -150 },
  blobB: { width: 400, height: 400, borderRadius: 400, top: -70, left: -160 },
  blobC: { width: 320, height: 320, borderRadius: 320, top: 90, left: '28%' },
});
