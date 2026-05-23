import BookIcon from '@/assets/icons/book.svg';
import PrayIcon from '@/assets/icons/pray.svg';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import type { RecommendedChallengeItem } from '@/hooks/useChallenge';
import { formatShortDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  item: RecommendedChallengeItem;
  onPress: () => void;
};

export function ChallengeListCard({ item, onPress }: Props) {
  const typeLabel = item.type === 'FAITH' ? '신앙 챌린지' : '성경 챌린지';
  const dateLabel = `${formatShortDate(item.startDate)} ~ ${formatShortDate(item.endDate)}`;
  const descLabel = item.goal ?? item.creatorName;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* 태그 행 — padding 16 16 8, gap 10 */}
      <View style={styles.tagRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{typeLabel}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.participantCount}명 참여중</Text>
        </View>
      </View>

      {/* 콘텐츠 행 — padding 6 16 16 */}
      <View style={styles.contentRow}>
        {/* 챌린지 타입 배지 — 32x32 */}
        <View style={styles.badgeWrap}>
          {item.type === 'FAITH'
            ? <PrayIcon width={32} height={32} />
            : <BookIcon width={32} height={32} />
          }
        </View>

        {/* 텍스트 컬럼 */}
        <View style={styles.textCol}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          {descLabel ? (
            <Text style={styles.desc} numberOfLines={1}>{descLabel}</Text>
          ) : null}
        </View>

        {/* 오른쪽 chevron */}
        <View style={styles.chevronWrap}>
          <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  badgeWrap: {
    marginRight: spacing.sm,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  dateLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  desc: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  chevronWrap: {
    paddingLeft: spacing.sm,
  },
});
