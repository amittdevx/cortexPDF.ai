/** Divider — a hairline separator using the theme border color. */

import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme';

export function Divider({ inset = 0, spacing }: { inset?: number; spacing?: keyof typeof Spacing }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: 1,
        marginLeft: inset,
        marginVertical: spacing ? Spacing[spacing] : 0,
        backgroundColor: colors.border,
      }}
    />
  );
}
