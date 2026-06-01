/**
 * EmptyState — a calm, centered placeholder for empty lists / zero-data screens,
 * with an icon medallion, message, and an optional primary action. Animates in.
 */

import { StyleSheet, View } from 'react-native';

import { FadeIn } from '@/components/animations/fade-in';
import { Button } from '@/components/buttons/button';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <FadeIn>
      <View style={styles.container}>
        <View style={[styles.medallion, { backgroundColor: colors.primarySoft }]}>
          <Icon name={icon} size="xl" color="primary" />
        </View>
        <Text variant="title3" center>
          {title}
        </Text>
        {message ? (
          <Text variant="small" color="textSecondary" center style={styles.message}>
            {message}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <Button label={actionLabel} onPress={onAction} style={styles.action} />
        ) : null}
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.six, gap: Spacing.three },
  medallion: {
    width: 72,
    height: 72,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  message: { maxWidth: 280 },
  action: { marginTop: Spacing.two },
});
