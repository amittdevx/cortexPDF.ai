/**
 * Markdown — a tiny, dependency-free renderer for the light markdown the model
 * returns (headings, bold, bullet/numbered lists, rules). Keeps the AI results
 * looking clean instead of showing raw `**`, `#`, `-` characters in the UI.
 */

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme';

/** Inline parse: **bold** segments; strip stray emphasis/backtick chars. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split('**').map((seg, i) => {
    const clean = seg.replace(/\*/g, '').replace(/`/g, '').replace(/_{2,}/g, '');
    if (!clean) return null;
    return i % 2 === 1 ? (
      <Text key={`${keyPrefix}-${i}`} style={styles.bold}>
        {clean}
      </Text>
    ) : (
      clean
    );
  });
}

export function Markdown({ content }: { content: string }) {
  const { colors } = useTheme();
  const lines = content.replace(/\r/g, '').split('\n');

  return (
    <View style={styles.root}>
      {lines.map((raw, i) => {
        const line = raw.trim();
        const key = `md-${i}`;

        if (!line) return <View key={key} style={styles.gap} />;

        // Horizontal rule (---, ***, ___)
        if (/^[-*_]{3,}$/.test(line)) {
          return <View key={key} style={[styles.rule, { backgroundColor: colors.border }]} />;
        }

        // Headings (#, ##, ###)
        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
          return (
            <Text key={key} variant="bodyMedium" style={styles.heading}>
              {renderInline(heading[2], key)}
            </Text>
          );
        }

        // Bullets (-, *, •)
        const bullet = line.match(/^[-*•]\s+(.*)$/);
        if (bullet) {
          return (
            <View key={key} style={styles.row}>
              <Text variant="body" color="primary">
                {'•  '}
              </Text>
              <Text variant="body" style={styles.rowText}>
                {renderInline(bullet[1], key)}
              </Text>
            </View>
          );
        }

        // Numbered list (1. 2. …)
        const numbered = line.match(/^(\d+)\.\s+(.*)$/);
        if (numbered) {
          return (
            <View key={key} style={styles.row}>
              <Text variant="bodyMedium" color="primary">
                {numbered[1]}.{'  '}
              </Text>
              <Text variant="body" style={styles.rowText}>
                {renderInline(numbered[2], key)}
              </Text>
            </View>
          );
        }

        return (
          <Text key={key} variant="body">
            {renderInline(line, key)}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.one },
  gap: { height: Spacing.two },
  heading: { marginTop: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  rowText: { flex: 1 },
  bold: { fontWeight: '700' },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.one },
});
