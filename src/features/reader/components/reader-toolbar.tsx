/**
 * ReaderToolbar — the reader's top bar: back, centered title + page indicator,
 * and share. Rendered as part of the auto-hiding reader chrome; pure presentation
 * with behavior arriving via props from the screen.
 */

import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass, IconButton, Text } from '@/components';
import { Spacing } from '@/theme';
import { fileNameToTitle } from '@/utils/format';

export interface ReaderToolbarProps {
  title: string;
  page: number;
  totalPages: number | null;
  isBookmarked: boolean;
  onBack: () => void;
  onToggleBookmark: () => void;
  onShare: () => void;
}

export function ReaderToolbar({
  title,
  page,
  totalPages,
  isBookmarked,
  onBack,
  onToggleBookmark,
  onShare,
}: ReaderToolbarProps) {
  const insets = useSafeAreaInsets();
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
});
