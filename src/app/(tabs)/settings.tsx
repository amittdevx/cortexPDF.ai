/**
 * Settings — appearance, feedback, and about. Binds directly to the settings
 * store (the state layer); the store's actions own persistence (RULE 1). Uses the
 * premium parallax large-title header to match the rest of the app.
 */

import { StyleSheet, Switch, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  CollapsingHeaderBar,
  Divider,
  FadeIn,
  Glass,
  LargeTitleHeader,
  Screen,
  SegmentedControl,
  SettingRow,
  Text,
  useScrollHeader,
} from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/settings.store';
import type { ThemePreference } from '@/types/domain';
import { AppConfig } from '@/config';
import { BottomTabInset, ScreenPadding, Spacing } from '@/theme';

const THEME_SEGMENTS: { label: string; value: ThemePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { scrollY, scrollHandler } = useScrollHeader();
  const themePreference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);

  return (
    <Screen
      noPadding
      scrollY={scrollY}
      overlay={<CollapsingHeaderBar title="Settings" scrollY={scrollY} />}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <LargeTitleHeader eyebrow="Preferences" title="Settings" subtitle="Make it yours" scrollY={scrollY} />

        <FadeIn index={1}>
          <Section title="Appearance">
            <SettingRow
              icon="color-palette-outline"
              title="Theme"
              subtitle="How CortexPDF looks"
              below={
                <SegmentedControl
                  segments={THEME_SEGMENTS}
                  value={themePreference}
                  onChange={setThemePreference}
                />
              }
            />
          </Section>
        </FadeIn>

        <FadeIn index={2}>
          <Section title="Feedback">
            <SettingRow
              icon="pulse-outline"
              iconColor="accent"
              title="Haptics"
              subtitle="Tactile feedback on actions"
              trailing={
                <Switch
                  value={hapticsEnabled}
                  onValueChange={setHapticsEnabled}
                  trackColor={{ false: colors.backgroundSelected, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              }
            />
          </Section>
        </FadeIn>

        <FadeIn index={3}>
          <Section title="About">
            <SettingRow icon="information-circle-outline" title="Version" subtitle="1.0.0" />
            <Divider inset={50} />
            <SettingRow
              icon="shield-checkmark-outline"
              iconColor="success"
              title="Offline-first"
              subtitle="Your files and data stay on this device"
            />
          </Section>
        </FadeIn>

        <Text variant="caption" color="textTertiary" center style={styles.footer}>
          {AppConfig.appName} · Powerful without feeling heavy
        </Text>
      </Animated.ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="captionBold" color="primary" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </Text>
      <Glass variant="card" radius="xl" padding="three">
        {children}
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: ScreenPadding, paddingBottom: BottomTabInset + Spacing.five },
  section: { marginTop: Spacing.four, gap: Spacing.two },
  sectionTitle: { marginLeft: Spacing.two, letterSpacing: 1 },
  footer: { marginTop: Spacing.six },
});
