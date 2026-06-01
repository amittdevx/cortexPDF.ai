/**
 * Text — the canonical typographic primitive. Pick a `variant` (from the
 * typography scale) and a semantic `color` role; never hardcode font sizes or hex.
 */

import { Text as RNText, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Typography, type ThemeColor, type TypographyVariant } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ThemeColor;
  /** Center the text. */
  center?: boolean;
}

export function Text({
  variant = 'body',
  color = 'text',
  center,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  return (
    <RNText
      style={[Typography[variant], { color: colors[color] }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
