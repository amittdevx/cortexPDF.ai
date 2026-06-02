/**
 * NotesSheet — lists a document's page notes and lets the user add a note to the
 * current page, edit an existing one, jump to a note's page, or remove it. The
 * composer state (draft text + which note is being edited) is local UI state;
 * persistence delegates to the notes hook via props (RULE 1).
 */

import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet, Button, Glass, GradientView, IconButton, PressScale, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing, Typography } from '@/theme';
import { formatRelativeTime } from '@/utils/format';

import type { Note } from '../services/notes.service';

export interface NotesSheetProps {
  visible: boolean;
  onClose: () => void;
  notes: Note[];
  currentPage: number;
  onAdd: (page: number, text: string) => void;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onJump: (page: number) => void;
}

export function NotesSheet({
  visible,
  onClose,
  notes,
  currentPage,
  onAdd,
  onUpdate,
  onRemove,
  onJump,
}: NotesSheetProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setDraft('');
    setEditingId(null);
  }, []);

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    if (editingId) onUpdate(editingId, text);
    else onAdd(currentPage, text);
    reset();
  }, [draft, editingId, currentPage, onAdd, onUpdate, reset]);

  const startEdit = useCallback((note: Note) => {
    setEditingId(note.id);
    setDraft(note.text);
  }, []);

  const composerLabel = editingId ? 'Save note' : `Add note · page ${currentPage}`;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Notes">
      <Glass variant="search" radius="md" style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={editingId ? 'Edit note…' : `Write a note for page ${currentPage}…`}
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, Typography.body, { color: colors.text }]}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Note text"
        />
      </Glass>
      <View style={styles.composerActions}>
        {editingId ? (
          <Button label="Cancel" variant="ghost" size="sm" onPress={reset} />
        ) : null}
        <Button
          label={composerLabel}
          icon={editingId ? 'checkmark' : 'add'}
          size="sm"
          disabled={draft.trim().length === 0}
          onPress={submit}
        />
      </View>

      {notes.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="small" color="textTertiary" center>
            No notes yet. Jot a thought for the page you’re on.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {notes.map((n) => (
            <View key={n.id} style={styles.row}>
              <PressScale
                accessibilityRole="button"
                accessibilityLabel={`Go to page ${n.page}`}
                haptic="light"
                style={styles.pageChip}
                onPress={() => onJump(n.page)}>
                <GradientView gradient="gradientBrand" radius="sm" style={StyleSheet.absoluteFill} />
                <Text variant="smallBold" color="textOnPrimary">
                  {n.page}
                </Text>
              </PressScale>
              <PressScale
                accessibilityRole="button"
                accessibilityLabel="Edit note"
                style={styles.rowBody}
                onPress={() => startEdit(n)}>
                <Text variant="body" numberOfLines={4}>
                  {n.text}
                </Text>
                <Text variant="caption" color="textTertiary">
                  {formatRelativeTime(n.createdAt)}
                </Text>
              </PressScale>
              <IconButton
                name="trash-outline"
                color="textTertiary"
                accessibilityLabel="Remove note"
                onPress={() => {
                  if (editingId === n.id) reset();
                  onRemove(n.id);
                }}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  composer: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, minHeight: 72 },
  input: { flex: 1, minHeight: 56, paddingVertical: 0 },
  composerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two },
  empty: { paddingVertical: Spacing.four, paddingHorizontal: Spacing.three },
  list: { maxHeight: 320 },
  listContent: { gap: Spacing.two, paddingVertical: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  pageChip: {
    minWidth: 42,
    height: 42,
    paddingHorizontal: Spacing.two,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowBody: { flex: 1, gap: Spacing.half, paddingTop: Spacing.one },
});
