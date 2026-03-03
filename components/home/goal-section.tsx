import { Card } from '@/components/ui/card';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';

// Android에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Goal {
  id: number;
  text: string;
}

// 더미 데이터 — API 연동 시 props로 교체
const GOALS: Goal[] = [
  { id: 1, text: '매일 기도하기' },
  { id: 2, text: '일주일에 한 번 연락하기' },
];

export function GoalSection() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(prev => !prev);
  };

  return (
    <Card style={styles.card}>
      {/* 헤더 행 */}
      <TouchableOpacity style={styles.row} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.title}>적용하기</Text>
        <View style={styles.right}>
          <Text style={styles.subtitle}>이번 주 목표 확인하기</Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.text.secondary}
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {/* 드롭다운 목록 */}
      {isOpen && (
        <View style={styles.listContainer}>
          {GOALS.map(goal => (
            <View key={goal.id} style={styles.goalRow}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{goal.id}</Text>
              </View>
              <Text style={styles.goalText}>{goal.text}</Text>
            </View>
          ))}
        </View>
      )}
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
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  chevron: {
    marginTop: 1,
  },
  listContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
  },
  goalText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
});
