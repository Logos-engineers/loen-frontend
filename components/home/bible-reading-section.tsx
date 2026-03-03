import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 더미 데이터 — API 연동 시 props로 교체
const BIBLE_DATA = {
  book: '창세기',
  chapter: 13,
  totalChapters: 50,
  date: '2025년 6월 16일',
};

export function BibleReadingSection() {
  const progressRatio = BIBLE_DATA.chapter / BIBLE_DATA.totalChapters;

  return (
    <View>
      <SectionHeader title="성경 읽기" />
      <Card style={styles.card}>
        {/* 상단 행: 북마크 + 제목/날짜 + 이어읽기 버튼 */}
        <View style={styles.topRow}>
          <View style={styles.bookmarkBox}>
            <Ionicons name="bookmark" size={20} color={colors.primary} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.chapterTitle}>
              {BIBLE_DATA.book} {BIBLE_DATA.chapter}장
            </Text>
            <Text style={styles.date}>{BIBLE_DATA.date}</Text>
          </View>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => Alert.alert('이어읽기')}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>이어읽기</Text>
          </TouchableOpacity>
        </View>

        {/* 프로그레스 바 */}
        <View style={styles.progressSection}>
          {/* 뱃지 위치 계산 */}
          <View style={[styles.badgeWrapper, { left: `${progressRatio * 100}%` as any }]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{BIBLE_DATA.chapter}장</Text>
            </View>
            <View style={styles.badgeTail} />
          </View>

          {/* 바 본체 */}
          <View style={styles.trackBg}>
            <View style={[styles.trackFill, { flex: progressRatio }]} />
            <View style={{ flex: 1 - progressRatio }} />
          </View>

          {/* 1장 / 50장 레이블 */}
          <View style={styles.labelRow}>
            <Text style={styles.labelText}>1장</Text>
            <Text style={styles.labelText}>{BIBLE_DATA.totalChapters}장</Text>
          </View>
        </View>

        {/* 전체 통독표 보기 링크 */}
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Alert.alert('전체 통독표 보기')}
        >
          <Text style={styles.linkText}>전체 통독표 보기</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bookmarkBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  chapterTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  continueBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  continueBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },

  // 프로그레스 바
  progressSection: {
    gap: spacing.xs,
  },
  badgeWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 2,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    transform: [{ translateX: -16 }],
  },
  badgeText: {
    color: '#FFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  badgeTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    alignSelf: 'center',
    transform: [{ translateX: -16 }],
  },
  trackBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  trackFill: {
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  labelText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },

  // 링크
  linkRow: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  linkText: {
    fontSize: fontSize.sm,
    color: colors.text.accent,
    fontWeight: fontWeight.medium,
  },
});
