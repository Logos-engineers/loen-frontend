import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const DATE_PICKER_MONTHS = Array.from({ length: 12 }, (_, i) => i);
const ITEM_HEIGHT = 44;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function toDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getClampedDate(year: number, month: number, day: number, minimumDate?: Date) {
  const next = new Date(year, month, Math.min(day, getDaysInMonth(year, month)));
  if (minimumDate && next.getTime() < toDateOnly(minimumDate).getTime()) {
    return toDateOnly(minimumDate);
  }
  return next;
}

function getYearOptions(value: Date, minimumDate?: Date) {
  const currentYear = new Date().getFullYear();
  const firstYear = Math.min(
    value.getFullYear(),
    minimumDate?.getFullYear() ?? currentYear - 1,
    currentYear - 1
  );
  const lastYear = Math.max(value.getFullYear(), currentYear + 4);
  return Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
}

function getWheelOffset(index: number) {
  return { x: 0, y: Math.max(0, index * ITEM_HEIGHT) };
}

function getScrollIndex(event: NativeSyntheticEvent<NativeScrollEvent>, maxIndex: number) {
  return Math.max(
    0,
    Math.min(maxIndex, Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT))
  );
}

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
};

export default function DateWheelPicker({ value, onChange, minimumDate }: Props) {
  const selectedYear = value.getFullYear();
  const selectedMonth = value.getMonth();
  const selectedDay = value.getDate();
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);
  const years = getYearOptions(value, minimumDate);
  const minDate = minimumDate ? toDateOnly(minimumDate) : undefined;

  const update = (year: number, month: number, day: number) => {
    onChange(getClampedDate(year, month, day, minDate));
  };

  const isMonthDisabled = (month: number) =>
    !!minDate && selectedYear === minDate.getFullYear() && month < minDate.getMonth();

  const isDayDisabled = (day: number) =>
    !!minDate &&
    selectedYear === minDate.getFullYear() &&
    selectedMonth === minDate.getMonth() &&
    day < minDate.getDate();

  const isYearDisabled = (year: number) => !!minDate && year < minDate.getFullYear();

  return (
    <View style={styles.wheel}>
      {/* 월 */}
      <ScrollView
        style={[styles.column, styles.monthColumn]}
        contentContainerStyle={styles.columnContent}
        contentOffset={getWheelOffset(selectedMonth)}
        decelerationRate="fast"
        disableIntervalMomentum
        keyboardShouldPersistTaps="handled"
        onMomentumScrollEnd={e =>
          update(selectedYear, DATE_PICKER_MONTHS[getScrollIndex(e, DATE_PICKER_MONTHS.length - 1)], selectedDay)
        }
        onScrollEndDrag={e =>
          update(selectedYear, DATE_PICKER_MONTHS[getScrollIndex(e, DATE_PICKER_MONTHS.length - 1)], selectedDay)
        }
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
      >
        {DATE_PICKER_MONTHS.map(month => {
          const isSelected = month === selectedMonth;
          const disabled = isMonthDisabled(month);
          return (
            <TouchableOpacity
              key={month}
              style={styles.item}
              activeOpacity={0.7}
              disabled={disabled}
              onPress={() => update(selectedYear, month, selectedDay)}
            >
              <Text style={[styles.text, isSelected && styles.textSelected, disabled && styles.textDisabled]}>
                {month + 1}월
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 일 */}
      <ScrollView
        style={[styles.column, styles.dayColumn]}
        contentContainerStyle={styles.columnContent}
        contentOffset={getWheelOffset(selectedDay - 1)}
        decelerationRate="fast"
        disableIntervalMomentum
        keyboardShouldPersistTaps="handled"
        onMomentumScrollEnd={e =>
          update(selectedYear, selectedMonth, days[getScrollIndex(e, days.length - 1)])
        }
        onScrollEndDrag={e =>
          update(selectedYear, selectedMonth, days[getScrollIndex(e, days.length - 1)])
        }
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
      >
        {days.map(day => {
          const isSelected = day === selectedDay;
          const disabled = isDayDisabled(day);
          return (
            <TouchableOpacity
              key={day}
              style={styles.item}
              activeOpacity={0.7}
              disabled={disabled}
              onPress={() => update(selectedYear, selectedMonth, day)}
            >
              <Text style={[styles.text, isSelected && styles.textSelected, disabled && styles.textDisabled]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 년 */}
      <ScrollView
        style={[styles.column, styles.yearColumn]}
        contentContainerStyle={styles.columnContent}
        contentOffset={getWheelOffset(Math.max(0, years.indexOf(selectedYear)))}
        decelerationRate="fast"
        disableIntervalMomentum
        keyboardShouldPersistTaps="handled"
        onMomentumScrollEnd={e =>
          update(years[getScrollIndex(e, years.length - 1)], selectedMonth, selectedDay)
        }
        onScrollEndDrag={e =>
          update(years[getScrollIndex(e, years.length - 1)], selectedMonth, selectedDay)
        }
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
      >
        {years.map(year => {
          const isSelected = year === selectedYear;
          const disabled = isYearDisabled(year);
          return (
            <TouchableOpacity
              key={year}
              style={styles.item}
              activeOpacity={0.7}
              disabled={disabled}
              onPress={() => update(year, selectedMonth, selectedDay)}
            >
              <Text style={[styles.text, isSelected && styles.textSelected, disabled && styles.textDisabled]}>
                {year}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const DATE_WHEEL_ITEM_HEIGHT = ITEM_HEIGHT;

const styles = StyleSheet.create({
  wheel: {
    height: ITEM_HEIGHT * 3,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  column: { height: ITEM_HEIGHT * 3 },
  monthColumn: { width: 78 },
  dayColumn: { width: 70 },
  yearColumn: { width: 92 },
  columnContent: { paddingVertical: ITEM_HEIGHT },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: fontSize.base, color: colors.text.secondary, fontWeight: fontWeight.medium },
  textSelected: { color: colors.text.primary, fontWeight: fontWeight.semibold },
  textDisabled: { color: colors.text.dim },
});
