/**
 * Semantic color schemes for light and dark mode.
 *
 * Components must reference these semantic roles (e.g. `surface`, `textSecondary`)
 * rather than raw hex values, so a single edit here re-skins the whole app.
 *
 * The original starter exposed: text, background, backgroundElement,
 * backgroundSelected, textSecondary. Those keys are preserved for compatibility;
 * everything else is additive.
 */

export interface ColorScheme {
  /** App canvas — the calm base layer. */
  background: string;
  /** Primary card / panel surface that sits on the background. */
  surface: string;
  /** A surface that floats above others (sheets, popovers). */
  surfaceElevated: string;
  /** A recessed element well (inputs, segmented controls). Alias: original `backgroundElement`. */
  backgroundElement: string;
  /** Selected / active element fill. */
  backgroundSelected: string;
  /** Hairline separators and subtle outlines. */
  border: string;
  /** Stronger outline for focus / emphasis. */
  borderStrong: string;

  /** Primary text. */
  text: string;
  /** Secondary, lower-emphasis text. */
  textSecondary: string;
  /** Tertiary text — hints, timestamps, placeholders. */
  textTertiary: string;
  /** Text that sits on top of a primary-colored fill. */
  textOnPrimary: string;

  /** Brand / primary action color. */
  primary: string;
  /** Pressed / active variant of primary. */
  primaryPressed: string;
  /** Soft tinted background derived from primary (chips, selected rows). */
  primarySoft: string;

  /** Accent used for AI / intelligence surfaces. */
  accent: string;
  /** Soft tinted accent background. */
  accentSoft: string;

  /** Status colors. */
  success: string;
  warning: string;
  danger: string;
  dangerSoft: string;

  /** Full-screen scrim behind modals & sheets. */
  scrim: string;
  /** Skeleton / shimmer base while loading. */
  skeleton: string;

  /** Translucent fill for faux-glass cards/rows (NO live blur). Sits over the backdrop. */
  glassFill: string;
  /** Stronger translucent fill for chrome fallback + the modal sheet (near-opaque, legible). */
  glassFillStrong: string;
  /** Primary-tinted glass fill — active tab pill, thumbnails, medallions. */
  glassFillPrimary: string;
  /** Low-alpha tint passed INTO GlassView / BlurView. */
  glassTint: string;
  /** Hairline glass border — brighter than `border` so the rim catches light. */
  glassBorder: string;
  /** Specular top-edge highlight (the 1px line that sells "glass"). */
  glassHighlight: string;
  /** Backdrop wash gradient stops (bottom == background for a seamless blend). */
  backdropTop: string;
  backdropBottom: string;
}

export const lightColors: ColorScheme = {
  background: '#FBFBFD',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  backgroundElement: '#F1F2F6',
  backgroundSelected: '#E6E8EF',
  border: 'rgba(17, 19, 26, 0.07)',
  borderStrong: 'rgba(17, 19, 26, 0.14)',

  text: '#14151A',
  textSecondary: '#5B6170',
  textTertiary: '#9AA0AD',
  textOnPrimary: '#FFFFFF',

  primary: '#2F6FED',
  primaryPressed: '#2459C6',
  primarySoft: '#E9F0FF',

  accent: '#6C5CE7',
  accentSoft: '#EFEBFF',

  success: '#1FA971',
  warning: '#E8950C',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',

  scrim: 'rgba(10, 12, 18, 0.40)',
  skeleton: '#ECEDF1',

  glassFill: 'rgba(255, 255, 255, 0.62)',
  glassFillStrong: 'rgba(255, 255, 255, 0.82)',
  glassFillPrimary: 'rgba(47, 111, 237, 0.12)',
  glassTint: 'rgba(255, 255, 255, 0.35)',
  glassBorder: 'rgba(255, 255, 255, 0.70)',
  glassHighlight: 'rgba(255, 255, 255, 0.90)',
  backdropTop: '#EFF2FB',
  backdropBottom: '#FBFBFD',
};

export const darkColors: ColorScheme = {
  background: '#0B0C0F',
  surface: '#16181D',
  surfaceElevated: '#1D2026',
  backgroundElement: '#16181D',
  backgroundSelected: '#262A33',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',

  text: '#F5F6F8',
  textSecondary: '#A8AEBC',
  textTertiary: '#6B7280',
  textOnPrimary: '#FFFFFF',

  primary: '#5B8DEF',
  primaryPressed: '#7AA4F4',
  primarySoft: '#16233D',

  accent: '#8B7CF6',
  accentSoft: '#211D3A',

  success: '#34D399',
  warning: '#FBBF24',
  danger: '#FF6B6B',
  dangerSoft: '#2A1718',

  scrim: 'rgba(0, 0, 0, 0.55)',
  skeleton: '#1E2127',

  glassFill: 'rgba(34, 38, 47, 0.55)',
  glassFillStrong: 'rgba(28, 31, 39, 0.80)',
  glassFillPrimary: 'rgba(91, 141, 239, 0.18)',
  glassTint: 'rgba(20, 22, 28, 0.40)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.14)',
  backdropTop: '#10131A',
  backdropBottom: '#0B0C0F',
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
} as const;

/** Union of every semantic color role, e.g. 'text' | 'surface' | 'primary'. */
export type ThemeColor = keyof ColorScheme;
