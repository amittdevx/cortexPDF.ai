/**
 * BottomSheet — a reusable modal sheet that rises from the bottom over a scrim.
 * Tapping the scrim or the OS back gesture dismisses it; an optional title renders
 * a header beneath a grab handle. The panel springs up (Reanimated) while the
 * scrim fades via the native Modal transition, so open and close both feel soft.
 */

import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing, Springs } from '@/theme';

import { Text } from './text';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function BottomSheet({ visible, onClose, children, title }: BottomSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={[styles.scrim, { backgroundColor: colors.scrim }]}
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
        />
        <Animated.View
          entering={SlideInDown.springify().damping(Springs.smooth.damping).stiffness(Springs.smooth.stiffness)}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.glassFillStrong,
              borderColor: colors.glassBorder,
              paddingBottom: insets.bottom + Spacing.four,
            },
          ]}>
          {/* Soft brand glow at the crown of the sheet. */}
          <LinearGradient
            colors={[colors.gradientBrandSoft[0], 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
            style={styles.glow}
          />
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          {title ? (
            <Text variant="title3" style={styles.title}>
              {title}
            </Text>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    borderTopLeftRadius: Radii.glass,
    borderTopRightRadius: Radii.glass,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
    overflow: 'hidden',
  },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 140 },
  handle: {
    width: 44,
    height: 5,
    borderRadius: Radii.pill,
    alignSelf: 'center',
    marginBottom: Spacing.one,
  },
  title: { marginBottom: Spacing.one },
});
