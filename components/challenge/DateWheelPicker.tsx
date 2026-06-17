import React from 'react';
import { StyleSheet, View } from 'react-native';
import WheelColumn from './WheelColumn';

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 7;
const HALF = 3; // Math.floor(VISIBLE_ITEMS / 2)

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
        <WheelColumn
          items={years}
          selectedIndex={yearIdx}
          onIndexChange={(i) => update(years[i], selectedMonth, selectedDay)}
          itemHeight={ITEM_HEIGHT}
          visibleItems={VISIBLE_ITEMS}
          width={YEAR_WIDTH}
          isDisabled={(i) => isYearDisabled(years[i])}
        />
        {/* 월 */}
        <WheelColumn
          items={months.map((m) => m + 1)}
          selectedIndex={monthIdx}
          onIndexChange={(i) => update(selectedYear, i, selectedDay)}
          itemHeight={ITEM_HEIGHT}
          visibleItems={VISIBLE_ITEMS}
          width={MONTH_WIDTH}
          isDisabled={(i) => isMonthDisabled(i)}
        />
        {/* 일 */}
        <WheelColumn
          items={days}
          selectedIndex={dayIdx}
          onIndexChange={(i) => update(selectedYear, selectedMonth, days[i])}
          itemHeight={ITEM_HEIGHT}
          visibleItems={VISIBLE_ITEMS}
          width={DAY_WIDTH}
          isDisabled={(i) => isDayDisabled(days[i])}
        />
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
});
