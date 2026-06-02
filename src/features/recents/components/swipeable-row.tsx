/**
 * SwipeableRow — wraps a Library row so swiping left reveals a Delete action.
 * Kept separate from FileCard so the card stays pure presentation (RULE 1); the
 * screen passes `onDelete` wired to the recents hook's `remove`. The revealed
 * action "develops" (scales + fades in with the drag) rather than popping, and on
 * commit the row fades out while siblings glide up via a layout transition.
 */

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  FadeOut,
  LinearTransition,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { Icon, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/services/haptics';
import { Duration, Radii, Spacing } from '@/theme';

const ACTION_WIDTH = Spacing.six; // 64

function DeleteAction({ drag }: { drag: SharedValue<number> }) {
  const { colors } = useTheme();
  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(drag.value, [-ACTION_WIDTH, 0], [1, 0]),
    transform: [{ scale: interpolate(drag.value, [-ACTION_WIDTH, 0], [1, 0.6]) }],
  }));
  return (
    <View style={[styles.action, { backgroundColor: colors.danger }]}>
      <View pointerEvents="none" style={[styles.rim, { backgroundColor: colors.glassHighlight }]} />
      <Animated.View style={[styles.actionInner, iconStyle]}>
        <Icon name="trash-outline" size="md" color="textOnPrimary" />
        <Text variant="caption" color="textOnPrimary" center>
          Delete
        </Text>
      </Animated.View>
    </View>
  );
}

export function SwipeableRow({ onDelete, children }: { onDelete: () => void; children: ReactNode }) {
  return (
    <Animated.View
      exiting={FadeOut.duration(Duration.fast)}
      layout={LinearTransition.springify().damping(30)}>
      <ReanimatedSwipeable
        renderRightActions={(_progress, drag) => <DeleteAction drag={drag} />}
        rightThreshold={ACTION_WIDTH}
        overshootRight={false}
        friction={1.6}
        onSwipeableWillOpen={() => haptics.medium()}
        onSwipeableOpen={onDelete}>
        {children}
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  action: {
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.lg,
  },
  actionInner: { alignItems: 'center', gap: Spacing.half },
  rim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
  },
});
