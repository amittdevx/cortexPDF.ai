/**
 * SettingRow — a labeled row with a leading icon medallion and a trailing control
 * slot (switch, segmented control, chevron). The building block of Settings.
 */

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing, type Gradient, type ThemeColor } from '@/theme';

import { GradientMedallion } from './gradient';
import { type IconName } from './icon';
import { Text } from './text';

/** Map an accent role to a vivid gradient for the leading medallion. */
const ROLE_GRADIENT: Partial<Record<ThemeColor, Gradient>> = {
  primary: ['#6366F1', '#9B5CF5'],
  accent: ['#9B5CF5', '#E25CC0'],
  success: ['#10B981', '#84CC16'],
  warning: ['#F59E0B', '#F43F5E'],
  danger: ['#F43F5E', '#EC4899'],
};

export interface SettingRowProps {
  icon: IconName;
  iconColor?: ThemeColor;
  title: string;
  subtitle?: string;
  /** Trailing control rendered on the right (e.g. a Switch). */
  trailing?: ReactNode;
  /** Control placed full-width below the title (e.g. a SegmentedControl). */
  below?: ReactNode;
}

export function SettingRow({
  icon,
  iconColor = 'primary',
  title,
  subtitle,
  trailing,
  below,
}: SettingRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <GradientMedallion
          icon={icon}
          colors={ROLE_GRADIENT[iconColor]}
          size={38}
          radius="sm"
          iconSize={18}
        />
        <View style={styles.text}>
          <Text variant="bodyMedium">{title}</Text>
          {subtitle ? (
            <Text variant="caption" color="textTertiary">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing ? <View>{trailing}</View> : null}
      </View>
      {below ? <View style={styles.below}>{below}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  text: { flex: 1, gap: 1 },
  below: { marginTop: Spacing.three },
});
