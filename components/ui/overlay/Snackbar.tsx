/**
 * components/ui/overlay/Snackbar.tsx
 * 다크 바 + 우측 액션 형태의 스낵바 (프레젠테이션 전용).
 * Figma: bg overlay.toast, radius.lg, pad 12/16, 좌측 아이콘 + 내용 + 우측 액션.
 */

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  message: string;
  action?: { label?: string; onPress: () => void };
};

export default function Snackbar({ message, action }: Props) {
  return (
    <View style={styles.bar}>
      <Ionicons name="information-circle" size={24} color={colors.white} style={styles.iconLeft} />
      <Text style={styles.text} numberOfLines={2}>{message}</Text>
      {!!action && (
        <TouchableOpacity onPress={action.onPress} style={styles.actionWrap} hitSlop={8}>
          {action.label ? (
            <Text style={styles.actionLabel}>{action.label}</Text>
          ) : (
            <Ionicons name="close" size={24} color={colors.white} />
          )}
        </TouchableOpacity>
      )}
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
  iconLeft: { marginRight: spacing.sm },
  text: { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.white },
  actionWrap: { marginLeft: spacing.sm },
  actionLabel: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.primary },
});
