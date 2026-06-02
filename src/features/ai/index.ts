/** AI feature — public surface (text-based tasks over the proxy). */
export { useAiTasks, type UseAiTasksResult } from './hooks/use-ai-tasks';
export { AiMenuSheet, type AiMenuSheetProps } from './components/ai-menu-sheet';
export { AI_TASKS, getTask, type TaskDef } from './ai-tasks';
export * as aiTasksService from './services/ai.service';
