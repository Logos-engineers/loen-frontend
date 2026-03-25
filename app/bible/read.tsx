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
import { useBiblePlan } from '@/hooks/useBiblePlan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

  // ── bible plan sync ─────────────────────────────────────────────────────
  const { planData, toggleChapter } = useBiblePlan();

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

  const handlePrev = useCallback(() => {
    if (chapterNum > 1) {
      goToChapter(bookCode, chapterNum - 1);
    }
  }, [bookCode, chapterNum, goToChapter]);

  const handleNext = useCallback(() => {
    if (chapterNum < totalChapters) {
      goToChapter(bookCode, chapterNum + 1);
    }
  }, [bookCode, chapterNum, totalChapters, goToChapter]);

  const handleBookSelect = useCallback((newBook: string, chapter: number, verse?: number) => {
    setShowBookModal(false);
    goToChapter(newBook, chapter, verse);
  }, [goToChapter]);

  // ── read-check ────────────────────────────────────────────────────────────
  const handleReadCheck = useCallback(async () => {
    if (!isChapterRead) {
      await toggleChapter(bookCode, chapterNum);
    }
    if (chapterNum < totalChapters) {
      goToChapter(bookCode, chapterNum + 1);
    }
  }, [bookCode, chapterNum, goToChapter, isChapterRead, toggleChapter, totalChapters]);

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
          listFooter={
            <View style={styles.endLine}>
              <TouchableOpacity
                onPress={handleReadCheck}
                activeOpacity={0.85}
                style={[
                  styles.readCheckBtn,
                  isChapterRead && styles.readCheckBtnActive,
                ]}
              >
                <Text style={[styles.readCheckText, isChapterRead && styles.readCheckTextActive]}>
                  {isChapterRead ? '이미 읽은 장이에요' : '읽음 표시하고 다음장으로'}
                </Text>
                <CheckCircleIcon width={16} height={16} />
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Floating prev/next arrows */}
      <ChapterNav
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={chapterNum > 1}
        hasNext={chapterNum < totalChapters}
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
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  readCheckBtn: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(101,97,255,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  readCheckBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: 'transparent',
  },
  readCheckText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 26,
    color: colors.primary,
  },
  readCheckTextActive: {
    color: colors.primary,
  },
});
