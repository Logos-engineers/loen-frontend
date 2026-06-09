/**
 * components/ui/overlay/Handle.tsx
 * 바텀시트 상단 그래버 바.
 * Figma: bar 80×5, color border(rgba(13,28,45,0.08)), radius full, 패딩 8 상하.
 */

import { colors, radius, spacing } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Handle() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingVertical: spacing.sm },
  bar: { width: 80, height: 5, borderRadius: radius.full, backgroundColor: colors.border },
});
