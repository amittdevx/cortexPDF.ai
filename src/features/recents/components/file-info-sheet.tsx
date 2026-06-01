/**
 * FileInfoSheet — a bottom sheet showing a document's details and quick actions
 * (open, pin/unpin, share, remove). Pure presentation: actions arrive via props
 * from the Library screen, which wires them to the recents hook (RULE 1).
 */

import { StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Divider, Icon, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';
import type { PdfFile } from '@/types/domain';
import { fileNameToTitle, formatBytes, formatRelativeTime } from '@/utils/format';

export interface FileInfoSheetProps {
  file: PdfFile | null;
  visible: boolean;
  onClose: () => void;
  onOpen: (file: PdfFile) => void;
  onTogglePin: (file: PdfFile) => void;
  onShare: (file: PdfFile) => void;
  onDelete: (file: PdfFile) => void;
}

export function FileInfoSheet({
  file,
  visible,
  onClose,
  onOpen,
  onTogglePin,
  onShare,
  onDelete,
}: FileInfoSheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible && !!file} onClose={onClose}>
      {file ? (
        <>
          <View style={styles.header}>
            <View style={[styles.thumb, { backgroundColor: colors.primarySoft }]}>
              <Icon name="document-text" size="lg" color="primary" />
            </View>
            <View style={styles.headerText}>
              <Text variant="bodyMedium" numberOfLines={2}>
                {fileNameToTitle(file.name)}
              </Text>
              <Text variant="caption" color="textTertiary">
                {[formatBytes(file.size), file.pageCount ? `${file.pageCount} pages` : null]
                  .filter(Boolean)
                  .join('  ·  ')}
              </Text>
            </View>
          </View>

          <View style={styles.meta}>
            <InfoRow label="Last opened" value={formatRelativeTime(file.lastOpenedAt)} />
            <InfoRow label="Pages" value={file.pageCount ? String(file.pageCount) : 'Unknown'} />
            <InfoRow label="Status" value={file.isPinned ? 'Pinned' : 'Not pinned'} />
          </View>

          <Divider />

          <View style={styles.actions}>
            <Button
              label="Open"
              icon="book-outline"
              fullWidth
              onPress={() => {
                onClose();
                onOpen(file);
              }}
            />
            <View style={styles.actionRow}>
              <Button
                label={file.isPinned ? 'Unpin' : 'Pin'}
                icon={file.isPinned ? 'bookmark' : 'bookmark-outline'}
                variant="secondary"
                style={styles.flex}
                onPress={() => onTogglePin(file)}
              />
              <Button
                label="Share"
                icon="share-outline"
                variant="secondary"
                style={styles.flex}
                onPress={() => {
                  onClose();
                  onShare(file);
                }}
              />
            </View>
            <Button
              label="Remove from Library"
              icon="trash-outline"
              variant="danger"
              fullWidth
              onPress={() => {
                onClose();
                onDelete(file);
              }}
            />
          </View>
        </>
      ) : null}
    </BottomSheet>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="small" color="textSecondary">
        {label}
      </Text>
      <Text variant="small">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: Spacing.half },
  meta: { gap: Spacing.two },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { gap: Spacing.two },
  actionRow: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
});
