import CheckIcon from '@/assets/icons/check.svg';
import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';
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
  /** 선택된 날 배열 — 다중 선택, 빈 배열이면 아무것도 선택 안됨 */
  selectedDates: string[];
  /** 오늘 날짜 키 — 하단 점(dot) 인디케이터 표시용 */
  todayKey: string;
  /** 날짜 토글 핸들러 */
  onToggleDate: (key: string) => void;
}

export function FaithNoteWeekSelector({
  selectedDates,
  todayKey,
  onToggleDate,
}: FaithNoteWeekSelectorProps) {
  return (
    // Figma: bg:#FFFFFF, px:16, py:12, flex-row, justify:space-between
    <View style={styles.container}>
      {DAYS.map((day) => {
        const isSelected = selectedDates.includes(day.key);
        const isToday = day.key === todayKey;

        return (
          <TouchableOpacity
            key={day.key}
            style={styles.dayWrapper}
            onPress={() => onToggleDate(day.key)}
            activeOpacity={0.7}
          >
            {/* Figma: 36×36 원형 버블 */}
            <View
              style={[
                styles.bubble,
                isSelected && styles.bubbleSelected,
              ]}
            >
              {isSelected ? (
                // 선택된 날: primary 배경 + 체크 아이콘
                <CheckIcon width={16} height={16} />
              ) : (
                // 미선택: 요일 텍스트
                <Text
                  style={[
                    styles.dayLabel,
                    isToday && styles.dayLabelToday,
                  ]}
                >
                  {day.label}
                </Text>
              )}
            </View>

            {/* 오늘 날짜 인디케이터 — 선택 여부와 무관 */}
            {isToday && <View style={styles.todayDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma: bg:#FFFFFF, px:16, py:12, flex-row, justify:space-between
  container: {
    backgroundColor: colors.background.elevated,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dayWrapper: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },

  // Figma: 36×36 원형
  bubble: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.border,     // 기본 — 회색
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma: 선택됨 — primary(#6561FF) 배경
  bubbleSelected: {
    backgroundColor: colors.primary,
  },

  dayLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  // 오늘 날짜 라벨 — primary 색상 강조 (미선택 상태에서만 표시)
  dayLabelToday: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },

  // 오늘 날짜 하단 점 인디케이터
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 1,
  },
});
