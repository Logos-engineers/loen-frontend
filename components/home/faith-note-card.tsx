import PencilIcon from '@/assets/icons/pencil.svg';
import { Card } from '@/components/ui/card';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function FaithNoteCard() {
  return (
    <View style={styles.wrapper}>
      <Card style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => Alert.alert('신앙노트 작성하기')}
          activeOpacity={0.7}
        >
          {/* Figma: pencil.svg 32×32 앱 아이콘 (PNG-embedded SVG, transformer로 렌더링) */}
          <PencilIcon width={32} height={32} style={styles.iconBox} />

          <View style={styles.textCol}>
            <Text style={styles.label}>오늘의 신앙 여정 기록</Text>
            <Text style={styles.title}>신앙노트 작성하기</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    borderRadius: radius.xs,
    overflow: 'hidden',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
});
