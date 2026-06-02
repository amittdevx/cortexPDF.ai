/**
 * Tab navigator — headless `expo-router/ui` tabs with a FLOATING frosted-glass
 * tab bar. `TabSlot` renders the active screen; the `TabList` floats above the
 * bottom edge as a rounded glass bar. The `Glass` background is an absolute-fill
 * FIRST child of `TabList` (expo-router only parses `TabTrigger`s inside the
 * `TabList` and ignores other children, so this renders behind the triggers
 * without breaking trigger discovery). It is the one always-on live-blur surface.
 */

import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '@/components';
import { TabButton } from '@/components/navigation/tab-button';
import { Radii, Spacing } from '@/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <View style={styles.slot}>
        <TabSlot />
      </View>

      <TabList style={[styles.bar, { bottom: insets.bottom + Spacing.two }]}>
        <Glass variant="chrome" radius="glass" elevation="xl" style={StyleSheet.absoluteFill} />
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
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: Radii.glass,
  },
});
