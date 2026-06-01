/**
 * Theme barrel — the single import surface for the design system.
 *
 *   import { useTheme, Spacing, Radii, Typography } from '@/theme';
 *
 * Scheme-dependent values (colors, shadows) come from `useTheme()`. Static tokens
 * (spacing, radii, typography, motion) are imported directly.
 */

import "@/global.css";

export * from "./colors";
export * from "./layout";
export * from "./motion";
export * from "./shadows";
export * from "./tokens";
export * from "./typography";
export { buildTheme, type Theme } from "./theme";
export { ThemeProvider, useTheme, useThemeContext } from "./theme-provider";
