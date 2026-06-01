/**
 * FileCard — a recent-file list row. Tapping the row opens the document; the
 * trailing button toggles pinned state. Pure presentation: all behavior arrives
 * via props from the screen, which wires them to the feature hook.
 */

import { StyleSheet, View } from 'react-native';

import { Icon, IconButton, PressScale, Surface, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/services/haptics';
import type { PdfFile } from '@/types/domain';
import { Radii, Spacing } from '@/theme';
import { fileNameToTitle, formatBytes, formatRelativeTime } from '@/utils/format';

export interface FileCardProps {
  file: PdfFile;
  onOpen: (file: PdfFile) => void;
  onTogglePin: (file: PdfFile) => void;
  /** Long-press the row to reveal details + actions. */
  onShowInfo?: (file: PdfFile) => void;
}

export function FileCard({ file, onOpen, onTogglePin, onShowInfo }: FileCardProps) {
  const { colors } = useTheme();
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
      <Surface color="surface" elevation="sm" padding="three" bordered style={styles.card}>
        <View style={[styles.thumb, { backgroundColor: colors.primarySoft }]}>
          <Icon name="document-text" size="lg" color="primary" />
        </View>

        <View style={styles.body}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {fileNameToTitle(file.name)}
          </Text>
          <Text variant="caption" color="textTertiary" numberOfLines={1}>
            {meta}
          </Text>
        </View>

        <IconButton
          name={file.isPinned ? 'bookmark' : 'bookmark-outline'}
          color={file.isPinned ? 'primary' : 'textTertiary'}
          accessibilityLabel={file.isPinned ? 'Unpin file' : 'Pin file'}
          onPress={() => onTogglePin(file)}
        />
      </Surface>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
});
