import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FaithNoteEmptyProps {
  tabLabel: string;  // e.g., '감사노트', '기도노트', '말씀노트'
}

export function FaithNoteEmpty({ tabLabel }: FaithNoteEmptyProps) {
  return (
    // Figma: empty 상태 — 리스트 영역 중앙 정렬
    <View style={styles.container}>
      <Ionicons
        name="document-text-outline"
        size={40}
        color={colors.text.dim}
        style={styles.icon}
      />
      <Text style={styles.title}>아직 작성된 {tabLabel}가 없어요</Text>
      <Text style={styles.subtitle}>오늘의 신앙 여정을 기록해보세요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma: empty state — flex:1, center
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  icon: {
    marginBottom: spacing.sm,
  },
  // Figma: 16px SemiBold, fg/basic/stronger
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  // Figma: 14px Regular, fg/basic/subtle
  subtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
