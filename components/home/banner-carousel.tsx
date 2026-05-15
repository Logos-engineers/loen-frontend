import { colors, fontSize, spacing } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function BannerCarousel() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.emptyText}>등록된 배너가 없습니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
