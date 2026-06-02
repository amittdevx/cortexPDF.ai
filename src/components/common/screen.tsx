/**
 * Screen — the standard page container. Applies the themed background, safe-area
 * insets, horizontal padding, and a content-width cap for comfortable wide/web
 * layouts. Optionally scrolls. Every screen should start here.
 */

import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';
import type { SharedValue } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, MaxContentWidth, ScreenPadding, Spacing } from '@/theme';

import { AuroraBackground } from './aurora-background';

export interface ScreenProps {
  children: ReactNode;
  /** Wrap content in a vertical ScrollView. */
  scroll?: boolean;
  /** Remove the default horizontal padding (for edge-to-edge lists). */
  noPadding?: boolean;
  /** Reserve space at the bottom for the floating tab bar. */
  tabBarInset?: boolean;
  /** Paint the aurora backdrop wash that glass surfaces sit over. Default true. */
  backdrop?: boolean;
  /** Optional scroll position — drives the aurora's parallax drift. */
  scrollY?: SharedValue<number>;
  /** Full-bleed overlay rendered above content (e.g. a collapsing header bar),
   * outside the safe-area inset so it can span the status bar. */
  overlay?: ReactNode;
  /** Safe-area edges to apply. Defaults to top only (tab bar handles bottom). */
  edges?: readonly Edge[];
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

export function Screen({
  children,
  scroll,
  noPadding,
  tabBarInset,
  backdrop = true,
  scrollY,
  overlay,
  edges = ['top'],
  contentContainerStyle,
}: ScreenProps) {
  const { colors } = useTheme();

  const padding = {
    paddingHorizontal: noPadding ? 0 : ScreenPadding,
    paddingBottom: tabBarInset ? BottomTabInset + Spacing.four : Spacing.four,
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {backdrop ? <AuroraBackground scrollY={scrollY} /> : null}
      <SafeAreaView style={styles.safe} edges={edges}>
        <View style={styles.center}>
          {scroll ? (
            <ScrollView
              style={styles.fill}
              contentContainerStyle={[padding, contentContainerStyle]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.fill, padding]}>{children}</View>
          )}
        </View>
      </SafeAreaView>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  fill: { flex: 1 },
});
