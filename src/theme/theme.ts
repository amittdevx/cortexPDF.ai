/**
 * Resolved-theme assembly. Kept separate from the barrel (`index.ts`) so that
 * `theme-provider` can import `buildTheme`/`Theme` without creating a require
 * cycle (index re-exports the provider).
 */

import { Colors, type ColorScheme } from './colors';
import { Shadows, type ElevationLevel } from './shadows';

/** A fully-resolved theme for a given color scheme. */
export interface Theme {
  scheme: 'light' | 'dark';
  colors: ColorScheme;
  shadows: Record<ElevationLevel, (typeof Shadows)['light'][ElevationLevel]>;
}

/** Assemble the resolved theme object for a scheme. */
export function buildTheme(scheme: 'light' | 'dark'): Theme {
  return {
    scheme,
    colors: Colors[scheme],
    shadows: Shadows[scheme],
  };
}
