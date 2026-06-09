/**
 * plan.tsx — 성경 통독표 메인 탭 스크린
 * [2026-03-20] 디자인 시스템 토큰 리팩토링: 하드코딩 색상/폰트 → tokens.ts 참조로 전환
 */

import ChapterSelectModal from '@/components/BiblePlan/ChapterSelectModal';
import BookCard from '@/components/BiblePlan/BookCard';
import { BIBLE_BOOKS, BibleBook } from '@/constants/BibleMeta';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import { useBiblePlan } from '@/hooks/useBiblePlan';
import { useBibleHistory } from '@/hooks/useBibleHistory';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

const BOTTOM_TABS = ['말씀강해', '성경통독', '성경읽기'];
const POSITION_KEY = 'LOEN_BIBLE_POSITION_v1';
type LastPosition = { bookCode: string; chapterNum: number };
const FALLBACK: LastPosition = { bookCode: 'GEN', chapterNum: 1 };

export default function PlanScreen() {
  const { isLoading, stats, planData, getReadChaptersForBook, saveSelectedChapters } = useBiblePlan();
  const { history, checkChapters, uncheckChapters } = useBibleHistory();
  const [activeTestament, setActiveTestament] = useState<Testament>('old');
  const [activeBottomTab, setActiveBottomTab] = useState('성경통독');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);

  const bookList = BIBLE_BOOKS.filter(b => b.testament === activeTestament);

  // 목표 설정 플로우 완료 시 selectedBookCode가 저장됨 → 미설정 판별
  const isGoalSet = planData.selectedBookCode !== null;

  // 서버 통계로 로컬 stats를 덮어씀 (서버 데이터 없으면 로컬 fallback)
  const mergedStats = {
    ...stats,
    todayRead: history?.todayReadCount ?? stats.todayRead,
    totalRead: history?.accruedReadCount ?? stats.totalRead,
  };

  const handleBookPress = (book: BibleBook) => setSelectedBook(book);
  const handleModalConfirm = async (selectedChapters: number[]) => {
    if (!selectedBook) return;

    const currentChapters = history?.readCheckList?.[selectedBook.code] ?? getReadChaptersForBook(selectedBook.code);
    const toCheck = selectedChapters.filter(ch => !currentChapters.includes(ch));
    const toUncheck = currentChapters.filter(ch => !selectedChapters.includes(ch));

    await saveSelectedChapters(selectedBook.code, selectedChapters);
    if (toCheck.length > 0) await checkChapters(selectedBook.code, toCheck);
    if (toUncheck.length > 0) await uncheckChapters(selectedBook.code, toUncheck);

    setSelectedBook(null);
  };
  const handleModalClose = () => setSelectedBook(null);

  const handleBottomTabPress = async (tab: string) => {
    if (tab === '성경읽기') {
      try {
        const raw = await AsyncStorage.getItem(POSITION_KEY);
        const pos = raw ? JSON.parse(raw) as LastPosition : FALLBACK;
        router.push({
          pathname: '/bible/read',
          params: { book: pos.bookCode, chapter: String(pos.chapterNum) },
        });
      } catch {
        router.push({ pathname: '/bible/read', params: { book: 'GEN', chapter: '1' } });
      }
      return;
    }
    setActiveBottomTab(tab);
  };

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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.dim} />
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
              {isGoalSet ? (
                <Text style={styles.statsValue}>
                  {mergedStats.weekRead} / {mergedStats.weeklyGoal}장
                </Text>
              ) : (
                // 미설정: + 버튼 → 이번주 목표 설정 플로우
                <TouchableOpacity
                  style={styles.addGoalBtn}
                  activeOpacity={0.7}
                  onPress={() => router.push('/plan/goal')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="add" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>오늘</Text>
              <Text style={styles.statsValue}>{mergedStats.todayRead}장</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>전체</Text>
              <Text style={styles.statsValue}>
                {mergedStats.totalRead} / {mergedStats.totalChapters}장
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

        {/* ── 책 목록 ── (Figma: 흰 배경 위에 회색 제목 밴드를 가진 책 섹션을 풀폭으로 쌓음) */}
        <View style={styles.bookList}>
          {bookList.map(book => (
            <BookCard
              key={book.code}
              book={book}
              readChapters={getReadChaptersForBook(book.code)}
              onPress={() => handleBookPress(book)}
            />
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
              onPress={() => handleBottomTabPress(tab)}
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
    backgroundColor: colors.background.elevated, // Figma: 페이지 배경 흰색
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
    height: 48,
    backgroundColor: colors.background.elevated, // Figma: 네비 흰색
  },
  headerBack: {
    width: 32,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.heading,   // 18px — Figma 네비 제목
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },

  // ── 스크롤
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 }, // 플로팅 바 고정 높이 확보

  // ── 통계 카드 (Figma: container 361x76, r16, bg #F2F4F7, 그림자 없음)
  statsCard: {
    backgroundColor: colors.background.base,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,      // 16px — Figma 상단 여백
    borderRadius: radius.lg,
    paddingVertical: spacing.md, // 16px
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
  // Figma: 라벨 12/600 rgba(13,28,45,0.5)
  statsLabel: {
    fontSize: fontSize.sm,      // 12px
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  // Figma: 수치 16/700 rgba(13,28,45,0.8) — 단일 텍스트
  statsValue: {
    fontSize: fontSize.base,    // 16px
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  // 미설정 시 + 버튼 — 수치 텍스트(높이 26)와 정렬되는 원형 버튼
  addGoalBtn: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: fontSize.md,      // 14px — Figma 탭 레이블
    fontWeight: fontWeight.semibold, // 비활성 600
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

  // ── 책 목록 (Figma: 풀폭, 책마다 회색 제목 밴드 — 흰 카드 래퍼/구분선 없음)
  // 탭과 첫 책 사이 공백 없음
  bookList: {},

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
