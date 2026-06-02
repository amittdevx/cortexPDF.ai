/**
 * Library — the home screen. Lists recent documents, supports search, opening
 * into the reader, and a per-file detail sheet. The header is the premium
 * large-title pattern: an aurora wash that parallaxes on scroll plus a glass bar
 * that slides in once the title scrolls away. Pure UI: it binds to the
 * `useRecents` feature hook + reader store and renders the kit (RULE 1).
 */

import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  CollapsingHeaderBar,
  EmptyState,
  FadeIn,
  Glass,
  IconButton,
  LargeTitleHeader,
  Screen,
  SearchBar,
  Skeleton,
  useScrollHeader,
} from '@/components';
import { FileCard, FileInfoSheet, SwipeableRow, useRecents } from '@/features/recents';
import { useReaderStore } from '@/store/reader.store';
import { BottomTabInset, ScreenPadding, Spacing } from '@/theme';
import type { PdfFile } from '@/types/domain';

export default function LibraryScreen() {
  const { items, totalCount, loading, query, setQuery, importPdf, open, togglePin, remove, share } =
    useRecents();
  const router = useRouter();
  const openDocument = useReaderStore((s) => s.openDocument);
  const { scrollY, scrollHandler } = useScrollHeader();

  const [infoFile, setInfoFile] = useState<PdfFile | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);

  const onImport = useCallback(() => {
    void importPdf();
  }, [importPdf]);

  const onOpen = useCallback(
    (file: PdfFile) => {
      openDocument(file); // prime the reader store for an instant first frame
      router.push(`/reader/${file.id}`);
      void open(file); // record the open + refresh the list for our return
    },
    [openDocument, router, open],
  );

  const onShowInfo = useCallback((file: PdfFile) => {
    setInfoFile(file);
    setInfoVisible(true);
  }, []);

  const closeInfo = useCallback(() => setInfoVisible(false), []);

  // Render the sheet from the live list entry (by id) so a Pin/Unpin done inside
  // the sheet reflects immediately, rather than a stale snapshot from open-time.
  const liveInfoFile = infoFile ? (items.find((f) => f.id === infoFile.id) ?? infoFile) : null;

  const renderItem = useCallback(
    ({ item, index }: { item: PdfFile; index: number }) => (
      <FadeIn index={index} stagger={0}>
        <SwipeableRow onDelete={() => void remove(item.id)}>
          <FileCard file={item} onOpen={onOpen} onTogglePin={togglePin} onShowInfo={onShowInfo} />
        </SwipeableRow>
      </FadeIn>
    ),
    [onOpen, togglePin, onShowInfo, remove],
  );

  const subtitle = totalCount
    ? `${totalCount} document${totalCount > 1 ? 's' : ''}`
    : 'Your documents live here';

  return (
    <Screen
      noPadding
      scrollY={scrollY}
      overlay={
        <CollapsingHeaderBar
          title="Library"
          scrollY={scrollY}
          trailing={
            <IconButton name="add" variant="tinted" accessibilityLabel="Import PDF" onPress={onImport} />
          }
        />
      }>
      <Animated.FlatList
        data={items}
        keyExtractor={(f: PdfFile) => f.id}
        renderItem={renderItem}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.list}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <View style={styles.header}>
            <LargeTitleHeader
              eyebrow="Your library"
              title="Library"
              subtitle={subtitle}
              scrollY={scrollY}
              trailing={
                <IconButton
                  name="add"
                  variant="gradient"
                  size={48}
                  accessibilityLabel="Import PDF"
                  onPress={onImport}
                />
              }
            />
            {totalCount > 0 ? (
              <SearchBar value={query} onChangeText={setQuery} placeholder="Search documents" />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingList />
          ) : query.trim() ? (
            <EmptyState
              icon="search-outline"
              title="No matches"
              message={`Nothing in your library matches “${query.trim()}”.`}
            />
          ) : (
            <EmptyState
              icon="documents-outline"
              title="No documents yet"
              message="Import a PDF to start reading. Your recents, pins, and notes stay on this device."
              actionLabel="Import PDF"
              onAction={onImport}
            />
          )
        }
      />

      <FileInfoSheet
        file={liveInfoFile}
        visible={infoVisible}
        onClose={closeInfo}
        onOpen={onOpen}
        onTogglePin={togglePin}
        onShare={share}
        onDelete={(file) => void remove(file.id)}
      />
    </Screen>
  );
}

function Separator() {
  return <View style={{ height: Spacing.two }} />;
}

function LoadingList() {
  return (
    <View style={styles.loading}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Glass key={i} variant="card" padding="three" radius="xl" style={styles.skeletonRow}>
          <Skeleton width={52} height={52} radius="md" />
          <View style={styles.skeletonBody}>
            <Skeleton width="70%" height={15} />
            <Skeleton width="40%" height={11} />
          </View>
        </Glass>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingHorizontal: ScreenPadding, paddingBottom: BottomTabInset + Spacing.five },
  header: { gap: Spacing.three, marginBottom: Spacing.three },
  loading: { gap: Spacing.two },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  skeletonBody: { flex: 1, gap: Spacing.two },
});
