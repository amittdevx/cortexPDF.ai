/**
 * Surface — a themed container with a color role, rounded corners, optional
 * elevation (soft shadow), and padding. The building block for cards and panels.
 */

import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing, type ElevationLevel, type RadiusToken, type ThemeColor } from '@/theme';

export interface SurfaceProps extends ViewProps {
  color?: ThemeColor;
  radius?: RadiusToken;
  elevation?: ElevationLevel;
  /** Uniform padding from the spacing scale. */
  padding?: keyof typeof Spacing;
  /** Draw a hairline border using the theme border color. */
  bordered?: boolean;
}

export function Surface({
  color = 'surface',
  radius = 'lg',
  elevation = 'none',
  padding,
  bordered,
  style,
  ...rest
}: SurfaceProps) {
  const { colors, shadows } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors[color],
          borderRadius: Radii[radius],
          ...(padding ? { padding: Spacing[padding] } : null),
          ...(bordered ? { borderWidth: 1, borderColor: colors.border } : null),
        },
        shadows[elevation],
        style,
      ]}
      {...rest}
    />
  );
}
