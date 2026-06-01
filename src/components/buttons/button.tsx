/**
 * Button — the primary action component. Variants map to semantic color roles;
 * it inherits the spring press + haptic from PressScale. Logic-free by design:
 * pass an `onPress` handler that delegates to a hook/service (RULE 1).
 */

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PressScale, type PressScaleProps } from '@/components/animations/press-scale';
import { useTheme } from '@/hooks/use-theme';
import { Opacity, Radii, Spacing, type ThemeColor } from '@/theme';

import { Icon, type IconName } from '../common/icon';
import { Text } from '../common/text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressScaleProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
}

const SIZE_STYLE: Record<ButtonSize, { paddingV: number; paddingH: number; gap: number }> = {
  sm: { paddingV: Spacing.two, paddingH: Spacing.three, gap: Spacing.one },
  md: { paddingV: Spacing.md, paddingH: Spacing.four, gap: Spacing.two },
  lg: { paddingV: Spacing.three, paddingH: Spacing.five, gap: Spacing.two },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  fullWidth,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const sizing = SIZE_STYLE[size];

  const bg: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.backgroundElement,
    ghost: 'transparent',
    danger: colors.danger,
  };
  const fg: Record<ButtonVariant, ThemeColor> = {
    primary: 'textOnPrimary',
    secondary: 'text',
    ghost: 'primary',
    danger: 'textOnPrimary',
  };

  const isDisabled = disabled || loading;

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      scaleTo={0.96}
      haptic="medium"
      style={[
        styles.base,
        {
          backgroundColor: bg[variant],
          paddingVertical: sizing.paddingV,
          paddingHorizontal: sizing.paddingH,
          gap: sizing.gap,
          opacity: isDisabled ? Opacity.disabled : 1,
        },
        variant === 'ghost' && { borderWidth: 1, borderColor: colors.border },
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={colors[fg[variant]]} size="small" />
      ) : (
        <View style={[styles.content, { gap: sizing.gap }]}>
          {icon ? <Icon name={icon} size={size === 'lg' ? 'lg' : 'md'} color={fg[variant]} /> : null}
          <Text variant={size === 'sm' ? 'smallBold' : 'callout'} color={fg[variant]}>
            {label}
          </Text>
        </View>
      )}
    </PressScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  fullWidth: { alignSelf: 'stretch' },
});
