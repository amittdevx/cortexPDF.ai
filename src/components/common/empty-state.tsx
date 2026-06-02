/**
 * EmptyState — a calm, centered placeholder for empty lists / zero-data screens,
 * with an icon medallion, message, and an optional primary action. Animates in.
 */

import { StyleSheet, View } from 'react-native';

import { FadeIn } from '@/components/animations/fade-in';
import { Button } from '@/components/buttons/button';
import { GradientMedallion } from '@/components/common/gradient';
import { Spacing } from '@/theme';

import { type IconName } from './icon';
import { Text } from './text';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <FadeIn>
      <View style={styles.container}>
        <GradientMedallion icon={icon} size={80} radius="xl" iconSize={34} />
        <Text variant="title2" center style={styles.title}>
          {title}
        </Text>
        {message ? (
          <Text variant="small" color="textSecondary" center style={styles.message}>
            {message}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <Button label={actionLabel} icon="add" onPress={onAction} style={styles.action} />
        ) : null}
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.six, gap: Spacing.three },
  title: { marginTop: Spacing.one },
  message: { maxWidth: 300 },
  action: { marginTop: Spacing.two },
});
