import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { colors, fontWeight } from '@/constants/tokens';
import { BIBLE_BOOKS } from '@/constants/BibleMeta';
import { getBibleBook } from '@/constants/bibleLoader';

const ARROW_BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;

function parseScriptureVerses(reference: string): { number: number; text: string }[] {
  const match = reference.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) return [];
  const [, korName, chapterStr, startVerseStr, endVerseStr] = match;
  const chapter = parseInt(chapterStr, 10);
  const startVerse = parseInt(startVerseStr, 10);
  const endVerse = endVerseStr ? parseInt(endVerseStr, 10) : startVerse;
  const book = BIBLE_BOOKS.find(b => b.korName === korName);
  if (!book) return [];
  const bibleDoc = getBibleBook(book.code);
  if (!bibleDoc) return [];
  const chapterData = bibleDoc.chapters.find(c => c.chapter === chapter);
  if (!chapterData) return [];
  return chapterData.verses
    .filter(v => v.verse >= startVerse && v.verse <= endVerse)
    .map(v => ({ number: v.verse, text: v.text }));
}

export default function ObsScriptureScreen() {
  const params = useLocalSearchParams<{ contentId?: string; reviewId?: string; title?: string; verse?: string; preview?: string }>();
  const reference = params.verse || '성경말씀 데이터가 없습니다';
  const scriptureVerses = parseScriptureVerses(reference);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
            <SvgXml xml={ARROW_BACK_SVG} width={24} height={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.referenceWrapper}>
            <View style={styles.referenceCard}>
              <View style={styles.bookIcon}>
                <Ionicons name="book" size={18} color={colors.white} />
              </View>
              <View style={styles.referenceTextWrapper}>
                <Text style={styles.referenceLabel}>성경말씀</Text>
                <Text style={styles.referenceText}>{reference}</Text>
              </View>
            </View>
          </View>

          <View style={styles.bodyWrapper}>
            <View style={styles.bodyCard}>
              {scriptureVerses.length > 0 ? scriptureVerses.map(verse => (
                <View key={verse.number} style={styles.verseRow}>
                  <View style={styles.verseNumberWrapper}>
                    <View style={styles.verseNumberBox}>
                      <Text style={styles.verseNumber}>{verse.number}</Text>
                    </View>
                  </View>
                  <View style={styles.verseTextWrapper}>
                    <Text style={styles.verseText}>{verse.text}</Text>
                  </View>
                </View>
              )) : (
                <Text style={styles.emptyText}>본문 데이터 API가 필요합니다</Text>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomCta}>
          <View style={styles.bottomBlur} />
          <TouchableOpacity
            style={styles.nextButton}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/obs/content/summary', params: { contentId: params.contentId, reviewId: params.reviewId, title: params.title, verse: params.verse, ...(params.preview === 'true' ? { preview: 'true' } : {}) } })}
          >
            <Text style={styles.nextButtonText}>다음으로</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  navBar: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 112,
  },
  referenceWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  referenceCard: {
    minHeight: 80,
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  bookIcon: {
    width: 32,
    height: 32,
    borderRadius: 9.6,
    backgroundColor: '#1687F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  referenceTextWrapper: {
    flex: 1,
    gap: 4,
  },
  referenceLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: fontWeight.medium,
  },
  referenceText: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.bold,
    textAlign: 'left',
  },
  bodyWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bodyCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  verseNumberWrapper: {
    paddingLeft: 16,
    paddingVertical: 12,
  },
  verseNumberBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseNumber: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.semibold,
  },
  verseTextWrapper: {
    flex: 1,
    paddingRight: 16,
    paddingVertical: 12,
  },
  verseText: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.medium,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 26,
    padding: 16,
    textAlign: 'center',
  },
  bottomCta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: colors.background.base,
  },
  bottomBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -20,
    height: 20,
    backgroundColor: 'rgba(242,244,247,0.88)',
  },
  nextButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: fontWeight.semibold,
  },
});
