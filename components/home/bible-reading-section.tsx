import BookmarkIcon from '@/assets/icons/bookmark.svg';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

const BIBLE_DATA = {
  book: '창세기',
  chapter: 13,
  totalChapters: 50,
  date: '2025년 6월 16일',
};

export function BibleReadingSection() {
  const progressRatio = BIBLE_DATA.chapter / BIBLE_DATA.totalChapters;
  const markerPercent = progressRatio * 100;

  return (
    <View>
      <SectionHeader title="성경 읽기" />

      <View style={styles.wrapper}>
        <Card style={styles.card}>
          {/* 상단 행 */}
          <View style={styles.topRow}>
            {/* Figma: bookmark.svg 32×32 (SVG transformer) */}
            <BookmarkIcon width={32} height={32} />

            <View style={styles.textCol}>
              <Text style={styles.chapterTitle}>
                {BIBLE_DATA.book} {BIBLE_DATA.chapter}장
              </Text>
              <Text style={styles.date}>{BIBLE_DATA.date}</Text>
            </View>

            {/* Figma: 이어읽기 py:10 px:16 */}
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => {/* TODO: 이어읽기 연결 */}}
              activeOpacity={0.8}
            >
              <Text style={styles.continueBtnText}>이어읽기</Text>
            </TouchableOpacity>
          </View>

          {/* ── 프로그레스 바 섹션 ── */}
          <View style={styles.progressSection}>
            {/* Marker 배지 */}
            <View style={[styles.markerContainer, { left: `${markerPercent}%` as any }]}>
              <View style={styles.markerBadge}>
                <Text style={styles.markerText}>{BIBLE_DATA.chapter}장</Text>
              </View>
              <View style={styles.markerTail} />
            </View>

            {/* 바 행: [1장] [████░░░░░░] [50장] — 피그마 인라인 레이아웃 */}
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>1장</Text>
              <View style={styles.trackBg}>
                <View style={[styles.trackFill, { flex: progressRatio }]} />
                <View style={{ flex: 1 - progressRatio }} />
              </View>
              <Text style={styles.barLabel}>{BIBLE_DATA.totalChapters}장</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 전체 통독표 보기 — 밑줄 없음 */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/(tabs)/plan')}
          >
            <Text style={styles.linkText}>전체 통독표 보기</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  card: {
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  chapterTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  date: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  continueBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  continueBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },

  // 프로그레스 영역
  progressSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  markerContainer: {
    position: 'absolute',
    top: spacing.sm,
    alignItems: 'center',
    transform: [{ translateX: -16 }],
    zIndex: 1,
  },
  markerBadge: {
    backgroundColor: 'rgba(101,97,255,0.8)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(101,97,255,0.8)',
  },

  // Figma: 바 양 옆에 1장/50장 인라인 배치
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 30,  // marker 공간
  },
  barLabel: {
    fontSize: fontSize.sm,           // 12px
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  trackBg: {
    flex: 1,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  trackFill: {
    backgroundColor: 'rgba(101,97,255,0.8)',
    borderRadius: 6,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  linkRow: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  // 밑줄 없음
  linkText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.accent,
    textDecorationLine: 'none',
  },
});
