import BookIcon from '@/assets/icons/book.svg';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CHALLENGE_DATA = {
  tag: '성경 챌린지',
  title: '박채연의 성경 챌린지 1',
  detail: '요한복음, 시편 · 총 173장',
  dueDate: '~7/31',
};

export function ChallengeSection() {
  const router = useRouter();

  return (
    <View>
      <SectionHeader title="챌린지" />

      <View style={styles.wrapper}>
        <Card style={styles.card}>
          <View style={styles.tagRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{CHALLENGE_DATA.tag}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert('챌린지 상세')}
            activeOpacity={0.7}
          >
            {/* Figma: book.svg 32×32 (SVG transformer) */}
            <BookIcon width={32} height={32} />

            <View style={styles.textCol}>
              <Text style={styles.title} numberOfLines={1}>{CHALLENGE_DATA.title}</Text>
              <Text style={styles.detail} numberOfLines={1}>{CHALLENGE_DATA.detail}</Text>
            </View>

            {/* Figma: 날짜 배지(흰색 배경) + chevron-right */}
            <View style={styles.dateBadgeRow}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{CHALLENGE_DATA.dueDate}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
            </View>
          </TouchableOpacity>

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
