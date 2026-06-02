/**
 * Design tokens — the raw, theme-agnostic primitives of the CortexPDF design system.
 *
 * Nothing in the app should hardcode a number for spacing, radius, font size, or
 * duration. Everything flows from here so the look stays consistent and tunable
 * from a single place.
 */

/** Spacing scale (4pt grid). Kept backwards-compatible with the original starter. */
export const Spacing = {
  none: 0,
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  /** Semantic aliases for readable call-sites. */
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Corner radii. Soft, rounded — the design language calls for generous curves. */
export const Radii = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  glass: 24, // continuous-corner feel for floating chrome (tab bar, sheet)
  xl: 28,
  pill: 999,
} as const;

/** Font sizes on a calm modular scale. */
export const FontSize = {
  caption: 12,
  small: 14,
  body: 16,
  callout: 18,
  title3: 20,
  title2: 24,
  title1: 32,
  display: 40,
  hero: 48,
} as const;

/** Font weights as numeric values (RN + web friendly). */
export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Line heights paired with the font scale. */
export const LineHeight = {
  caption: 16,
  small: 20,
  body: 24,
  callout: 26,
  title3: 26,
  title2: 30,
  title1: 38,
  display: 46,
  hero: 52,
} as const;

/** Stacking order. Keep all overlay layers here to avoid z-index wars. */
export const ZIndex = {
  base: 0,
  card: 1,
  header: 10,
  floatingAction: 20,
  sheet: 30,
  modal: 40,
  toast: 50,
  splash: 100,
} as const;

/** Standard opacity steps for disabled / pressed / overlay states. */
export const Opacity = {
  disabled: 0.4,
  pressed: 0.7,
  scrim: 0.45,
  hairline: 0.08,
} as const;

/** Default hit slop so small icon buttons stay easy to tap. */
export const HitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;

/** Glass material parameters. Intensities deliberately low for mid-range Android. */
export const Glass = {
  intensityChrome: 24, // tab bar / reader bars (reader blur is iOS-only)
  highlightHeight: 1.5, // specular top-edge strip height
} as const;

export type SpacingToken = keyof typeof Spacing;
export type RadiusToken = keyof typeof Radii;
