/**
 * select-bible.tsx — 말씀노트 성경 구절 선택
 * 통독표(plan.tsx)와 동일한 책+장 그리드(BookCard). 장을 누르면 가운데 VerseSelectModal 팝업이
 * 떠서 그 장의 절(節)을 여러 개 선택한다. 한 책 / 한 장 / 여러 절.
 */

import BookCard from '@/components/BiblePlan/BookCard';
import VerseSelectModal from '@/components/BiblePlan/VerseSelectModal';
import { BIBLE_BOOKS, BibleBook } from '@/constants/BibleMeta';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { getPendingPassages, setPendingPassages } from '@/utils/faith-note-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Testament = 'old' | 'new';

export default function SelectBibleScreen() {
  const router = useRouter();
  const [activeTestament, setActiveTestament] = useState<Testament>('old');

  // 선택된 단일 구절 (한 책 / 한 장 / 여러 절)
  const initial = getPendingPassages()[0];
  const [selBook, setSelBook] = useState<BibleBook | null>(
    initial ? BIBLE_BOOKS.find((b) => b.korName === initial.book) ?? null : null,
  );
  const [selChapter, setSelChapter] = useState<number | null>(initial?.chapter ?? null);
  const [selVerses, setSelVerses] = useState<number[]>(initial?.verses ?? []);

  // 절 선택 팝업 컨텍스트
  const [verseCtx, setVerseCtx] = useState<{ book: BibleBook; chapter: number } | null>(null);

  const bookList = BIBLE_BOOKS.filter((b) => b.testament === activeTestament);

  const openVerseModal = (book: BibleBook, chapter: number) => setVerseCtx({ book, chapter });

  const handleVerseConfirm = (verses: number[]) => {
    if (!verseCtx) return;
    if (verses.length === 0) {
      setSelBook(null);
      setSelChapter(null);
      setSelVerses([]);
    } else {
      setSelBook(verseCtx.book);
      setSelChapter(verseCtx.chapter);
      setSelVerses(verses);
    }
    setVerseCtx(null);
  };

  const handleDone = () => {
    if (selBook && selChapter && selVerses.length > 0) {
      setPendingPassages([{ book: selBook.korName, chapter: selChapter, verses: selVerses }]);
    } else {
      setPendingPassages([]);
    }
    router.back();
  };

  // 그리드에서 현재 선택된 장 하이라이트
  const highlightChapters = (book: BibleBook) =>
    selBook?.code === book.code && selChapter ? [selChapter] : [];

  const totalSelected = selVerses.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          activeOpacity={0.7}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>성경 선택</Text>
        <View style={styles.headerBack} />
      </View>

      {/* 통독표와 동일: 구약/신약 탭 + 책별 장 그리드. 장을 누르면 절 선택 팝업. */}
      <FlatList
        key={activeTestament}
        style={styles.list}
        data={bookList}
        keyExtractor={(book) => book.code}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            readChapters={highlightChapters(item)}
            onPress={() => {}}
            onChapterPress={(ch) => openVerseModal(item, ch)}
            edgeToEdge
          />
        )}
        ListHeaderComponent={
          <View style={styles.tabRow}>
            {(['old', 'new'] as Testament[]).map((t) => {
              const isActive = activeTestament === t;
              return (
                <TouchableOpacity key={t} style={styles.tabBtn} activeOpacity={0.8} onPress={() => setActiveTestament(t)}>
                  <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                    {t === 'old' ? '구약성경' : '신약성경'}
                  </Text>
                  {isActive && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              );
            })}
          </View>
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
      />

      {/* 완료 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.8}>
          <Text style={styles.doneBtnText}>선택 완료 ({totalSelected}절)</Text>
        </TouchableOpacity>
      </View>

      {/* 절 멀티선택 팝업 */}
      <VerseSelectModal
        visible={!!verseCtx}
        book={verseCtx?.book ?? null}
        chapter={verseCtx?.chapter ?? 0}
        selectedVerses={
          verseCtx && selBook?.code === verseCtx.book.code && selChapter === verseCtx.chapter
            ? selVerses
            : []
        }
        onClose={() => setVerseCtx(null)}
        onConfirm={handleVerseConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.elevated },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    backgroundColor: colors.background.elevated,
  },
  headerBack: { width: 32, height: 32, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.heading,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  list: { flex: 1 },
  scrollContent: { paddingBottom: spacing.md },

  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
  tabBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.secondary },
  tabBtnTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: colors.primary, borderRadius: 1 },

  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 14,
    backgroundColor: colors.background.elevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneBtn: { height: 52, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: '#fff' },
});
