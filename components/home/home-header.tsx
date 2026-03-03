import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function HomeHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>lœin</Text>
      <TouchableOpacity onPress={() => {}} hitSlop={8}>
        <Ionicons name="notifications-outline" size={24} color={colors.text.dim} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.elevated,
  },
  logo: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
});
