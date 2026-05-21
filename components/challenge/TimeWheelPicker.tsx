import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { TimePeriod } from './challengeTypes';
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

const ITEM_HEIGHT = 44;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'] as const;

function getScrollIndex(event: NativeSyntheticEvent<NativeScrollEvent>, maxIndex: number) {
  return Math.max(
    0,
    Math.min(maxIndex, Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT))
  );
}

function getWheelOffset(index: number) {
  return { x: 0, y: Math.max(0, index * ITEM_HEIGHT) };
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

  const update = (nextHour: number, nextMinute: number, nextPeriod: TimePeriod) => {
    onChange(buildDate(value, nextHour, nextMinute, nextPeriod));
  };

  return (
    <View style={styles.wheel}>
      {/* 시 */}
      <ScrollView
        style={[styles.column, styles.numberColumn]}
        contentContainerStyle={styles.columnContent}
        contentOffset={getWheelOffset(hour12 - 1)}
        decelerationRate="fast"
        disableIntervalMomentum
        keyboardShouldPersistTaps="handled"
        onMomentumScrollEnd={e => update(HOURS[getScrollIndex(e, HOURS.length - 1)], minute, period)}
        onScrollEndDrag={e => update(HOURS[getScrollIndex(e, HOURS.length - 1)], minute, period)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
      >
        {HOURS.map(h => (
          <TouchableOpacity key={h} style={styles.item} activeOpacity={0.7} onPress={() => update(h, minute, period)}>
            <Text style={[styles.text, h === hour12 && styles.textSelected]}>{h}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.colon}>:</Text>

      {/* 분 */}
      <ScrollView
        style={[styles.column, styles.numberColumn]}
        contentContainerStyle={styles.columnContent}
        contentOffset={getWheelOffset(minute)}
        decelerationRate="fast"
        disableIntervalMomentum
        keyboardShouldPersistTaps="handled"
        onMomentumScrollEnd={e => update(hour12, MINUTES[getScrollIndex(e, MINUTES.length - 1)], period)}
        onScrollEndDrag={e => update(hour12, MINUTES[getScrollIndex(e, MINUTES.length - 1)], period)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
      >
        {MINUTES.map(m => (
          <TouchableOpacity key={m} style={styles.item} activeOpacity={0.7} onPress={() => update(hour12, m, period)}>
            <Text style={[styles.text, m === minute && styles.textSelected]}>
              {m.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* AM/PM */}
      <ScrollView
        style={[styles.column, styles.periodColumn]}
        contentContainerStyle={styles.columnContent}
        contentOffset={getWheelOffset(PERIODS.indexOf(period))}
        decelerationRate="fast"
        disableIntervalMomentum
        keyboardShouldPersistTaps="handled"
        onMomentumScrollEnd={e => update(hour12, minute, PERIODS[getScrollIndex(e, PERIODS.length - 1)])}
        onScrollEndDrag={e => update(hour12, minute, PERIODS[getScrollIndex(e, PERIODS.length - 1)])}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
      >
        {PERIODS.map(p => (
          <TouchableOpacity key={p} style={styles.item} activeOpacity={0.7} onPress={() => update(hour12, minute, p)}>
            <Text style={[styles.text, p === period && styles.textSelected]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    height: ITEM_HEIGHT * 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  column: { height: ITEM_HEIGHT * 3 },
  numberColumn: { width: 72 },
  periodColumn: { width: 78 },
  columnContent: { paddingVertical: ITEM_HEIGHT },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: fontSize.base, color: colors.text.secondary, fontWeight: fontWeight.medium },
  textSelected: { color: colors.text.primary, fontWeight: fontWeight.semibold },
  colon: {
    width: 10,
    height: ITEM_HEIGHT * 3,
    lineHeight: ITEM_HEIGHT * 3,
    textAlign: 'center',
    fontSize: fontSize.base,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
});
