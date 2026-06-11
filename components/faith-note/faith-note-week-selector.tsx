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
        // 검은 pill 은 '오늘'에만. 선택(클릭)은 동그라미 테두리 + 라벨 색으로 가볍게 표시.
        const showSelected = isSelected && !isToday;

        return (
          <TouchableOpacity
            key={day.key}
            style={styles.dayWrapper}
            onPress={() => onToggleDate(day.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.dayPill, isToday && styles.dayPillActive]}>
              <Text
                style={[
                  styles.dayLabel,
                  isToday && styles.dayLabelActive,
                  showSelected && styles.dayLabelSelected,
                ]}
              >
                {day.label}
              </Text>
              <View
                style={[
                  styles.circle,
                  isToday && styles.circleActive,
                  showSelected && styles.circleSelected,
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
  // 선택(클릭)된 날 — 라벨만 강조색
  dayLabelSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
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
  // 선택(클릭)된 날 — 동그라미에 강조색 테두리(링)만. 검은 pill 은 쓰지 않음.
  circleSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  // 작성한 날 — 파란 원 + 흰 체크 (Figma today/y, trans/blue/a1)
  circleWritten: {
    backgroundColor: '#4568FF',
  },
});
