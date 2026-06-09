import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  goal: string | null;
}

export function ChallengeGoalCard({ goal }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name="locate" size={spacing.md} color={colors.white} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label}>챌린지 목표</Text>
        <Text style={styles.value}>{goal ?? '목표가 설정되지 않았습니다'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.reaction.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: spacing.nano,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  value: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
});
