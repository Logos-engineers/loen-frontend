import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { ObsContent, formatKoreanDate } from '@/hooks/useObs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ObsCardProps = {
  item: ObsContent;
  reviewLabel?: string;
  showReviewCompleteTag?: boolean;
  viewLabel?: string;
  onPressReview: () => void;
  onPressView: () => void;
};

export function ObsCard({
  item,
  reviewLabel = '복습하기',
  showReviewCompleteTag = true,
  viewLabel = 'OBS 보기',
  onPressReview,
  onPressView,
}: ObsCardProps) {
  const isDone = item.reviewStatus === 'DONE';

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardDate}>{formatKoreanDate(item.publishedDate)}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: colors.primary,
  },
  obsViewButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: '#FAFAFA',
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
