import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type ChallengeAlarm = {
  id: string;
  hour: number;
  minute: number;
  weekdays: number[];
  notificationIds: string[];
  enabled: boolean;
};

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

export default function ChallengeVisibilityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [visibility, setVisibility] = useState<'public' | 'oikos' | 'link'>('public');
  const [encouragementNotificationEnabled, setEncouragementNotificationEnabled] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // 알람 상태
  const [alarms, setAlarms] = useState<ChallengeAlarm[]>([]);
  const [isAlarmSheetOpen, setIsAlarmSheetOpen] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  
  // 관리 모드 상태
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedAlarmIdsForDelete, setSelectedAlarmIdsForDelete] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // 권한 미리 요청 (필요한 경우)
    Notifications.requestPermissionsAsync();
  }, []);

  const handleBack = () => {
    if (isManageMode) {
      handleCancelManage();
    } else {
      setIsExitModalOpen(true);
    }
  };

  const handleComplete = async () => {
    const challengeData = {
      challengeName: params.challengeName,
      selectedBooks: params.selectedBooks ? JSON.parse(params.selectedBooks as string) : [],
      totalChapters: Number(params.totalChapters || 0),
      startDate: params.startDate,
      endDate: params.endDate,
      alarms,
      visibility,
    };

    try {
      await AsyncStorage.setItem('LOEN_BIBLE_CHALLENGE_CREATED_v1', JSON.stringify(challengeData));
    } catch (error) {
      console.warn('챌린지 저장 실패:', error);
    }

    router.push('/challenge/complete');
  };

  const openAlarmSheet = () => {
    setSelectedTime(new Date());
    setSelectedWeekdays([]);
    setIsAlarmSheetOpen(true);
  };

  const closeAlarmSheet = () => {
    setIsAlarmSheetOpen(false);
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
    const notificationIds: string[] = [];

    // 요일별 알람 스케줄링
    for (const dayIndex of selectedWeekdays) {
      // expo-notifications weekday: 1(일) ~ 7(토)
      // dayIndex: 0(월) ~ 6(일)
      const expoWeekday = dayIndex === 6 ? 1 : dayIndex + 2;

      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '성경 읽기 알림',
            body: '오늘 성경 읽을 시간이에요!',
          },
          trigger: {
            hour,
            minute,
            weekday: expoWeekday,
            repeats: true,
          },
        });
        notificationIds.push(id);
      } catch (error) {
        console.warn('알람 스케줄링 실패:', error);
      }
    }

    const newAlarm: ChallengeAlarm = {
      id: Date.now().toString(),
      hour,
      minute,
      weekdays: [...selectedWeekdays],
      notificationIds,
      enabled: true,
    };

    setAlarms(prev => [...prev, newAlarm]);
    closeAlarmSheet();
  };

  const getWeekdayText = (weekdays: number[]) => {
    if (weekdays.length === 7) return '매일';
    if (weekdays.length === 1) return `${WEEKDAYS[weekdays[0]]}요일마다`;
    return weekdays.sort().map(idx => WEEKDAYS[idx]).join(',') + '마다';
  };

  const formatTimeText = (hour: number, minute: number) => {
    const isPM = hour >= 12;
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${isPM ? '오후' : '오전'} ${displayHour}:${displayMinute}`;
  };

  const handleManageAlarm = () => {
    setIsManageMode(true);
    setSelectedAlarmIdsForDelete([]);
  };

  const handleCancelManage = () => {
    setIsManageMode(false);
    setSelectedAlarmIdsForDelete([]);
  };

  const toggleAlarmDeleteSelection = (id: string) => {
    setSelectedAlarmIdsForDelete(prev => 
      prev.includes(id) ? prev.filter(alarmId => alarmId !== id) : [...prev, id]
    );
  };

  const handleDeleteAlarms = async () => {
    if (selectedAlarmIdsForDelete.length === 0) return;

    const alarmsToDelete = alarms.filter(a => selectedAlarmIdsForDelete.includes(a.id));
    
    // 알림 스케줄 취소
    for (const alarm of alarmsToDelete) {
      for (const notiId of alarm.notificationIds) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notiId);
        } catch (error) {
          console.warn('알림 취소 실패:', error);
        }
      }
    }

    const deleteCount = selectedAlarmIdsForDelete.length;
    setAlarms(prev => prev.filter(a => !selectedAlarmIdsForDelete.includes(a.id)));
    handleCancelManage();
    
    // 토스트 띄우기
    setToastMessage(`${deleteCount}개의 알람을 삭제했어요`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isManageMode ? '삭제할 알람 선택' : '성경 챌린지 만들기'}
        </Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View pointerEvents={isManageMode ? 'none' : 'auto'} style={{ opacity: isManageMode ? 0.3 : 1 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>챌린지 공개</Text>
          </View>

          {/* 공개범위 설정 카드들 */}
          <TouchableOpacity 
            style={styles.optionCard} 
            activeOpacity={0.7} 
            onPress={() => setVisibility('public')}
          >
            <View style={styles.optionIconWrapper}>
              <Ionicons name="people" size={24} color={colors.text.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>전체 공개</Text>
              <Text style={styles.optionDescription} numberOfLines={1}>
                로고스 청년 모두에게 공개되며,...
              </Text>
            </View>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color={visibility === 'public' ? colors.primary : colors.border} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard} 
            activeOpacity={0.7} 
            onPress={() => setVisibility('oikos')}
          >
            <View style={styles.optionIconWrapper}>
              <Ionicons name="person" size={24} color={colors.text.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>오이코스 공개</Text>
              <Text style={styles.optionDescription} numberOfLines={1}>
                오이코스원에게만 공개되며, 오이코스원만...
              </Text>
            </View>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color={visibility === 'oikos' ? colors.primary : colors.border} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, { marginBottom: spacing.xxl }]} 
            activeOpacity={0.7} 
            onPress={() => setVisibility('link')}
          >
            <View style={styles.optionIconWrapper}>
              <Ionicons name="link" size={24} color={colors.text.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>링크로 공개</Text>
              <Text style={styles.optionDescription} numberOfLines={1}>
                챌린지 생성 완료 후 공유한 링크를 전달 받은...
              </Text>
            </View>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color={visibility === 'link' ? colors.primary : colors.border} 
            />
          </TouchableOpacity>
        </View>

        {/* 알람 설정 섹션 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>알람 설정</Text>
          {!isManageMode && (
            <TouchableOpacity style={styles.manageBadge} onPress={handleManageAlarm} activeOpacity={0.7}>
              <Text style={styles.manageBadgeText}>관리</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.settingCard} 
          activeOpacity={0.7} 
          onPress={isManageMode ? undefined : openAlarmSheet}
          disabled={isManageMode}
        >
          <Text style={[styles.settingTitle, isManageMode && { color: colors.text.tertiary }]}>알람 추가하기</Text>
          <Ionicons name="add" size={24} color={isManageMode ? colors.text.tertiary : colors.text.secondary} />
        </TouchableOpacity>

        {/* 알람 리스트 */}
        {alarms.map(alarm => (
          <View key={alarm.id} style={styles.alarmRowCard}>
            <View style={styles.alarmRowLeft}>
              <Text style={styles.alarmTimeText}>{formatTimeText(alarm.hour, alarm.minute)}</Text>
              <Text style={styles.alarmWeekdayText}>{getWeekdayText(alarm.weekdays)}</Text>
            </View>
            {isManageMode ? (
              <TouchableOpacity onPress={() => toggleAlarmDeleteSelection(alarm.id)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={selectedAlarmIdsForDelete.includes(alarm.id) ? colors.primary : colors.border} 
                />
              </TouchableOpacity>
            ) : (
              <Switch
                value={alarm.enabled}
                onValueChange={() => {}} // 임시
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.border}
              />
            )}
          </View>
        ))}

        <View style={[styles.settingCard, { marginTop: spacing.md }]}>
          <View style={styles.settingTitleWrapper}>
            <Text style={[styles.settingTitle, isManageMode && { color: colors.text.tertiary }]}>맞춤형 독려 알림</Text>
            <Ionicons name="help-circle" size={18} color={isManageMode ? colors.text.tertiary : colors.text.secondary} style={styles.helpIcon} />
          </View>
          <Switch
            value={encouragementNotificationEnabled}
            onValueChange={setEncouragementNotificationEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.border}
            disabled={isManageMode}
          />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 하단 버튼 영역 */}
      <View style={styles.footer}>
        {isManageMode ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={handleCancelManage}
              activeOpacity={0.7}
            >
              <Text style={styles.btnTextCancel}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, selectedAlarmIdsForDelete.length > 0 ? { backgroundColor: '#FF5A5A' } : styles.btnCancel]}
              onPress={handleDeleteAlarms}
              activeOpacity={0.8}
              disabled={selectedAlarmIdsForDelete.length === 0}
            >
              <Text style={[styles.btnTextActive, selectedAlarmIdsForDelete.length === 0 && { color: colors.primary }]}>
                {selectedAlarmIdsForDelete.length > 0 ? `${selectedAlarmIdsForDelete.length}개 삭제하기` : '삭제하기'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.btnTextCancel}>이전으로</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnActive]}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              <Text style={styles.btnTextActive}>완료</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 토스트 메시지 */}
      {toastMessage && (
        <View style={[styles.toastContainer, { bottom: insets.bottom + 90 }]}>
          <View style={styles.toastContent}>
            <View style={styles.toastIconWrapper}>
              <Ionicons name="checkmark" size={16} color={colors.white} />
            </View>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* 알람 추가 바텀시트 */}
      <Modal visible={isAlarmSheetOpen} transparent animationType="slide" onRequestClose={closeAlarmSheet}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={styles.sheetDimArea} activeOpacity={1} onPress={closeAlarmSheet} />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            
            <View style={styles.sheetPickerContainer}>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="spinner"
                locale="en-US"
                onChange={(event, date) => date && setSelectedTime(date)}
                style={{ width: '100%', height: 180 }}
                textColor={colors.text.primary}
              />
            </View>

            <View style={styles.weekdaySection}>
              <View style={styles.weekdayHeader}>
                <Text style={styles.weekdayTitle}>요일 선택</Text>
                <Text style={styles.weekdaySummary}>{selectedWeekdays.length > 0 ? getWeekdayText(selectedWeekdays) : ''}</Text>
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

            <View style={styles.sheetButtonRow}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={closeAlarmSheet} activeOpacity={0.7}>
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

      {/* 이탈 방지 모달 */}
      <Modal visible={isExitModalOpen} transparent animationType="fade" onRequestClose={() => setIsExitModalOpen(false)}>
        <View style={styles.modalOverlayCenter}>
          <View style={styles.exitModalCard}>
            <Text style={styles.exitModalText}>지금까지 입력한 내용이 저장되지 않아요</Text>
            <View style={styles.exitModalBtnRow}>
              <TouchableOpacity style={[styles.exitModalBtn, styles.exitModalBtnStay]} onPress={() => setIsExitModalOpen(false)} activeOpacity={0.8}>
                <Text style={styles.exitModalBtnTextStay}>머무르기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.exitModalBtn, styles.exitModalBtnLeave]} onPress={() => router.replace('/(tabs)')} activeOpacity={0.8}>
                <Text style={styles.exitModalBtnTextLeave}>나가기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  
  // 헤더
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.base,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  headerRightSpace: {
    width: 32,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  manageBadge: {
    backgroundColor: '#F0F0F5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  manageBadgeText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    fontWeight: fontWeight.semibold,
  },

  // 공개범위 카드
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIconWrapper: {
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  optionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },

  // 기타 설정 카드 (알람 추가, 맞춤형 알림)
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  helpIcon: {
    marginLeft: 6,
  },

  // 알람 리스트 아이템
  alarmRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alarmRowLeft: {
    flex: 1,
  },
  alarmTimeText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  alarmWeekdayText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },

  // 하단 버튼
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: colors.primaryLight,
  },
  btnTextCancel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  btnActive: {
    backgroundColor: colors.primary,
  },
  btnDisabled: {
    backgroundColor: colors.border,
  },
  btnTextActive: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },

  // 알람 추가 바텀시트
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetDimArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.background.base,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  sheetPickerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  weekdaySection: {
    marginBottom: spacing.xxl,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weekdaySummary: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  weekdayTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayCircleActive: {
    backgroundColor: colors.primary,
  },
  weekdayText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  weekdayTextActive: {
    color: colors.white,
  },
  sheetButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // 토스트 메시지
  toastContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 50, 0.95)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  toastIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  toastText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // 이탈 방지 모달
  modalOverlayCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  exitModalCard: {
    width: '80%',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  exitModalText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  exitModalBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  exitModalBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitModalBtnStay: {
    backgroundColor: '#F0F0F5',
  },
  exitModalBtnTextStay: {
    color: colors.text.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  exitModalBtnLeave: {
    backgroundColor: '#FF5A5A',
  },
  exitModalBtnTextLeave: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
