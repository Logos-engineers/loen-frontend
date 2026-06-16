/**
 * components/plan/AlarmTimeSheet.tsx
 * 시간 + 요일 선택 오버레이.
 *
 * 수정 사항:
 * - iOS: DateTimePicker에 명시적 height: 216 부여 (0px 빈 화면 문제 해결)
 * - Android: 버튼 → 시스템 피커 다이얼로그 (modal=true)
 * - 요일 선택: 월~일 순서 7개 원형 버튼
 * - 하단: "취소" / "추가" 버튼
 */

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import TimeWheelPicker from '@/components/challenge/TimeWheelPicker';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── 요일 레이블 (월~일 순) ───────────────────────────────────────────
// 표시 순서: 월(1) 화(2) 수(3) 목(4) 금(5) 토(6) 일(0)
const DAY_DISPLAY = [
  { label: '월', value: 1 },
  { label: '화', value: 2 },
  { label: '수', value: 3 },
  { label: '목', value: 4 },
  { label: '금', value: 5 },
  { label: '토', value: 6 },
  { label: '일', value: 0 },
];

type Props = {
  visible: boolean;
  initialAlarm?: { hour: number; minute: number; days: number[] };
  onConfirm: (hour: number, minute: number, days: number[]) => void;
  onCancel: () => void;
};

export default function AlarmTimeSheet({ visible, initialAlarm, onConfirm, onCancel }: Props) {
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(initialAlarm?.hour ?? 7, initialAlarm?.minute ?? 0, 0, 0);
    return d;
  });
  // 기본 선택 요일: 평일 (1~5)
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialAlarm?.days ?? [1, 2, 3, 4, 5]
  );

  const toggleDay = useCallback((day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedDays.length === 0) return;
    onConfirm(date.getHours(), date.getMinutes(), [...selectedDays].sort((a, b) => a - b));
  }, [date, selectedDays, onConfirm]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      {/* 배경 딤 */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />

      {/* 시트 본체 */}
      <View style={styles.sheet}>
        {/* 핸들 바 */}
        <View style={styles.handle} />

        <Text style={styles.sheetTitle}>알림 시간 설정</Text>

        {/* ── 시간 선택 (휠) ── iOS/Android 공통 커스텀 휠 */}
        <View style={styles.wheelWrapper}>
          <TimeWheelPicker value={date} onChange={setDate} visibleItems={5} />
        </View>

        <View style={styles.divider} />

        {/* ── 요일 선택 ── */}
        <Text style={styles.dayLabel}>반복 요일</Text>
        <View style={styles.dayRow}>
          {DAY_DISPLAY.map(({ label, value }) => {
            const isSelected = selectedDays.includes(value);
            return (
              <TouchableOpacity
                key={value}
                style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}
                activeOpacity={0.7}
                onPress={() => toggleDay(value)}
              >
                <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 요일 미선택 경고 */}
        {selectedDays.length === 0 && (
          <Text style={styles.dayWarning}>최소 1개 요일을 선택해 주세요.</Text>
        )}

        {/* ── 하단 버튼 ── */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnCancel]}
            activeOpacity={0.7}
            onPress={onCancel}
          >
            <Text style={[styles.btnText, styles.btnTextCancel]}>취소</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnAdd, selectedDays.length === 0 && styles.btnDisabled]}
            activeOpacity={selectedDays.length === 0 ? 1 : 0.85}
            onPress={handleConfirm}
            disabled={selectedDays.length === 0}
          >
            <Text style={[styles.btnText, styles.btnTextAdd]}>추가</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const DAY_CIRCLE = 36;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay.default,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: 36,          // 홈 인디케이터 여유
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  // 시간 휠 영역
  wheelWrapper: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  dayLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dayCircle: {
    width: DAY_CIRCLE,
    height: DAY_CIRCLE,
    borderRadius: DAY_CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  dayWarning: {
    fontSize: fontSize.xs,
    color: colors.reaction.red,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: colors.background.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnAdd: {
    backgroundColor: colors.primary,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  btnTextCancel: {
    color: colors.text.secondary,
  },
  btnTextAdd: {
    color: colors.white,
  },
});
