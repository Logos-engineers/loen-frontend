import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { ObsContent, formatKoreanDate } from '@/hooks/useObs';
import { scrapObsContent } from '@/hooks/useObsContent';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ObsCardProps = {
  item: ObsContent;
  reviewLabel?: string;
  showReviewCompleteTag?: boolean;
  viewLabel?: string;
  singleLineTitle?: boolean;
  noShadow?: boolean;
  /** 복습하기 버튼 오른쪽에 스크랩 토글 별을 노출 (qa-bot#34) */
  enableScrap?: boolean;
  /** 스크랩 토글 성공 후 호출 — 목록 새로고침으로 필터 동기화 */
  onScrapChange?: (next: boolean) => void;
  onPressReview: () => void;
  onPressView: () => void;
};

export function ObsCard({
  item,
  reviewLabel = '복습하기',
  showReviewCompleteTag = true,
  viewLabel = 'OBS 보기',
  singleLineTitle = false,
  noShadow = false,
  enableScrap = false,
  onScrapChange,
  onPressReview,
  onPressView,
}: ObsCardProps) {
  const isDone = item.reviewStatus === 'DONE';

  const [scraped, setScraped] = useState(item.isScraped);
  const [scrapBusy, setScrapBusy] = useState(false);
  // 외부(목록 새로고침)에서 스크랩 상태가 바뀌면 동기화
  useEffect(() => { setScraped(item.isScraped); }, [item.isScraped]);
  const toggleScrap = async () => {
    if (scrapBusy) return;
    setScrapBusy(true);
    const next = !scraped;
    setScraped(next); // 낙관적 반영
    try {
      const result = await scrapObsContent(item.id);
      setScraped(result);
      onScrapChange?.(result);
    } catch {
      setScraped(!next); // 실패 시 롤백
    } finally {
      setScrapBusy(false);
    }
  };

  return (
    <View style={styles.cardWrapper}>
      <View style={[styles.card, noShadow && styles.cardFlat]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardDate}>{formatKoreanDate(item.publishedDate)}</Text>
            <Text
              style={styles.cardTitle}
              numberOfLines={singleLineTitle ? 1 : undefined}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>
            <Text style={styles.cardVerse}>{item.biblePassage}</Text>
          </View>
          {showReviewCompleteTag && isDone && (
            <View style={styles.cardHeaderRight}>
              <View style={styles.reviewTag}>
                <Text style={styles.reviewTagText}>복습 완료</Text>
              </View>
            </View>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {enableScrap && (
            <TouchableOpacity
              style={styles.scrapButton}
              activeOpacity={0.7}
              onPress={toggleScrap}
              disabled={scrapBusy}
              accessibilityLabel={scraped ? '스크랩 해제' : '스크랩'}
            >
              <Ionicons
                name={scraped ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={scraped ? colors.primary : 'rgba(13,28,45,0.35)'}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.ctaButton, styles.obsViewButton]}
            activeOpacity={0.8}
            onPress={onPressView}
          >
            <Text style={styles.obsViewButtonText}>{viewLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaButton, styles.primaryButton]}
            activeOpacity={0.8}
            onPress={onPressReview}
          >
            <Text style={styles.primaryButtonText}>{reviewLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  // 홈 화면 등 그림자 제거용 (flat)
  cardFlat: {
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRight: {
    paddingLeft: 12,
    alignItems: 'flex-start',
  },
  reviewTag: {
    backgroundColor: 'rgba(13,28,45,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(13,28,45,0.8)',
    lineHeight: 18,
  },
  cardDate: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: 'rgba(13,28,45,0.5)',
    lineHeight: 21,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: 'rgba(13,28,45,0.8)',
    lineHeight: 28,
  },
  cardVerse: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: 'rgba(13,28,45,0.5)',
    lineHeight: 21,
  },
  buttonContainer: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ctaButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  obsViewButton: {
    backgroundColor: colors.primaryLight,   // rgba(101,97,255,0.20)
  },
  obsViewButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,                   // 연보라 배경 위 가독성
  },
  scrapButton: {
    width: 44,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: '#FAFAFA',
  },
});
