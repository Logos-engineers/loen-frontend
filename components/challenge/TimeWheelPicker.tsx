import { colors } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import WheelColumn from './WheelColumn';
import { TimePeriod } from './challengeTypes';

const ITEM_HEIGHT = 36;
const DEFAULT_VISIBLE_ITEMS = 7; // 위아래 3개씩 + 선택 1

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'] as const;

function getTimeParts(date: Date) {
  const hour = date.getHours();
  return {
    hour12: hour % 12 || 12,
    minute: date.getMinutes(),
    period: (hour >= 12 ? 'PM' : 'AM') as TimePeriod,
  };
}

function buildDate(base: Date, hour12: number, minute: number, period: TimePeriod): Date {
  const next = new Date(base);
  const hour = period === 'PM' ? (hour12 % 12) + 12 : hour12 % 12;
  next.setHours(hour, minute, 0, 0);
  return next;
}

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  /** 전체 보이는 항목 수(홀수). 기본 7 = 위아래 3개씩. 5로 주면 위아래 2개씩 */
  visibleItems?: number;
};

export default function TimeWheelPicker({ value, onChange, visibleItems = DEFAULT_VISIBLE_ITEMS }: Props) {
  const half = Math.floor(visibleItems / 2);
  const wheelHeight = ITEM_HEIGHT * visibleItems;
  const { hour12, minute, period } = getTimeParts(value);
  const hourIdx = hour12 - 1;
  const minuteIdx = minute;
  const periodIdx = PERIODS.indexOf(period);

  const update = (h: number, m: number, p: TimePeriod) => onChange(buildDate(value, h, m, p));

  return (
    <View style={styles.container}>
      <View style={[styles.wheel, { height: wheelHeight }]}>
        {/* 시 */}
        <WheelColumn
          items={HOURS}
          selectedIndex={hourIdx}
          onIndexChange={(i) => update(HOURS[i], minute, period)}
          itemHeight={ITEM_HEIGHT}
          visibleItems={visibleItems}
          width={COL_WIDTH}
        />
        {/* 분 */}
        <WheelColumn
          items={MINUTES.map((m) => m.toString().padStart(2, '0'))}
          selectedIndex={minuteIdx}
          onIndexChange={(i) => update(hour12, MINUTES[i], period)}
          itemHeight={ITEM_HEIGHT}
          visibleItems={visibleItems}
          width={COL_WIDTH}
        />
        {/* AM/PM */}
        <WheelColumn
          items={PERIODS}
          selectedIndex={periodIdx}
          onIndexChange={(i) => update(hour12, minute, PERIODS[i])}
          itemHeight={ITEM_HEIGHT}
          visibleItems={visibleItems}
          width={COL_WIDTH}
        />
      </View>

      <View style={[styles.separator, { top: ITEM_HEIGHT * half }]} pointerEvents="none" />
      <View style={[styles.separator, { top: ITEM_HEIGHT * (half + 1) }]} pointerEvents="none" />
    </View>
  );
}

export const TIME_WHEEL_ITEM_HEIGHT = ITEM_HEIGHT;

// Figma 휠 컬럼 중심 간격 ≈ 52px (시146 → 분196 → AM/PM252, picker 361 기준)
const COL_WIDTH = 44;
const WHEEL_WIDTH = COL_WIDTH * 3 + 8 * 2; // 148 — 컬럼 사이 8px

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  separator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.text.dim, // rgba(13,28,45,0.16)
    zIndex: 2,
  },
  wheel: {
    width: WHEEL_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
