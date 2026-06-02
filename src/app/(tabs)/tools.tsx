/**
 * Tools — the PDF utilities hub. Renders the centralized tool catalog as an
 * animated, colorful grid under the premium large-title header. Each tool gets
 * its flow in the utilities phase; tapping a not-yet-built tool gives gentle
 * feedback.
 */

import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  CollapsingHeaderBar,
  FadeIn,
  LargeTitleHeader,
  Screen,
  useScrollHeader,
} from '@/components';
import { TOOLS, ToolCard, type ToolDefinition } from '@/features/utilities';
import { haptics } from '@/services/haptics';
import { BottomTabInset, ScreenPadding, Spacing } from '@/theme';

export default function ToolsScreen() {
  const { scrollY, scrollHandler } = useScrollHeader();

  const onToolPress = useCallback((tool: ToolDefinition) => {
    if (tool.status === 'soon') {
      haptics.warning();
      return;
    }
    haptics.medium();
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ToolDefinition; index: number }) => (
      <FadeIn index={index} style={styles.cell}>
        <ToolCard tool={item} onPress={onToolPress} />
      </FadeIn>
    ),
    [onToolPress],
  );

  return (
    <Screen
      noPadding
      scrollY={scrollY}
      overlay={<CollapsingHeaderBar title="Tools" scrollY={scrollY} />}>
      <Animated.FlatList
        data={TOOLS}
        keyExtractor={(t: ToolDefinition) => t.id}
        renderItem={renderItem}
        numColumns={2}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.list}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <LargeTitleHeader
              eyebrow="Utilities"
              title="Tools"
              subtitle="Fast, on-device PDF utilities"
              scrollY={scrollY}
            />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: {
    paddingHorizontal: ScreenPadding,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.three,
  },
  row: { gap: Spacing.three },
  cell: { flex: 1 },
  header: { marginBottom: Spacing.three },
});
