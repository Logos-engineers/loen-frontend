/**
 * read.tsx — Main Bible reading screen
 * Route params: book (code), chapter (number), verse? (number, when from search)
 *
 * Features:
 * - Offline JSON loading via static bibleLoader
 * - Saves resume position: LOEN_BIBLE_POSITION_v1
 * - Read-check "이미 읽은 장이에요" at END of scroll → calls useBiblePlan.toggleChapter
 * - Prev/Next chapter navigation (floating pill buttons)
 * - Highlight entry from search: 1ms → 200ms in → 1000ms hold → 200ms out
 * - Book select modal on title press
 * - Search navigation on search icon press
 */
import { BookSelectModal } from '@/components/bible/BookSelectModal';
import { BibleHeader } from '@/components/bible/BibleHeader';
import { ChapterNav } from '@/components/bible/ChapterNav';
import { VerseList, VerseListHandle, VerseListItem } from '@/components/bible/VerseList';
import { BIBLE_BOOKS } from '@/constants/BibleMeta';
import { getBibleBook } from '@/constants/bibleLoader';
import { colors } from '@/constants/tokens';
import { StatusBar } from 'expo-status-bar';
import { useBiblePlan } from '@/hooks/useBiblePlan';
import { useBibleHistory } from '@/hooks/useBibleHistory';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CheckCircleIcon from '@/assets/icons/CheckCircle.svg';

const POSITION_KEY = 'LOEN_BIBLE_POSITION_v1';

type LastPosition = { bookCode: string; chapterNum: number };

export default function BibleReadScreen() {
  const params = useLocalSearchParams<{ book?: string; chapter?: string; verse?: string }>();

  // ── params ── ────────────────────────────────────────────────────────────
  const [bookCode, setBookCode] = useState(params.book ?? 'GEN');
  const [chapterNum, setChapterNum] = useState(Number(params.chapter ?? 1));
  const [highlightVerseNum, setHighlightVerseNum] = useState<number | null>(
    params.verse ? Number(params.verse) : null
  );

  // ── modals ──────────────────────────────────────────────────────────────
  const [showBookModal, setShowBookModal] = useState(false);

  // ── scroll state ────────────────────────────────────────────────────────
  const [isAtBottom, setIsAtBottom] = useState(false);

  // ── bible plan sync ─────────────────────────────────────────────────────
  const { planData, toggleChapter } = useBiblePlan();
  // 통독표(성경통독표)는 서버 history를 읽으므로, 로컬 토글과 함께 서버에도 읽음/해제를 반영한다.
  const { checkChapters, uncheckChapters } = useBibleHistory();

  const isChapterRead = useMemo(() => {
    return Boolean(planData.readChapters[bookCode]?.[String(chapterNum)]);
  }, [planData, bookCode, chapterNum]);

  // ── data ─────────────────────────────────────────────────────────────────
  const bookDoc = useMemo(() => getBibleBook(bookCode), [bookCode]);
  const bookMeta = useMemo(
    () => BIBLE_BOOKS.find((b) => b.code === bookCode),
    [bookCode]
  );

  const chapterData = useMemo(() => {
    return bookDoc?.chapters.find((c) => c.chapter === chapterNum) ?? null;
  }, [bookDoc, chapterNum]);

  const verseListItems = useMemo((): VerseListItem[] => {
    if (!chapterData) return [];
    return chapterData.verses.map((v) => ({
      type: 'verse' as const,
      verseNum: v.verse,
      text: v.text,
    }));
  }, [chapterData]);

  const totalChapters = bookMeta?.chapterCount ?? (bookDoc?.totalChapters ?? 1);

  // ── list ref ─────────────────────────────────────────────────────────────
  const listRef = useRef<VerseListHandle>(null);

  useEffect(() => {
    const nextBookCode = params.book ?? 'GEN';
    const nextChapterNum = Number(params.chapter ?? 1);
    const nextVerseNum = params.verse ? Number(params.verse) : null;

    setBookCode(nextBookCode);
    setChapterNum(nextChapterNum);
    setHighlightVerseNum(nextVerseNum);
  }, [params.book, params.chapter, params.verse]);

  // ── save resume position ─────────────────────────────────────────────────
  useEffect(() => {
    const pos: LastPosition = { bookCode, chapterNum };
    AsyncStorage.setItem(POSITION_KEY, JSON.stringify(pos)).catch(() => {});
  }, [bookCode, chapterNum]);

  // ── highlight on entry from search ───────────────────────────────────────
  useEffect(() => {
    if (!highlightVerseNum) return;
    const delay = setTimeout(() => {
      // Scroll to the highlighted verse
      listRef.current?.scrollToVerse(highlightVerseNum);
      // The VerseItem itself animates: 200ms in → 1000ms hold → 200ms out
      // Clear after animation completes (200+1000+200 = 1400ms)
      setTimeout(() => setHighlightVerseNum(null), 1400);
    }, 1);
    return () => clearTimeout(delay);
  }, [highlightVerseNum]);

  // ── navigation ────────────────────────────────────────────────────────────
  const goToChapter = useCallback((book: string, chapter: number, verse?: number) => {
    setBookCode(book);
    setChapterNum(chapter);
    setHighlightVerseNum(verse ?? null);
    listRef.current?.scrollToVerse(verse ?? 1);
  }, []);

  // 이전/다음 장 대상 — 책 경계를 넘어 인접 책으로 이어진다.
  //   prev: 책 첫 장이면 이전 책의 마지막 장으로 (창세기 1장에서만 null → 막힘)
  //   next: 책 마지막 장이면 다음 책의 1장으로 (요한계시록 마지막 장에서만 null → 막힘)
  const bookIndex = useMemo(
    () => BIBLE_BOOKS.findIndex((b) => b.code === bookCode),
    [bookCode]
  );

  const prevTarget = useMemo<LastPosition | null>(() => {
    if (chapterNum > 1) return { bookCode, chapterNum: chapterNum - 1 };
    const prevBook = bookIndex > 0 ? BIBLE_BOOKS[bookIndex - 1] : null;
    return prevBook ? { bookCode: prevBook.code, chapterNum: prevBook.chapterCount } : null;
  }, [bookCode, chapterNum, bookIndex]);

  const nextTarget = useMemo<LastPosition | null>(() => {
    if (chapterNum < totalChapters) return { bookCode, chapterNum: chapterNum + 1 };
    const nextBook = bookIndex >= 0 && bookIndex < BIBLE_BOOKS.length - 1 ? BIBLE_BOOKS[bookIndex + 1] : null;
    return nextBook ? { bookCode: nextBook.code, chapterNum: 1 } : null;
  }, [bookCode, chapterNum, totalChapters, bookIndex]);

  const handlePrev = useCallback(() => {
    if (prevTarget) goToChapter(prevTarget.bookCode, prevTarget.chapterNum);
  }, [prevTarget, goToChapter]);

  const handleNext = useCallback(() => {
    if (nextTarget) goToChapter(nextTarget.bookCode, nextTarget.chapterNum);
  }, [nextTarget, goToChapter]);

  const handleBookSelect = useCallback((newBook: string, chapter: number, verse?: number) => {
    setShowBookModal(false);
    goToChapter(newBook, chapter, verse);
  }, [goToChapter]);

  // ── read-check ────────────────────────────────────────────────────────────
  const handleReadCheck = useCallback(async () => {
    if (isChapterRead) {
      // 이미 읽은 상태일 때 -> 읽음 해제만 수행, 다음 장으로 이동 금지
      await toggleChapter(bookCode, chapterNum);
      await uncheckChapters(bookCode, [chapterNum]); // 서버 통독표에도 해제 반영
      return;
    }

    // 아직 읽지 않은 상태일 때 -> 읽음 처리 후 다음 장으로 이동 (책 경계 넘어 다음 책 1장까지)
    await toggleChapter(bookCode, chapterNum);
    await checkChapters(bookCode, [chapterNum]); // 서버 통독표에도 읽음 반영
    if (nextTarget) {
      goToChapter(nextTarget.bookCode, nextTarget.chapterNum);
    }
  }, [bookCode, chapterNum, goToChapter, isChapterRead, toggleChapter, checkChapters, uncheckChapters, nextTarget]);

  // ── scroll ───────────────────────────────────────────────────────────────
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    if (contentSize.height === 0) return;
    
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    setIsAtBottom(isCloseToBottom);
  }, []);

  // ── search ───────────────────────────────────────────────────────────────
  const handleSearchPress = useCallback(() => {
    router.push('/bible/search');
  }, []);

  if (!bookDoc || !chapterData) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <BibleHeader
        bookName={bookMeta?.korName ?? bookCode}
        chapterNum={chapterNum}
        onSearchPress={handleSearchPress}
        onTitlePress={() => setShowBookModal(true)}
      />

      <View style={styles.listWrapper}>
        <VerseList
          ref={listRef}
          items={verseListItems}
          highlightVerseNum={highlightVerseNum}
          onScroll={handleScroll}
          listFooter={<View style={styles.endLine} />}
        />
      </View>

      {/* Floating prev/next arrows & read check button */}
      <ChapterNav
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={!!prevTarget}
        hasNext={!!nextTarget}
        isChapterRead={isChapterRead}
        onReadCheck={handleReadCheck}
        showReadCheck={isAtBottom}
      />

      {/* Book / Chapter select modal */}
      <BookSelectModal
        visible={showBookModal}
        currentBookCode={bookCode}
        currentChapter={chapterNum}
        onSelect={handleBookSelect}
        onClose={() => setShowBookModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listWrapper: {
    flex: 1,
  },
  // ── end line (read-check) ──
  endLine: {
    paddingTop: 16,
    paddingBottom: 80, // 하단 플로팅 버튼 여백 추가
  },
});
