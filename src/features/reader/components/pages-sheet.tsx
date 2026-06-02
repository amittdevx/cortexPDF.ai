/**
 * PagesSheet — a lightweight page-jump grid. Renders a tile per page (not an image
 * thumbnail: rn-pdf is render-only and per-page Pdfium instances are too heavy for
 * the "lightweight" goal), highlights the current page, and flags pages that carry
 * a bookmark or a note. Tapping a tile jumps there. Pure presentation; the page
 * sets + jump handler arrive via props from the reader screen (RULE 1).
 */

import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { BottomSheet, Icon, PressScale, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';

const COLUMNS = 4;

export interface PagesSheetProps {
  visible: boolean;
  onClose: () => void;
  totalPages: number | null;
  currentPage: number;
  bookmarkedPages: Set<number>;
  notedPages: Set<number>;
  onJump: (page: number) => void;
}

export function PagesSheet({
  visible,
  onClose,
  totalPages,
  currentPage,
  bookmarkedPages,
  notedPages,
  onJump,
}: PagesSheetProps) {
  const { colors } = useTheme();
  const pages = totalPages ? Array.from({ length: totalPages }, (_, i) => i + 1) : [];

  const renderTile = useCallback(
    ({ item: page }: { item: number }) => {
      const isCurrent = page === currentPage;
      const hasBookmark = bookmarkedPages.has(page);
      const hasNote = notedPages.has(page);
      return (
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={`Go to page ${page}`}
          haptic="light"
          style={styles.tileWrap}
          onPress={() => onJump(page)}>
          <View
            style={[
              styles.tile,
              {
                backgroundColor: isCurrent ? colors.primary : colors.glassFillPrimary,
                borderColor: isCurrent ? colors.primary : colors.glassBorder,
              },
            ]}>
            <Text variant="bodyMedium" color={isCurrent ? 'textOnPrimary' : 'text'}>
              {page}
            </Text>
            {(hasBookmark || hasNote) && !isCurrent ? (
              <View style={styles.tileBadges}>
                {hasBookmark ? <Icon name="bookmark" size={12} color="primary" /> : null}
                {hasNote ? <Icon name="document-text" size={12} color="primary" /> : null}
              </View>
            ) : null}
          </View>
        </PressScale>
      );
    },
    [currentPage, bookmarkedPages, notedPages, colors, onJump],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Pages">
      {pages.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="small" color="textTertiary" center>
            Page list isn’t ready yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pages}
          keyExtractor={(p) => String(p)}
          renderItem={renderTile}
          numColumns={COLUMNS}
          style={styles.grid}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.column}
          showsVerticalScrollIndicator={false}
          initialNumToRender={32}
          windowSize={5}
        />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  empty: { paddingVertical: Spacing.four, paddingHorizontal: Spacing.three },
  grid: { maxHeight: 380 },
  gridContent: { gap: Spacing.two, paddingVertical: Spacing.one },
  column: { gap: Spacing.two },
  tileWrap: { flex: 1 / COLUMNS },
  tile: {
    aspectRatio: 0.78,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  tileBadges: { flexDirection: 'row', gap: Spacing.half },
});
