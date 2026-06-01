/**
 * Screen — the standard page container. Applies the themed background, safe-area
 * insets, horizontal padding, and a content-width cap for comfortable wide/web
 * layouts. Optionally scrolls. Every screen should start here.
 */

import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, MaxContentWidth, ScreenPadding, Spacing } from '@/theme';

export interface ScreenProps {
  children: ReactNode;
  /** Wrap content in a vertical ScrollView. */
  scroll?: boolean;
  /** Remove the default horizontal padding (for edge-to-edge lists). */
  noPadding?: boolean;
  /** Reserve space at the bottom for the native tab bar. */
  tabBarInset?: boolean;
  /** Safe-area edges to apply. Defaults to top only (tab bar handles bottom). */
  edges?: readonly Edge[];
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

export function Screen({
  children,
  scroll,
  noPadding,
  tabBarInset,
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  fill: { flex: 1 },
});
