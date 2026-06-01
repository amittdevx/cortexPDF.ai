/**
 * Icon — a thin, theme-aware wrapper over Ionicons. Centralizing it means we can
 * swap icon sets or sizing later without touching every call-site, and icon names
 * are type-checked.
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { useTheme } from '@/hooks/use-theme';
import type { ThemeColor } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Named size steps so icons stay consistent across the app. */
const SIZES = { sm: 16, md: 20, lg: 24, xl: 28 } as const;

export interface IconProps {
  name: IconName;
  size?: keyof typeof SIZES | number;
  color?: ThemeColor;
  /** Pass a raw color string to bypass theme roles (e.g. on a colored fill). */
  rawColor?: string;
}

export function Icon({ name, size = 'md', color = 'text', rawColor }: IconProps) {
  const { colors } = useTheme();
  const resolvedSize = typeof size === 'number' ? size : SIZES[size];
  return <Ionicons name={name} size={resolvedSize} color={rawColor ?? colors[color]} />;
}
