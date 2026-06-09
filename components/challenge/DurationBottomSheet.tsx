import BottomSheet from '@/components/ui/overlay/BottomSheet';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateWheelPicker from './DateWheelPicker';
import { DurationTab } from './challengeTypes';

type DurationResult = {
  durationDays: number;
  dailyChapters: number;
  endDate: Date;
  activeTab: DurationTab;
};

type Props = {
  visible: boolean;
  startDate: Date;
  initialDurationDays?: number;
  initialDailyChapters?: number;
  initialEndDate?: Date;
  initialTab?: DurationTab;
  onClose: () => void;
  onConfirm: (result: DurationResult) => void;
};

const TABS: DurationTab[] = ['duration', 'daily', 'end'];
const TAB_LABELS: Record<DurationTab, string> = {
  duration: '기간기준',
  daily: '하루기준',
  end: '마감기준',
};

export default function DurationBottomSheet({
  visible,
  startDate,
  initialDurationDays = 7,
  initialDailyChapters = 3,
  initialEndDate,
  initialTab = 'duration',
  onClose,
  onConfirm,
}: Props) {
  const [activeTab, setActiveTab] = useState<DurationTab>(initialTab);
  const [durationDays, setDurationDays] = useState(initialDurationDays);
  const [dailyChapters, setDailyChapters] = useState(initialDailyChapters);
  const [endDate, setEndDate] = useState<Date>(initialEndDate ?? startDate);

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      setDurationDays(initialDurationDays);
      setDailyChapters(initialDailyChapters);
      setEndDate(initialEndDate ?? startDate);
    }
  }, [visible]);

  const footerSummary = () => {
    if (activeTab === 'duration') return `${Math.max(1, durationDays)}일동안 읽어요`;
    if (activeTab === 'daily') return `하루에 약 ${Math.max(1, dailyChapters)}장씩 읽어요`;
    return `${Math.max(1, durationDays)}일동안, 하루 약 ${Math.max(1, dailyChapters)}장씩 읽어요`;
  };

  // 칩 3개(기간/하루/마감) 중 현재 선택된 한 가지 기준으로 바로 확정
  const handleComplete = () => {
    onConfirm({ durationDays, dailyChapters, endDate, activeTab });
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      disableContentPadding
      footer={
        <>
          <View style={styles.summaryRow}>
            <Ionicons name="disc" size={20} color="#FF5A5A" style={{ marginRight: 6 }} />
            <Text style={styles.summaryText}>{footerSummary()}</Text>
          </View>
          <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.8} onPress={handleComplete}>
            <Text style={styles.confirmBtnText}>완료</Text>
          </TouchableOpacity>
        </>
      }
    >
      <View>
          {/* 탭 헤더 */}
          <View style={styles.tabRow}>
            {TABS.map(tab => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {TAB_LABELS[tab]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 탭 콘텐츠 */}
          <View style={styles.content}>
            {activeTab === 'duration' && (
              <View style={styles.counterRow}>
                <View style={styles.counterWrapper}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setDurationDays(Math.max(1, durationDays - 1))}
                  >
                    <Ionicons name="remove" size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{durationDays}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setDurationDays(durationDays + 1)}
                  >
                    <Ionicons name="add" size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.counterLabel}>일 동안</Text>
              </View>
            )}

            {activeTab === 'daily' && (
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>하루에</Text>
                <View style={styles.counterWrapper}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setDailyChapters(Math.max(1, dailyChapters - 1))}
                  >
                    <Ionicons name="remove" size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{dailyChapters}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setDailyChapters(dailyChapters + 1)}
                  >
                    <Ionicons name="add" size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.counterLabel}>장씩</Text>
              </View>
            )}

            {activeTab === 'end' && (
              <DateWheelPicker
                value={endDate}
                onChange={setEndDate}
                minimumDate={startDate}
              />
            )}
          </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: colors.background.base,
  },
  tabActive: { backgroundColor: colors.primaryLight },
  tabText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.secondary },
  tabTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  content: {
    paddingHorizontal: spacing.xl,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  counterLabel: { fontSize: fontSize.lg, color: colors.text.primary, fontWeight: fontWeight.medium },
  counterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.base,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  counterBtn: { padding: spacing.sm },
  counterValue: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  summaryText: { fontSize: fontSize.sm, color: colors.text.primary, fontWeight: fontWeight.medium },
  confirmBtn: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
