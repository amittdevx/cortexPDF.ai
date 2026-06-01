/**
 * Settings — appearance, feedback, and about. Binds directly to the settings
 * store (the state layer); the store's actions own persistence (RULE 1).
 */

import { StyleSheet, Switch, View } from 'react-native';

import {
  Divider,
  FadeIn,
  Screen,
  ScreenHeader,
  SegmentedControl,
  SettingRow,
  Surface,
  Text,
} from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/settings.store';
import type { ThemePreference } from '@/types/domain';
import { AppConfig } from '@/config';
import { Spacing } from '@/theme';

const THEME_SEGMENTS: { label: string; value: ThemePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const themePreference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);

  return (
    <Screen scroll>
      <ScreenHeader title="Settings" subtitle="Make it yours" />

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
          <Divider inset={48} />
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
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="smallBold" color="textSecondary" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </Text>
      <Surface color="surface" elevation="sm" bordered padding="three">
        {children}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.four, gap: Spacing.two },
  sectionTitle: { marginLeft: Spacing.one, letterSpacing: 0.5 },
  footer: { marginTop: Spacing.six },
});
