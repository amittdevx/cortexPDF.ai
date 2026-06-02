/**
 * ReaderOptionsSheet — view settings for the open document: scroll layout
 * (vertical / horizontal / book) and an immersive reading-mode toggle. Both are
 * persisted PER-DOCUMENT by the reader store. Pure presentation; the current
 * values + change handlers arrive via props (RULE 1).
 */

import { StyleSheet, Switch, View } from 'react-native';

import { BottomSheet, Icon, PressScale, Text, type IconName } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';
import type { ReaderScrollMode } from '@/store/reader.store';

interface ModeOption {
  mode: ReaderScrollMode;
  label: string;
  hint: string;
  icon: IconName;
}

const MODES: ModeOption[] = [
  { mode: 'continuous', label: 'Vertical scroll', hint: 'Scroll up and down', icon: 'swap-vertical' },
  { mode: 'horizontal', label: 'Horizontal scroll', hint: 'Swipe left and right', icon: 'swap-horizontal' },
  { mode: 'book', label: 'Book', hint: 'Flip page by page', icon: 'book-outline' },
];

export interface ReaderOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  scrollMode: ReaderScrollMode;
  readingMode: boolean;
  onScrollModeChange: (mode: ReaderScrollMode) => void;
  onReadingModeChange: (on: boolean) => void;
}

export function ReaderOptionsSheet({
  visible,
  onClose,
  scrollMode,
  readingMode,
  onScrollModeChange,
  onReadingModeChange,
}: ReaderOptionsSheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} title="View options">
      <Text variant="caption" color="textTertiary">
        LAYOUT
      </Text>
      <View style={styles.group}>
        {MODES.map((option) => {
          const selected = option.mode === scrollMode;
          return (
            <PressScale
              key={option.mode}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              haptic="light"
              onPress={() => onScrollModeChange(option.mode)}
              style={[
                styles.row,
                { backgroundColor: selected ? colors.glassFillPrimary : 'transparent' },
              ]}>
              <Icon name={option.icon} size="md" color={selected ? 'primary' : 'textSecondary'} />
              <View style={styles.rowBody}>
                <Text variant="bodyMedium" color={selected ? 'primary' : 'text'}>
                  {option.label}
                </Text>
                <Text variant="caption" color="textTertiary">
                  {option.hint}
                </Text>
              </View>
              {selected ? <Icon name="checkmark-circle" size="md" color="primary" /> : null}
            </PressScale>
          );
        })}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.readingRow}>
        <Icon name="glasses-outline" size="md" color={readingMode ? 'primary' : 'textSecondary'} />
        <View style={styles.rowBody}>
          <Text variant="bodyMedium">Reading mode</Text>
          <Text variant="caption" color="textTertiary">
            Distraction-free, screen stays awake. Remembered for this file.
          </Text>
        </View>
        <Switch
          value={readingMode}
          onValueChange={onReadingModeChange}
          trackColor={{ true: colors.primary, false: colors.borderStrong }}
          thumbColor={colors.surfaceElevated}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.one },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radii.md,
  },
  rowBody: { flex: 1, gap: Spacing.half },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.one },
  readingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.two },
});
