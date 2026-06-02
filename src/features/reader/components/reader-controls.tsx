/**
 * ReaderControls — the reader's floating bottom bar: page navigation, a tappable
 * zoom readout (tap to reset), zoom in/out, and a scroll-mode toggle. Part of the
 * auto-hiding chrome; pure presentation driven by props.
 */

import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass, IconButton, PressScale, Text } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme';
import type { ReaderScrollMode } from '@/store/reader.store';

import { ZOOM } from '../hooks/use-reader';

export interface ReaderControlsProps {
  page: number;
  totalPages: number | null;
  zoom: number;
  scrollMode: ReaderScrollMode;
  onPrev: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleScrollMode: () => void;
  /** Tap the page indicator to open the bookmarks sheet. */
  onOpenBookmarks: () => void;
}

export function ReaderControls({
  page,
  totalPages,
  zoom,
  scrollMode,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleScrollMode,
  onOpenBookmarks,
}: ReaderControlsProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const canPrev = page > 1;
  const canNext = totalPages == null || page < totalPages;
  const canZoomOut = zoom > ZOOM.min + 0.001;
  const canZoomIn = zoom < ZOOM.max - 0.001;
  const pageLabel = totalPages ? `${page} / ${totalPages}` : `${page}`;

  return (
    <View style={[styles.dock, { paddingBottom: insets.bottom + Spacing.three }]}>
      <Glass variant="chrome" radius="pill" elevation="lg" flat={Platform.OS === 'android'} style={styles.bar}>
        <IconButton
          name="chevron-back"
          variant="plain"
          accessibilityLabel="Previous page"
          disabled={!canPrev}
          onPress={onPrev}
        />
        <PressScale
          accessibilityRole="button"
          accessibilityLabel="Open bookmarks"
          haptic="light"
          style={styles.pageLabel}
          onPress={onOpenBookmarks}>
          <Text variant="smallBold">{pageLabel}</Text>
        </PressScale>
        <IconButton
          name="chevron-forward"
          variant="plain"
          accessibilityLabel="Next page"
          disabled={!canNext}
          onPress={onNext}
        />

        <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

        <IconButton
          name="remove"
          variant="plain"
          accessibilityLabel="Zoom out"
          disabled={!canZoomOut}
          onPress={onZoomOut}
        />
        <PressScale
          accessibilityRole="button"
          accessibilityLabel="Reset zoom"
          haptic="light"
          style={styles.zoomLabel}
          onPress={onResetZoom}>
          <Text variant="smallBold" color="textSecondary">
            {Math.round(zoom * 100)}%
          </Text>
        </PressScale>
        <IconButton
          name="add"
          variant="plain"
          accessibilityLabel="Zoom in"
          disabled={!canZoomIn}
          onPress={onZoomIn}
        />

        <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

        <IconButton
          name={scrollMode === 'continuous' ? 'swap-vertical' : 'documents-outline'}
          variant="plain"
          color="textSecondary"
          accessibilityLabel={
            scrollMode === 'continuous' ? 'Switch to paged scrolling' : 'Switch to continuous scrolling'
          }
          onPress={onToggleScrollMode}
        />
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    gap: Spacing.half,
  },
  pageLabel: { minWidth: 44, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.two },
  zoomLabel: { minWidth: 48, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.two },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginVertical: Spacing.two, marginHorizontal: Spacing.half },
});
