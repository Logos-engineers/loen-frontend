import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChallengeItem {
  id: string;
  tag: string;
  title: string;
  period: string;
  detail: string;
}

// 더미 데이터 — API 연동 시 props로 교체
const CHALLENGE: ChallengeItem = {
  id: '1',
  tag: '성경 챌린지',
  title: '박채연의 성경 챌린지 1',
  period: '~7/31',
  detail: '유한복음, 사전 · 총 173장',
};

export function ChallengeSection() {
  return (
    <View>
      <SectionHeader title="챌린지" />
      <Card style={styles.card}>
        {/* 태그 칩 */}
        <View style={styles.chip}>
          <Text style={styles.chipText}>{CHALLENGE.tag}</Text>
        </View>

        {/* 챌린지 행 */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => Alert.alert('챌린지 상세')}
          activeOpacity={0.7}
        >
          <View style={styles.iconBox}>
            <Ionicons name="book" size={18} color={colors.primary} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.title}>{CHALLENGE.title}</Text>
            <Text style={styles.detail}>{CHALLENGE.detail}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.period}>{CHALLENGE.period}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.text.dim} />
          </View>
        </TouchableOpacity>

        <PrimaryButton
          label="챌린지 참여하기"
          onPress={() => Alert.alert('챌린지 참여하기')}
          style={styles.button}
        />
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
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
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
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  detail: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  period: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  button: {
    marginTop: spacing.xs,
  },
});
