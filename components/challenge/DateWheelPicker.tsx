import React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 7;
const HALF = 3; // Math.floor(VISIBLE_ITEMS / 2)

const DISTANCE_STYLES = [
  { fontSize: 23, color: '#16191C' }, // distance 0 — selected
  { fontSize: 18, color: '#AEAEAE' }, // distance 1
  { fontSize: 14, color: '#C2C2C2' }, // distance 2
  { fontSize: 12, color: '#D7D7D7' }, // distance 3+
] as const;

function getDistanceStyle(distance: number) {
  return DISTANCE_STYLES[Math.min(Math.abs(distance), 3)];
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function toDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getClampedDate(year: number, month: number, day: number, minimumDate?: Date, maximumDate?: Date) {
  const next = new Date(year, month, Math.min(day, getDaysInMonth(year, month)));
  if (minimumDate && next.getTime() < toDateOnly(minimumDate).getTime()) {
    return toDateOnly(minimumDate);
  }
  if (maximumDate && next.getTime() > toDateOnly(maximumDate).getTime()) {
    return toDateOnly(maximumDate);
  }
  return next;
}

function getYearOptions(value: Date, minimumDate?: Date, maximumDate?: Date) {
  const currentYear = new Date().getFullYear();
  const firstYear = Math.min(
    value.getFullYear(),
    minimumDate?.getFullYear() ?? currentYear - 1,
    currentYear - 1
  );
  // maximumDate 가 있으면 그 해까지만 (없으면 기존처럼 +4년)
  const maxYear = maximumDate?.getFullYear() ?? currentYear + 4;
  const lastYear = Math.max(value.getFullYear(), maxYear);
  return Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
}

function snapIndex(e: NativeSyntheticEvent<NativeScrollEvent>, maxIndex: number) {
  return Math.max(0, Math.min(maxIndex, Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT)));
}

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

export default function DateWheelPicker({ value, onChange, minimumDate, maximumDate }: Props) {
  const selectedYear = value.getFullYear();
  const selectedMonth = value.getMonth();
  const selectedDay = value.getDate();

  const years = getYearOptions(value, minimumDate, maximumDate);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const minDate = minimumDate ? toDateOnly(minimumDate) : undefined;
  const maxDate = maximumDate ? toDateOnly(maximumDate) : undefined;
  const update = (year: number, month: number, day: number) => {
    onChange(getClampedDate(year, month, day, minDate, maxDate));
  };

  const yearIdx = Math.max(0, years.indexOf(selectedYear));
  const monthIdx = selectedMonth;
  const dayIdx = selectedDay - 1;

  const isYearDisabled = (year: number) =>
    (!!minDate && year < minDate.getFullYear()) || (!!maxDate && year > maxDate.getFullYear());
  const isMonthDisabled = (month: number) =>
    (!!minDate && selectedYear === minDate.getFullYear() && month < minDate.getMonth()) ||
    (!!maxDate && selectedYear === maxDate.getFullYear() && month > maxDate.getMonth());
  const isDayDisabled = (day: number) =>
    (!!minDate &&
      selectedYear === minDate.getFullYear() &&
      selectedMonth === minDate.getMonth() &&
      day < minDate.getDate()) ||
    (!!maxDate &&
      selectedYear === maxDate.getFullYear() &&
      selectedMonth === maxDate.getMonth() &&
      day > maxDate.getDate());

  return (
    <View style={styles.container}>
      <View style={styles.wheel}>
        {/* 년 */}
        <ScrollView
          style={styles.yearColumn}
          contentContainerStyle={styles.columnContent}
          contentOffset={{ x: 0, y: yearIdx * ITEM_HEIGHT }}
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          onMomentumScrollEnd={e =>
            update(years[snapIndex(e, years.length - 1)], selectedMonth, selectedDay)
          }
          onScrollEndDrag={e =>
            update(years[snapIndex(e, years.length - 1)], selectedMonth, selectedDay)
          }
        >
          {years.map((year, i) => {
            const s = getDistanceStyle(i - yearIdx);
            return (
              <View key={year} style={styles.item}>
                <Text style={[styles.itemText, { fontSize: s.fontSize, color: isYearDisabled(year) ? '#D7D7D7' : s.color }]}>
                  {year}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* 월 */}
        <ScrollView
          style={styles.monthColumn}
          contentContainerStyle={styles.columnContent}
          contentOffset={{ x: 0, y: monthIdx * ITEM_HEIGHT }}
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          onMomentumScrollEnd={e =>
            update(selectedYear, snapIndex(e, months.length - 1), selectedDay)
          }
          onScrollEndDrag={e =>
            update(selectedYear, snapIndex(e, months.length - 1), selectedDay)
          }
        >
          {months.map((month, i) => {
            const s = getDistanceStyle(i - monthIdx);
            return (
              <View key={month} style={styles.item}>
                <Text style={[styles.itemText, { fontSize: s.fontSize, color: isMonthDisabled(month) ? '#D7D7D7' : s.color }]}>
                  {month + 1}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* 일 */}
        <ScrollView
          style={styles.dayColumn}
          contentContainerStyle={styles.columnContent}
          contentOffset={{ x: 0, y: dayIdx * ITEM_HEIGHT }}
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          onMomentumScrollEnd={e =>
            update(selectedYear, selectedMonth, days[snapIndex(e, days.length - 1)])
          }
          onScrollEndDrag={e =>
            update(selectedYear, selectedMonth, days[snapIndex(e, days.length - 1)])
          }
        >
          {days.map((day, i) => {
            const s = getDistanceStyle(i - dayIdx);
            return (
              <View key={day} style={styles.item}>
                <Text style={[styles.itemText, { fontSize: s.fontSize, color: isDayDisabled(day) ? '#D7D7D7' : s.color }]}>
                  {day}
                </Text>
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

export const DATE_WHEEL_ITEM_HEIGHT = ITEM_HEIGHT;

const YEAR_WIDTH = 70;
const MONTH_WIDTH = 36;
const DAY_WIDTH = 36;
const GAP = 27;
const WHEEL_WIDTH = YEAR_WIDTH + GAP + MONTH_WIDTH + GAP + DAY_WIDTH;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: WHEEL_WIDTH,
    alignSelf: 'center',
  },
  separator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(13, 28, 45, 0.16)',
    zIndex: 2,
  },
  wheel: {
    width: WHEEL_WIDTH,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    flexDirection: 'row',
    gap: GAP,
    backgroundColor: '#FFFFFF',
  },
  yearColumn: { width: YEAR_WIDTH, height: ITEM_HEIGHT * VISIBLE_ITEMS },
  monthColumn: { width: MONTH_WIDTH, height: ITEM_HEIGHT * VISIBLE_ITEMS },
  dayColumn: { width: DAY_WIDTH, height: ITEM_HEIGHT * VISIBLE_ITEMS },
  columnContent: { paddingVertical: ITEM_HEIGHT * HALF },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontWeight: '400' },
});
