import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import DurationBottomSheet from '@/components/challenge/DurationBottomSheet';
import {
  BIBLE_BOOK_NAMES,
  BIBLE_CHAPTER_MAP,
  DurationTab,
  formatDateFrom,
  formatDateUntil,
  formatSelectedBooks,
} from '@/components/challenge/challengeTypes';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function getTotalChapters(selected: string[]) {
  return selected.reduce((acc, book) => acc + (BIBLE_CHAPTER_MAP[book] || 0), 0);
}

export default function ChallengeCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 흐름: 1 (이름) → 2 (성경) → 3 (날짜) → 4 (기간)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [challengeName, setChallengeName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // 성경 선택
  const [isBibleSheetOpen, setIsBibleSheetOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [tempSelectedBooks, setTempSelectedBooks] = useState<string[]>([]);

  // 시작 날짜
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState(new Date());

  // 기간 설정
  const [isDurationSheetOpen, setIsDurationSheetOpen] = useState(false);
  const [durationDays, setDurationDays] = useState(7);
  const [dailyChapters, setDailyChapters] = useState(3);
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<DurationTab>('duration');
  const [isDurationSet, setIsDurationSet] = useState(false);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const hasInput = challengeName.trim().length > 0;
  const formattedBooks = formatSelectedBooks(selectedBooks);
  const totalChapters = getTotalChapters(selectedBooks);

  const handleBack = () => {
    if (step > 1) setStep(prev => (prev - 1) as 1 | 2 | 3 | 4);
    else setIsExitModalOpen(true);
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
    if (step === 2) setStep(3);
  };

  // 날짜 선택 시트
  const openDateSheet = () => {
    Keyboard.dismiss();
    setTempStartDate(new Date(startDate));
    setIsDateSheetOpen(true);
  };

  const handleCompleteDateSelection = () => {
    setStartDate(new Date(tempStartDate));
    if (endDate.getTime() < tempStartDate.getTime()) {
      setEndDate(new Date(tempStartDate));
    }
    setIsDateSheetOpen(false);
    if (step === 3) setStep(4);
  };

  // 기간 설정 요약 텍스트
  const renderDurationSummary = () => {
    if (step < 4 && !isDurationSet) return '읽을 기간 설정';
    if (activeTab === 'duration') return `${durationDays}일 동안`;
    if (activeTab === 'daily') return `하루 ${dailyChapters}장씩`;
    return formatDateUntil(endDate);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>성경 챌린지 만들기</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>

            {step >= 4 && (
              <View style={styles.section}>
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
            )}

            {step >= 3 && (
              <View style={styles.section}>
                <Text style={styles.label}>언제부터 읽을까요?</Text>
                <TouchableOpacity style={[styles.inputBorder, styles.inputBorderActive]} activeOpacity={0.7} onPress={openDateSheet}>
                  <Text style={styles.inputText}>{formatDateFrom(startDate)}</Text>
                  <Ionicons name="chevron-down" size={20} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            )}

            {step >= 2 && (
              <View style={styles.section}>
                <Text style={styles.label}>어디를 읽을까요?</Text>
                <TouchableOpacity
                  style={[styles.inputBorder, selectedBooks.length > 0 && styles.inputBorderActive]}
                  activeOpacity={0.7}
                  onPress={openBibleSheet}
                >
                  <Text style={[styles.inputText, selectedBooks.length === 0 && styles.inputTextPlaceholder]}>
                    {selectedBooks.length > 0 ? formattedBooks : '성경을 선택해주세요'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={selectedBooks.length > 0 ? colors.text.primary : colors.text.secondary} />
                </TouchableOpacity>
                {selectedBooks.length > 0 && (
                  <Text style={styles.subLabel}>{selectedBooks.length}권, 총 {totalChapters}장이에요</Text>
                )}
              </View>
            )}

            <View style={step >= 2 ? styles.sectionLast : undefined}>
              <Text style={styles.label}>챌린지 이름을 정해주세요</Text>
              <View style={[styles.inputBorder, isFocused && styles.inputBorderActive]}>
                <TextInput
                  style={styles.input}
                  value={challengeName}
                  onChangeText={setChallengeName}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="이윤재의 성경챌린지1"
                  placeholderTextColor={colors.text.dim}
                  returnKeyType={step === 1 ? 'next' : 'done'}
                  onSubmitEditing={() => {
                    if (step === 1 && hasInput) setStep(2);
                  }}
                />
              </View>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          {isFocused ? (
            <TouchableOpacity
              style={[styles.btn, !hasInput && styles.btnDisabled]}
              onPress={() => { if (hasInput && step === 1) setStep(2); }}
              activeOpacity={0.8}
              disabled={!hasInput}
            >
              <Text style={styles.btnTextActive}>완료</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setIsExitModalOpen(true)} activeOpacity={0.7}>
                <Text style={styles.btnTextCancel}>그만두기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, (!hasInput || selectedBooks.length === 0 || !isDurationSet) ? styles.btnDisabled : styles.btnActive]}
                onPress={() => router.push({
                  pathname: '/challenge/visibility',
                  params: {
                    challengeName,
                    selectedBooks: JSON.stringify(selectedBooks),
                    totalChapters,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                  },
                })}
                disabled={!hasInput || selectedBooks.length === 0 || !isDurationSet}
                activeOpacity={0.8}
              >
                <Text style={styles.btnTextActive}>완료</Text>
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

      {/* 시작 날짜 모달 */}
      <Modal visible={isDateSheetOpen} transparent animationType="slide" onRequestClose={() => setIsDateSheetOpen(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsDateSheetOpen(false)}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>
          <View style={[styles.bottomSheet, { maxHeight: 'auto' }]}>
            <View style={styles.handleWrapper}><View style={styles.sheetHandle} /></View>
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
              <TouchableOpacity style={styles.completeBtn} activeOpacity={0.8} onPress={handleCompleteDateSelection}>
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
          setIsDurationSet(true);
          setIsDurationSheetOpen(false);
        }}
      />

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
  safe: { flex: 1, backgroundColor: colors.background.base },
  flex: { flex: 1 },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.background.base },
  backButton: { width: 32, alignItems: 'flex-start' },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerRightSpace: { width: 32 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.xl },

  card: { backgroundColor: colors.background.elevated, borderRadius: radius.lg, padding: spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  section: { marginBottom: spacing.xxl },
  sectionLast: { marginBottom: 0 },
  label: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  subLabel: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.sm },
  inputBorder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.sm, marginTop: spacing.xs },
  inputBorderActive: { borderBottomColor: colors.primary },
  inputText: { fontSize: fontSize.lg, color: colors.text.primary, fontWeight: fontWeight.medium },
  inputTextPlaceholder: { color: colors.text.secondary },
  input: { flex: 1, fontSize: fontSize.lg, color: colors.text.primary, fontWeight: fontWeight.medium, padding: 0 },

  footer: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: colors.primaryLight },
  btnTextCancel: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.primary },
  btnDisabled: { backgroundColor: 'rgba(101,97,255,0.3)' },
  btnActive: { backgroundColor: colors.primary },
  btnTextActive: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.white },

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
  datePickerContainer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, alignItems: 'center' },
  datePicker: { width: '100%', height: 200 },

  modalOverlayCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  exitModalCard: { width: '80%', backgroundColor: colors.background.elevated, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center' },
  exitModalText: { fontSize: fontSize.base, color: colors.text.primary, fontWeight: fontWeight.medium, marginBottom: spacing.xl, textAlign: 'center' },
  exitModalBtnRow: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  exitModalBtn: { flex: 1, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  exitModalBtnStay: { backgroundColor: '#F0F0F5' },
  exitModalBtnTextStay: { color: colors.text.primary, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  exitModalBtnLeave: { backgroundColor: '#FF5A5A' },
  exitModalBtnTextLeave: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
