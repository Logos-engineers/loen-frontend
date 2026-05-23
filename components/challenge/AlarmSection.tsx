import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TimeWheelPicker from './TimeWheelPicker';
import {
  ChallengeAlarm,
  WEEKDAYS,
  formatTimeText,
  getWeekdayText,
  scheduleWeeklyAlarm,
} from './challengeTypes';

type Props = {
  alarms: ChallengeAlarm[];
  onAlarmsChange: (alarms: ChallengeAlarm[]) => void;
  isManageMode: boolean;
  onManageModeChange: (active: boolean) => void;
  selectedForDelete: string[];
  onSelectedForDeleteChange: (ids: string[]) => void;
};

export default function AlarmSection({
  alarms,
  onAlarmsChange,
  isManageMode,
  onManageModeChange,
  selectedForDelete,
  onSelectedForDeleteChange,
}: Props) {
  const insets = useSafeAreaInsets();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);

  const openSheet = () => {
    setSelectedTime(new Date());
    setSelectedWeekdays([]);
    setIsSheetOpen(true);
  };

  const toggleWeekday = (index: number) => {
    setSelectedWeekdays(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSaveAlarm = async () => {
    if (selectedWeekdays.length === 0) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        alert('알람을 설정하려면 알림 권한이 필요합니다.');
        return;
      }
    }

    const hour = selectedTime.getHours();
    const minute = selectedTime.getMinutes();
    const notificationIds = await scheduleWeeklyAlarm(hour, minute, selectedWeekdays, {
      title: '성경 읽기 알림',
      body: '오늘 성경 읽을 시간이에요!',
    });

    const newAlarm: ChallengeAlarm = {
      id: Date.now().toString(),
      hour,
      minute,
      weekdays: [...selectedWeekdays],
      notificationIds,
      enabled: true,
    };
    onAlarmsChange([...alarms, newAlarm]);
    setIsSheetOpen(false);
  };

  const toggleAlarmEnabled = (id: string) => {
    onAlarmsChange(alarms.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  };

  const toggleDeleteSelection = (id: string) => {
    const next = selectedForDelete.includes(id)
      ? selectedForDelete.filter(i => i !== id)
      : [...selectedForDelete, id];
    onSelectedForDeleteChange(next);
  };

  return (
    <>
      {/* 섹션 헤더 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>알람 설정</Text>
        {!isManageMode && (
          <TouchableOpacity
            style={styles.manageBadge}
            onPress={() => onManageModeChange(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.manageBadgeText}>관리</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 알람 추가하기 */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={isManageMode ? undefined : openSheet}
        disabled={isManageMode}
      >
        <Text style={[styles.cardTitle, isManageMode && styles.dimText]}>알람 추가하기</Text>
        <Ionicons name="add" size={24} color={isManageMode ? colors.text.dim : colors.text.secondary} />
      </TouchableOpacity>

      {/* 알람 목록 */}
      {alarms.map(alarm => (
        <View key={alarm.id} style={styles.alarmCard}>
          <View style={styles.alarmLeft}>
            <Text style={styles.alarmTime}>{formatTimeText(alarm.hour, alarm.minute)}</Text>
            <Text style={styles.alarmDays}>{getWeekdayText(alarm.weekdays)}</Text>
          </View>
          {isManageMode ? (
            <TouchableOpacity
              onPress={() => toggleDeleteSelection(alarm.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={selectedForDelete.includes(alarm.id) ? colors.primary : colors.border}
              />
            </TouchableOpacity>
          ) : (
            <Switch
              value={alarm.enabled}
              onValueChange={() => toggleAlarmEnabled(alarm.id)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.border}
            />
          )}
        </View>
      ))}

      {/* 알람 추가 바텀시트 */}
      <Modal visible={isSheetOpen} transparent animationType="slide" onRequestClose={() => setIsSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setIsSheetOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <View style={styles.handleWrapper}>
              <View style={styles.sheetHandle} />
            </View>

            <TimeWheelPicker value={selectedTime} onChange={setSelectedTime} />

            <View style={styles.weekdaySection}>
              <View style={styles.weekdayHeader}>
                <Text style={styles.weekdayTitle}>요일 선택</Text>
                <Text style={styles.weekdaySummary}>
                  {selectedWeekdays.length > 0 ? getWeekdayText(selectedWeekdays) : ''}
                </Text>
              </View>
              <View style={styles.weekdayRow}>
                {WEEKDAYS.map((day, index) => {
                  const isSelected = selectedWeekdays.includes(index);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.weekdayCircle, isSelected && styles.weekdayCircleActive]}
                      onPress={() => toggleWeekday(index)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.weekdayText, isSelected && styles.weekdayTextActive]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setIsSheetOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.btnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, selectedWeekdays.length > 0 ? styles.btnActive : styles.btnDisabled]}
                onPress={handleSaveAlarm}
                activeOpacity={0.8}
                disabled={selectedWeekdays.length === 0}
              >
                <Text style={styles.btnTextActive}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  manageBadge: {
    backgroundColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xs,
  },
  manageBadgeText: { fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: fontWeight.semibold },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  dimText: { color: colors.text.dim },

  alarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  alarmLeft: { flex: 1 },
  alarmTime: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: 4 },
  alarmDays: { fontSize: fontSize.xs, color: colors.text.secondary },

  // 알람 추가 시트
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 12,
    paddingHorizontal: spacing.xl,
  },
  handleWrapper: { alignItems: 'center', paddingBottom: spacing.xl },
  sheetHandle: { width: 48, height: 4, borderRadius: 2, backgroundColor: colors.border },

  weekdaySection: { marginBottom: spacing.xxl },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weekdayTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.primary },
  weekdaySummary: { fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: fontWeight.medium },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekdayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayCircleActive: { backgroundColor: colors.primary },
  weekdayText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.primary },
  weekdayTextActive: { color: colors.white },

  sheetFooter: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: colors.primaryLight },
  btnActive: { backgroundColor: colors.primary },
  btnDisabled: { backgroundColor: 'rgba(101,97,255,0.3)' },
  btnTextCancel: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.primary },
  btnTextActive: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.white },
});
