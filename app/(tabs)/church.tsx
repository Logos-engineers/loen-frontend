import { colors, fontSize, fontWeight } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChurchScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.text}>교회생활</Text>
        <Text style={styles.sub}>준비 중입니다</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  sub: { fontSize: fontSize.md, color: colors.text.secondary },
});
