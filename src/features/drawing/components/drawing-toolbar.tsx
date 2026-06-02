/**
 * DrawingToolbar — the draw-mode chrome: a pen-settings row (color + width) and an
 * actions row (undo / redo / clear / done). Pure presentation; state and handlers
 * arrive via props from the reader screen, wired to the drawing hook (RULE 1).
 */

import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Glass, Icon, IconButton, PressScale } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';

import type { PenTool } from '../services/drawing.service';

/** Pen palette — kept small and calm to match the design language. */
export const PEN_COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#0A84FF', '#111111'];
/** Stroke widths as a fraction of surface width, per tool. */
export const PEN_WIDTHS = [0.004, 0.008, 0.016];
export const HL_WIDTHS = [0.02, 0.035, 0.05];

/** The width presets shown for a given tool. */
export const widthsForTool = (tool: PenTool) => (tool === 'highlighter' ? HL_WIDTHS : PEN_WIDTHS);

export interface DrawingToolbarProps {
  tool: PenTool;
  color: string;
  width: number;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: PenTool) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDone: () => void;
}

export function DrawingToolbar({
  tool,
  color,
  width,
  canUndo,
  canRedo,
  onToolChange,
  onColorChange,
  onWidthChange,
  onUndo,
  onRedo,
  onClear,
  onDone,
}: DrawingToolbarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const widths = widthsForTool(tool);

  return (
    <View style={[styles.dock, { paddingBottom: insets.bottom + Spacing.three }]}>
      <Glass variant="chrome" radius="pill" elevation="lg" flat={Platform.OS === 'android'} style={styles.settingsBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.settingsContent}>
        {(['pen', 'highlighter'] as const).map((t) => {
          const selected = t === tool;
          return (
            <PressScale
              key={t}
              accessibilityRole="button"
              accessibilityLabel={t === 'pen' ? 'Pen' : 'Highlighter'}
              accessibilityState={{ selected }}
              haptic="light"
              onPress={() => onToolChange(t)}
              style={[
                styles.toolSlot,
                selected && { backgroundColor: colors.glassFillPrimary },
              ]}>
              <Icon
                name={t === 'pen' ? 'pencil' : 'color-wand'}
                size="md"
                color={selected ? 'primary' : 'textSecondary'}
              />
            </PressScale>
          );
        })}

        <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

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

        {widths.map((w, i) => {
          const selected = w === width;
          const dot = 6 + i * 6;
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
        </ScrollView>
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
  dock: { alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  // Pen settings can exceed the screen width — scroll horizontally so nothing clips.
  settingsBar: { maxWidth: '100%', paddingVertical: Spacing.two },
  settingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  toolSlot: {
    width: 34,
    height: 34,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
