import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 일~토 (주일이 한 주의 시작)
const DAYS: { key: string; label: string }[] = [
  { key: 'SUN', label: '일' },
  { key: 'MON', label: '월' },
  { key: 'TUE', label: '화' },
  { key: 'WED', label: '수' },
  { key: 'THU', label: '목' },
  { key: 'FRI', label: '금' },
  { key: 'SAT', label: '토' },
];

interface FaithNoteWeekSelectorProps {
  selectedDates: string[];
  /** 이번 주에 내가 노트를 작성한 요일 키 — 동그라미에 체크 표시 */
  writtenDays?: string[];
  /** 오늘 요일 키 — 오늘 강조용 */
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
    <View style={styles.wrapper}>
      {/* 이번 주 고정 — 주차 이동 없음(피드는 전체 최신순) */}
      <View style={styles.header}>
        <Text style={styles.weekLabel}>이번 주</Text>
      </View>

      <View style={styles.daysRow}>
        {DAYS.map((day) => {
          const isSelected = selectedDates.includes(day.key);
          const isToday = day.key === todayKey;
          const isWritten = writtenDays.includes(day.key);
          // 검은 pill 은 '오늘'에만. 선택(클릭) 표시는 pill 바깥 아래의 언더바로.

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
                    day.key === 'SUN' && !isToday && styles.dayLabelSunday,
                    isToday && styles.dayLabelActive,
                  ]}
                >
                  {day.label}
                </Text>
                <View
                  style={[
                    styles.circle,
                    isToday && styles.circleActive,
                    isWritten && styles.circleWritten,
                  ]}
                >
                  {isWritten ? (
                    <Ionicons name="checkmark" size={20} color={colors.white} />
                  ) : null}
                </View>
              </View>
              {/* 선택(클릭) 표시 — pill 바깥 아래 언더바. 미선택 시 투명(높이 유지). */}
              <View style={[styles.underbar, isSelected && styles.underbarActive]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background.base,
    paddingTop: 12,
    paddingBottom: 8,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  weekLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dayWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  dayPill: {
    // 폭·반경 확정값 + overflow:hidden. Android New Architecture(Fabric)에서 배경색을
    // 껐다 켜면(오늘→다른 주→복귀) 재그린 배경에 라운드가 안 입혀져 사각형이 되는데,
    // 라운드 클리핑 레이어를 상시 유지시켜(overflow hidden) 배경 토글과 무관하게 고정한다.
    width: 40,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
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
  dayLabelSunday: {
    color: colors.reaction.red, // 주일(일요일) 강조 — #59와 동일
  },
  // 선택(클릭)된 날 — pill 바깥 아래 언더바. 미선택 시 투명(높이 유지).
  underbar: {
    width: 18,
    height: 3,
    borderRadius: radius.full,
    marginTop: 6,
    backgroundColor: 'transparent',
  },
  underbarActive: {
    backgroundColor: colors.primary,
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
