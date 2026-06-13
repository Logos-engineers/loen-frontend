import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { ObsContent, formatKoreanDate } from '@/hooks/useObs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ObsCardProps = {
  item: ObsContent;
  reviewLabel?: string;
  showReviewCompleteTag?: boolean;
  viewLabel?: string;
  singleLineTitle?: boolean;
  noShadow?: boolean;
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
  onPressReview,
  onPressView,
}: ObsCardProps) {
  const isDone = item.reviewStatus === 'DONE';

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
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: '#FAFAFA',
  },
});
