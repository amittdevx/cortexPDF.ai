/**
 * Reader route — the immersive, full-screen document reader. Pushed over the tab
 * navigator, it binds to the `useReader` hook and composes the viewport with
 * auto-hiding chrome (toolbar + controls), toggled by tapping the page. Pure UI:
 * all behavior delegates to the hook (RULE 1).
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown, SlideInUp, SlideOutDown, SlideOutUp } from 'react-native-reanimated';

import { EmptyState } from '@/components';
import { BookmarksSheet, useBookmarks } from '@/features/bookmarks';
import { PdfViewport, ReaderControls, ReaderToolbar, useReader } from '@/features/reader';
import { useTheme } from '@/hooks/use-theme';
import { ScreenPadding } from '@/theme';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const reader = useReader(id);
  const bookmarks = useBookmarks(reader.document?.id);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [bookmarksVisible, setBookmarksVisible] = useState(false);

  const goBack = useCallback(() => router.back(), [router]);
  const toggleChrome = useCallback(() => setChromeVisible((v) => !v), []);
  const toggleScrollMode = useCallback(
    () => reader.setScrollMode(reader.scrollMode === 'continuous' ? 'paged' : 'continuous'),
    [reader],
  );
  const jumpToPage = useCallback(
    (targetPage: number) => {
      reader.goToPage(targetPage);
      setBookmarksVisible(false);
    },
    [reader],
  );

  if (reader.loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (reader.error || renderError || !reader.document) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Can’t open this document"
          message={reader.error ?? renderError ?? 'The file is no longer available.'}
          actionLabel="Back to Library"
          onAction={goBack}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <PdfViewport
        document={reader.document}
        page={reader.page}
        zoom={reader.zoom}
        scrollMode={reader.scrollMode}
        onZoomChange={reader.setZoom}
        onPageChange={reader.goToPage}
        onLoadComplete={reader.reportPageCount}
        onTap={toggleChrome}
        onError={setRenderError}
      />

      {chromeVisible ? (
        <>
          <Animated.View entering={SlideInUp} exiting={SlideOutUp} style={styles.top}>
            <ReaderToolbar
              title={reader.document.name}
              page={reader.page}
              totalPages={reader.totalPages}
              isBookmarked={bookmarks.isBookmarked(reader.page)}
              onBack={goBack}
              onToggleBookmark={() => bookmarks.toggle(reader.page)}
              onShare={reader.share}
            />
          </Animated.View>

          <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.bottom}>
            <ReaderControls
              page={reader.page}
              totalPages={reader.totalPages}
              zoom={reader.zoom}
              scrollMode={reader.scrollMode}
              onPrev={reader.prevPage}
              onNext={reader.nextPage}
              onZoomIn={reader.zoomIn}
              onZoomOut={reader.zoomOut}
              onResetZoom={reader.resetZoom}
              onToggleScrollMode={toggleScrollMode}
              onOpenBookmarks={() => setBookmarksVisible(true)}
            />
          </Animated.View>
        </>
      ) : null}

      <BookmarksSheet
        visible={bookmarksVisible}
        onClose={() => setBookmarksVisible(false)}
        bookmarks={bookmarks.bookmarks}
        currentPage={reader.page}
        isCurrentBookmarked={bookmarks.isBookmarked(reader.page)}
        onToggleCurrent={() => bookmarks.toggle(reader.page)}
        onJump={jumpToPage}
        onRemove={bookmarks.remove}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ScreenPadding },
  top: { position: 'absolute', top: 0, left: 0, right: 0 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
