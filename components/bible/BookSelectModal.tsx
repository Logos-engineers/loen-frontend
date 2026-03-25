import ChevronLeftIcon from '@/assets/icons/back.svg';
import SearchIcon from '@/assets/icons/search.svg';
import WhiteXMarkIcon from '@/assets/icons/whiteX mark.svg';
import { BIBLE_BOOKS, BibleBook } from '@/constants/BibleMeta';
import { getBibleBook } from '@/constants/bibleLoader';
import { colors, fontSize, radius, spacing } from '@/constants/tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const POSITION_KEY = 'LOEN_BIBLE_POSITION_v1';
const SECTION_ORDER = [
  { title: '모세오경', codes: ['GEN', 'EXO', 'LEV', 'NUM', 'DEU'] },
  { title: '역사서', codes: ['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'] },
  { title: '시가서', codes: ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'] },
  { title: '선지서', codes: ['ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'] },
  { title: '복음서', codes: ['MAT', 'MRK', 'LUK', 'JHN'] },
  { title: '역사서', codes: ['ACT'] },
  { title: '바울서신', codes: ['ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM'] },
  { title: '공동서신', codes: ['HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD'] },
  { title: '예언서', codes: ['REV'] },
] as const;

type BookSelectModalProps = {
  visible: boolean;
  currentBookCode: string;
  currentChapter: number;
  onSelect: (bookCode: string, chapter: number, verse?: number) => void;
  onClose: () => void;
};

type LastPosition = {
  bookCode: string;
  chapterNum: number;
};

function matchesBook(book: BibleBook, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return true;
  const normalized = trimmed.toLowerCase();
  const extractChosung = (text: string) =>
    Array.from(text)
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code < 0xac00 || code > 0xd7a3) return '';
        const idx = Math.floor((code - 0xac00) / 21 / 28);
        return ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'][idx] ?? '';
      })
      .join('');

  return (
    book.korName.includes(trimmed) ||
    extractChosung(book.korName).includes(trimmed) ||
    book.engName.toLowerCase().includes(normalized) ||
    book.code.toLowerCase().includes(normalized)
  );
}

export function BookSelectModal({
  visible,
  currentBookCode,
  currentChapter,
  onSelect,
  onClose,
}: BookSelectModalProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookCode, setSelectedBookCode] = useState(currentBookCode);
  const [selectedChapter, setSelectedChapter] = useState(currentChapter);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setSearchQuery('');
    setSelectedBookCode(currentBookCode);
    setSelectedChapter(currentChapter);
    setSelectedVerse(null);
  }, [visible, currentBookCode, currentChapter]);

  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter((book) => matchesBook(book, searchQuery));
  }, [searchQuery]);

  const groupedBooks = useMemo(() => {
    return SECTION_ORDER.map((section) => ({
      key: `${section.title}-${section.codes.join('-')}`,
      title: section.title,
      books: section.codes
        .map((code) => filteredBooks.find((book) => book.code === code))
        .filter(Boolean) as BibleBook[],
    })).filter((section) => section.books.length > 0);
  }, [filteredBooks]);

  const selectedBook = useMemo(() => {
    return BIBLE_BOOKS.find((book) => book.code === selectedBookCode) ?? filteredBooks[0] ?? null;
  }, [filteredBooks, selectedBookCode]);

  const selectedBookDoc = useMemo(() => {
    return selectedBook ? getBibleBook(selectedBook.code) : null;
  }, [selectedBook]);

  const selectedChapterData = useMemo(() => {
    return selectedBookDoc?.chapters.find((chapter) => chapter.chapter === selectedChapter) ?? null;
  }, [selectedBookDoc, selectedChapter]);

  const chapters = useMemo(() => {
    return selectedBookDoc?.chapters ?? [];
  }, [selectedBookDoc]);

  const verses = useMemo(() => {
    return selectedChapterData?.verses ?? [];
  }, [selectedChapterData]);

  useEffect(() => {
    if (!selectedBook) return;
    if (selectedBook.code !== selectedBookCode) {
      setSelectedBookCode(selectedBook.code);
    }
  }, [selectedBook, selectedBookCode]);

  useEffect(() => {
    if (!selectedBookDoc) return;
    const maxChapter = selectedBookDoc.totalChapters;
    if (selectedChapter > maxChapter || selectedChapter < 1) {
      setSelectedChapter(1);
    }
  }, [selectedBookDoc, selectedChapter]);

  useEffect(() => {
    if (!verses.length) {
      setSelectedVerse(null);
      return;
    }
    if (!selectedVerse || !verses.some((verse) => verse.verse === selectedVerse)) {
      setSelectedVerse(verses[0]?.verse ?? null);
    }
  }, [selectedVerse, verses]);

  const handleBookPress = (bookCode: string) => {
    setSelectedBookCode(bookCode);
    const nextBook = getBibleBook(bookCode);
    const nextChapter = bookCode === currentBookCode ? currentChapter : 1;
    const safeChapter = Math.min(nextChapter, nextBook?.totalChapters ?? 1);
    setSelectedChapter(safeChapter);
    const firstVerse = nextBook?.chapters.find((chapter) => chapter.chapter === safeChapter)?.verses[0]?.verse ?? 1;
    setSelectedVerse(firstVerse);
  };

  const handleChapterPress = (chapter: number) => {
    setSelectedChapter(chapter);
    const firstVerse = selectedBookDoc?.chapters.find((item) => item.chapter === chapter)?.verses[0]?.verse ?? 1;
    setSelectedVerse(firstVerse);
  };

  const handleVersePress = (verse: number) => {
    if (!selectedBook) return;
    setSelectedVerse(verse);
    onSelect(selectedBook.code, selectedChapter, verse);
  };

  const handleContinueReading = async () => {
    try {
      const raw = await AsyncStorage.getItem(POSITION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastPosition;
      onSelect(parsed.bookCode, parsed.chapterNum);
    } catch {
      // Ignore storage parse failures and leave modal open.
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton} hitSlop={8}>
            <ChevronLeftIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>성경 선택</Text>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.controls}>
          <View style={styles.searchField}>
            <SearchIcon width={20} height={20} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="검색어를 입력해주세요"
              placeholderTextColor={colors.text.secondary}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={8}
                style={styles.clearButton}
              >
                <WhiteXMarkIcon width={8} height={8} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.columns}>
          <View style={[styles.column, styles.bookColumn]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
              {groupedBooks.map((section) => (
                <View key={section.key}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{section.title}</Text>
                  </View>
                  {section.books.map((book) => {
                    const isSelected = book.code === selectedBook?.code;
                    return (
                      <TouchableOpacity
                        key={book.code}
                        activeOpacity={0.85}
                        onPress={() => handleBookPress(book.code)}
                        style={[styles.rowButton, styles.bookRow, isSelected && styles.rowButtonSelected]}
                      >
                        <View>
                          <Text style={[styles.bookNameText, isSelected && styles.rowTextSelected]}>
                            {book.korName}
                          </Text>
                          <Text style={[styles.bookEnglishText, isSelected && styles.bookEnglishTextSelected]}>
                            {book.engName}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.column, styles.chapterColumn]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
              {chapters.map((chapter) => {
                const isSelected = chapter.chapter === selectedChapter;
                return (
                  <TouchableOpacity
                    key={chapter.chapter}
                    activeOpacity={0.85}
                    onPress={() => handleChapterPress(chapter.chapter)}
                    style={[styles.rowButton, isSelected && styles.rowButtonSelected]}
                  >
                    <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>
                      {chapter.chapter}장
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={[styles.column, styles.verseColumn]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
              {verses.map((verse) => {
                const isSelected = verse.verse === selectedVerse;
                return (
                  <TouchableOpacity
                    key={verse.verse}
                    activeOpacity={0.85}
                    onPress={() => handleVersePress(verse.verse)}
                    style={[styles.rowButton, isSelected && styles.rowButtonSelected]}
                  >
                    <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>
                      {verse.verse}절
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View style={styles.fixedBottomWrap} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleContinueReading}
            style={[styles.continueButton, { marginBottom: Math.max(insets.bottom, 16) }]}
          >
            <Text style={styles.continueButtonText}>최근 읽은 성경 이어읽기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSide: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 25,
    color: colors.text.primary,
  },
  controls: {
    paddingHorizontal: spacing.md,
    paddingTop: 2,
    paddingBottom: 12,
  },
  searchField: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.background.base,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: fontSize.base,
    lineHeight: 24,
    color: colors.text.primary,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  column: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  bookColumn: {
    width: '40%',
  },
  chapterColumn: {
    width: '28%',
  },
  verseColumn: {
    width: '32%',
    borderRightWidth: 0,
  },
  columnContent: {
    paddingBottom: 96,
  },
  rowButton: {
    minHeight: 64,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  bookRow: {
    paddingRight: 12,
  },
  sectionHeader: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.background.base,
  },
  sectionHeaderText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontSize.md,
    lineHeight: 21,
    color: colors.text.secondary,
  },
  rowButtonSelected: {
    backgroundColor: colors.text.primary,
  },
  rowText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontSize.lg,
    lineHeight: 28,
    color: colors.text.secondary,
  },
  rowTextSelected: {
    color: colors.white,
  },
  bookNameText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: colors.text.primary,
  },
  bookEnglishText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontSize.md,
    lineHeight: 21,
    color: colors.text.secondary,
  },
  bookEnglishTextSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  fixedBottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  continueButton: {
    minHeight: 42,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(101,97,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: fontSize.base,
    lineHeight: 26,
    color: colors.primary,
  },
});
