/**
 * IconButton — a circular, tappable icon. Used for header actions, toolbars, and
 * compact controls. Inherits the spring press + haptic from PressScale.
 *
 * Variants: `plain` (bare), `filled` (recessed well), `tinted` (soft brand),
 * `glass` (frosted hairline-bordered), `gradient` (brand gradient + glow — the
 * hero action, e.g. Import).
 */

import { StyleSheet } from 'react-native';

import { PressScale, type PressScaleProps } from '@/components/animations/press-scale';
import { useTheme } from '@/hooks/use-theme';
import { HitSlop, Opacity, Radii, type ThemeColor } from '@/theme';

import { GradientView } from '../common/gradient';
import { Icon, type IconName } from '../common/icon';

type IconButtonVariant = 'plain' | 'filled' | 'tinted' | 'glass' | 'gradient';

export interface IconButtonProps extends Omit<PressScaleProps, 'children'> {
  name: IconName;
  variant?: IconButtonVariant;
  color?: ThemeColor;
  size?: number;
  accessibilityLabel: string;
}

export function IconButton({
  name,
  variant = 'plain',
  color = 'text',
  size = 40,
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: IconButtonProps) {
  const { colors } = useTheme();
  const isGradient = variant === 'gradient';

  const background =
    variant === 'filled'
      ? colors.backgroundElement
      : variant === 'tinted'
        ? colors.primarySoft
        : variant === 'glass'
          ? colors.backgroundElement
          : isGradient
            ? colors.primary // opaque backing so the glow shadow casts under the gradient
            : 'transparent';
  const iconColor: ThemeColor = variant === 'tinted' ? 'primary' : color;

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={HitSlop}
      disabled={disabled}
      scaleTo={0.9}
      haptic="light"
      style={[
        styles.base,
        { width: size, height: size, backgroundColor: background },
        variant === 'glass' && { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
        disabled && { opacity: Opacity.disabled },
        style,
      ]}
      {...rest}>
      {isGradient ? (
        <GradientView gradient="gradientBrand" radius="pill" style={StyleSheet.absoluteFill} />
      ) : null}
      <Icon name={name} size="md" color={isGradient ? 'textOnPrimary' : iconColor} />
    </PressScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
