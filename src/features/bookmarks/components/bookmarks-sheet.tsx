/**
 * BookmarksSheet — lists a document's saved pages and lets the user jump to one,
 * remove one, or bookmark/unbookmark the current page. Pure presentation: actions
 * arrive via props from the reader screen, wired to the bookmarks hook (RULE 1).
 */

import { ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, IconButton, PressScale, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';
import type { Bookmark } from '@/types/domain';
import { formatRelativeTime } from '@/utils/format';

export interface BookmarksSheetProps {
  visible: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  currentPage: number;
  isCurrentBookmarked: boolean;
  onToggleCurrent: () => void;
  onJump: (page: number) => void;
  onRemove: (id: string) => void;
}

export function BookmarksSheet({
  visible,
  onClose,
  bookmarks,
  currentPage,
  isCurrentBookmarked,
  onToggleCurrent,
  onJump,
  onRemove,
}: BookmarksSheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Bookmarks">
      <Button
        label={isCurrentBookmarked ? `Remove bookmark · page ${currentPage}` : `Bookmark page ${currentPage}`}
        icon={isCurrentBookmarked ? 'bookmark' : 'bookmark-outline'}
        variant={isCurrentBookmarked ? 'secondary' : 'primary'}
        fullWidth
        onPress={onToggleCurrent}
      />

      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="small" color="textTertiary" center>
            No bookmarks yet. Save your spot with the button above.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {bookmarks.map((b) => (
            <PressScale
              key={b.id}
              onPress={() => onJump(b.page)}
              accessibilityRole="button"
              accessibilityLabel={`Go to page ${b.page}`}
              style={styles.row}>
              <View style={[styles.pageChip, { backgroundColor: colors.glassFillPrimary }]}>
                <Text variant="smallBold" color="primary">
                  {b.page}
                </Text>
              </View>
              <View style={styles.rowBody}>
                <Text variant="bodyMedium" numberOfLines={1}>
                  {b.label || `Page ${b.page}`}
                </Text>
                <Text variant="caption" color="textTertiary">
                  {formatRelativeTime(b.createdAt)}
                </Text>
              </View>
              <IconButton
                name="trash-outline"
                color="textTertiary"
                accessibilityLabel="Remove bookmark"
                onPress={() => onRemove(b.id)}
              />
            </PressScale>
          ))}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  empty: { paddingVertical: Spacing.four, paddingHorizontal: Spacing.three },
  list: { maxHeight: 320 },
  listContent: { gap: Spacing.two, paddingVertical: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  pageChip: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: Spacing.two,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: Spacing.half },
});
