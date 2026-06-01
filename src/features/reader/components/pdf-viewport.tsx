/**
 * PdfViewport — the document rendering surface.
 *
 * The native renderer (react-native-pdf) is wired in a later step behind the
 * `@/services/pdf` seam; until then this presents a polished page placeholder so
 * the full reader shell — zoom (pinch + controls), page state, and immersive
 * chrome toggling — is real and testable in Expo Go. When the engine lands, this
 * component swaps its body for the native view with no change to the screen,
 * store, or controls around it.
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon, Surface, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing, Springs } from '@/theme';
import type { PdfFile } from '@/types/domain';
import { fileNameToTitle } from '@/utils/format';

import { ZOOM } from '../hooks/use-reader';

export interface PdfViewportProps {
  document: PdfFile;
  page: number;
  totalPages: number | null;
  zoom: number;
  /** Commit a new zoom level (e.g. at the end of a pinch). */
  onZoomChange: (zoom: number) => void;
  /** Single tap — used by the screen to toggle the reader chrome. */
  onTap?: () => void;
}

export function PdfViewport({
  document,
  page,
  totalPages,
  zoom,
  onZoomChange,
  onTap,
}: PdfViewportProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(zoom);
  const startScale = useSharedValue(zoom);

  // Reflect zoom coming from the controls (soft spring settle). A pinch already
  // leaves `scale` at the committed value, so skip the redundant re-spring then.
  useEffect(() => {
    if (Math.abs(scale.value - zoom) > 0.001) {
      scale.value = withSpring(zoom, Springs.gentle);
    }
  }, [zoom, scale]);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(startScale.value * e.scale, ZOOM.min), ZOOM.max);
    })
    .onEnd(() => {
      runOnJS(onZoomChange)(scale.value);
    });

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      if (onTap) runOnJS(onTap)();
    });

  const gesture = Gesture.Exclusive(pinch, tap);
  const pageStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const meta = totalPages ? `Page ${page} of ${totalPages}` : `Page ${page}`;

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.viewport}>
        <Animated.View style={pageStyle}>
          <Surface color="surface" elevation="lg" radius="md" bordered style={styles.page}>
            <View style={[styles.medallion, { backgroundColor: colors.primarySoft }]}>
              <Icon name="document-text-outline" size="xl" color="primary" />
            </View>
            <Text variant="bodyMedium" center numberOfLines={2}>
              {fileNameToTitle(document.name)}
            </Text>
            <Text variant="caption" color="textSecondary" center>
              {meta}
            </Text>
            <Text variant="caption" color="textTertiary" center style={styles.note}>
              Live rendering wires up in the reader engine step.
            </Text>
          </Surface>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  page: {
    width: '82%',
    aspectRatio: 1 / 1.414, // A-series page proportions
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  medallion: {
    width: 64,
    height: 64,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  note: { maxWidth: 220, marginTop: Spacing.two },
});
