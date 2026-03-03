import { Card } from '@/components/ui/card';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function FaithNoteCard() {
  return (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => Alert.alert('신앙노트 작성하기')}
        activeOpacity={0.7}
      >
        {/* 연필 아이콘 원형 배경 */}
        <View style={styles.iconBox}>
          <Ionicons name="pencil" size={18} color={colors.text.secondary} />
        </View>

        {/* 텍스트 */}
        <View style={styles.textCol}>
          <Text style={styles.label}>오늘의 신앙 여정 기록</Text>
          <Text style={styles.title}>신앙노트 작성하기</Text>
        </View>

        {/* 오른쪽 화살표 */}
        <Ionicons name="chevron-forward" size={18} color={colors.text.dim} />
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
});
