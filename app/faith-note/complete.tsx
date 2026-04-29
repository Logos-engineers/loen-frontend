import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

// Bigbook SVG (foreignObject 제거, RN svg transformer 호환 버전)
const BOOK_SVG = `<svg width="160" height="133" viewBox="0 0 160 133" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M79.9922 124.02C86.8868 117.126 96.2388 113.249 105.991 113.249H151.263C156.081 113.249 159.99 109.34 159.99 104.522V8.72736C159.99 3.90894 156.081 0 151.263 0H105.991C96.2388 0 86.8868 3.87219 79.9922 10.7714" fill="white" fill-opacity="0.23"/>
<path d="M80.0062 124.02C73.1116 117.126 63.7595 113.249 54.0079 113.249H8.73126C3.91284 113.249 0.00390625 109.34 0.00390625 104.522V8.72736C0.00390625 3.90894 3.91284 0 8.73126 0H54.0033C63.755 0 73.107 3.87219 80.0016 10.7714" fill="white"/>
<path d="M80.0033 124.002L80.6455 123.38C87.4714 116.884 96.5434 113.246 105.99 113.246H151.263C156.081 113.246 159.99 109.337 159.99 104.519L160 113.252C160 118.07 156.091 121.979 151.272 121.979H114.728C106.06 121.98 97.7046 125.039 91.1133 130.564C89.5194 131.901 87.5719 132.751 85.4912 132.751H74.5088C72.4281 132.751 70.4806 131.901 68.8867 130.564C62.2954 125.043 53.9399 121.98 45.2725 121.979H8.72754C3.90912 121.979 0 118.07 0 113.252V104.519C0 109.337 3.90912 113.246 8.72754 113.246H54.0039C63.4508 113.246 73.1773 117.507 80.0033 124.002Z" fill="#6561FF"/>
</svg>`;

// 현재 날짜 포맷: "YYYY년 M월 D일"
function getKoreanDate(): string {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CompleteScreen() {
  const router = useRouter();
  const { noteType } = useLocalSearchParams<{ noteType?: string }>();
  const noteLabel = noteType === 'PRAYER' ? '기도노트' : noteType === 'WORD' ? '말씀노트' : '감사노트';
  const today = getKoreanDate();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* 상단 여백 */}
      <View style={styles.spacer} />

      {/* ── 중앙: 날짜 + 일러스트 + 텍스트 */}
      <View style={styles.centerContent}>
        {/* Figma: 날짜 표시 */}
        <Text style={styles.date}>{today}</Text>

        {/* Figma: 책 일러스트 */}
        <View style={styles.bookWrapper}>
          <SvgXml xml={BOOK_SVG} width={140} height={116} />
        </View>

        {/* Figma: 타이틀 */}
        <View style={styles.textGroup}>
          <Text style={styles.noteType}>신앙노트 작성 완료</Text>
          <Text style={styles.title}>{noteLabel} 작성 완료</Text>
        </View>
      </View>

      <View style={styles.spacer} />

      {/* ── 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>공유 게시글 보기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.elevated,
  },
  spacer: { flex: 1 },

  // ── 중앙 콘텐츠
  centerContent: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  date: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  textGroup: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  bookWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  noteType: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },

  // ── 하단 버튼
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  // Figma: primary bg, 52px height, radius:16, full width
  ctaButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
});
