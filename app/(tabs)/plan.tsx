/**
 * plan.tsx — 성경 통독표 메인 탭 스크린
 * [2026-03-20] 디자인 시스템 토큰 리팩토링: 하드코딩 색상/폰트 → tokens.ts 참조로 전환
 */

import ChapterSelectModal from '@/components/BiblePlan/ChapterSelectModal';
import BookCard from '@/components/BiblePlan/BookCard';
import { BIBLE_BOOKS, BibleBook } from '@/constants/BibleMeta';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import { useBiblePlan } from '@/hooks/useBiblePlan';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Testament = 'old' | 'new';

const BOTTOM_TABS = ['말씀강해', '성경통독', '챌린지', '성경읽기'];

export default function PlanScreen() {
  const { isLoading, stats, getReadChaptersForBook, saveSelectedChapters } = useBiblePlan();
  const [activeTestament, setActiveTestament] = useState<Testament>('old');
  const [activeBottomTab, setActiveBottomTab] = useState('성경통독');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);

  const bookList = BIBLE_BOOKS.filter(b => b.testament === activeTestament);

  const handleBookPress = (book: BibleBook) => setSelectedBook(book);
  const handleModalConfirm = async (selectedChapters: number[]) => {
    if (!selectedBook) return;
    await saveSelectedChapters(selectedBook.code, selectedChapters);
    setSelectedBook(null);
  };
  const handleModalClose = () => setSelectedBook(null);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centerLoader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── 상단 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          activeOpacity={0.7}
          onPress={() => { if (router.canGoBack()) router.back(); }}
        >
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>성경 통독표</Text>
        <View style={styles.headerBack} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 진척도 카드 ── */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>이번주 목표</Text>
              <Text style={styles.statsValue}>
                <Text style={styles.statsNum}>{stats.weekRead}</Text>
                <Text style={styles.statsSuffix}> / {stats.weeklyGoal}장</Text>
              </Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>오늘</Text>
              <Text style={styles.statsValue}>
                <Text style={styles.statsNum}>{stats.todayRead}</Text>
                <Text style={styles.statsSuffix}>장</Text>
              </Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>전체</Text>
              <Text style={styles.statsValue}>
                <Text style={styles.statsNum}>{stats.totalRead}</Text>
                <Text style={styles.statsSuffix}> / {stats.totalChapters}장</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── 언더라인 탭 ── */}
        <View style={styles.tabRow}>
          {(['old', 'new'] as Testament[]).map(t => {
            const label = t === 'old' ? '구약성경' : '신약성경';
            const isActive = activeTestament === t;
            return (
              <TouchableOpacity
                key={t}
                style={styles.tabBtn}
                activeOpacity={0.8}
                onPress={() => setActiveTestament(t)}
              >
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {label}
                </Text>
                {isActive && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 책 목록 ── */}
        <View style={styles.bookList}>
          {bookList.map((book, idx) => (
            <View key={book.code}>
              {idx > 0 && <View style={styles.separator} />}
              <BookCard
                book={book}
                readChapters={getReadChaptersForBook(book.code)}
                onPress={() => handleBookPress(book)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── 하단 플로팅 세그먼트 바 ── */}
      <View style={styles.floatingBar}>
        {BOTTOM_TABS.map(tab => {
          const isActive = activeBottomTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.floatingTabBtn, isActive && styles.floatingTabBtnActive]}
              activeOpacity={0.8}
              onPress={() => setActiveBottomTab(tab)}
            >
              <Text style={[styles.floatingTabText, isActive && styles.floatingTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── 장 선택 모달 ── */}
      <ChapterSelectModal
        visible={!!selectedBook}
        book={selectedBook}
        readChapters={selectedBook ? getReadChaptersForBook(selectedBook.code) : []}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,        // 일회성 세부조정값 — 미세 간격
    backgroundColor: colors.background.base,
  },
  headerBack: {
    width: 32,                  // 일회성: 터치 영역 고정 너비
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackText: {
    fontSize: fontSize.lg,      // 20px — 뒤로가기 화살표
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },

  // ── 스크롤
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 }, // 플로팅 바 고정 높이 확보

  // ── 통계 카드
  statsCard: {
    backgroundColor: colors.background.elevated,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,      // 8px — spacing.sm
    borderRadius: radius.lg,
    paddingVertical: 14,        // 일회성: 토큰 사이 중간값
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,                     // 일회성: 라벨↔숫자 미세 간격
  },
  statsLabel: {
    fontSize: fontSize.xs,      // 11px — fontSize.xs
    fontWeight: fontWeight.regular,
    color: colors.text.secondary,
  },
  statsValue: {
    // inline Text 조합용 컨테이너
  },
  statsNum: {
    fontSize: fontSize.display,    // 17px — fontSize.display
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  statsSuffix: {
    fontSize: fontSize.md,      // 14px — fontSize.md
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  statsDivider: {
    width: 1,
    height: 36,                 // 일회성: 구분선 시각적 높이
    backgroundColor: colors.border,
    alignSelf: 'center',
  },

  // ── 언더라인 탭
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,      // 16px — spacing.md
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,        // 일회성: 탭 터치 영역 높이
    position: 'relative',
  },
  tabBtnText: {
    fontSize: fontSize.sm,      // 12px — fontSize.sm
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,                  // 일회성: 언더라인 두께 고정값
    backgroundColor: colors.primary,
    borderRadius: 1,
  },

  // ── 책 목록
  bookList: {
    marginTop: spacing.sm,      // 8px — spacing.sm
    backgroundColor: colors.background.elevated,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  // ── 하단 플로팅 세그먼트 바
  floatingBar: {
    position: 'absolute',
    bottom: spacing.sm,         // 8px — spacing.sm
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,  // 4px — spacing.xs
    paddingHorizontal: spacing.xs,
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    gap: 2,                     // 일회성: 탭 사이 미세 간격
  },
  floatingTabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,  // 8px — spacing.sm
    alignItems: 'center',
    borderRadius: radius.full,
  },
  floatingTabBtnActive: {
    backgroundColor: colors.primary,   // 활성 세그먼트 — colors.primary 직접 참조
  },
  floatingTabText: {
    fontSize: fontSize.sm,      // 12px — fontSize.sm
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,      // 비활성 세그먼트 텍스트
  },
  floatingTabTextActive: {
    color: colors.white,        // colors.white (신규 토큰)
    fontWeight: fontWeight.bold,
  },
});
