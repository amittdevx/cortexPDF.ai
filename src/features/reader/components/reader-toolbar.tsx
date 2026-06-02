/**
 * ReaderToolbar — the reader's top bar: back, centered title + page indicator,
 * and share. Rendered as part of the auto-hiding reader chrome; pure presentation
 * with behavior arriving via props from the screen.
 */

import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass, IconButton, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';
import { fileNameToTitle } from '@/utils/format';

export interface ReaderToolbarProps {
  title: string;
  page: number;
  totalPages: number | null;
  isBookmarked: boolean;
  /** Notes saved on the current page (drives the indicator dot). */
  noteCount: number;
  onBack: () => void;
  onToggleBookmark: () => void;
  onOpenNotes: () => void;
  onShare: () => void;
}

export function ReaderToolbar({
  title,
  page,
  totalPages,
  isBookmarked,
  noteCount,
  onBack,
  onToggleBookmark,
  onOpenNotes,
  onShare,
}: ReaderToolbarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const meta = totalPages ? `Page ${page} of ${totalPages}` : `Page ${page}`;

  return (
    <Glass
      variant="chrome"
      radius="none"
      elevation="none"
      flat={Platform.OS === 'android'}
      style={[styles.bar, { paddingTop: insets.top + Spacing.one }]}>
      <IconButton
        name="chevron-back"
        variant="filled"
        accessibilityLabel="Back to library"
        onPress={onBack}
      />
      <View style={styles.titleBlock}>
        <Text variant="bodyMedium" center numberOfLines={1}>
          {fileNameToTitle(title)}
        </Text>
        <Text variant="caption" color="textTertiary" center numberOfLines={1}>
          {meta}
        </Text>
      </View>
      <IconButton
        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
        color={isBookmarked ? 'primary' : 'text'}
        variant="filled"
        accessibilityLabel={isBookmarked ? 'Remove bookmark for this page' : 'Bookmark this page'}
        onPress={onToggleBookmark}
      />
      <View>
        <IconButton
          name={noteCount > 0 ? 'document-text' : 'document-text-outline'}
          color={noteCount > 0 ? 'primary' : 'text'}
          variant="filled"
          accessibilityLabel={noteCount > 0 ? `Notes (${noteCount} on this page)` : 'Notes'}
          onPress={onOpenNotes}
        />
        {noteCount > 0 ? (
          <View style={[styles.dot, { backgroundColor: colors.primary, borderColor: colors.glassFillStrong }]} />
        ) : null}
      </View>
      <IconButton
        name="share-outline"
        variant="filled"
        accessibilityLabel="Share document"
        onPress={onShare}
      />
    </Glass>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  titleBlock: { flex: 1, alignItems: 'center', gap: Spacing.half },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 9,
    height: 9,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
  },
});
