/**
 * ReaderToolbar — the reader's top bar: back, centered title + page indicator,
 * and share. Rendered as part of the auto-hiding reader chrome; pure presentation
 * with behavior arriving via props from the screen.
 */

import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme';
import { fileNameToTitle } from '@/utils/format';

export interface ReaderToolbarProps {
  title: string;
  page: number;
  totalPages: number | null;
  onBack: () => void;
  onShare: () => void;
}

export function ReaderToolbar({ title, page, totalPages, onBack, onShare }: ReaderToolbarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const meta = totalPages ? `Page ${page} of ${totalPages}` : `Page ${page}`;

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: insets.top + Spacing.one,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}>
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
        name="share-outline"
        variant="filled"
        accessibilityLabel="Share document"
        onPress={onShare}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleBlock: { flex: 1, alignItems: 'center', gap: Spacing.half },
});
