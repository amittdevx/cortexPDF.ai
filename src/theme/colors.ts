/**
 * Semantic color schemes for light and dark mode.
 *
 * Components must reference these semantic roles (e.g. `surface`, `textSecondary`)
 * rather than raw hex values, so a single edit here re-skins the whole app.
 *
 * Design language: "Aurora" — a refined indigo→violet brand with soft gradient
 * washes and glows. Gradient tokens are tuples (`readonly [string, string]`) so
 * they drop straight into `expo-linear-gradient`'s `colors` prop.
 *
 * The original starter keys (text, background, backgroundElement,
 * backgroundSelected, textSecondary) are preserved for compatibility; everything
 * else is additive.
 */

/** A gradient color stop list, ready for `<LinearGradient colors={...} />`. */
export type Gradient = readonly [string, string, ...string[]];

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

  // — Aurora gradient system —————————————————————————————————————————————

  /** The signature brand gradient (indigo→violet). Buttons, FAB, active states. */
  gradientBrand: Gradient;
  /** Accent gradient (violet→magenta). AI / accent surfaces, highlights. */
  gradientAccent: Gradient;
  /** Soft, low-alpha brand gradient for tinted medallions / chips over surfaces. */
  gradientBrandSoft: Gradient;
  /** Aurora wash blobs painted behind screens (low-alpha, glow-like). */
  auroraOne: Gradient;
  auroraTwo: Gradient;
  auroraThree: Gradient;
  /** Colored shadow used for premium "glow" on key elements (iOS shadowColor). */
  glow: string;
  /** Strong glow color for the active/primary glow ring. */
  glowStrong: string;
}

export const lightColors: ColorScheme = {
  background: '#FAFAFE',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  backgroundElement: '#F1F1F9',
  backgroundSelected: '#E7E6F4',
  border: 'rgba(24, 20, 45, 0.07)',
  borderStrong: 'rgba(24, 20, 45, 0.14)',

  text: '#16131F',
  textSecondary: '#5D596F',
  textTertiary: '#9B97AD',
  textOnPrimary: '#FFFFFF',

  primary: '#5B57F2',
  primaryPressed: '#4842D6',
  primarySoft: '#ECEBFE',

  accent: '#9B5CF5',
  accentSoft: '#F3ECFE',

  success: '#10B981',
  warning: '#F59E0B',
  danger: '#F43F5E',
  dangerSoft: '#FDEDEF',

  scrim: 'rgba(12, 10, 24, 0.42)',
  skeleton: '#ECEBF2',

  glassFill: 'rgba(255, 255, 255, 0.64)',
  glassFillStrong: 'rgba(255, 255, 255, 0.86)',
  glassFillPrimary: 'rgba(91, 87, 242, 0.12)',
  glassTint: 'rgba(255, 255, 255, 0.35)',
  glassBorder: 'rgba(255, 255, 255, 0.72)',
  glassHighlight: 'rgba(255, 255, 255, 0.92)',
  backdropTop: '#EFEDFE',
  backdropBottom: '#FAFAFE',

  gradientBrand: ['#6366F1', '#9B5CF5'],
  gradientAccent: ['#9B5CF5', '#E25CC0'],
  gradientBrandSoft: ['rgba(99,102,241,0.18)', 'rgba(155,92,245,0.16)'],
  // Subtle fresh tint near the top of the canvas — clean, not glassy.
  auroraOne: ['rgba(99,102,241,0.14)', 'rgba(99,102,241,0)'],
  auroraTwo: ['rgba(155,92,245,0.11)', 'rgba(155,92,245,0)'],
  auroraThree: ['rgba(226,92,192,0.07)', 'rgba(226,92,192,0)'],
  glow: 'rgba(91, 87, 242, 0.45)',
  glowStrong: '#6366F1',
};

export const darkColors: ColorScheme = {
  background: '#0A0911',
  surface: '#15131F',
  surfaceElevated: '#1C1A28',
  backgroundElement: '#16141F',
  backgroundSelected: '#262234',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',

  text: '#F4F3FA',
  textSecondary: '#A8A4BE',
  textTertiary: '#6E6A85',
  textOnPrimary: '#FFFFFF',

  primary: '#8B85FF',
  primaryPressed: '#A39DFF',
  primarySoft: '#1E1B3A',

  accent: '#B57BFF',
  accentSoft: '#241E3A',

  success: '#34D399',
  warning: '#FBBF24',
  danger: '#FB7185',
  dangerSoft: '#2A1620',

  scrim: 'rgba(0, 0, 0, 0.58)',
  skeleton: '#1E1B29',

  glassFill: 'rgba(34, 31, 48, 0.55)',
  glassFillStrong: 'rgba(26, 23, 38, 0.82)',
  glassFillPrimary: 'rgba(139, 133, 255, 0.18)',
  glassTint: 'rgba(18, 16, 28, 0.40)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.14)',
  backdropTop: '#13101F',
  backdropBottom: '#0A0911',

  gradientBrand: ['#7C83FF', '#B57BFF'],
  gradientAccent: ['#B57BFF', '#F07BD0'],
  gradientBrandSoft: ['rgba(124,131,255,0.22)', 'rgba(181,123,255,0.18)'],
  // Subtle fresh tint near the top of the canvas — clean, not glassy.
  auroraOne: ['rgba(124,131,255,0.20)', 'rgba(124,131,255,0)'],
  auroraTwo: ['rgba(181,123,255,0.15)', 'rgba(181,123,255,0)'],
  auroraThree: ['rgba(240,123,208,0.10)', 'rgba(240,123,208,0)'],
  glow: 'rgba(124, 131, 255, 0.55)',
  glowStrong: '#7C83FF',
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
} as const;

/**
 * A solid (single-string) color role, e.g. 'text' | 'surface' | 'primary'.
 * Excludes the gradient tuple roles so `colors[role]` is always a `string` —
 * this is what `<Text color>`, `<Icon color>`, etc. accept.
 */
export type ThemeColor = {
  [K in keyof ColorScheme]: ColorScheme[K] extends string ? K : never;
}[keyof ColorScheme];

/** A gradient color role, e.g. 'gradientBrand' | 'auroraOne'. */
export type GradientColor = {
  [K in keyof ColorScheme]: ColorScheme[K] extends Gradient ? K : never;
}[keyof ColorScheme];
