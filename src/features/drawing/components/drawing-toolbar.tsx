/**
 * DrawingToolbar — the draw-mode chrome: a pen-settings row (color + width) and an
 * actions row (undo / redo / clear / done). Pure presentation; state and handlers
 * arrive via props from the reader screen, wired to the drawing hook (RULE 1).
 */

import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Glass, IconButton, PressScale } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';

/** Pen palette — kept small and calm to match the design language. */
export const PEN_COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#0A84FF', '#111111'];
/** Stroke widths as a fraction of surface width. */
export const PEN_WIDTHS = [0.004, 0.008, 0.016];

export interface DrawingToolbarProps {
  color: string;
  width: number;
  canUndo: boolean;
  canRedo: boolean;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDone: () => void;
}

export function DrawingToolbar({
  color,
  width,
  canUndo,
  canRedo,
  onColorChange,
  onWidthChange,
  onUndo,
  onRedo,
  onClear,
  onDone,
}: DrawingToolbarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.dock, { paddingBottom: insets.bottom + Spacing.three }]}>
      <Glass variant="chrome" radius="pill" elevation="lg" flat={Platform.OS === 'android'} style={styles.bar}>
        {PEN_COLORS.map((c) => {
          const selected = c === color;
          return (
            <PressScale
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`Pen color ${c}`}
              accessibilityState={{ selected }}
              haptic="light"
              onPress={() => onColorChange(c)}
              style={[
                styles.swatch,
                { backgroundColor: c, borderColor: selected ? colors.text : 'transparent' },
              ]}
            />
          );
        })}

        <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

        {PEN_WIDTHS.map((w) => {
          const selected = w === width;
          const dot = 6 + PEN_WIDTHS.indexOf(w) * 6;
          return (
            <PressScale
              key={w}
              accessibilityRole="button"
              accessibilityLabel={`Stroke width ${Math.round(w * 1000)}`}
              accessibilityState={{ selected }}
              haptic="light"
              onPress={() => onWidthChange(w)}
              style={styles.widthSlot}>
              <View
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: Radii.pill,
                  backgroundColor: selected ? colors.primary : colors.textTertiary,
                }}
              />
            </PressScale>
          );
        })}
      </Glass>

      <Glass variant="chrome" radius="pill" elevation="lg" flat={Platform.OS === 'android'} style={styles.bar}>
        <IconButton
          name="arrow-undo"
          variant="plain"
          accessibilityLabel="Undo stroke"
          disabled={!canUndo}
          onPress={onUndo}
        />
        <IconButton
          name="arrow-redo"
          variant="plain"
          accessibilityLabel="Redo stroke"
          disabled={!canRedo}
          onPress={onRedo}
        />
        <IconButton
          name="trash-outline"
          variant="plain"
          color="danger"
          accessibilityLabel="Clear page drawings"
          disabled={!canUndo}
          onPress={onClear}
        />
        <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
        <Button label="Done" icon="checkmark" size="sm" onPress={onDone} />
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { alignItems: 'center', gap: Spacing.two },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: Radii.pill,
    borderWidth: 2,
  },
  widthSlot: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginVertical: Spacing.one, marginHorizontal: Spacing.half },
});
