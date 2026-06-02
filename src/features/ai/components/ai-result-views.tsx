/**
 * Renderers for the structured AI tasks. The model is asked for strict JSON but can
 * still wrap it in prose/code fences, so `parseJsonLoose` is tolerant. Quiz and
 * flashcard views render the parsed data; on a parse failure the menu falls back to
 * showing the raw text.
 */

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, PressScale, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/theme';

/** Parse JSON that may be wrapped in ```fences``` or surrounded by stray prose. */
export function parseJsonLoose<T>(raw: string): T | null {
  if (!raw) return null;
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(slice) as T;
  } catch {
    return null;
  }
}

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export function QuizView({ raw }: { raw: { questions?: unknown } }) {
  const questions = Array.isArray(raw.questions) ? (raw.questions as QuizQuestion[]) : [];
  return (
    <View style={styles.group}>
      {questions.map((q, i) => (
        <QuizCard key={i} index={i} question={q} />
      ))}
    </View>
  );
}

function QuizCard({ index, question }: { index: number; question: QuizQuestion }) {
  const { colors } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const options = Array.isArray(question.options) ? question.options : [];
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <Text variant="bodyMedium">
        {index + 1}. {question.question}
      </Text>
      <View style={styles.options}>
        {options.map((opt, i) => {
          const correct = revealed && i === question.answerIndex;
          return (
            <View key={i} style={[styles.option, correct && { backgroundColor: colors.glassFillPrimary }]}>
              <Text variant="small" color={correct ? 'primary' : 'textSecondary'}>
                {String.fromCharCode(65 + i)}. {opt}
              </Text>
            </View>
          );
        })}
      </View>
      <PressScale accessibilityRole="button" accessibilityLabel="Reveal answer" haptic="light" onPress={() => setRevealed((v) => !v)}>
        <Text variant="smallBold" color="primary">
          {revealed ? 'Hide answer' : 'Show answer'}
        </Text>
      </PressScale>
      {revealed && question.explanation ? (
        <Text variant="caption" color="textTertiary">
          {question.explanation}
        </Text>
      ) : null}
    </View>
  );
}

interface Flashcard {
  front: string;
  back: string;
}

export function FlashcardsView({ raw }: { raw: { cards?: unknown } }) {
  const cards = Array.isArray(raw.cards) ? (raw.cards as Flashcard[]) : [];
  return (
    <View style={styles.group}>
      {cards.map((c, i) => (
        <FlashcardItem key={i} card={c} />
      ))}
    </View>
  );
}

function FlashcardItem({ card }: { card: Flashcard }) {
  const { colors } = useTheme();
  const [flipped, setFlipped] = useState(false);
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel="Flip card"
      haptic="light"
      onPress={() => setFlipped((v) => !v)}
      style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={styles.flashHeader}>
        <Icon name={flipped ? 'sync-outline' : 'help-outline'} size="sm" color="textTertiary" />
        <Text variant="caption" color="textTertiary">
          {flipped ? 'Answer' : 'Tap to flip'}
        </Text>
      </View>
      <Text variant="body">{flipped ? card.back : card.front}</Text>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.three },
  card: {
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  options: { gap: Spacing.one },
  option: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.two, borderRadius: Radii.sm },
  flashHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
});
