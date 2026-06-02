/**
 * ScreenHeader — a large-title header with an optional subtitle and a trailing
 * action slot. A thin wrapper over `LargeTitleHeader` (the canonical premium
 * title) that fades in on mount. Used by screens that don't drive their own
 * scroll-parallax; parallax screens use `LargeTitleHeader` + `CollapsingHeaderBar`
 * directly.
 */

import type { ReactNode } from 'react';

import { FadeIn } from '@/components/animations/fade-in';

import { LargeTitleHeader } from './parallax-header';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Small tinted label above the title (editorial accent). */
  eyebrow?: string;
  /** Trailing element, e.g. an IconButton, aligned to the title row. */
  trailing?: ReactNode;
}

export function ScreenHeader({ title, subtitle, eyebrow, trailing }: ScreenHeaderProps) {
  return (
    <FadeIn>
      <LargeTitleHeader title={title} subtitle={subtitle} eyebrow={eyebrow} trailing={trailing} />
    </FadeIn>
  );
}
