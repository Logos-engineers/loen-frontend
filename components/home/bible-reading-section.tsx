import BookmarkIcon from '@/assets/icons/bookmark.svg';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { BIBLE_BOOKS } from '@/constants/BibleMeta';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useBiblePlan } from '@/hooks/useBiblePlan';

export function BibleReadingSection() {
  const { planData, getReadChaptersForBook } = useBiblePlan();

  // 순차 통독 포인터: 창세기 1장부터 책 순서대로 훑어 "처음 만나는 안 읽은 장"이
  // 곧 '현재 읽고 있는 장'이다. (순서대로 읽어야 전진 — 중간에 건너뛴 장은 공백으로 남아 거기서 멈춤)
  // 1189장 전부 읽었으면 첫 공백이 없으므로 마지막 책 마지막 장 + 완독 상태.
  const current = useMemo(() => {
    for (const book of BIBLE_BOOKS) {
      const readSet = new Set(getReadChaptersForBook(book.code));
      for (let ch = 1; ch <= book.chapterCount; ch++) {
        if (!readSet.has(ch)) {
          return {
            bookCode: book.code,
            bookName: book.korName,
            chapterNum: ch,
            totalChapters: book.chapterCount,
            done: false,
          };
        }
      }
    }
    const last = BIBLE_BOOKS[BIBLE_BOOKS.length - 1];
    return {
      bookCode: last.code,
      bookName: last.korName,
      chapterNum: last.chapterCount,
      totalChapters: last.chapterCount,
      done: true,
    };
    // planData가 바뀌면(읽음 토글) 재계산 — getReadChaptersForBook는 planData 기반
  }, [planData, getReadChaptersForBook]);

  const progressRatio = current.totalChapters > 0
    ? Math.min(current.chapterNum / current.totalChapters, 1)
    : 0;
  const markerPercent = progressRatio * 100;

  const handleContinueReading = () => {
    router.push({
      pathname: '/bible/read',
      params: { book: current.bookCode, chapter: String(current.chapterNum) },
    });
  };

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
              {/* 현재 읽고 있는 장 (= 다음에 읽을 장) */}
              <Text style={styles.chapterTitle}>
                {current.bookName} {current.chapterNum}장
              </Text>
              {current.done && (
                <Text style={styles.date}>통독을 모두 마쳤어요 🎉</Text>
              )}
            </View>

            {/* Figma: 이어읽기 py:10 px:16 */}
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinueReading}
              activeOpacity={0.8}
            >
              <Text style={styles.continueBtnText}>이어읽기</Text>
            </TouchableOpacity>
          </View>

          {/* ── 프로그레스 바 섹션 ── */}
          <View style={styles.progressSection}>
            {/* 바 행: [1장] [marker + ████░░░░] [N장] — 피그마 인라인 레이아웃 */}
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>1장</Text>
              <View style={styles.trackWrap}>
                {/* Marker 배지 — '현재 읽고 있는 장'을 가리킴 */}
                <View style={[styles.markerContainer, { left: `${markerPercent}%` as any }]}>
                  <View style={styles.markerBadge}>
                    <Text style={styles.markerText}>{current.chapterNum}장</Text>
                  </View>
                  <View style={styles.markerTail} />
                </View>
                <View style={styles.trackBg}>
                  <View style={[styles.trackFill, { flex: progressRatio }]} />
                  <View style={{ flex: 1 - progressRatio }} />
                </View>
              </View>
              <Text style={styles.barLabel}>{current.totalChapters}장</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 전체 통독표 보기 — 밑줄 없음 */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/plan')}
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
  // 트랙(trackWrap) 기준 절대 위치 — 트랙 바로 위에 떠 있음
  markerContainer: {
    position: 'absolute',
    bottom: 22,                 // 트랙(높이 20) 위쪽에 배지+꼬리 배치
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
  // 마커를 트랙 기준으로 띄우기 위한 래퍼 (marker는 클리핑되면 안 되므로 overflow 미적용)
  trackWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  trackBg: {
    width: '100%',
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
