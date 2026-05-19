import { Card } from '@/components/ui/card';
import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { useBibleHistory } from '@/hooks/useBibleHistory';
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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function GoalSection() {
  const [isOpen, setIsOpen] = useState(false);
  const { goal, isLoading } = useBibleHistory();

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(prev => !prev);
  };

  const goals = goal
    ? [
        `${goal.bookName} ${goal.chaptersPerDay}장씩 읽기`,
        `이번 주 ${goal.weeklyTarget}장 읽기`,
      ]
    : [];

  return (
    <View style={styles.wrapper}>
      <Card style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={toggle} activeOpacity={0.7}>
          <Text style={styles.title}>적용하기</Text>
          <View style={styles.right}>
            {/* Figma: trans/gray/a3 = rgba(13,28,45,0.5) — 회색 (보라 ❌) */}
            <Text style={styles.subtitle}>이번 주 목표 확인하기</Text>
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.text.secondary}  // rgba(13,28,45,0.5)
            />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.listContainer}>
            {isLoading ? (
              <Text style={styles.emptyText}>목표를 불러오는 중입니다</Text>
            ) : goals.length > 0 ? goals.map((goalText, index) => (
              <View key={goalText} style={styles.goalRow}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <Text style={styles.goalText}>{goalText}</Text>
              </View>
            )) : (
              <Text style={styles.emptyText}>이번 주 목표가 없습니다</Text>
            )}
          </View>
        )}
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
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,    // rgba(13,28,45,0.8)
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Figma: trans/gray/a3 — 회색 (보라 아님!)
  subtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,  // rgba(13,28,45,0.5)
  },
  listContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  // Figma: 구분선 없음 (borderTopWidth 제거)
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
  },
  goalText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
});
