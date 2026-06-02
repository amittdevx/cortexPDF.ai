/**
 * AiSummarySheet — surfaces the document's AI summary across its states: backend
 * not configured, idle (offer to summarize), loading, error (retry), and a cached
 * result (with regenerate). Pure presentation; state + handlers arrive via props
 * from the reader screen, wired to the ai-summary hook (RULE 1).
 */

import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Icon, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme';
import type { AiSummary } from '@/types/domain';
import { formatRelativeTime } from '@/utils/format';

export interface AiSummarySheetProps {
  visible: boolean;
  onClose: () => void;
  configured: boolean;
  loading: boolean;
  error: string | undefined;
  summary: AiSummary | null;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export function AiSummarySheet({
  visible,
  onClose,
  configured,
  loading,
  error,
  summary,
  onGenerate,
  onRegenerate,
}: AiSummarySheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} title="AI Summary">
      {!configured ? (
        <View style={styles.message}>
          <Icon name="sparkles-outline" size="xl" color="textTertiary" />
          <Text variant="bodyMedium" center>
            AI summaries are coming soon
          </Text>
          <Text variant="small" color="textTertiary" center>
            They switch on once the AI backend is connected. Your documents stay on
            device until then.
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.message}>
          <ActivityIndicator color={colors.primary} />
          <Text variant="small" color="textTertiary" center>
            Reading and summarizing your document…
          </Text>
        </View>
      ) : error ? (
        <View style={styles.message}>
          <Icon name="alert-circle-outline" size="xl" color="danger" />
          <Text variant="small" color="textTertiary" center>
            {error}
          </Text>
          <Button label="Try again" icon="refresh" variant="secondary" onPress={onGenerate} />
        </View>
      ) : summary ? (
        <>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            <Text variant="body">{summary.summary}</Text>
          </ScrollView>
          <View style={styles.footer}>
            <Text variant="caption" color="textTertiary">
              Updated {formatRelativeTime(summary.createdAt)}
            </Text>
            <Button label="Regenerate" icon="refresh" variant="ghost" size="sm" onPress={onRegenerate} />
          </View>
        </>
      ) : (
        <View style={styles.message}>
          <Icon name="sparkles" size="xl" color="primary" />
          <Text variant="small" color="textTertiary" center>
            Get a quick, scannable overview of this document’s key points.
          </Text>
          <Button label="Summarize document" icon="sparkles-outline" fullWidth onPress={onGenerate} />
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  message: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.four, paddingHorizontal: Spacing.two },
  list: { maxHeight: 360 },
  listContent: { paddingVertical: Spacing.one },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.one,
  },
});
