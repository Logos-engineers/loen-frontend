import ChevronLeftIcon from '@/assets/icons/back.svg';
import SearchIcon from '@/assets/icons/search.svg';
import WhiteXMarkIcon from '@/assets/icons/whiteX mark.svg';
import { SearchResultItem, SearchResult } from '@/components/bible/SearchResultItem';
import { BIBLE_BOOKS } from '@/constants/BibleMeta';
import { getAllBooks } from '@/constants/bibleLoader';
import { colors, spacing } from '@/constants/tokens';
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
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      if (raw) setHistory(JSON.parse(raw) as SearchHistoryItem[]);
    });
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
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

  const handleSearch = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    if (nextQuery.trim().length < 1) {
      setResults([]);
      return;
    }
    setResults(searchBible(nextQuery.trim()));
  }, []);

  const handleSubmit = useCallback(() => {
    if (query.trim().length > 0) {
      saveHistory(query.trim());
    }
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
  }, []);

  const removeHistory = useCallback(async (nextQuery: string) => {
    const updated = history.filter((item) => item.query !== nextQuery);
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }, [history]);

  const resetSearch = () => {
    setQuery('');
    setResults([]);
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
              <WhiteXMarkIcon width={7} height={7} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
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
              <WhiteXMarkIcon width={8} height={8} />
            </TouchableOpacity>
          ) : null}
        </View>

        {renderHistory()}
      </View>

      <FlatList
        data={groupedResults}
        keyExtractor={(item) => item.bookCode}
        renderItem={({ item }) => (
          <View style={styles.groupSection}>
            <Text style={styles.groupTitle}>{item.bookName}</Text>
            <View style={styles.groupCards}>
              {item.items.map((result, index) => (
                <SearchResultItem
                  key={`${result.bookCode}-${result.chapterNum}-${result.verseNum}-${index}`}
                  result={result}
                  onPress={handleResultPress}
                  showBookName={false}
                />
              ))}
            </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topArea: {
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginLeft: -8,
  },
  searchField: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.background.base,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
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
  historyWrap: {
    paddingTop: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.background.base,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.primary,
  },
  chipCloseButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultList: {
    paddingHorizontal: spacing.md,
    paddingBottom: 32,
  },
  groupSection: {
    paddingTop: 16,
  },
  groupTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: colors.text.primary,
    marginBottom: 10,
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
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
  },
  emptySpacer: {
    height: 24,
  },
});
