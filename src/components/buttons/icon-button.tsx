/**
 * IconButton — a circular, tappable icon. Used for header actions, toolbars, and
 * compact controls. Inherits the spring press + haptic from PressScale.
 */

import { StyleSheet } from 'react-native';

import { PressScale, type PressScaleProps } from '@/components/animations/press-scale';
import { useTheme } from '@/hooks/use-theme';
import { HitSlop, Opacity, Radii, type ThemeColor } from '@/theme';

import { Icon, type IconName } from '../common/icon';

type IconButtonVariant = 'plain' | 'filled' | 'tinted';

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

  const background =
    variant === 'filled'
      ? colors.backgroundElement
      : variant === 'tinted'
        ? colors.primarySoft
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
        disabled && { opacity: Opacity.disabled },
        style,
      ]}
      {...rest}>
      <Icon name={name} size="md" color={iconColor} />
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
