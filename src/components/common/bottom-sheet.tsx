/**
 * BottomSheet — a reusable modal sheet that rises from the bottom over a scrim.
 * Tapping the scrim or the OS back gesture dismisses it; an optional title renders
 * a header beneath a grab handle. The panel springs up (Reanimated) while the
 * scrim fades via the native Modal transition, so open and close both feel soft.
 */

import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';

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
          entering={SlideInDown.springify().damping(22)}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              paddingBottom: insets.bottom + Spacing.four,
            },
          ]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
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
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radii.pill,
    alignSelf: 'center',
    marginBottom: Spacing.one,
  },
  title: { marginBottom: Spacing.one },
});
