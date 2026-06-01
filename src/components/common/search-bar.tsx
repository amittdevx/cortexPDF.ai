/**
 * SearchBar — a recessed, themed text field for filtering lists. Shows a leading
 * search glyph and a clear button once there's input. Controlled: pass `value`
 * and handle `onChangeText` (RULE 1 — the parent owns the query state).
 */

import { StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Icon } from './icon';
import { PressScale } from '@/components/animations/press-scale';
import { HitSlop, Radii, Spacing, Typography } from '@/theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Clear the field. Defaults to clearing via `onChangeText('')`. */
  onClear?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search', onClear }: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <Icon name="search" size="md" color="textTertiary" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, Typography.body, { color: colors.text }]}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel={placeholder}
      />
      {value.length > 0 ? (
        <PressScale
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={HitSlop}
          haptic="light"
          scaleTo={0.85}
          onPress={() => (onClear ? onClear() : onChangeText(''))}>
          <Icon name="close-circle" size="md" color="textTertiary" />
        </PressScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    height: 44,
    borderRadius: Radii.md,
  },
  input: { flex: 1, paddingVertical: 0 },
});
