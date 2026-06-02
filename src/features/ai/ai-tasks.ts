/**
 * Client-side AI task catalog — labels, icons, which input each task needs, and
 * the per-task input character budget used to trim the text slice before it goes
 * to the proxy (the Worker holds the authoritative prompts; this drives the UI and
 * slice sizing). Keeping tasks data-driven means the menu renders from this list.
 */

import type { IconName } from '@/components';
import type { AiTask } from '@/services/ai';

/** What extra input a task needs from the user. */
export type TaskInput = 'none' | 'question' | 'language' | 'count';

/** Which slice of the document a task reads. */
export type TaskScope = 'document' | 'page';

export interface TaskDef {
  key: AiTask;
  label: string;
  hint: string;
  icon: IconName;
  input: TaskInput;
  scope: TaskScope;
  /** Max characters of text sent for this task (token guard). */
  charBudget: number;
  /** Output is strict JSON the app parses (quiz / flashcards). */
  json?: boolean;
}

export const AI_TASKS: TaskDef[] = [
  { key: 'summary', label: 'Summary', hint: 'Whole-document overview', icon: 'reader-outline', input: 'none', scope: 'document', charBudget: 24000 },
  { key: 'page-summary', label: 'This page', hint: 'Summarize the current page', icon: 'document-text-outline', input: 'none', scope: 'page', charBudget: 8000 },
  { key: 'key-points', label: 'Key points', hint: 'The main takeaways', icon: 'list-outline', input: 'none', scope: 'document', charBudget: 24000 },
  { key: 'notes', label: 'Study notes', hint: 'Structured notes', icon: 'create-outline', input: 'none', scope: 'document', charBudget: 24000 },
  { key: 'quiz', label: 'Quiz', hint: 'Practice questions + answers', icon: 'help-circle-outline', input: 'count', scope: 'document', charBudget: 20000, json: true },
  { key: 'flashcards', label: 'Flashcards', hint: 'For revision', icon: 'albums-outline', input: 'count', scope: 'document', charBudget: 20000, json: true },
  { key: 'ask', label: 'Ask the PDF', hint: 'Question grounded in the doc', icon: 'chatbubble-ellipses-outline', input: 'question', scope: 'document', charBudget: 24000 },
  { key: 'explain', label: 'Explain simply', hint: 'Plain-language explainer', icon: 'bulb-outline', input: 'none', scope: 'document', charBudget: 16000 },
  { key: 'translate', label: 'Translate', hint: 'Into another language', icon: 'language-outline', input: 'language', scope: 'document', charBudget: 12000 },
];

export const getTask = (key: AiTask): TaskDef =>
  AI_TASKS.find((t) => t.key === key) ?? AI_TASKS[0];
