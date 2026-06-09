import { colors } from '@/constants/tokens';
import React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TimePeriod } from './challengeTypes';

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 7;
const HALF = 3; // Math.floor(VISIBLE_ITEMS / 2)

// 거리별 텍스트 스타일 (Figma 시간 휠 메타데이터: 23/#16191C → 18/#AEAEAE → 14/#C2C2C2 → 12/#D7D7D7)
const DISTANCE_STYLES = [
  { fontSize: 23, color: '#16191C' }, // distance 0 — selected
  { fontSize: 18, color: '#AEAEAE' }, // distance 1
  { fontSize: 14, color: '#C2C2C2' }, // distance 2
  { fontSize: 12, color: '#D7D7D7' }, // distance 3+
] as const;

function getDistanceStyle(distance: number) {
  return DISTANCE_STYLES[Math.min(Math.abs(distance), 3)];
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'] as const;

function snapIndex(e: NativeSyntheticEvent<NativeScrollEvent>, maxIndex: number) {
  return Math.max(0, Math.min(maxIndex, Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT)));
}

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
};

export default function TimeWheelPicker({ value, onChange }: Props) {
  const { hour12, minute, period } = getTimeParts(value);
  const hourIdx = hour12 - 1;
  const minuteIdx = minute;
  const periodIdx = PERIODS.indexOf(period);

  const update = (h: number, m: number, p: TimePeriod) => onChange(buildDate(value, h, m, p));

  return (
    <View style={styles.container}>
      <View style={styles.wheel}>
        {/* 시 */}
        <ScrollView
          style={styles.numberColumn}
          contentContainerStyle={styles.columnContent}
          contentOffset={{ x: 0, y: hourIdx * ITEM_HEIGHT }}
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          onMomentumScrollEnd={e => update(HOURS[snapIndex(e, HOURS.length - 1)], minute, period)}
          onScrollEndDrag={e => update(HOURS[snapIndex(e, HOURS.length - 1)], minute, period)}
        >
          {HOURS.map((h, i) => {
            const s = getDistanceStyle(i - hourIdx);
            return (
              <View key={h} style={styles.item}>
                <Text style={[styles.itemText, { fontSize: s.fontSize, color: s.color }]}>{h}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* 분 */}
        <ScrollView
          style={styles.numberColumn}
          contentContainerStyle={styles.columnContent}
          contentOffset={{ x: 0, y: minuteIdx * ITEM_HEIGHT }}
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          onMomentumScrollEnd={e => update(hour12, MINUTES[snapIndex(e, MINUTES.length - 1)], period)}
          onScrollEndDrag={e => update(hour12, MINUTES[snapIndex(e, MINUTES.length - 1)], period)}
        >
          {MINUTES.map((m, i) => {
            const s = getDistanceStyle(i - minuteIdx);
            return (
              <View key={m} style={styles.item}>
                <Text style={[styles.itemText, { fontSize: s.fontSize, color: s.color }]}>
                  {m.toString().padStart(2, '0')}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* AM/PM */}
        <ScrollView
          style={styles.periodColumn}
          contentContainerStyle={styles.columnContent}
          contentOffset={{ x: 0, y: periodIdx * ITEM_HEIGHT }}
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          onMomentumScrollEnd={e => update(hour12, minute, PERIODS[snapIndex(e, PERIODS.length - 1)])}
          onScrollEndDrag={e => update(hour12, minute, PERIODS[snapIndex(e, PERIODS.length - 1)])}
        >
          {PERIODS.map((p, i) => {
            const s = getDistanceStyle(i - periodIdx);
            return (
              <View key={p} style={styles.item}>
                <Text style={[styles.itemText, { fontSize: s.fontSize, color: s.color }]}>{p}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.separator, { top: ITEM_HEIGHT * HALF }]} pointerEvents="none" />
      <View style={[styles.separator, { top: ITEM_HEIGHT * (HALF + 1) }]} pointerEvents="none" />
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
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numberColumn: { width: COL_WIDTH, height: ITEM_HEIGHT * VISIBLE_ITEMS },
  periodColumn: { width: COL_WIDTH, height: ITEM_HEIGHT * VISIBLE_ITEMS },
  columnContent: { paddingVertical: ITEM_HEIGHT * HALF },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontWeight: '400' },
});
