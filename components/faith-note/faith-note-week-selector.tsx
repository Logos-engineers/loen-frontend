import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 월~일
const DAYS: { key: string; label: string }[] = [
  { key: 'MON', label: '월' },
  { key: 'TUE', label: '화' },
  { key: 'WED', label: '수' },
  { key: 'THU', label: '목' },
  { key: 'FRI', label: '금' },
  { key: 'SAT', label: '토' },
  { key: 'SUN', label: '일' },
];

interface FaithNoteWeekSelectorProps {
  selectedDates: string[];
  /** 이번 주 내가 노트를 작성한 요일 키 — 동그라미에 체크 표시 */
  writtenDays?: string[];
  todayKey: string;
  onToggleDate: (key: string) => void;
}

export function FaithNoteWeekSelector({
  selectedDates,
  writtenDays = [],
  todayKey,
  onToggleDate,
}: FaithNoteWeekSelectorProps) {
  return (
    <View style={styles.container}>
      {DAYS.map((day) => {
        const isSelected = selectedDates.includes(day.key);
        const isToday = day.key === todayKey;
        const isWritten = writtenDays.includes(day.key);
        // 오늘 또는 필터 선택된 날 → 어두운 pill + 흰 라벨
        const isHighlighted = isSelected || isToday;

        return (
          <TouchableOpacity
            key={day.key}
            style={styles.dayWrapper}
            onPress={() => onToggleDate(day.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.dayPill, isHighlighted && styles.dayPillActive]}>
              <Text style={[styles.dayLabel, isHighlighted && styles.dayLabelActive]}>
                {day.label}
              </Text>
              <View
                style={[
                  styles.circle,
                  isHighlighted && styles.circleActive,
                  isWritten && styles.circleWritten,
                ]}
              >
                {isWritten ? (
                  <Ionicons name="checkmark" size={20} color={colors.white} />
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dayWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  dayPill: {
    padding: 4,
    borderRadius: radius.full,
    alignItems: 'center',
    gap: 4,
  },
  dayPillActive: {
    backgroundColor: colors.text.primary,
  },
  dayLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  dayLabelActive: {
    color: colors.white,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(13,28,45,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  // 작성한 날 — 파란 원 + 흰 체크 (Figma today/y, trans/blue/a1)
  circleWritten: {
    backgroundColor: '#4568FF',
  },
});
