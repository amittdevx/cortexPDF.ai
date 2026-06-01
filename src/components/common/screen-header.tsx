/**
 * ScreenHeader — a large-title header with an optional subtitle and a trailing
 * action slot. Animates in on mount. Used at the top of primary screens.
 */

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { FadeIn } from '@/components/animations/fade-in';
import { Spacing } from '@/theme';

import { Text } from './text';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Trailing element, e.g. an IconButton, aligned to the title row. */
  trailing?: ReactNode;
}

export function ScreenHeader({ title, subtitle, trailing }: ScreenHeaderProps) {
  return (
    <FadeIn>
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          <Text variant="title1">{title}</Text>
          {subtitle ? (
            <Text variant="small" color="textSecondary" style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  titleBlock: { flex: 1, gap: Spacing.half },
  subtitle: {},
  trailing: {},
});
