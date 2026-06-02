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
  selectedDates: string[];
  todayKey: string;
  onToggleDate: (key: string) => void;
}

export function FaithNoteWeekSelector({
  selectedDates,
  todayKey,
  onToggleDate,
}: FaithNoteWeekSelectorProps) {
  return (
    <View style={styles.container}>
      {DAYS.map((day) => {
        const isSelected = selectedDates.includes(day.key);
        const isToday = day.key === todayKey;
        const isHighlighted = isSelected || isToday;

        return (
          <TouchableOpacity
            key={day.key}
            style={styles.dayWrapper}
            onPress={() => onToggleDate(day.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.dayPill,
                isHighlighted && styles.dayPillActive,
              ]}
            >
              <Text style={[styles.dayLabel, isHighlighted && styles.dayLabelActive]}>
                {day.label}
              </Text>
              <View style={[styles.circle, isHighlighted && styles.circleActive]} />
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
  circle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(13,28,45,0.16)',
  },
  circleActive: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
