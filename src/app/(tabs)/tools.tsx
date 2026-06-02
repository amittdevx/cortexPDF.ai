/**
 * Tools — the PDF utilities hub. Renders the centralized tool catalog as an
 * animated grid. Each tool gets its flow in the utilities phase; tapping a
 * not-yet-built tool gives gentle feedback.
 */

import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { FadeIn, Screen, ScreenHeader } from '@/components';
import { TOOLS, ToolCard, type ToolDefinition } from '@/features/utilities';
import { haptics } from '@/services/haptics';
import { ScreenPadding, Spacing } from '@/theme';

export default function ToolsScreen() {
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
    <Screen noPadding>
      <FlatList
        data={TOOLS}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        numColumns={2}
        style={styles.list}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="Tools" subtitle="Fast, on-device PDF utilities" />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingHorizontal: ScreenPadding, paddingBottom: Spacing.six, gap: Spacing.three },
  row: { gap: Spacing.three },
  cell: { flex: 1 },
  header: { marginBottom: Spacing.three },
});
