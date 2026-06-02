/**
 * AiMenuSheet — the reading-mode AI hub. Three views inside one BottomSheet:
 *   1. task list (Summary, Quiz, Ask, …),
 *   2. an input panel for tasks that need one (Ask → question, Translate →
 *      language, Quiz/Flashcards → count),
 *   3. a result view (loading / error / content), with Regenerate + Back.
 * Pure presentation; all work arrives via props wired to useAiTasks (RULE 1).
 */

import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet, Button, Icon, IconButton, PressScale, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import type { AiTask, AiTaskParams } from '@/services/ai';
import { Radii, Spacing, Typography } from '@/theme';

import { AI_TASKS, getTask, type TaskDef } from '../ai-tasks';
import { QuizView, FlashcardsView, parseJsonLoose } from './ai-result-views';
import { Markdown } from './markdown';

export interface AiMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  configured: boolean;
  extracting: boolean;
  loading: boolean;
  error: string | undefined;
  content: string | undefined;
  activeTask: AiTask | null;
  onRunTask: (task: AiTask, params?: AiTaskParams) => void;
  onRegenerate: () => void;
  onReset: () => void;
}

export function AiMenuSheet({
  visible,
  onClose,
  configured,
  extracting,
  loading,
  error,
  content,
  activeTask,
  onRunTask,
  onRegenerate,
  onReset,
}: AiMenuSheetProps) {
  const { colors } = useTheme();
  const [pending, setPending] = useState<TaskDef | null>(null);
  const [textInput, setTextInput] = useState('');
  const [count, setCount] = useState(5);

  const close = useCallback(() => {
    setPending(null);
    setTextInput('');
    onReset();
    onClose();
  }, [onReset, onClose]);

  const back = useCallback(() => {
    setPending(null);
    setTextInput('');
    onReset();
  }, [onReset]);

  const pickTask = useCallback(
    (def: TaskDef) => {
      if (def.input === 'none') {
        onRunTask(def.key);
      } else {
        setPending(def);
        setTextInput('');
        setCount(5);
      }
    },
    [onRunTask],
  );

  const submitPending = useCallback(() => {
    if (!pending) return;
    const params: AiTaskParams = {};
    if (pending.input === 'question') params.question = textInput.trim();
    if (pending.input === 'language') params.language = textInput.trim();
    if (pending.input === 'count') params.n = count;
    onRunTask(pending.key, params);
    setPending(null);
  }, [pending, textInput, count, onRunTask]);

  // ---- not configured ------------------------------------------------------
  if (!configured) {
    return (
      <BottomSheet visible={visible} onClose={close} title="AI">
        <View style={styles.message}>
          <Icon name="sparkles-outline" size="xl" color="textTertiary" />
          <Text variant="bodyMedium" center>
            AI features are coming soon
          </Text>
          <Text variant="small" color="textTertiary" center>
            They switch on once the AI backend is connected. Your documents stay on
            device until then.
          </Text>
        </View>
      </BottomSheet>
    );
  }

  // ---- result view ---------------------------------------------------------
  if (activeTask) {
    const def = getTask(activeTask);
    return (
      <BottomSheet visible={visible} onClose={close} title={def.label}>
        {loading ? (
          <View style={styles.message}>
            <ActivityIndicator color={colors.primary} />
            <Text variant="small" color="textTertiary" center>
              {extracting ? 'Reading your document…' : 'Thinking…'}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.message}>
            <Icon name="alert-circle-outline" size="xl" color="danger" />
            <Text variant="small" color="textTertiary" center>
              {error}
            </Text>
            <Button label="Try again" icon="refresh" variant="secondary" onPress={onRegenerate} />
          </View>
        ) : (
          <>
            <ScrollView style={styles.result} contentContainerStyle={styles.resultBody} showsVerticalScrollIndicator={false}>
              <TaskContent task={activeTask} content={content ?? ''} />
            </ScrollView>
            <View style={styles.resultActions}>
              <Button label="Back" icon="chevron-back" variant="ghost" size="sm" onPress={back} />
              <Button label="Regenerate" icon="refresh" variant="secondary" size="sm" onPress={onRegenerate} />
            </View>
          </>
        )}
      </BottomSheet>
    );
  }

  // ---- input panel ---------------------------------------------------------
  if (pending) {
    return (
      <BottomSheet visible={visible} onClose={close} title={pending.label}>
        {pending.input === 'count' ? (
          <View style={styles.stepperRow}>
            <Text variant="bodyMedium">How many?</Text>
            <View style={styles.stepper}>
              <IconButton name="remove" variant="filled" accessibilityLabel="Fewer" disabled={count <= 3} onPress={() => setCount((c) => Math.max(3, c - 1))} />
              <Text variant="title3" style={styles.count}>{count}</Text>
              <IconButton name="add" variant="filled" accessibilityLabel="More" disabled={count >= 15} onPress={() => setCount((c) => Math.min(15, c + 1))} />
            </View>
          </View>
        ) : (
          <View style={[styles.inputBox, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <TextInput
              value={textInput}
              onChangeText={setTextInput}
              placeholder={pending.input === 'question' ? 'Ask something about this document…' : 'Target language (e.g. Hindi, Spanish)'}
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, Typography.body, { color: colors.text }]}
              multiline={pending.input === 'question'}
              autoFocus
              accessibilityLabel={pending.label}
            />
          </View>
        )}
        <View style={styles.resultActions}>
          <Button label="Back" icon="chevron-back" variant="ghost" size="sm" onPress={back} />
          <Button
            label="Generate"
            icon="sparkles"
            size="sm"
            disabled={pending.input !== 'count' && textInput.trim().length === 0}
            onPress={submitPending}
          />
        </View>
      </BottomSheet>
    );
  }

  // ---- task list -----------------------------------------------------------
  return (
    <BottomSheet visible={visible} onClose={close} title="AI">
      <ScrollView style={styles.list} contentContainerStyle={styles.listBody} showsVerticalScrollIndicator={false}>
        {AI_TASKS.map((def) => (
          <PressScale
            key={def.key}
            accessibilityRole="button"
            accessibilityLabel={def.label}
            haptic="light"
            onPress={() => pickTask(def)}
            style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colors.glassFillPrimary }]}>
              <Icon name={def.icon} size="md" color="primary" />
            </View>
            <View style={styles.rowBody}>
              <Text variant="bodyMedium">{def.label}</Text>
              <Text variant="caption" color="textTertiary">{def.hint}</Text>
            </View>
            <Icon name="chevron-forward" size="sm" color="textTertiary" />
          </PressScale>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

/** Render the right view for a task's content (JSON for quiz/flashcards, else text). */
function TaskContent({ task, content }: { task: AiTask; content: string }) {
  if (task === 'quiz') {
    const data = parseJsonLoose<{ questions?: unknown }>(content);
    if (data?.questions) return <QuizView raw={data} />;
  }
  if (task === 'flashcards') {
    const data = parseJsonLoose<{ cards?: unknown }>(content);
    if (data?.cards) return <FlashcardsView raw={data} />;
  }
  return <Markdown content={content} />;
}

const styles = StyleSheet.create({
  message: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.four, paddingHorizontal: Spacing.two },
  list: { maxHeight: 420 },
  listBody: { gap: Spacing.one, paddingVertical: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two },
  rowIcon: { width: 40, height: 40, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, gap: Spacing.half },
  result: { maxHeight: 380 },
  resultBody: { paddingVertical: Spacing.one, gap: Spacing.three },
  resultActions: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.one },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.two },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  count: { minWidth: 32, textAlign: 'center' },
  inputBox: { borderRadius: Radii.md, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, minHeight: 56 },
  input: { minHeight: 40, paddingVertical: 0 },
});
