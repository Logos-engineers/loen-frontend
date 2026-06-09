/**
 * components/ui/overlay/Toast.tsx
 * 다크 바 형태의 토스트 (프레젠테이션 전용 — 위치/애니메이션은 OverlayHost 담당).
 * Figma: bg overlay.toast, radius.lg, pad 12/16, 좌측 아이콘 + 내용(600/16 흰색).
 */

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Toast({ message }: { message: string }) {
  return (
    <View style={styles.bar}>
      <Ionicons name="information-circle" size={24} color={colors.white} style={styles.icon} />
      <Text style={styles.text} numberOfLines={2}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay.toast,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  icon: { marginRight: spacing.sm },
  text: { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.white },
});
