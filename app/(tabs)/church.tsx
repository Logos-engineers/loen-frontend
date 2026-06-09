import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChurchScreen() {
  // TODO: 교회생활(오이코스) 기능 구현 예정 — 현재는 준비중 플레이스홀더
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>교회생활</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>To be continued</Text>
        <Text style={styles.desc}>교회생활 기능을 준비하고 있어요</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  desc: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center' },
});
