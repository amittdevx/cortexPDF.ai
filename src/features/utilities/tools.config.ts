/**
 * Centralized catalog of PDF utilities (plan Phase 5). Adding a tool here surfaces
 * it in the Tools grid; each gains its own screen/flow as the phase is built out.
 */

import type { IconName } from '@/components';
import type { ThemeColor } from '@/theme';

export type ToolStatus = 'available' | 'soon';

export interface ToolDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  /** Accent role used for the tool's icon medallion. */
  accent: ThemeColor;
  status: ToolStatus;
}

export const TOOLS: ToolDefinition[] = [
  { id: 'merge', title: 'Merge', subtitle: 'Combine PDFs', icon: 'git-merge-outline', accent: 'primary', status: 'soon' },
  { id: 'compress', title: 'Compress', subtitle: 'Shrink file size', icon: 'archive-outline', accent: 'accent', status: 'soon' },
  { id: 'pdf-to-image', title: 'PDF → Image', subtitle: 'Export pages', icon: 'image-outline', accent: 'success', status: 'soon' },
  { id: 'image-to-pdf', title: 'Image → PDF', subtitle: 'Build a PDF', icon: 'images-outline', accent: 'warning', status: 'soon' },
  { id: 'split', title: 'Split', subtitle: 'Extract pages', icon: 'cut-outline', accent: 'primary', status: 'soon' },
  { id: 'word-to-pdf', title: 'Word → PDF', subtitle: 'Convert docs', icon: 'document-outline', accent: 'accent', status: 'soon' },
];
