/**
 * SettingRow — a labeled row with a leading icon medallion and a trailing control
 * slot (switch, segmented control, chevron). The building block of Settings.
 */

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing, type ThemeColor } from '@/theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

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
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.medallion, { backgroundColor: colors[iconColor] + '22' }]}>
          <Icon name={icon} size="md" color={iconColor} />
        </View>
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
  medallion: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 1 },
  below: { marginTop: Spacing.three },
});
