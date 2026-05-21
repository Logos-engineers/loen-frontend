import BookIcon from '@/assets/icons/book.svg';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useChallenge } from '@/hooks/useChallenge';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ChallengeSection() {
  const router = useRouter();
  const { challenges, isLoading, error } = useChallenge();
  const challenge = challenges[0];

  return (
    <View>
      <SectionHeader title="챌린지" showArrow onPress={() => router.push('/challenge')} />

      <View style={styles.wrapper}>
        <Card style={styles.card}>
          {isLoading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <Text style={styles.emptyText}>챌린지를 불러오지 못했습니다</Text>
            </View>
          ) : challenge ? (
            <>
              <View style={styles.tagRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{challenge.type === 'BIBLE' ? '성경 챌린지' : '신앙 챌린지'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push('/challenge')}
                activeOpacity={0.7}
              >
                <BookIcon width={32} height={32} />

                <View style={styles.textCol}>
                  <Text style={styles.title} numberOfLines={1}>{challenge.name}</Text>
                  <Text style={styles.detail} numberOfLines={1}>
                    {challenge.type === 'BIBLE' ? (challenge.bibleBooks?.join(', ') || '읽기 범위 정보 없음') : '챌린지 목표 정보 없음'}
                  </Text>
                </View>

                <View style={styles.dateBadgeRow}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{challenge.participantCount}명</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.stateBox}>
              <Text style={styles.emptyText}>등록된 챌린지가 없습니다</Text>
            </View>
          )}

          <View style={styles.buttonWrapper}>
            <PrimaryButton
              label="챌린지 참여하기"
              onPress={() => router.push('/challenge')}
            />
          </View>
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
  card: { gap: 0, padding: 0, overflow: 'hidden' },
  stateBox: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  tagRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  textCol: { flex: 1, gap: 2 },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  detail: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dateBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dateBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  buttonWrapper: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
});
