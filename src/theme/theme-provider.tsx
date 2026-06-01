/**
 * Theme provider + hooks.
 *
 * Resolves the active color scheme from the user's preference (settings store)
 * combined with the OS scheme, and exposes a fully-built `Theme` via context.
 * Components consume `useTheme()` for scheme-dependent values (colors, shadows).
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/store/settings.store';
import type { ColorSchemeName } from '@/types/domain';

import { buildTheme, type Theme } from './theme';

const ThemeContext = createContext<Theme>(buildTheme('light'));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useSettingsStore((s) => s.themePreference);
  const systemScheme = useColorScheme();

  const scheme: ColorSchemeName =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const theme = useMemo(() => buildTheme(scheme), [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** The resolved theme: `{ scheme, colors, shadows }`. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** Theme + preference controls for settings UI. */
export function useThemeContext() {
  const theme = useTheme();
  const preference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  return { theme, preference, setThemePreference };
}
