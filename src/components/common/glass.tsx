/**
 * Glass — formerly the liquid-glass surface. The design language is now FLAT &
 * CLEAN, so this renders a plain SOLID surface: no blur, no translucent fill, no
 * shadow, no rim/specular highlight. Definition comes from an opaque background +
 * a hairline border.
 *
 * The component name and props (variant/radius/padding/rim/elevation/flat) are
 * kept for API compatibility so existing call-sites don't churn — the visual is
 * simply a clean card now. `expo-glass-effect` / `expo-blur` are no longer used
 * anywhere in the app.
 */

import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing, type ElevationLevel, type RadiusToken } from '@/theme';

export type GlassVariant = 'card' | 'chrome' | 'sheet' | 'search';

export interface GlassProps extends ViewProps {
  variant?: GlassVariant;
  radius?: RadiusToken;
  padding?: keyof typeof Spacing;
  /** Accepted for compatibility; ignored (no rim in the flat design). */
  rim?: boolean;
  /** Accepted for compatibility; ignored (no elevation in the flat design). */
  elevation?: ElevationLevel;
  /** Accepted for compatibility; ignored. */
  flat?: boolean;
  /** Draw the hairline border. Default true. */
  bordered?: boolean;
}

export function Glass({
  variant = 'card',
  radius = 'lg',
  padding,
  rim: _rim,
  elevation: _elevation,
  flat: _flat,
  bordered = true,
  style,
  children,
  ...rest
}: GlassProps) {
  const { colors } = useTheme();

  const background =
    variant === 'search'
      ? colors.backgroundElement
      : variant === 'chrome' || variant === 'sheet'
        ? colors.surfaceElevated
        : colors.surface;

  return (
    <View
      style={[
        {
          backgroundColor: background,
          borderRadius: Radii[radius],
          ...(bordered
            ? { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border }
            : null),
          ...(padding ? { padding: Spacing[padding] } : null),
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}
