import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import AlarmSection from '@/components/challenge/AlarmSection';
import DateWheelPicker from '@/components/challenge/DateWheelPicker';
import DurationBottomSheet from '@/components/challenge/DurationBottomSheet';
import {
  BIBLE_BOOK_NAMES,
  ChallengeAlarm,
  DurationTab,
  deleteAlarmsById,
  formatDateFrom,
  formatDateUntil,
  formatSelectedBooks,
  getTotalChapters,
} from '@/components/challenge/challengeTypes';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const INITIAL_ALARMS: ChallengeAlarm[] = [
  { id: 'default-morning', hour: 9,  minute: 0,  weekdays: [2, 4, 5],          notificationIds: [], enabled: true  },
  { id: 'default-night',   hour: 22, minute: 0,  weekdays: [0, 1, 2, 3, 4, 5, 6], notificationIds: [], enabled: true  },
  { id: 'default-noon',    hour: 12, minute: 0,  weekdays: [2],                 notificationIds: [], enabled: false },
];

const STORAGE_KEY = 'LOEN_BIBLE_CHALLENGE_CREATED_v1';

export default function ChallengeEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);

  // 기본 정보
  const [challengeName, setChallengeName] = useState('애굽 탈출하기');
  const [isFocused, setIsFocused] = useState(false);

  // 성경 선택
  const [isBibleSheetOpen, setIsBibleSheetOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>(['출애굽기']);
  const [tempSelectedBooks, setTempSelectedBooks] = useState<string[]>([]);

  // 시작 날짜
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date(2025, 11, 7));
  const [tempStartDate, setTempStartDate] = useState(new Date(2025, 11, 7));

  // 기간 설정
  const [isDurationSheetOpen, setIsDurationSheetOpen] = useState(false);
  const [durationDays, setDurationDays] = useState(7);
  const [dailyChapters, setDailyChapters] = useState(3);
  const [endDate, setEndDate] = useState(new Date(2025, 11, 31));
  const [activeTab, setActiveTab] = useState<DurationTab>('end');

  // 공개 범위
  const [visibility, setVisibility] = useState<'public' | 'oikos' | 'link'>('public');

  // 알람 (AlarmSection controlled state)
  const [alarms, setAlarms] = useState<ChallengeAlarm[]>(INITIAL_ALARMS);
  const [encouragementEnabled, setEncouragementEnabled] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  // 토스트
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.challengeName) setChallengeName(parsed.challengeName);
        if (parsed.selectedBooks) setSelectedBooks(parsed.selectedBooks);
        if (parsed.startDate) setStartDate(new Date(parsed.startDate));
        if (parsed.endDate) setEndDate(new Date(parsed.endDate));
        if (parsed.visibility) setVisibility(parsed.visibility);
        if (parsed.alarms) setAlarms(parsed.alarms);
      }
      setIsLoading(false);
    });
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSave = async () => {
    if (!challengeName.trim() || selectedBooks.length === 0) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        challengeName,
        selectedBooks,
        totalChapters: getTotalChapters(selectedBooks),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        alarms,
        visibility,
      }));
    } catch {
      // 저장 실패 무시
    }
    router.replace('/challenge/bible');
  };

  // 알람 관리 모드
  const handleCancelManage = () => {
    setIsManageMode(false);
    setSelectedForDelete([]);
  };

  const handleDeleteAlarms = async () => {
    if (selectedForDelete.length === 0) return;
    const count = selectedForDelete.length;
    const newAlarms = await deleteAlarmsById(alarms, selectedForDelete);
    setAlarms(newAlarms);
    setSelectedForDelete([]);
    setIsManageMode(false);
    showToast(`${count}개의 알람을 삭제했어요`);
  };

  // 성경 선택 시트
  const openBibleSheet = () => {
    Keyboard.dismiss();
    setTempSelectedBooks([...selectedBooks]);
    setIsBibleSheetOpen(true);
  };

  const toggleBook = (book: string) => {
    setTempSelectedBooks(prev =>
      prev.includes(book) ? prev.filter(b => b !== book) : [...prev, book]
    );
  };

  const handleCompleteBibleSelection = () => {
    if (tempSelectedBooks.length === 0) return;
    const sorted = [...tempSelectedBooks].sort(
      (a, b) => BIBLE_BOOK_NAMES.indexOf(a) - BIBLE_BOOK_NAMES.indexOf(b)
    );
    setSelectedBooks(sorted);
    setIsBibleSheetOpen(false);
  };

  // 날짜 선택 시트
  const openDateSheet = () => {
    Keyboard.dismiss();
    setTempStartDate(new Date(startDate));
    setIsDateSheetOpen(true);
  };

  const handleCompleteDateSelection = () => {
    setStartDate(new Date(tempStartDate));
    if (endDate.getTime() < tempStartDate.getTime()) setEndDate(new Date(tempStartDate));
    setIsDateSheetOpen(false);
  };

  const renderDurationSummary = () => {
    if (activeTab === 'duration') return `${durationDays}일 동안`;
    if (activeTab === 'daily') return `하루 ${dailyChapters}장씩`;
    return formatDateUntil(endDate);
  };

  if (isLoading) return null;

  const isDataValid = challengeName.trim().length > 0 && selectedBooks.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>챌린지 내용 수정하기</Text>
        <View style={styles.headerSide} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* A. 기본 정보 */}
          <View style={[styles.card, isManageMode && styles.dimmed]} pointerEvents={isManageMode ? 'none' : 'auto'}>
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
              <TouchableOpacity
                style={[styles.inputBorder, styles.inputBorderActive]}
                activeOpacity={0.7}
                onPress={() => { Keyboard.dismiss(); setIsDurationSheetOpen(true); }}
              >
                <Text style={styles.inputText}>{renderDurationSummary()}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* B. 알람 설정 */}
          <AlarmSection
            alarms={alarms}
            onAlarmsChange={setAlarms}
            isManageMode={isManageMode}
            onManageModeChange={setIsManageMode}
            selectedForDelete={selectedForDelete}
            onSelectedForDeleteChange={setSelectedForDelete}
            encouragementEnabled={encouragementEnabled}
            onEncouragementChange={setEncouragementEnabled}
          />

          {/* C. 공개 범위 */}
          <View
            pointerEvents={isManageMode ? 'none' : 'auto'}
            style={[{ opacity: isManageMode ? 0.3 : 1 }]}
          >
            <View style={styles.sectionHeaderMargin}>
              <Text style={styles.sectionTitle}>챌린지 공개</Text>
            </View>

            {(['public', 'oikos', 'link'] as const).map(v => {
              const info = {
                public: { icon: 'people' as const,  title: '전체 공개',    desc: '로고스 청년 모두에게 공개되며,...' },
                oikos:  { icon: 'person' as const,  title: '오이코스 공개', desc: '오이코스원에게만 공개되며,...' },
                link:   { icon: 'link' as const,    title: '링크로 공개',  desc: '챌린지 생성 완료 후 공유한 링크를 받은...' },
              }[v];
              return (
                <TouchableOpacity key={v} style={styles.optionCard} activeOpacity={0.7} onPress={() => setVisibility(v)}>
                  <View style={styles.optionIcon}>
                    <Ionicons name={info.icon} size={24} color={colors.text.primary} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{info.title}</Text>
                    <Text style={styles.optionDesc} numberOfLines={1}>{info.desc}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color={visibility === v ? colors.primary : colors.border} />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          {isManageMode ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.btn, styles.btnCancelBg]} onPress={handleCancelManage} activeOpacity={0.7}>
                <Text style={styles.btnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, selectedForDelete.length > 0 ? styles.btnDelete : styles.btnCancelBg]}
                onPress={handleDeleteAlarms}
                activeOpacity={0.8}
                disabled={selectedForDelete.length === 0}
              >
                <Text style={[styles.btnTextActive, selectedForDelete.length === 0 && { color: colors.primary }]}>
                  {selectedForDelete.length > 0 ? `${selectedForDelete.length}개 삭제하기` : '삭제하기'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.btn, styles.btnCancelBg]} onPress={() => router.back()} activeOpacity={0.7}>
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

      {/* 성경 선택 모달 */}
      <Modal visible={isBibleSheetOpen} transparent animationType="slide" onRequestClose={() => setIsBibleSheetOpen(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsBibleSheetOpen(false)}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>
          <View style={styles.bottomSheet}>
            <View style={styles.handleWrapper}><View style={styles.sheetHandle} /></View>
            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {BIBLE_BOOK_NAMES.map(book => {
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
              <TouchableOpacity
                style={[styles.completeBtn, tempSelectedBooks.length === 0 && styles.completeBtnDisabled]}
                disabled={tempSelectedBooks.length === 0}
                onPress={handleCompleteBibleSelection}
              >
                <Text style={styles.completeBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 날짜 선택 모달 */}
      <Modal visible={isDateSheetOpen} transparent animationType="slide" onRequestClose={() => setIsDateSheetOpen(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsDateSheetOpen(false)}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>
          <View style={[styles.bottomSheet, { maxHeight: 'auto' }]}>
            <View style={styles.handleWrapper}><View style={styles.sheetHandle} /></View>
            <DateWheelPicker value={tempStartDate} onChange={setTempStartDate} />
            <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteDateSelection}>
                <Text style={styles.completeBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 기간 설정 시트 */}
      <DurationBottomSheet
        visible={isDurationSheetOpen}
        startDate={startDate}
        initialDurationDays={durationDays}
        initialDailyChapters={dailyChapters}
        initialEndDate={endDate}
        initialTab={activeTab}
        onClose={() => setIsDurationSheetOpen(false)}
        onConfirm={result => {
          setDurationDays(result.durationDays);
          setDailyChapters(result.dailyChapters);
          setEndDate(result.endDate);
          setActiveTab(result.activeTab);
          setIsDurationSheetOpen(false);
        }}
      />

      {/* 토스트 */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  flex: { flex: 1 },
  header: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerSide: { width: 100 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSize.heading, fontWeight: fontWeight.semibold, color: colors.text.primary },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md },

  // 기본 정보 카드
  card: { backgroundColor: colors.background.elevated, borderRadius: radius.lg, marginBottom: spacing.lg, overflow: 'hidden' },
  dimmed: { opacity: 0.3 },
  section: { padding: spacing.md },
  sectionLast: { padding: spacing.md },
  label: { fontSize: fontSize.md, color: colors.text.secondary, fontWeight: fontWeight.semibold },
  subLabel: { fontSize: fontSize.base, color: colors.text.secondary, marginTop: spacing.sm, fontWeight: fontWeight.medium },
  inputBorder: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingVertical: spacing.sm, marginTop: spacing.xs,
  },
  inputBorderActive: { borderBottomColor: colors.text.dim },
  inputText: { fontSize: fontSize.xl, lineHeight: 33, color: colors.text.primary, fontWeight: fontWeight.semibold },
  input: { flex: 1, fontSize: fontSize.xl, lineHeight: 33, color: colors.text.primary, fontWeight: fontWeight.semibold, padding: 0 },

  // 공개 범위
  sectionHeaderMargin: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background.elevated, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.md,
  },
  optionIcon: { marginRight: spacing.md },
  optionTextContainer: { flex: 1, marginRight: spacing.sm },
  optionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: 4 },
  optionDesc: { fontSize: fontSize.xs, color: colors.text.secondary },

  // 하단 버튼
  footer: { backgroundColor: colors.background.elevated, paddingHorizontal: spacing.md, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnCancelBg: { backgroundColor: colors.primaryLight },
  btnActiveBg: { backgroundColor: colors.primary },
  btnDisabledBg: { backgroundColor: 'rgba(101,97,255,0.3)' },
  btnDelete: { backgroundColor: '#FF5A5A' },
  btnTextCancel: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.primary },
  btnTextActive: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.white },

  // 모달 공통
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomSheet: { backgroundColor: colors.background.elevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '80%', paddingTop: 12 },
  handleWrapper: { alignItems: 'center', paddingBottom: spacing.xl },
  sheetHandle: { width: 48, height: 4, borderRadius: 2, backgroundColor: colors.border },
  sheetScroll: { paddingHorizontal: spacing.xl },
  bookRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  bookText: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  bookTextSelected: { color: colors.primary, fontWeight: fontWeight.bold },
  sheetFooter: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  completeBtn: { height: 52, backgroundColor: colors.primary, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  completeBtnDisabled: { backgroundColor: 'rgba(101,97,255,0.3)' },
  completeBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.bold },

  // 토스트
  toastContainer: { position: 'absolute', left: spacing.lg, right: spacing.lg, alignItems: 'center', zIndex: 999 },
  toastContent: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(40,40,50,0.95)', paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  toastIconWrapper: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  toastText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
