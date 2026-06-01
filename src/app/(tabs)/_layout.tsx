/**
 * Tab navigator — headless `expo-router/ui` tabs with a fully custom, animated
 * tab bar. `TabSlot` renders the active screen above a docked `TabList` styled as
 * a premium bar; each `TabTrigger asChild` renders our animated `TabButton`.
 */

import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabButton } from '@/components/navigation/tab-button';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <View style={styles.slot}>
        <TabSlot />
      </View>

      <TabList
        style={[
          styles.bar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, Spacing.two),
          },
        ]}>
        <TabTrigger name="library" href="/" asChild>
          <TabButton icon="albums-outline" iconFocused="albums" label="Library" />
        </TabTrigger>
        <TabTrigger name="tools" href="/tools" asChild>
          <TabButton icon="grid-outline" iconFocused="grid" label="Tools" />
        </TabTrigger>
        <TabTrigger name="settings" href="/settings" asChild>
          <TabButton icon="settings-outline" iconFocused="settings" label="Settings" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
