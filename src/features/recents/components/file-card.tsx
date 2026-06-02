/**
 * FileCard — a recent-file list row. Tapping the row opens the document; the
 * trailing button toggles pinned state. Each file gets a distinct gradient tile
 * (derived from its id) so the library reads as a colorful shelf. Pure
 * presentation: all behavior arrives via props from the screen (RULE 1).
 */

import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Glass, GradientThumb, Icon, IconButton, PressScale, Text } from '@/components';
import { haptics } from '@/services/haptics';
import type { PdfFile } from '@/types/domain';
import { Spacing } from '@/theme';
import { fileNameToTitle, formatBytes, formatRelativeTime } from '@/utils/format';

export interface FileCardProps {
  file: PdfFile;
  onOpen: (file: PdfFile) => void;
  onTogglePin: (file: PdfFile) => void;
  /** Long-press the row to reveal details + actions. */
  onShowInfo?: (file: PdfFile) => void;
}

export const FileCard = memo(function FileCard({
  file,
  onOpen,
  onTogglePin,
  onShowInfo,
}: FileCardProps) {
  const meta = [formatBytes(file.size), formatRelativeTime(file.lastOpenedAt)]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <PressScale
      onPress={() => onOpen(file)}
      onLongPress={
        onShowInfo
          ? () => {
              haptics.medium();
              onShowInfo(file);
            }
          : undefined
      }
      accessibilityRole="button"
      accessibilityHint={onShowInfo ? 'Double tap to open, long press for options' : undefined}>
      <Glass variant="card" padding="three" radius="xl" style={styles.card}>
        <GradientThumb seed={file.id} size={52} radius="md" />

        <View style={styles.body}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {fileNameToTitle(file.name)}
          </Text>
          <View style={styles.metaRow}>
            {file.isPinned ? <Icon name="bookmark" size={12} color="primary" /> : null}
            <Text variant="caption" color="textTertiary" numberOfLines={1}>
              {meta}
            </Text>
          </View>
        </View>

        <IconButton
          name={file.isPinned ? 'bookmark' : 'bookmark-outline'}
          color={file.isPinned ? 'primary' : 'textTertiary'}
          accessibilityLabel={file.isPinned ? 'Unpin file' : 'Pin file'}
          onPress={() => onTogglePin(file)}
        />
      </Glass>
    </PressScale>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  body: { flex: 1, gap: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
});
