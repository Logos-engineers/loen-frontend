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
import TargetIcon from '@/assets/icons/target.svg';
import DownButtonIcon from '@/assets/icons/downbutton.svg';
import LightMinusButtonIcon from '@/assets/icons/LightMinusButton.svg';
import LightPlusButtonIcon from '@/assets/icons/LightPlusButton.svg';
import PlusButtonIcon from '@/assets/icons/PlusButton.svg';
import BackIcon from '@/assets/icons/back.svg';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
const DAY_MAP = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
  return `${p} ${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}시`;
}

// ─── 커스텀 스위치 (과한 Bounce 제거, 짧고 부드러운 Ease) ────────────────────────────────
import { Animated, Easing, Pressable } from 'react-native';
function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const animValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, animValue]);

  // FIX 3: Switch Toggle Color
  const bgInterpolate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(13,28,45,0.16)', '#6554FF'], // Exact Figma tokens for OFF/ON
  });

  const thumbX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 18],
  });

  const thumbColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#FFFFFF'], // Thumb is always white
  });

  return (
    <Pressable style={{ width: 44, height: 28, justifyContent: 'center' }} onPress={() => onValueChange(!value)}>
      <Animated.View style={[{ width: 40, height: 24, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 2 }, { backgroundColor: bgInterpolate }]}>
        <Animated.View style={[{ width: 18, height: 18, borderRadius: 9, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 2 }, { transform: [{ translateX: thumbX }], backgroundColor: thumbColor }]} />
      </Animated.View>
    </Pressable>
  );
}

// ─── 인라인 스텝퍼 ────────────────────────────────────────────────────
type StepperProps = { value: number; min: number; max: number; onDec: () => void; onInc: () => void };
function Stepper({ value, min, max, onDec, onInc }: StepperProps) {
  return (
    <View style={sp.stepperBox}>
      <TouchableOpacity style={[sp.stepperBtn, value <= min && sp.btnOff]} onPress={value > min ? onDec : undefined}>
        <LightMinusButtonIcon width={20} height={20} />
      </TouchableOpacity>
      <View style={sp.stepperValBox}><Text style={sp.stepperVal}>{value}</Text></View>
      <TouchableOpacity style={[sp.stepperBtn, value >= max && sp.btnOff]} onPress={value < max ? onInc : undefined}>
        <LightPlusButtonIcon width={20} height={20} />
      </TouchableOpacity>
    </View>
  );
}
const sp = StyleSheet.create({
  stepperBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f4f7', borderRadius: 8 },
  stepperBtn: { paddingHorizontal: 8, paddingVertical: 8, justifyContent: 'center' },
  stepperValBox: { width: 22, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  stepperVal: { fontSize: 16, fontWeight: '600', color: 'rgba(13,28,45,0.8)' },
  btnOff: { opacity: 0.3 },
});

// ─── 메인 ──────────────────────────────────────────────────────────────
export default function GoalScreen() {
  const { planData, isLoading, saveGoalAndAlarms, addAlarm, removeAlarm, toggleAlarm } = useBiblePlan();
  const { requestPermission, scheduleAlarm, cancelAlarm } = useAlarms();

  // 로컬 편집 상태
  const [days, setDays] = useState(planData.weeklyGoalDays);
  const [chaptersPerDay, setChaptersPerDay] = useState(planData.weeklyGoalChapters);
  const [selectedBook, setSelectedBook] = useState<string | null>(planData.selectedBookCode);
  const [alarms, setAlarms] = useState<AlarmItem[]>(planData.alarms ?? []);

  // 관리 상태
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedAlarmIds, setSelectedAlarmIds] = useState<string[]>([]);

  // [버그 수정] AsyncStorage 로딩 완료 시 데이터를 한 번 UI State로 싱크
  // 컴포넌트 마운트 시 isLoading=true라 빈 배열([])로 초기화되던 현상 방지. 이게 고스트 알람의 주 원인.
  useEffect(() => {
    if (!isLoading) {
      setDays(planData.weeklyGoalDays);
      setChaptersPerDay(planData.weeklyGoalChapters);
      setSelectedBook(planData.selectedBookCode);
      setAlarms(planData.alarms ?? []);
    }
  }, [isLoading]);  // planData 의존성 제외(사용자 인라인 편집 덮어쓰기 방지)

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
    setShowCancelModal(true);
  }, []);

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
        const newAlarm = { id, hour, minute, days: selectedDays, enabled: true, notificationIds: [] as string[] };
        const notificationIds = await scheduleAlarm(newAlarm);
        newAlarm.notificationIds = notificationIds;
        
        setAlarms(prev => [...prev, newAlarm]);
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
      await cancelAlarm(alarm.notificationIds);
      setAlarms(prev => prev.filter(a => a.id !== alarm.id));
      await removeAlarm(alarm.id);
    },
    [cancelAlarm, removeAlarm]
  );

  // ── 알림 토글 ─────────────────────────────────────────────────────
  const handleToggleAlarm = useCallback(
    async (alarm: AlarmItem, enabled: boolean) => {
      if (enabled) {
        if (alarm.notificationIds && alarm.notificationIds.length > 0) {
          await cancelAlarm(alarm.notificationIds);
        }
        const notificationIds = await scheduleAlarm({ ...alarm, enabled });
        setAlarms(prev => prev.map(a => a.id === alarm.id ? { ...a, enabled, notificationIds } : a));
        await toggleAlarm(alarm.id, enabled, notificationIds);
      } else {
        await cancelAlarm(alarm.notificationIds);
        setAlarms(prev => prev.map(a => a.id === alarm.id ? { ...a, enabled, notificationIds: [] } : a));
        await toggleAlarm(alarm.id, enabled, []);
      }
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
      Alert.alert('오류', '목표 저장에 실패했습니다.');
      setIsSaving(false);
    }
  }, [days, chaptersPerDay, selectedBook, alarms, saveGoalAndAlarms, isSaving]);

  // ── 스와이프 우측 삭제 버튼 ──────────────────────────────────────
  const renderRightActions = useCallback(
    (_: unknown, __: unknown, alarm: AlarmItem) => (
      <View style={{ paddingLeft: 8, height: '100%' }}>
        <TouchableOpacity style={s.swipeDel} onPress={() => { 
          handleDeleteAlarm(alarm); 
          Alert.alert('', '1개의 알람을 삭제했어요');
        }} activeOpacity={0.8}>
          <Text style={s.swipeDelTxt}>삭제</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleDeleteAlarm]
  );

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* ── 헤더 ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={s.cardWrapper}>
          <View style={s.card}>

            <View style={s.cardTitleArea}>
              {/* FIX 1: First Card Layout */}
              <Text style={s.cardSubtitle}>이번주는 어디를 읽을까요?</Text>
            </View>

            {/* 성경책 선택 row */}
            <View style={s.cardInnerRow}>
              <TouchableOpacity style={s.bookRow} activeOpacity={0.7} onPress={() => setShowBibleSheet(true)}>
                <View style={s.bookRowTextWrap}>
                  <Text style={selectedBook ? s.bookName : s.bookPlaceholder}>{selectedBookName ?? '창세기'}</Text>
                </View>
                <DownButtonIcon width={24} height={24} />
              </TouchableOpacity>
            </View>

            {/* 스텝퍼 자연어 문장 */}
            <View style={s.stepperRowArea}>
              <View style={s.naturalLine}>
                <Stepper value={days} min={MIN_DAYS} max={MAX_DAYS} onDec={() => setDays(v => Math.max(MIN_DAYS, v - 1))} onInc={() => setDays(v => Math.min(MAX_DAYS, v + 1))} />
                <Text style={s.naturalText}>일에</Text>
                <Stepper value={chaptersPerDay} min={MIN_CH} max={MAX_CH} onDec={() => setChaptersPerDay(v => Math.max(MIN_CH, v - 1))} onInc={() => setChaptersPerDay(v => Math.min(MAX_CH, v + 1))} />
                <Text style={s.naturalText}>장씩 읽을게요</Text>
              </View>
            </View>

            {/* 요약 */}
            <View style={s.summaryBox}>
              <TargetIcon width={24} height={24} />
              <View style={s.summaryTextContainer}>
                <Text style={s.summaryText}>일주일에 {weeklyTotal}장 읽게 돼요</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 알림 설정 섹션 ── */}
        <View style={s.alarmSectionWrapper}>
          <View style={s.alarmSectionTop}>
            <Text style={s.alarmSectionTitle}>알림 설정</Text>
            {!isManageMode && (
              <TouchableOpacity onPress={() => setIsManageMode(true)} activeOpacity={0.7} style={s.manageTag}>
                <Text style={s.manageTagText}>관리</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 알림 목록 */}
          {alarms.length > 0 && (
            <View style={s.alarmList}>
              {alarms.map(alarm => {
                const isSelected = selectedAlarmIds.includes(alarm.id);
                return (
                  <View key={alarm.id} style={s.alarmCardWrapper}>
                    <Swipeable
                      ref={(ref) => { swipeRefs.current.set(alarm.id, ref); }}
                      renderRightActions={(p, d) => renderRightActions(p, d, alarm)}
                      onSwipeableOpen={() => {
                        swipeRefs.current.forEach((ref, id) => { if (id !== alarm.id) ref?.close(); });
                      }}
                      rightThreshold={60}
                      containerStyle={s.alarmSwipeContainer}
                      enabled={!isManageMode}
                    >
                      <View style={s.alarmRow}>
                        <View style={s.alarmInfo}>
                          <Text style={s.alarmTime}>{fmtTime(alarm.hour, alarm.minute)}</Text>
                          <Text style={s.alarmDays}>{fmtDays(alarm.days)}</Text>
                        </View>
                        <View style={s.alarmSwitchArea}>
                          {isManageMode ? (
                            <TouchableOpacity activeOpacity={0.7} onPress={() => {
                              setSelectedAlarmIds(prev =>
                                prev.includes(alarm.id) ? prev.filter(id => id !== alarm.id) : [...prev, alarm.id]
                              );
                            }}>
                              <Ionicons 
                                name="checkmark-circle" 
                                size={24} 
                                color={isSelected ? colors.primary : colors.border} 
                              />
                            </TouchableOpacity>
                          ) : (
                            <CustomSwitch
                              value={alarm.enabled}
                              onValueChange={v => handleToggleAlarm(alarm, v)}
                            />
                          )}
                        </View>
                      </View>
                    </Swipeable>
                  </View>
                );
              })}
            </View>
          )}

          {/* 알람 추가하기 버튼 (분리된 카드) */}
          <View style={s.addAlarmWrapper}>
            <TouchableOpacity style={s.addAlarmCard} activeOpacity={0.7} onPress={handleAddAlarm}>
              <Text style={s.addAlarmText}>알람 추가하기</Text>
              <PlusButtonIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* 빈 알림 표시 (추가하기 밑으로 이동) */}
          {alarms.length === 0 && (
            <Text style={s.emptyAlarm}>설정된 알림이 없어요</Text>
          )}
        </View>

      </ScrollView>

      {/* ── 하단 CTA: 취소 / 완료 / 삭제 ── */}
      {isManageMode ? (
        <View style={s.cta}>
          <TouchableOpacity
            style={[s.ctaBtn, s.ctaBtnCancel]}
            activeOpacity={0.7}
            onPress={() => {
              setIsManageMode(false);
              setSelectedAlarmIds([]);
            }}
          >
            <Text style={[s.ctaBtnText, s.ctaBtnTextCancel]}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.ctaBtn, { backgroundColor: '#FF3B30' }, selectedAlarmIds.length === 0 && s.ctaBtnDisabled]}
            activeOpacity={0.85}
            onPress={async () => {
              if (selectedAlarmIds.length === 0) return;
              const count = selectedAlarmIds.length;
              for (const id of selectedAlarmIds) {
                const alarm = alarms.find(a => a.id === id);
                if (alarm) await handleDeleteAlarm(alarm);
              }
              setIsManageMode(false);
              setSelectedAlarmIds([]);
              Alert.alert('', `${count}개의 알람을 삭제했어요`);
            }}
            disabled={selectedAlarmIds.length === 0}
          >
            <Text style={[s.ctaBtnText, s.ctaBtnTextConfirm]}>
              {selectedAlarmIds.length === 0 ? '삭제하기' : `${selectedAlarmIds.length}개 삭제하기`}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
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
      )}

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
  safe: { flex: 1, backgroundColor: '#f2f4f7' },

  // 헤더
  header: { height: 46, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, backgroundColor: '#f2f4f7' },
  backBtn: { padding: 10, marginLeft: -10, justifyContent: 'center' }, // 컬러/정합 (BackIcon SVG)

  // 스크롤
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  /* ── 1. 첫 번째 카드 (성경/스텝퍼) ── */
  cardWrapper: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingBottom: 16 },
  
  // FIX 1: First Card Layout - spacing between text, dropdown, icon
  cardTitleArea: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 16, justifyContent: 'center' },
  cardSubtitle: { fontSize: 14, fontWeight: '600', color: 'rgba(13,28,45,0.5)' },

  cardInnerRow: { paddingHorizontal: 16, paddingBottom: 16 },
  bookRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: 'rgba(13,28,45,0.16)', paddingBottom: 12 },
  bookRowTextWrap: { flex: 1 },
  bookName: { fontSize: 24, fontWeight: '700', color: '#1B1E26', lineHeight: 36 },
  bookPlaceholder: { fontSize: 24, fontWeight: '700', color: 'rgba(13,28,45,0.5)', lineHeight: 36 },

  stepperRowArea: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  naturalLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  naturalText: { fontSize: 16, fontWeight: '600', color: 'rgba(13,28,45,0.8)' },

  summaryBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  summaryTextContainer: { flex: 1, justifyContent: 'center', paddingLeft: 8, paddingRight: 8 },
  summaryText: { fontSize: 16, fontWeight: '600', color: 'rgba(13,28,45,0.8)', lineHeight: 25.6, textAlign: 'left' },

  /* ── 2. 알람 섹션 ── */
  alarmSectionWrapper: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  
  // FIX 2: "알림 설정" Title Section - text size and margin-bottom
  alarmSectionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  alarmSectionTitle: { fontSize: 18, fontWeight: '700', color: '#1B1E26', lineHeight: 26 },

  manageTag: { backgroundColor: 'rgba(13,28,45,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  manageTagText: { fontSize: 12, fontWeight: '600', color: 'rgba(13,28,45,0.8)', lineHeight: 18, textAlign: 'center' },
  
  alarmList: { gap: 16 },
  emptyAlarm: { fontSize: 14, color: 'rgba(13,28,45,0.5)', textAlign: 'center', paddingVertical: 16 },
  
  alarmCardWrapper: { borderRadius: 16 }, // 스와이프를 위해 border radius 래퍼
  alarmSwipeContainer: { borderRadius: 16 },
  alarmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16 },
  alarmInfo: { flex: 1, flexDirection: 'column' },
  alarmTime: { fontSize: 16, fontWeight: '600', color: 'rgba(13,28,45,0.8)', lineHeight: 25.6 },
  alarmDays: { fontSize: 12, fontWeight: '500', color: 'rgba(13,28,45,0.5)', lineHeight: 18, marginTop: 2 },
  alarmSwitchArea: { justifyContent: 'center', paddingLeft: 8 },

  swipeDel: { backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center', width: 74, height: '100%', borderRadius: 16 },
  swipeDelTxt: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  addAlarmWrapper: { paddingTop: 8 },
  addAlarmCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16 },
  addAlarmText: { fontSize: 16, fontWeight: '600', color: 'rgba(13,28,45,0.8)', lineHeight: 25.6 },

  // 하단 CTA
  cta: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, backgroundColor: '#f2f4f7' },
  ctaBtn: { flex: 1, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ctaBtnCancel: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB' },
  ctaBtnConfirm: { backgroundColor: '#6561FF' },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { fontSize: 16, fontWeight: 'bold' },
  ctaBtnTextCancel: { color: 'rgba(13,28,45,0.5)' },
  ctaBtnTextConfirm: { color: '#FFFFFF' },
});
