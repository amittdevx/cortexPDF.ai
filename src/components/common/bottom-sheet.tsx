/**
 * BottomSheet — a reusable modal sheet that rises from the bottom over a scrim.
 * Tapping the scrim or the OS back gesture dismisses it; an optional title renders
 * a header beneath a grab handle. It opens with a smooth ease-out slide (no bounce)
 * and sits flush to the bottom edge. A KeyboardAvoidingView lifts the sheet above
 * the keyboard when it contains an input, and settles back when the keyboard hides.
 */

import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, SlideInDown } from 'react-native-reanimated';

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
      navigationBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable
          style={[styles.scrim, { backgroundColor: colors.scrim }]}
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
        />
        <Animated.View
          entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              paddingBottom: insets.bottom + Spacing.three,
            },
          ]}>
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          {title ? (
            <Text variant="title3" style={styles.title}>
              {title}
            </Text>
          ) : null}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
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
  handle: {
    width: 44,
    height: 5,
    borderRadius: Radii.pill,
    alignSelf: 'center',
    marginBottom: Spacing.one,
  },
  title: { marginBottom: Spacing.one },
});
