import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from '@/utils/notifications';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Switch
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// --- 상수 및 헬퍼 ---
const BIBLE_BOOKS = [
  '창세기', '출애굽기', '레위기', '민수기', '신명기', '여호수아', '사사기', '룻기', '사무엘상', '사무엘하',
  '열왕기상', '열왕기하', '역대상', '역대하', '에스라', '느헤미야', '에스더', '욥기', '시편', '잠언',
  '전도서', '아가', '이사야', '예레미야', '예레미야애가', '에스겔', '다니엘', '호세아', '요엘', '아모스',
  '오바댜', '요나', '미가', '나훔', '하박국', '스바냐', '학개', '스가랴', '말라기',
  '마태복음', '마가복음', '누가복음', '요한복음', '사도행전', '로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서',
  '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서', '디모데후서', '디도서', '빌레몬서', '히브리서', '야고보서',
  '베드로전서', '베드로후서', '요한일서', '요한이서', '요한삼서', '유다서', '요한계시록'
];

const BIBLE_CHAPTERS: Record<string, number> = {
  '창세기': 50, '출애굽기': 40, '레위기': 27, '민수기': 36, '신명기': 34, '여호수아': 24, '사사기': 21, '룻기': 4,
  '사무엘상': 31, '사무엘하': 24, '열왕기상': 22, '열왕기하': 25, '역대상': 29, '역대하': 36, '에스라': 10, '느헤미야': 13,
  '에스더': 10, '욥기': 42, '시편': 150, '잠언': 31, '전도서': 12, '아가': 8, '이사야': 66, '예레미야': 52, '예레미야애가': 5,
  '에스겔': 48, '다니엘': 12, '호세아': 14, '요엘': 3, '아모스': 9, '오바댜': 1, '요나': 4, '미가': 7, '나훔': 3, '하박국': 3,
  '스바냐': 3, '학개': 2, '스가랴': 14, '말라기': 4,
  '마태복음': 28, '마가복음': 16, '누가복음': 24, '요한복음': 21, '사도행전': 28, '로마서': 16, '고린도전서': 16, '고린도후서': 13,
  '갈라디아서': 6, '에베소서': 6, '빌립보서': 4, '골로새서': 4, '데살로니가전서': 5, '데살로니가후서': 3, '디모데전서': 6,
  '디모데후서': 4, '디도서': 3, '빌레몬서': 1, '히브리서': 13, '야고보서': 5, '베드로전서': 5, '베드로후서': 3, '요한일서': 5,
  '요한이서': 1, '요한삼서': 1, '유다서': 1, '요한계시록': 22
};

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

type ChallengeAlarm = {
  id: string;
  hour: number;
  minute: number;
  weekdays: number[];
  notificationIds: string[];
  enabled: boolean;
};

type DurationTab = 'duration' | 'daily' | 'end';

function formatSelectedBooks(selected: string[]) {
  if (!selected || selected.length === 0) return '';
  if (selected.length === 1) return selected[0];
  if (selected.length === 2) return `${selected[0]}, ${selected[1]}`;
  return `${selected[0]}, ${selected[1]} 외 ${selected.length - 2}권`;
}

function getTotalChapters(selected: string[]) {
  if (!selected) return 0;
  return selected.reduce((acc, book) => acc + (BIBLE_CHAPTERS[book] || 0), 0);
}

function formatDateFrom(date: Date) {
  if (!date) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일부터`;
}

function formatDateUntil(date: Date) {
  if (!date) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일까지`;
}

export default function ChallengeEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);

  // A. 기본 정보 폼 상태
  const [challengeName, setChallengeName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const [isBibleSheetOpen, setIsBibleSheetOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [tempSelectedBooks, setTempSelectedBooks] = useState<string[]>([]);

  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());

  const [isDurationSheetOpen, setIsDurationSheetOpen] = useState(false);
  const [durationDays, setDurationDays] = useState(7);
  const [dailyChapters, setDailyChapters] = useState(3);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<DurationTab>('end'); // 수정 모드는 이미 정해져 있으므로 보통 end
  const [tempDurationDays, setTempDurationDays] = useState(7);
  const [tempDailyChapters, setTempDailyChapters] = useState(3);
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());
  const [tempActiveTab, setTempActiveTab] = useState<DurationTab>('end');

  // B. 공개범위 상태
  const [visibility, setVisibility] = useState<'public' | 'oikos' | 'link'>('public');
  
  // C. 알람 설정 상태
  const [encouragementNotificationEnabled, setEncouragementNotificationEnabled] = useState(false);
  const [alarms, setAlarms] = useState<ChallengeAlarm[]>([]);
  const [isAlarmSheetOpen, setIsAlarmSheetOpen] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  
  // 알람 관리 모드
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedAlarmIdsForDelete, setSelectedAlarmIdsForDelete] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    
    // 기존 데이터 로딩
    AsyncStorage.getItem('LOEN_BIBLE_CHALLENGE_CREATED_v1').then(data => {
      if (data) {
        const parsed = JSON.parse(data);
        setChallengeName(parsed.challengeName || '');
        setSelectedBooks(parsed.selectedBooks || []);
        
        if (parsed.startDate) setStartDate(new Date(parsed.startDate));
        if (parsed.endDate) setEndDate(new Date(parsed.endDate));
        
        setVisibility(parsed.visibility || 'public');
        setAlarms(parsed.alarms || []);
      }
      setIsLoading(false);
    });
  }, []);

  // --- 제출 및 취소 ---
  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    if (challengeName.trim().length === 0 || selectedBooks.length === 0) return;

    const challengeData = {
      challengeName,
      selectedBooks,
      totalChapters: getTotalChapters(selectedBooks),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      alarms,
      visibility,
    };

    try {
      await AsyncStorage.setItem('LOEN_BIBLE_CHALLENGE_CREATED_v1', JSON.stringify(challengeData));
    } catch (error) {
      console.warn('수정 내역 저장 실패:', error);
    }
    
    // 수정 완료 후 데이터 갱신을 위해 replace 사용
    router.replace('/challenge/complete');
  };

  // --- 성경 바텀시트 ---
  const openBibleSheet = () => {
    Keyboard.dismiss();
    setTempSelectedBooks([...selectedBooks]);
    setIsBibleSheetOpen(true);
  };
  const closeBibleSheet = () => setIsBibleSheetOpen(false);
  const toggleBook = (book: string) => {
    setTempSelectedBooks(prev => prev.includes(book) ? prev.filter(b => b !== book) : [...prev, book]);
  };
  const handleCompleteBibleSelection = () => {
    if (tempSelectedBooks.length === 0) return;
    const sorted = [...tempSelectedBooks].sort((a, b) => BIBLE_BOOKS.indexOf(a) - BIBLE_BOOKS.indexOf(b));
    setSelectedBooks(sorted);
    closeBibleSheet();
  };

  // --- 날짜 바텀시트 ---
  const openDateSheet = () => {
    Keyboard.dismiss();
    setTempStartDate(new Date(startDate));
    setIsDateSheetOpen(true);
  };
  const closeDateSheet = () => setIsDateSheetOpen(false);
  const handleCompleteDateSelection = () => {
    setStartDate(new Date(tempStartDate));
    if (endDate.getTime() < tempStartDate.getTime()) {
      setEndDate(new Date(tempStartDate));
    }
    closeDateSheet();
  };

  // --- 기간 바텀시트 ---
  const openDurationSheet = () => {
    Keyboard.dismiss();
    setTempDurationDays(durationDays);
    setTempDailyChapters(dailyChapters);
    setTempEndDate(new Date(endDate));
    setTempActiveTab(activeTab);
    setIsDurationSheetOpen(true);
  };
  const closeDurationSheet = () => setIsDurationSheetOpen(false);
  const handleCompleteDurationSelection = () => {
    if (tempActiveTab === 'duration') setTempActiveTab('daily');
    else if (tempActiveTab === 'daily') setTempActiveTab('end');
    else {
      setDurationDays(tempDurationDays);
      setDailyChapters(tempDailyChapters);
      setEndDate(new Date(tempEndDate));
      setActiveTab(tempActiveTab);
      closeDurationSheet();
    }
  };

  const renderDurationSummary = () => {
    if (activeTab === 'duration') return `${durationDays}일 동안`;
    if (activeTab === 'daily') return `하루 ${dailyChapters}장씩`;
    return formatDateUntil(endDate);
  };

  const renderDurationFooterSummary = () => {
    if (tempActiveTab === 'duration') return `${Math.max(1, tempDurationDays)}일동안 읽어요`;
    if (tempActiveTab === 'daily') return `하루에 약 ${Math.max(1, tempDailyChapters)}장씩 읽어요`;
    if (tempActiveTab === 'end') return `${Math.max(1, tempDurationDays)}일동안, 하루 약 ${Math.max(1, tempDailyChapters)}장씩 읽어요`;
    return '';
  };

  // --- 알람 바텀시트 ---
  const openAlarmSheet = () => {
    Keyboard.dismiss();
    setSelectedTime(new Date());
    setSelectedWeekdays([]);
    setIsAlarmSheetOpen(true);
  };
  const closeAlarmSheet = () => setIsAlarmSheetOpen(false);
  const toggleWeekday = (index: number) => {
    setSelectedWeekdays(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
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

    for (const dayIndex of selectedWeekdays) {
      const expoWeekday = dayIndex === 6 ? 1 : dayIndex + 2;
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title: '성경 읽기 알림', body: '오늘 성경 읽을 시간이에요!' },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: expoWeekday,
            hour,
            minute,
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

  const getWeekdayText = (wds: number[]) => {
    if (wds.length === 7) return '매일';
    if (wds.length === 1) return `${WEEKDAYS[wds[0]]}요일마다`;
    return wds.sort().map(idx => WEEKDAYS[idx]).join(',') + '마다';
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
    setSelectedAlarmIdsForDelete(prev => prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]);
  };
  const handleDeleteAlarms = async () => {
    if (selectedAlarmIdsForDelete.length === 0) return;
    const alarmsToDelete = alarms.filter(a => selectedAlarmIdsForDelete.includes(a.id));
    
    // 알람 취소 로직 유지
    for (const alarm of alarmsToDelete) {
      for (const notiId of alarm.notificationIds) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notiId);
        } catch (error) {
          console.warn('알림 취소 실패:', error);
        }
      }
    }
    const count = selectedAlarmIdsForDelete.length;
    setAlarms(prev => prev.filter(a => !selectedAlarmIdsForDelete.includes(a.id)));
    handleCancelManage();
    
    setToastMessage(`${count}개의 알람을 삭제했어요`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (isLoading) return null; // 빈 화면 대기

  const hasInput = challengeName.trim().length > 0;
  const isDataValid = hasInput && selectedBooks.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>챌린지 내용 수정하기</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* A. 기본 정보 섹션 */}
          <View style={[styles.card, isManageMode && { opacity: 0.3 }]} pointerEvents={isManageMode ? 'none' : 'auto'}>
            <View style={styles.section}>
              <Text style={styles.label}>챌린지 이름을 정해주세요</Text>
              <View style={[styles.inputBorder, isFocused && styles.inputBorderActive]}>
                <TextInput
                  style={styles.input}
                  value={challengeName}
                  onChangeText={setChallengeName}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="챌린지 이름"
                  placeholderTextColor={colors.text.dim}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>어디를 읽을까요?</Text>
              <TouchableOpacity style={[styles.inputBorder, styles.inputBorderActive]} activeOpacity={0.7} onPress={openBibleSheet}>
                <Text style={styles.inputText}>{formatSelectedBooks(selectedBooks)}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.subLabel}>{selectedBooks.length}권, 총 {getTotalChapters(selectedBooks)}장이에요</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>언제부터 읽을까요?</Text>
              <TouchableOpacity style={[styles.inputBorder, styles.inputBorderActive]} activeOpacity={0.7} onPress={openDateSheet}>
                <Text style={styles.inputText}>{formatDateFrom(startDate)}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.sectionLast}>
              <Text style={styles.label}>읽을 기간을 정해주세요</Text>
              <TouchableOpacity style={[styles.inputBorder, styles.inputBorderActive]} activeOpacity={0.7} onPress={openDurationSheet}>
                <Text style={styles.inputText}>{renderDurationSummary()}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* B. 공개범위 섹션 */}
          <View pointerEvents={isManageMode ? 'none' : 'auto'} style={{ opacity: isManageMode ? 0.3 : 1 }}>
            <View style={styles.sectionHeaderMargin}>
              <Text style={styles.sectionTitle}>공개범위</Text>
            </View>

            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7} onPress={() => setVisibility('public')}>
              <View style={styles.optionIconWrapper}>
                <Ionicons name="people" size={24} color={colors.text.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>전체 공개</Text>
                <Text style={styles.optionDescription} numberOfLines={1}>로고스 청년 모두에게 공개되며,...</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={visibility === 'public' ? colors.primary : colors.border} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7} onPress={() => setVisibility('oikos')}>
              <View style={styles.optionIconWrapper}>
                <Ionicons name="person" size={24} color={colors.text.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>오이코스 공개</Text>
                <Text style={styles.optionDescription} numberOfLines={1}>오이코스원에게만 공개되며,...</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={visibility === 'oikos' ? colors.primary : colors.border} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7} onPress={() => setVisibility('link')}>
              <View style={styles.optionIconWrapper}>
                <Ionicons name="link" size={24} color={colors.text.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>링크로 공개</Text>
                <Text style={styles.optionDescription} numberOfLines={1}>공유한 링크를 전달 받은 사람만...</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={visibility === 'link' ? colors.primary : colors.border} />
            </TouchableOpacity>
          </View>

          {/* C. 알람 설정 섹션 */}
          <View style={styles.sectionHeaderMargin}>
            <View style={styles.flexRowBetween}>
              <Text style={styles.sectionTitle}>알람 설정</Text>
              {!isManageMode && (
                <TouchableOpacity style={styles.manageBadge} onPress={handleManageAlarm} activeOpacity={0.7}>
                  <Text style={styles.manageBadgeText}>관리</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.settingCard} activeOpacity={0.7} onPress={isManageMode ? undefined : openAlarmSheet} disabled={isManageMode}>
            <Text style={[styles.settingTitle, isManageMode && { color: colors.text.secondary }]}>알람 추가하기</Text>
            <Ionicons name="add" size={24} color={isManageMode ? colors.text.secondary : colors.text.secondary} />
          </TouchableOpacity>

          {alarms.map(alarm => (
            <View key={alarm.id} style={styles.alarmRowCard}>
              <View style={styles.alarmRowLeft}>
                <Text style={styles.alarmTimeText}>{formatTimeText(alarm.hour, alarm.minute)}</Text>
                <Text style={styles.alarmWeekdayText}>{getWeekdayText(alarm.weekdays)}</Text>
              </View>
              {isManageMode ? (
                <TouchableOpacity onPress={() => toggleAlarmDeleteSelection(alarm.id)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                  <Ionicons name="checkmark-circle" size={24} color={selectedAlarmIdsForDelete.includes(alarm.id) ? colors.primary : colors.border} />
                </TouchableOpacity>
              ) : (
                <Switch
                  value={alarm.enabled}
                  onValueChange={() => {}}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.border}
                />
              )}
            </View>
          ))}

          <View style={styles.settingCard}>
            <View style={styles.settingTitleWrapper}>
              <Text style={[styles.settingTitle, isManageMode && { color: colors.text.secondary }]}>맞춤형 독려 알림</Text>
              <Ionicons name="help-circle" size={18} color={isManageMode ? colors.text.secondary : colors.text.secondary} style={styles.helpIcon} />
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

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* 하단 버튼 영역 */}
        <View style={styles.footer}>
          {isManageMode ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.btn, styles.btnCancelBg]} onPress={handleCancelManage} activeOpacity={0.7}>
                <Text style={styles.btnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, selectedAlarmIdsForDelete.length > 0 ? { backgroundColor: '#FF5A5A' } : styles.btnCancelBg]}
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
              <TouchableOpacity style={[styles.btn, styles.btnCancelBg]} onPress={handleCancel} activeOpacity={0.7}>
                <Text style={styles.btnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, isDataValid ? styles.btnActiveBg : styles.btnDisabledBg]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={!isDataValid}
              >
                <Text style={styles.btnTextActive}>수정완료</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* --- 각종 모달 (바텀시트) --- */}
      {/* 1. 성경 선택 모달 */}
      <Modal visible={isBibleSheetOpen} transparent animationType="slide" onRequestClose={closeBibleSheet}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeBibleSheet}><View style={styles.modalBackground} /></TouchableWithoutFeedback>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrapper}><View style={styles.sheetHandle} /></View>
            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {BIBLE_BOOKS.map(book => {
                const isSelected = tempSelectedBooks.includes(book);
                return (
                  <TouchableOpacity key={book} style={styles.bookRow} activeOpacity={0.7} onPress={() => toggleBook(book)}>
                    <Text style={[styles.bookText, isSelected && styles.bookTextSelected]}>{book}</Text>
                    {isSelected && <Ionicons name="checkmark-outline" size={24} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <TouchableOpacity style={[styles.completeBtn, tempSelectedBooks.length === 0 && styles.completeBtnDisabled]} disabled={tempSelectedBooks.length === 0} onPress={handleCompleteBibleSelection}>
                <Text style={styles.completeBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. 날짜 선택 모달 */}
      <Modal visible={isDateSheetOpen} transparent animationType="slide" onRequestClose={closeDateSheet}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeDateSheet}><View style={styles.modalBackground} /></TouchableWithoutFeedback>
          <View style={[styles.bottomSheet, { maxHeight: 'auto' }]}>
            <View style={styles.sheetHandleWrapper}><View style={styles.sheetHandle} /></View>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={tempStartDate}
                mode="date"
                display="spinner"
                locale="ko-KR"
                onChange={(_, date) => { if (date) setTempStartDate(date); }}
                style={styles.datePicker}
                textColor={colors.text.primary}
              />
            </View>
            <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteDateSelection}>
                <Text style={styles.completeBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. 기간 설정 모달 */}
      <Modal visible={isDurationSheetOpen} transparent animationType="slide" onRequestClose={closeDurationSheet}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeDurationSheet}><View style={styles.modalBackground} /></TouchableWithoutFeedback>
          <View style={[styles.bottomSheet, { maxHeight: 'auto' }]}>
            <View style={styles.sheetHandleWrapper}><View style={styles.sheetHandle} /></View>
            <View style={styles.durationTabRow}>
              {(['duration', 'daily', 'end'] as DurationTab[]).map(tab => {
                const isActive = tempActiveTab === tab;
                const label = tab === 'duration' ? '기간기준' : tab === 'daily' ? '하루기준' : '마감기준';
                return (
                  <TouchableOpacity key={tab} style={[styles.durationTab, isActive && styles.durationTabActive]} onPress={() => setTempActiveTab(tab)}>
                    <Text style={[styles.durationTabText, isActive && styles.durationTabTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.durationContent}>
              {tempActiveTab === 'duration' && (
                <View style={styles.counterRow}>
                  <View style={styles.counterWrapper}>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => setTempDurationDays(Math.max(1, tempDurationDays - 1))}><Ionicons name="remove" size={24} color={colors.text.secondary} /></TouchableOpacity>
                    <Text style={styles.counterValue}>{tempDurationDays}</Text>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => setTempDurationDays(tempDurationDays + 1)}><Ionicons name="add" size={24} color={colors.text.secondary} /></TouchableOpacity>
                  </View>
                  <Text style={styles.counterLabel}>일 동안</Text>
                </View>
              )}
              {tempActiveTab === 'daily' && (
                <View style={styles.counterRow}>
                  <Text style={styles.counterLabel}>하루에</Text>
                  <View style={styles.counterWrapper}>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => setTempDailyChapters(Math.max(1, tempDailyChapters - 1))}><Ionicons name="remove" size={24} color={colors.text.secondary} /></TouchableOpacity>
                    <Text style={styles.counterValue}>{tempDailyChapters}</Text>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => setTempDailyChapters(tempDailyChapters + 1)}><Ionicons name="add" size={24} color={colors.text.secondary} /></TouchableOpacity>
                  </View>
                  <Text style={styles.counterLabel}>장씩</Text>
                </View>
              )}
              {tempActiveTab === 'end' && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker value={tempEndDate} mode="date" display="spinner" locale="ko-KR" onChange={(_, date) => { if (date) setTempEndDate(date); }} style={styles.datePicker} textColor={colors.text.primary} minimumDate={startDate} />
                </View>
              )}
            </View>
            <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <View style={styles.summaryRow}>
                <Ionicons name="disc" size={20} color="#FF5A5A" style={{ marginRight: 6 }} />
                <Text style={styles.summaryText}>{renderDurationFooterSummary()}</Text>
              </View>
              <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteDurationSelection}>
                <Text style={styles.completeBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. 알람 추가 모달 */}
      <Modal visible={isAlarmSheetOpen} transparent animationType="slide" onRequestClose={closeAlarmSheet}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeAlarmSheet}><View style={styles.modalBackground} /></TouchableWithoutFeedback>
          <View style={[styles.bottomSheet, { maxHeight: 'auto', paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <View style={styles.sheetHandleWrapper}><View style={styles.sheetHandle} /></View>
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <DateTimePicker value={selectedTime} mode="time" display="spinner" locale="en-US" onChange={(_, date) => { if (date) setSelectedTime(date); }} style={{ width: '100%', height: 180 }} textColor={colors.text.primary} />
            </View>
            <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xxl }}>
              <View style={styles.flexRowBetween}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.md }}>요일 선택</Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: fontWeight.medium, marginBottom: spacing.md }}>{selectedWeekdays.length > 0 ? getWeekdayText(selectedWeekdays) : ''}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {WEEKDAYS.map((day, index) => {
                  const isSelected = selectedWeekdays.includes(index);
                  return (
                    <TouchableOpacity key={day} style={[styles.weekdayCircle, isSelected && styles.weekdayCircleActive]} onPress={() => toggleWeekday(index)}>
                      <Text style={[styles.weekdayText, isSelected && styles.weekdayTextActive]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.sheetFooter}>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.btn, styles.btnCancelBg]} onPress={closeAlarmSheet}><Text style={styles.btnTextCancel}>취소</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, selectedWeekdays.length > 0 ? styles.btnActiveBg : styles.btnDisabledBg]} onPress={handleSaveAlarm} disabled={selectedWeekdays.length === 0}><Text style={styles.btnTextActive}>완료</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 토스트 */}
      {toastMessage && (
        <View style={[styles.toastContainer, { bottom: insets.bottom + 90 }]}>
          <View style={styles.toastContent}>
            <View style={styles.toastIconWrapper}><Ionicons name="checkmark" size={16} color={colors.white} /></View>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  flex: { flex: 1 },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  backButton: { width: 32, alignItems: 'flex-start' },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerRightSpace: { width: 32 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  flexRowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // 섹션
  card: { backgroundColor: colors.background.elevated, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  section: { marginBottom: spacing.xxl },
  sectionLast: { marginBottom: 0 },
  label: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  subLabel: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.sm },
  inputBorder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.sm, marginTop: spacing.xs },
  inputBorderActive: { borderBottomColor: colors.primary },
  inputText: { fontSize: fontSize.lg, color: colors.text.primary, fontWeight: fontWeight.medium },
  input: { flex: 1, fontSize: fontSize.lg, color: colors.text.primary, fontWeight: fontWeight.medium, padding: 0 },
  
  sectionHeaderMargin: { marginBottom: spacing.md, paddingHorizontal: spacing.xs },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  
  // 공개범위
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.elevated, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  optionIconWrapper: { marginRight: spacing.md },
  optionTextContainer: { flex: 1, marginRight: spacing.sm },
  optionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: 4 },
  optionDescription: { fontSize: fontSize.xs, color: colors.text.secondary },

  // 알람 설정
  manageBadge: { backgroundColor: '#F0F0F5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full },
  manageBadgeText: { fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: fontWeight.semibold },
  settingCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background.elevated, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  settingTitleWrapper: { flexDirection: 'row', alignItems: 'center' },
  settingTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  helpIcon: { marginLeft: 6 },
  alarmRowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background.elevated, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  alarmRowLeft: { flex: 1 },
  alarmTimeText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: 4 },
  alarmWeekdayText: { fontSize: fontSize.xs, color: colors.text.secondary },

  // 하단 버튼
  footer: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  btnCancelBg: { backgroundColor: colors.primaryLight },
  btnActiveBg: { backgroundColor: colors.primary },
  btnDisabledBg: { backgroundColor: 'rgba(101,97,255,0.3)' },
  btnTextCancel: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.primary },
  btnTextActive: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.white },

  // 모달
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay.default },
  bottomSheet: { backgroundColor: colors.background.elevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '80%', paddingTop: 12 },
  sheetHandleWrapper: { alignItems: 'center', paddingBottom: spacing.xl },
  sheetHandle: { width: 48, height: 4, borderRadius: 2, backgroundColor: colors.border },
  sheetScroll: { paddingHorizontal: spacing.xl },
  bookRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  bookText: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  bookTextSelected: { color: colors.primary, fontWeight: fontWeight.bold },
  sheetFooter: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  completeBtn: { height: 52, backgroundColor: colors.primary, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  completeBtnDisabled: { backgroundColor: 'rgba(101,97,255,0.3)' },
  completeBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  
  // 날짜/기간 픽커 모달
  datePickerContainer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, alignItems: 'center' },
  datePicker: { width: '100%', height: 200 },
  durationTabRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.xl },
  durationTab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.full, backgroundColor: colors.background.base },
  durationTabActive: { backgroundColor: colors.primaryLight },
  durationTabText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.secondary },
  durationTabTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  durationContent: { paddingHorizontal: spacing.xl, minHeight: 180, justifyContent: 'center', alignItems: 'center' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  counterLabel: { fontSize: fontSize.lg, color: colors.text.primary, fontWeight: fontWeight.medium },
  counterWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.base, borderRadius: radius.md, paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
  counterBtn: { padding: spacing.sm },
  counterValue: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text.primary, minWidth: 40, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  summaryText: { fontSize: fontSize.sm, color: colors.text.primary, fontWeight: fontWeight.medium },

  // 알람 픽커 요일 버튼
  weekdayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background.base, alignItems: 'center', justifyContent: 'center' },
  weekdayCircleActive: { backgroundColor: colors.primary },
  weekdayText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.primary },
  weekdayTextActive: { color: colors.white },

  // 토스트
  toastContainer: { position: 'absolute', left: spacing.lg, right: spacing.lg, alignItems: 'center', zIndex: 999 },
  toastContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(40, 40, 50, 0.95)', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  toastIconWrapper: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  toastText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
