import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  showArrow?: boolean;
  onPress?: () => void;
}

export function SectionHeader({ title, showArrow = false, onPress }: SectionHeaderProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.text.dim} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,   // Figma: pt-[16px]
    paddingBottom: 0,
  },
  titleRow: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.base,  // Figma: 16px Bold
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
});
