/**
 * components/ui/overlay/Floating.tsx
 * 보라색 pill 형태의 플로팅 알림 (프레젠테이션 전용).
 * Figma: bg primary, radius.lg, 내용(600/16 흰색).
 */

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Floating({ message }: { message: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text} numberOfLines={1}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.white },
});
