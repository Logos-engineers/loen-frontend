import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';
import { formatWeekRangeLabel } from '@/utils/faith-note-store';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

// 스와이프로 주 이동을 확정하는 최소 이동량/속도
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 0.4;

interface FaithNoteWeekSelectorProps {
  selectedDates: string[];
  /** 보고 있는 주에 내가 노트를 작성한 요일 키 — 동그라미에 체크 표시 */
  writtenDays?: string[];
  /** 오늘 요일 키. 보고 있는 주가 '이번 주'가 아니면 '' 를 넘겨 오늘 강조를 끈다 */
  todayKey: string;
  onToggleDate: (key: string) => void;
  /** 보고 있는 주의 시작(일요일 00:00) */
  weekStart: Date;
  /** 보고 있는 주가 이번 주인지 — 미래(왼쪽) 스와이프 상한 & 라벨('이번 주') 표시용 */
  isCurrentWeek: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function FaithNoteWeekSelector({
  selectedDates,
  writtenDays = [],
  todayKey,
  onToggleDate,
  weekStart,
  isCurrentWeek,
  onPrevWeek,
  onNextWeek,
}: FaithNoteWeekSelectorProps) {
  const weekLabel = isCurrentWeek ? '이번 주' : formatWeekRangeLabel(weekStart);

  // PanResponder는 1회 생성이라 최신 값(isCurrentWeek·핸들러)을 ref로 참조해 stale closure 방지.
  // 손가락-따라가기 transform은 쓰지 않는다 — Animated transform이 자식 pill의
  // borderRadius 클리핑을 깨뜨려(사각형 렌더) 제스처 '감지'만 하고 놓을 때 주를 바꾼다.
  const latest = useRef({ isCurrentWeek, onPrevWeek, onNextWeek });
  latest.current = { isCurrentWeek, onPrevWeek, onNextWeek };

  const panResponder = useRef(
    PanResponder.create({
      // 가로 이동이 우세할 때만 스와이프로 인식(요일 탭은 그대로 통과)
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 12,
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_DISTANCE || g.vx > SWIPE_VELOCITY) {
          latest.current.onPrevWeek(); // 오른쪽 스와이프 = 과거로
        } else if (
          (g.dx < -SWIPE_DISTANCE || g.vx < -SWIPE_VELOCITY) &&
          !latest.current.isCurrentWeek
        ) {
          latest.current.onNextWeek(); // 왼쪽 스와이프 = 미래로(이번 주 상한)
        }
      },
    }),
  ).current;

  return (
    <View style={styles.wrapper}>
      {/* 보고 있는 주 라벨. 주 이동은 아래 요일 스트립 좌우 스와이프로. */}
      <View style={styles.header}>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
      </View>

      <View style={styles.daysRow} {...panResponder.panHandlers}>
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
