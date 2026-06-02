/**
 * ToolCard — a single utility tile in the Tools grid. Presentational; the screen
 * supplies the press handler.
 */

import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Glass, Icon, PressScale, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';

import type { ToolDefinition } from '../tools.config';

export interface ToolCardProps {
  tool: ToolDefinition;
  onPress: (tool: ToolDefinition) => void;
}

export const ToolCard = memo(function ToolCard({ tool, onPress }: ToolCardProps) {
  const { colors } = useTheme();

  return (
    <PressScale style={styles.wrap} scaleTo={0.95} onPress={() => onPress(tool)}>
      <Glass variant="card" padding="three" radius="lg" style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.medallion, { backgroundColor: colors[tool.accent] + '22' }]}>
            <Icon name={tool.icon} size="lg" color={tool.accent} />
          </View>
          {tool.status === 'soon' && (
            <View style={[styles.badge, { backgroundColor: colors.glassFill }]}>
              <Text variant="caption" color="textSecondary">
                Soon
              </Text>
            </View>
          )}
        </View>
        <View style={styles.text}>
          <Text variant="bodyMedium">{tool.title}</Text>
          <Text variant="caption" color="textTertiary">
            {tool.subtitle}
          </Text>
        </View>
      </Glass>
    </PressScale>
  );
});

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  card: { gap: Spacing.three, minHeight: 132, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  medallion: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  text: { gap: 2 },
});
