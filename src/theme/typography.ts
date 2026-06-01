/**
 * Typography system — named text variants used by the <Text> primitive.
 *
 * Adding a variant here makes it available app-wide. Components never set raw
 * fontSize / lineHeight; they pick a `variant`.
 */

import { Platform, type TextStyle } from 'react-native';

import { FontSize, FontWeight, LineHeight } from './tokens';

/** Platform font families mirroring the system design-rounded / serif / mono faces. */
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
})!;

export type TypographyVariant =
  | 'hero'
  | 'display'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'body'
  | 'bodyMedium'
  | 'callout'
  | 'small'
  | 'smallBold'
  | 'caption'
  | 'captionBold'
  | 'code'
  | 'link';

export const Typography: Record<TypographyVariant, TextStyle> = {
  hero: { fontSize: FontSize.hero, lineHeight: LineHeight.hero, fontWeight: FontWeight.bold },
  display: {
    fontSize: FontSize.display,
    lineHeight: LineHeight.display,
    fontWeight: FontWeight.bold,
  },
  title1: {
    fontSize: FontSize.title1,
    lineHeight: LineHeight.title1,
    fontWeight: FontWeight.bold,
  },
  title2: {
    fontSize: FontSize.title2,
    lineHeight: LineHeight.title2,
    fontWeight: FontWeight.semibold,
  },
  title3: {
    fontSize: FontSize.title3,
    lineHeight: LineHeight.title3,
    fontWeight: FontWeight.semibold,
  },
  body: { fontSize: FontSize.body, lineHeight: LineHeight.body, fontWeight: FontWeight.regular },
  bodyMedium: {
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
    fontWeight: FontWeight.medium,
  },
  callout: {
    fontSize: FontSize.callout,
    lineHeight: LineHeight.callout,
    fontWeight: FontWeight.medium,
  },
  small: { fontSize: FontSize.small, lineHeight: LineHeight.small, fontWeight: FontWeight.medium },
  smallBold: {
    fontSize: FontSize.small,
    lineHeight: LineHeight.small,
    fontWeight: FontWeight.bold,
  },
  caption: {
    fontSize: FontSize.caption,
    lineHeight: LineHeight.caption,
    fontWeight: FontWeight.medium,
  },
  captionBold: {
    fontSize: FontSize.caption,
    lineHeight: LineHeight.caption,
    fontWeight: FontWeight.bold,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.caption,
    fontWeight: Platform.select({ android: FontWeight.bold }) ?? FontWeight.medium,
  },
  link: {
    fontSize: FontSize.small,
    lineHeight: LineHeight.callout,
    fontWeight: FontWeight.semibold,
  },
};
