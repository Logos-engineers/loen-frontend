/**
 * app/plan/goal.tsx — 이번주 목표 설정 화면 (피그마 정합 버전)
 * Figma: 6566-57761
 *
 * 레이아웃 구조 (피그마 기준):
 *   헤더 (제목)
 *   ├── [통합 카드]
 *   │     "이번주는 어디를 읽을까요?"
 *   │     성경책 선택 row (dropdown 형태)
 *   │     divider
 *   │     스텝퍼 (N일에 M장)
 *   │     "일주일에 N장 읽게 돼요" 요약
 *   └── [알림 섹션]
 *         "알림 설정" + "관리" 버튼
 *         알림 row 목록 (스와이프 삭제)
 *         "알람 추가하기" 버튼
 *   하단 CTA: [취소] [완료]
 */

import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import { BIBLE_BOOKS } from '@/constants/BibleMeta';
import { AlarmItem, useBiblePlan } from '@/hooks/useBiblePlan';
import { useAlarms } from '@/hooks/useAlarms';
import BibleSelectSheet from '@/components/plan/BibleSelectSheet';
import AlarmTimeSheet from '@/components/plan/AlarmTimeSheet';
import CancelModal from '@/components/plan/CancelModal';
import { TargetIcon, DownButtonIcon, LightMinusButtonIcon, LightPlusButtonIcon, PlusButtonIcon, CheckCircleIcon, CheckCirclePurpleIcon } from '@/components/plan/PlanIcons';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── 상수 ─────────────────────────────────────────────────────────────
const MIN_DAYS = 1, MAX_DAYS = 7;
const MIN_CH = 1,   MAX_CH = 99;

// ─── 요일 표시 유틸 ───────────────────────────────────────────────────
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function fmtDays(days: number[]): string {
  const s = [...days].sort((a, b) => a - b);
  if (s.length === 7) return '매일';
  if (s.length === 5 && [1,2,3,4,5].every(d => s.includes(d))) return '평일';
  if (s.length === 2 && s.includes(0) && s.includes(6)) return '주말';
  return s.map(d => DAY_LABELS[d]).join(', ');
}

function fmtTime(h: number, m: number): string {
  const p = h < 12 ? '오전' : '오후';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${p} ${hh}:${String(m).padStart(2, '0')}`;
}

// ─── 인라인 스텝퍼 ────────────────────────────────────────────────────
type StepperProps = { value: number; min: number; max: number; onDec: () => void; onInc: () => void };
function Stepper({ value, min, max, onDec, onInc }: StepperProps) {
  return (
    <View style={sp.row}>
      <TouchableOpacity style={[sp.btn, value <= min && sp.btnOff]} onPress={value > min ? onDec : undefined} activeOpacity={0.6}>
        <LightMinusButtonIcon width={24} height={24} />
      </TouchableOpacity>
      <View style={sp.center}>
        <Text style={sp.val}>{value}</Text>
      </View>
      <TouchableOpacity style={[sp.btn, value >= max && sp.btnOff]} onPress={value < max ? onInc : undefined} activeOpacity={0.6}>
        <LightPlusButtonIcon width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
}
const sp = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: { alignItems: 'center', justifyContent: 'center' },
  btnOff: { opacity: 0.3 },
  center: { width: 32, alignItems: 'center', justifyContent: 'center' },
  val: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },
});

// ─── 메인 ──────────────────────────────────────────────────────────────
export default function GoalScreen() {
  const { planData, saveGoalAndAlarms, addAlarm, removeAlarm, toggleAlarm } = useBiblePlan();
  const { requestPermission, scheduleAlarm, cancelAlarm } = useAlarms();

  // 로컬 편집 상태
  const [days, setDays] = useState(planData.weeklyGoalDays);
  const [chaptersPerDay, setChaptersPerDay] = useState(planData.weeklyGoalChapters);
  const [selectedBook, setSelectedBook] = useState<string | null>(planData.selectedBookCode);
  const [alarms, setAlarms] = useState<AlarmItem[]>(planData.alarms ?? []);

  // 다이얼로그/시트 표시
  const [showBibleSheet,   setShowBibleSheet]   = useState(false);
  const [showAlarmSheet,   setShowAlarmSheet]   = useState(false);
  const [showCancelModal,  setShowCancelModal]  = useState(false);
  const [isSaving,         setIsSaving]         = useState(false);

  // 변경 감지
  const isDirty =
    days !== planData.weeklyGoalDays ||
    chaptersPerDay !== planData.weeklyGoalChapters ||
    selectedBook !== planData.selectedBookCode ||
    JSON.stringify(alarms) !== JSON.stringify(planData.alarms ?? []);

  // Swipeable ref 관리
  const swipeRefs = useRef<Map<string, Swipeable | null>>(new Map());

  const weeklyTotal = days * chaptersPerDay;

  const selectedBookName =
    selectedBook
      ? BIBLE_BOOKS.find(b => b.code === selectedBook)?.korName ?? selectedBook
      : null;

  // ── 뒤로가기 ─────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (isDirty) setShowCancelModal(true);
    else if (router.canGoBack()) router.back();
  }, [isDirty]);

  // ── 알림 추가 — lazy 권한 요청 ───────────────────────────────────
  const handleAddAlarm = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        '알림 권한 필요',
        '알림을 설정하려면 기기 설정에서 알림 권한을 허용해 주세요.',
        [{ text: '확인' }]
      );
      return;
    }
    setShowAlarmSheet(true);
  }, [requestPermission]);

  // ── AlarmTimeSheet 확정 ───────────────────────────────────────────
  const handleAlarmConfirm = useCallback(
    async (hour: number, minute: number, selectedDays: number[]) => {
      setShowAlarmSheet(false);
      try {
        const id = Date.now().toString();
        const newAlarm = { id, hour, minute, days: selectedDays, enabled: true, notifIds: [] as string[] };
        const notifIds = await scheduleAlarm(newAlarm);
        newAlarm.notifIds = notifIds;
        
        setAlarms(prev => [...prev, newAlarm]);
        // [FIX] 즉시 영구 저장 동기화
        await addAlarm(newAlarm); 
      } catch (e) {
        console.warn('[GoalScreen] 알림 등록 실패', e);
        Alert.alert('알림 등록 실패', '알림을 등록하지 못했습니다. 다시 시도해 주세요.');
      }
    },
    [scheduleAlarm, addAlarm]
  );

  // ── 알림 삭제 ─────────────────────────────────────────────────────
  const handleDeleteAlarm = useCallback(
    async (alarm: AlarmItem) => {
      await cancelAlarm(alarm.notifIds);
      setAlarms(prev => prev.filter(a => a.id !== alarm.id));
      // [FIX] 즉시 영구 저장 동기화
      await removeAlarm(alarm.id);
    },
    [cancelAlarm, removeAlarm]
  );

  // ── 알림 토글 ─────────────────────────────────────────────────────
  const handleToggleAlarm = useCallback(
    async (alarm: AlarmItem, enabled: boolean) => {
      if (enabled) {
        const notifIds = await scheduleAlarm({ ...alarm, enabled });
        setAlarms(prev => prev.map(a => a.id === alarm.id ? { ...a, enabled, notifIds } : a));
      } else {
        await cancelAlarm(alarm.notifIds);
        setAlarms(prev => prev.map(a => a.id === alarm.id ? { ...a, enabled, notifIds: [] } : a));
      }
      // [FIX] 즉시 영구 저장 동기화
      await toggleAlarm(alarm.id, enabled);
    },
    [scheduleAlarm, cancelAlarm, toggleAlarm]
  );

  // ── 저장 (완료 버튼) ──────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await saveGoalAndAlarms(days, chaptersPerDay, selectedBook, alarms);
      router.replace('/plan/goal-success');
    } catch (e) {
      console.warn('[GoalScreen] 저장 실패', e);
      setIsSaving(false);
    }
  }, [days, chaptersPerDay, selectedBook, alarms, saveGoalAndAlarms, isSaving]);

  // ── 스와이프 우측 삭제 버튼 ──────────────────────────────────────
  const renderRightActions = useCallback(
    (_: unknown, __: unknown, alarm: AlarmItem) => (
      <TouchableOpacity style={s.swipeDel} onPress={() => handleDeleteAlarm(alarm)} activeOpacity={0.8}>
        <Text style={s.swipeDelTxt}>삭제</Text>
      </TouchableOpacity>
    ),
    [handleDeleteAlarm]
  );

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* ── 헤더 ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Text style={s.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>이번주 목표 설정</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── 통합 카드 ── */}
        <View style={s.card}>

          {/* 섹션 제목 */}
          <Text style={s.cardTitle}>이번주는 어디를 읽을까요?</Text>

          {/* 성경책 선택 row */}
          <View style={s.cardInnerRow}>
            <TouchableOpacity style={s.bookRow} activeOpacity={0.7} onPress={() => setShowBibleSheet(true)}>
              <Text style={selectedBook ? s.bookName : s.bookPlaceholder}>
                {selectedBookName ?? '창세기'}
              </Text>
              <DownButtonIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* 스텝퍼 자연어 문장 */}
          <View style={s.cardInnerRow}>
            <View style={s.naturalLine}>
              <Stepper
                value={days}
                min={MIN_DAYS}
                max={MAX_DAYS}
                onDec={() => setDays(v => Math.max(MIN_DAYS, v - 1))}
                onInc={() => setDays(v => Math.min(MAX_DAYS, v + 1))}
              />
              <Text style={s.naturalText}>일에</Text>
              <View style={{ width: spacing.md }} />
              <Stepper
                value={chaptersPerDay}
                min={MIN_CH}
                max={MAX_CH}
                onDec={() => setChaptersPerDay(v => Math.max(MIN_CH, v - 1))}
                onInc={() => setChaptersPerDay(v => Math.min(MAX_CH, v + 1))}
              />
              <Text style={s.naturalText}>장씩 읽을게요</Text>
            </View>
          </View>

          {/* 요약 */}
          <View style={s.summaryBox}>
            <TargetIcon width={24} height={24} />
            <Text style={s.summaryText}>
              일주일에 <Text style={s.summaryHighlight}>{weeklyTotal}장</Text> 읽게돼요
            </Text>
          </View>
        </View>

        {/* ── 알림 목록 및 추가 버튼 ── */}
        <View style={s.alarmSectionWrapper}>
          {/* 섹션 헤더 */}
          <View style={s.alarmSectionTop}>
            <Text style={s.cardTitle}>알림 설정</Text>
            {alarms.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  const allEnabled = alarms.every(a => a.enabled);
                  const anyEnabled = alarms.some(a => a.enabled);
                  
                  // 만약 하나라도 켜져있으면 전부 끄기, 모두 꺼져있으면 전부 켜기로 동작
                  if (anyEnabled) {
                    alarms.forEach(a => { if (a.enabled) handleToggleAlarm(a, false); });
                  } else {
                    alarms.forEach(a => { if (!a.enabled) handleToggleAlarm(a, true); });
                  }
                }}
                activeOpacity={0.7}
                style={s.alarmManageBtn}
              >
                {alarms.some(a => a.enabled) ? (
                  <CheckCirclePurpleIcon width={24} height={24} />
                ) : (
                  <CheckCircleIcon width={24} height={24} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* 알림 목록 */}
          {alarms.length === 0 ? (
            <Text style={s.emptyAlarm}>설정된 알림이 없어요</Text>
          ) : (
            <View style={s.alarmList}>
              {alarms.map(alarm => (
                <View key={alarm.id} style={s.alarmCardWrapper}>
                  <Swipeable
                    ref={(ref) => { swipeRefs.current.set(alarm.id, ref); }}
                    renderRightActions={(p, d) => renderRightActions(p, d, alarm)}
                    onSwipeableOpen={() => {
                      swipeRefs.current.forEach((ref, id) => { if (id !== alarm.id) ref?.close(); });
                    }}
                    rightThreshold={60}
                    containerStyle={s.alarmSwipeContainer}
                  >
                    <View style={s.alarmRow}>
                      <View style={s.alarmInfo}>
                        <Text style={s.alarmTime}>{fmtTime(alarm.hour, alarm.minute)}</Text>
                        <Text style={s.alarmDays}>{fmtDays(alarm.days)}</Text>
                      </View>
                      <Switch
                        value={alarm.enabled}
                        onValueChange={v => handleToggleAlarm(alarm, v)}
                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                        thumbColor={alarm.enabled ? colors.primary : colors.text.dim}
                        ios_backgroundColor={colors.border}
                      />
                    </View>
                  </Swipeable>
                </View>
              ))}
            </View>
          )}

          {/* 알람 추가하기 버튼 */}
          <TouchableOpacity style={s.addAlarmCard} activeOpacity={0.7} onPress={handleAddAlarm}>
            <Text style={s.addAlarmText}>알람 추가하기</Text>
            <PlusButtonIcon width={24} height={24} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── 하단 CTA: 취소 / 완료 ── */}
      <View style={s.cta}>
        <TouchableOpacity
          style={[s.ctaBtn, s.ctaBtnCancel]}
          activeOpacity={0.7}
          onPress={handleBack}
        >
          <Text style={[s.ctaBtnText, s.ctaBtnTextCancel]}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.ctaBtn, s.ctaBtnConfirm, isSaving && s.ctaBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={[s.ctaBtnText, s.ctaBtnTextConfirm]}>
            {isSaving ? '저장 중...' : '완료'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 성경책 선택 바텀시트 */}
      <BibleSelectSheet
        visible={showBibleSheet}
        selectedCode={selectedBook}
        onSelect={setSelectedBook}
        onClose={() => setShowBibleSheet(false)}
      />

      {/* 알림 시간/요일 선택 */}
      <AlarmTimeSheet
        visible={showAlarmSheet}
        onConfirm={handleAlarmConfirm}
        onCancel={() => setShowAlarmSheet(false)}
      />

      {/* 취소 확인 모달 */}
      <CancelModal
        visible={showCancelModal}
        onKeepEditing={() => setShowCancelModal(false)}
        onLeave={() => {
          setShowCancelModal(false);
          if (router.canGoBack()) router.back();
        }}
      />

    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.background.base,
  },
  backBtn: { width: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text.primary },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },

  // 스크롤
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xxl, gap: spacing.md },

  // 통합 카드
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  // 성경책 선택 row
  cardInnerRow: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bookName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  bookPlaceholder: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.secondary },

  // 자연어 스텝퍼
  naturalLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  naturalText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },

  // 요약
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  summaryText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.primary },
  summaryHighlight: { fontWeight: fontWeight.bold, color: colors.primary },

  // 알림 섹션 전체 래퍼
  alarmSectionWrapper: {
    paddingHorizontal: 0,
  },
  alarmSectionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  alarmManageBtn: {
    padding: 4,
  },
  
  // 알림 목록
  emptyAlarm: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  alarmList: { marginBottom: spacing.xs },
  alarmCardWrapper: {
    marginBottom: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.background.elevated,
    shadowColor: '#000000',
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
    overflow: 'hidden',
  },
  alarmSwipeContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.elevated,
  },
  alarmInfo: { flex: 1 },
  alarmTime: { fontSize: 20, fontWeight: fontWeight.bold, color: colors.text.primary },
  alarmDays: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },

  // 스와이프 삭제
  swipeDel: {
    backgroundColor: colors.reaction.red,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  swipeDelTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.white },

  // 알람 추가하기 카드
  addAlarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    shadowColor: '#000000',
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
  },
  addAlarmText: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },

  // 하단 CTA
  cta: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.base,
  },
  ctaBtn: {
    flex: 1,
    height: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnCancel: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaBtnConfirm: { backgroundColor: colors.primary },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  ctaBtnTextCancel: { color: colors.text.secondary },
  ctaBtnTextConfirm: { color: colors.white },
});
