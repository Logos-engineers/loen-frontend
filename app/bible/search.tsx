import ChevronLeftIcon from '@/assets/icons/back.svg';
import SearchIcon from '@/assets/icons/search.svg';
import { Ionicons } from '@expo/vector-icons';
import { SearchResult, SearchResultItem } from '@/components/bible/SearchResultItem';
import { BIBLE_BOOKS } from '@/constants/BibleMeta';
import { getAllBooks } from '@/constants/bibleLoader';
import { colors, radius, spacing, fontSize } from '@/constants/tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HISTORY_KEY = 'LOEN_BIBLE_SEARCH_HISTORY';
const MAX_HISTORY = 10;

type SearchHistoryItem = { query: string; timestamp: number };
type SearchResultGroup = { bookCode: string; bookName: string; items: SearchResult[] };

const CHOSUNG_LIST = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'];
const HANGUL_START = 0xAC00;

function getChosung(char: string): string {
  const code = char.charCodeAt(0);
  if (code < HANGUL_START || code > 0xd7a3) return '';
  const idx = Math.floor((code - HANGUL_START) / 21 / 28);
  return CHOSUNG_LIST[idx] ?? '';
}

function extractChosung(text: string): string {
  return Array.from(text).map(getChosung).join('');
}

function isChosungQuery(query: string): boolean {
  return Array.from(query).every((char) => CHOSUNG_LIST.includes(char));
}

function searchBible(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const normalized = query.toLowerCase();
  const isCho = isChosungQuery(query);

  for (const bookDoc of getAllBooks()) {
    const bookMeta = BIBLE_BOOKS.find((book) => book.code === bookDoc.code);
    const bookName = bookMeta?.korName ?? bookDoc.code;

    for (const chapter of bookDoc.chapters) {
      for (const verse of chapter.verses) {
        const matches = isCho
          ? extractChosung(verse.text).includes(query)
          : verse.text.toLowerCase().includes(normalized);

        if (!matches) continue;

        results.push({
          bookCode: bookDoc.code,
          bookName,
          chapterNum: chapter.chapter,
          verseNum: verse.verse,
          text: verse.text,
          query,
        });

        if (results.length >= 200) return results;
      }
    }
  }

  return results;
}

function groupResults(results: SearchResult[]) {
  const grouped = new Map<string, SearchResultGroup>();
  for (const result of results) {
    const existing = grouped.get(result.bookCode);
    if (existing) {
      existing.items.push(result);
      continue;
    }
    grouped.set(result.bookCode, {
      bookCode: result.bookCode,
      bookName: result.bookName,
      items: [result],
    });
  }
  return Array.from(grouped.values());
}

export default function BibleSearchScreen() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      if (raw) setHistory(JSON.parse(raw) as SearchHistoryItem[]);
    });
    
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => {
      clearTimeout(timer);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const groupedResults = useMemo(() => groupResults(results), [results]);

  const saveHistory = useCallback(async (nextQuery: string) => {
    const updated = [
      { query: nextQuery, timestamp: Date.now() },
      ...history.filter((item) => item.query !== nextQuery),
    ].slice(0, MAX_HISTORY);
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }, [history]);

  // 입력만으로는 검색하지 않음 — 비웠을 때 결과만 정리
  const handleSearch = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    if (nextQuery.trim().length < 1) {
      setResults([]);
    }
  }, []);

  // 검색 CTA(또는 키보드 검색키) — 이때 실제 검색 실행 + 키보드 내림(→ CTA 사라짐)
  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) return;
    setResults(searchBible(trimmed));
    saveHistory(trimmed);
    inputRef.current?.blur();
  }, [query, saveHistory]);

  const handleResultPress = useCallback((result: SearchResult) => {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      saveHistory(trimmed);
    }
    router.push({
      pathname: '/bible/read',
      params: {
        book: result.bookCode,
        chapter: String(result.chapterNum),
        verse: String(result.verseNum),
      },
    });
  }, [query, saveHistory]);

  const handleHistoryPress = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    setResults(searchBible(nextQuery.trim()));
    saveHistory(nextQuery.trim());
    inputRef.current?.blur();
  }, [saveHistory]);

  const removeHistory = useCallback(async (nextQuery: string) => {
    const updated = history.filter((item) => item.query !== nextQuery);
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }, [history]);

  const resetSearch = () => {
    setQuery('');
    setResults([]);
    // X 버튼 누르면 검색어를 초기화하고, 키보드가 내려가지 않도록 focus 유지
    inputRef.current?.focus();
  };

  const renderHistory = () => (
    <View style={styles.historyWrap}>
      <View style={styles.chipRow}>
        {history.map((item) => (
          <View key={item.query} style={styles.chip}>
            <TouchableOpacity onPress={() => handleHistoryPress(item.query)} activeOpacity={0.85}>
              <Text style={styles.chipText}>{item.query}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => removeHistory(item.query)}
              hitSlop={8}
              style={styles.chipCloseButton}
            >
              <Ionicons name="close" size={14} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topArea}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
            <ChevronLeftIcon width={24} height={24} />
          </TouchableOpacity>

          <View style={styles.searchField}>
            <SearchIcon width={20} height={20} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={query}
              onChangeText={handleSearch}
              onSubmitEditing={handleSubmit}
              placeholder="검색어를 입력해주세요"
              placeholderTextColor={colors.text.secondary}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={resetSearch} hitSlop={8} style={styles.clearButton}>
                <Ionicons name="close" size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {renderHistory()}
        </View>

      <FlatList
        data={groupedResults}
        keyExtractor={(item) => item.bookCode}
        renderItem={({ item }) => (
          <View style={styles.groupCards}>
            {item.items.map((result, index) => (
              <SearchResultItem
                key={`${result.bookCode}-${result.chapterNum}-${result.verseNum}-${index}`}
                result={result}
                onPress={handleResultPress}
                showBookName={true}
              />
            ))}
          </View>
        )}
        contentContainerStyle={styles.resultList}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          query.trim().length > 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
            </View>
          ) : (
            <View style={styles.emptySpacer} />
          )
        }
      />

      {query.trim().length > 0 && isKeyboardVisible ? (
        <View style={styles.bottomCtaWrap}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.searchButtonText}>검색</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topArea: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  backButton: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 6,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  clearButton: {
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyWrap: {
    paddingTop: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    paddingLeft: 12,
    paddingRight: spacing.xs,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },
  chipCloseButton: {
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  groupCards: {
    gap: 0,
  },
  emptyWrap: {
    paddingTop: 72,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  emptySpacer: {
    height: spacing.lg,
  },
  bottomCtaWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: fontSize.base,
    color: colors.white,
  },
});
