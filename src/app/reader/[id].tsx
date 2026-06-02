/**
 * Reader route — the immersive, full-screen document reader. Pushed over the tab
 * navigator, it binds to the `useReader` hook and composes the viewport with
 * auto-hiding chrome (toolbar + controls), toggled by tapping the page. Pure UI:
 * all behavior delegates to the hook (RULE 1).
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown, SlideInUp, SlideOutDown, SlideOutUp } from 'react-native-reanimated';

import { EmptyState } from '@/components';
import { AiSummarySheet, useAiSummary } from '@/features/ai-summary';
import { BookmarksSheet, useBookmarks } from '@/features/bookmarks';
import {
  DrawingCanvas,
  DrawingToolbar,
  PEN_COLORS,
  PEN_WIDTHS,
  useDrawing,
  widthsForTool,
  type PenTool,
} from '@/features/drawing';
import { NotesSheet, useNotes } from '@/features/notes';
import {
  PagesSheet,
  PdfViewport,
  ReaderControls,
  ReaderOptionsSheet,
  ReaderToolbar,
  useReader,
} from '@/features/reader';
import { useTheme } from '@/hooks/use-theme';
import { ScreenPadding } from '@/theme';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const reader = useReader(id);
  const bookmarks = useBookmarks(reader.document?.id);
  const notes = useNotes(reader.document?.id);
  const drawing = useDrawing(reader.document?.id, reader.page);
  const ai = useAiSummary(reader.document);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [bookmarksVisible, setBookmarksVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const [pagesVisible, setPagesVisible] = useState(false);
  const [aiVisible, setAiVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [penTool, setPenTool] = useState<PenTool>('pen');
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [penWidth, setPenWidth] = useState(PEN_WIDTHS[1]);

  // Switching tool resets width to that tool's medium preset (pen and marker
  // live on very different width scales).
  const changeTool = useCallback((tool: PenTool) => {
    setPenTool(tool);
    setPenWidth(widthsForTool(tool)[1]);
  }, []);

  const bookmarkedPages = useMemo(
    () => new Set(bookmarks.bookmarks.map((b) => b.page)),
    [bookmarks.bookmarks],
  );
  const notedPages = useMemo(() => new Set(notes.notes.map((n) => n.page)), [notes.notes]);

  const goBack = useCallback(() => router.back(), [router]);
  const toggleChrome = useCallback(() => setChromeVisible((v) => !v), []);
  // Reading mode is immersive: entering it hides the chrome, leaving it shows it.
  // (Tapping the page still toggles chrome either way.)
  const readingMode = reader.readingMode;
  useEffect(() => {
    setChromeVisible(!readingMode);
  }, [readingMode]);
  const jumpToPage = useCallback(
    (targetPage: number) => {
      reader.goToPage(targetPage);
      setBookmarksVisible(false);
      setNotesVisible(false);
      setPagesVisible(false);
    },
    [reader],
  );
  // Draw mode hides the chrome for the drawing toolbar; the viewport freezes to a
  // single page (PdfViewport handles the lock via the `frozen` prop).
  const enterDraw = useCallback(() => {
    setChromeVisible(false);
    setDrawMode(true);
  }, []);
  const exitDraw = useCallback(() => {
    setDrawMode(false);
    setChromeVisible(!readingMode);
  }, [readingMode]);
  // Opening the AI sheet kicks off generation on a cache miss (cheap when cached).
  const openAi = useCallback(() => {
    setAiVisible(true);
    if (ai.configured && !ai.summary && !ai.loading) void ai.generate();
  }, [ai]);

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
        frozen={drawMode}
        onZoomChange={reader.setZoom}
        onPageChange={reader.goToPage}
        onLoadComplete={reader.reportPageCount}
        onTap={drawMode ? undefined : toggleChrome}
        onError={setRenderError}
      />

      {/* Saved strokes stay visible over the page when not actively drawing. */}
      {!drawMode && drawing.strokes.length > 0 ? (
        <DrawingCanvas readOnly strokes={drawing.strokes} tool={penTool} color={penColor} width={penWidth} onCommit={drawing.addStroke} />
      ) : null}

      {/* Reading mode: a subtle warm tint for comfortable, distraction-free reading. */}
      {readingMode && !drawMode ? (
        <View pointerEvents="none" style={[styles.readingTint, { backgroundColor: READING_TINT }]} />
      ) : null}

      {drawMode ? (
        <DrawingCanvas
          strokes={drawing.strokes}
          tool={penTool}
          color={penColor}
          width={penWidth}
          onCommit={drawing.addStroke}
        />
      ) : null}

      {chromeVisible && !drawMode ? (
        <>
          <Animated.View entering={SlideInUp} exiting={SlideOutUp} style={styles.top}>
            <ReaderToolbar
              title={reader.document.name}
              page={reader.page}
              totalPages={reader.totalPages}
              isBookmarked={bookmarks.isBookmarked(reader.page)}
              noteCount={notes.countForPage(reader.page)}
              onBack={goBack}
              onToggleBookmark={() => bookmarks.toggle(reader.page)}
              onOpenNotes={() => setNotesVisible(true)}
              onShare={reader.share}
            />
          </Animated.View>

          <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.bottom}>
            <ReaderControls
              page={reader.page}
              totalPages={reader.totalPages}
              zoom={reader.zoom}
              onPrev={reader.prevPage}
              onNext={reader.nextPage}
              onZoomIn={reader.zoomIn}
              onZoomOut={reader.zoomOut}
              onResetZoom={reader.resetZoom}
              onOpenOptions={() => setOptionsVisible(true)}
              onOpenBookmarks={() => setBookmarksVisible(true)}
              onOpenPages={() => setPagesVisible(true)}
              onEnterDraw={enterDraw}
              onOpenAi={openAi}
            />
          </Animated.View>
        </>
      ) : null}

      {drawMode ? (
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.bottom}>
          <DrawingToolbar
            tool={penTool}
            color={penColor}
            width={penWidth}
            canUndo={drawing.canUndo}
            canRedo={drawing.canRedo}
            onToolChange={changeTool}
            onColorChange={setPenColor}
            onWidthChange={setPenWidth}
            onUndo={drawing.undo}
            onRedo={drawing.redo}
            onClear={drawing.clear}
            onDone={exitDraw}
          />
        </Animated.View>
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

      <NotesSheet
        visible={notesVisible}
        onClose={() => setNotesVisible(false)}
        notes={notes.notes}
        currentPage={reader.page}
        onAdd={notes.add}
        onUpdate={notes.update}
        onRemove={notes.remove}
        onJump={jumpToPage}
      />

      <PagesSheet
        visible={pagesVisible}
        onClose={() => setPagesVisible(false)}
        totalPages={reader.totalPages}
        currentPage={reader.page}
        bookmarkedPages={bookmarkedPages}
        notedPages={notedPages}
        onJump={jumpToPage}
      />

      <AiSummarySheet
        visible={aiVisible}
        onClose={() => setAiVisible(false)}
        configured={ai.configured}
        loading={ai.loading}
        error={ai.error}
        summary={ai.summary}
        onGenerate={ai.generate}
        onRegenerate={ai.regenerate}
      />

      <ReaderOptionsSheet
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        scrollMode={reader.scrollMode}
        readingMode={reader.readingMode}
        onScrollModeChange={reader.setScrollMode}
        onReadingModeChange={reader.setReadingMode}
      />
    </View>
  );
}

/** Subtle warm overlay for reading mode (works over light and dark pages). */
const READING_TINT = 'rgba(214, 158, 74, 0.10)';

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ScreenPadding },
  top: { position: 'absolute', top: 0, left: 0, right: 0 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  readingTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
