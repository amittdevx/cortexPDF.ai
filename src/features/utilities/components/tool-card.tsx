/**
 * ToolCard — a single utility tile in the Tools grid. Each tool gets a vivid
 * gradient medallion (derived from its id) for a colorful, scannable grid.
 * Presentational; the screen supplies the press handler.
 */

import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Glass, GradientMedallion, PressScale, Text, gradientForSeed } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';

import type { ToolDefinition } from '../tools.config';

export interface ToolCardProps {
  tool: ToolDefinition;
  onPress: (tool: ToolDefinition) => void;
}

export const ToolCard = memo(function ToolCard({ tool, onPress }: ToolCardProps) {
  const { colors } = useTheme();
  const soon = tool.status === 'soon';

  return (
    <PressScale style={styles.wrap} scaleTo={0.95} onPress={() => onPress(tool)}>
      <Glass variant="card" padding="three" radius="xl" style={styles.card}>
        <View style={styles.topRow}>
          <GradientMedallion
            icon={tool.icon}
            colors={gradientForSeed(tool.id)}
            size={48}
            radius="md"
            glow="sm"
          />
          {soon ? (
            <View style={[styles.badge, { backgroundColor: colors.glassFillPrimary }]}>
              <Text variant="captionBold" color="primary">
                Soon
              </Text>
            </View>
          ) : null}
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
  card: { gap: Spacing.three, minHeight: 140, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  text: { gap: 3 },
});
