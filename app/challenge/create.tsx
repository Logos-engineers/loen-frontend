import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import BottomSheet from '@/components/ui/overlay/BottomSheet';
import Popup from '@/components/ui/overlay/Popup';
import DateWheelPicker from '@/components/challenge/DateWheelPicker';
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
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getTotalChapters(selected: string[]) {
  return selected.reduce((acc, book) => acc + (BIBLE_CHAPTER_MAP[book] || 0), 0);
}

export default function ChallengeCreateScreen() {
  const router = useRouter();

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

  // 하단 CTA: 마지막 단계 전까지는 "다음으로", 마지막 단계에서 "완료"
  const isFinalStep = step === 4;
  const primaryLabel = isFinalStep ? '완료' : '다음으로';
  const primaryDisabled =
    step === 1
      ? !hasInput
      : step === 2
        ? selectedBooks.length === 0
        : step === 4
          ? !isDurationSet
          : false;

  const handlePrimary = () => {
    if (primaryDisabled) return;
    if (step === 1) {
      Keyboard.dismiss();
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
      return;
    }
    router.push({
      pathname: '/challenge/visibility',
      params: {
        challengeName,
        selectedBooks: JSON.stringify(selectedBooks),
        totalChapters,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  };

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
          <View style={styles.inputStack}>

            {step >= 4 && (
              <TouchableOpacity
                style={styles.fieldBlock}
                activeOpacity={0.7}
                onPress={() => { Keyboard.dismiss(); setIsDurationSheetOpen(true); }}
              >
                <Text style={styles.fieldLabel}>읽을 기간을 정해주세요</Text>
                <View style={styles.fieldUnderline}>
                  <View style={styles.fieldValueRow}>
                    <Text style={styles.fieldValue}>{renderDurationSummary()}</Text>
                    <Ionicons name="chevron-down" size={24} color={colors.text.secondary} />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {step >= 3 && (
              <TouchableOpacity style={styles.fieldBlock} activeOpacity={0.7} onPress={openDateSheet}>
                <Text style={styles.fieldLabel}>언제부터 읽을까요?</Text>
                <View style={styles.fieldUnderline}>
                  <View style={styles.fieldValueRow}>
                    <Text style={styles.fieldValue}>{formatDateFrom(startDate)}</Text>
                    <Ionicons name="chevron-down" size={24} color={colors.text.secondary} />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {step >= 2 && (
              <TouchableOpacity style={styles.fieldBlock} activeOpacity={0.7} onPress={openBibleSheet}>
                <Text style={styles.fieldLabel}>어디를 읽을까요?</Text>
                <View style={styles.fieldUnderline}>
                  <View style={styles.fieldValueRow}>
                    <Text style={[styles.fieldValue, selectedBooks.length === 0 && styles.fieldPlaceholder]}>
                      {selectedBooks.length > 0 ? formattedBooks : '성경을 선택해주세요'}
                    </Text>
                    <Ionicons name="chevron-down" size={24} color={colors.text.secondary} />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, isFocused && styles.fieldLabelActive]}>챌린지 이름을 정해주세요</Text>
              <View style={[styles.fieldUnderline, isFocused && styles.fieldUnderlineActive]}>
                <TextInput
                  style={styles.fieldInput}
                  value={challengeName}
                  onChangeText={setChallengeName}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="이윤재의 성경챌린지1"
                  placeholderTextColor={colors.text.secondary}
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
              style={[styles.btn, primaryDisabled ? styles.btnDisabled : styles.btnActive]}
              onPress={handlePrimary}
              activeOpacity={0.8}
              disabled={primaryDisabled}
            >
              <Text style={styles.btnTextActive}>완료</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setIsExitModalOpen(true)} activeOpacity={0.7}>
                <Text style={styles.btnTextCancel}>그만두기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, primaryDisabled ? styles.btnDisabled : styles.btnActive]}
                onPress={handlePrimary}
                disabled={primaryDisabled}
                activeOpacity={0.8}
              >
                <Text style={styles.btnTextActive}>{primaryLabel}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* 성경 선택 모달 */}
      <BottomSheet
        visible={isBibleSheetOpen}
        onClose={() => setIsBibleSheetOpen(false)}
        title="성경을 선택해주세요"
        disableContentPadding
        footer={
          <TouchableOpacity
            style={[styles.completeBtn, tempSelectedBooks.length === 0 && styles.completeBtnDisabled]}
            disabled={tempSelectedBooks.length === 0}
            onPress={handleCompleteBibleSelection}
          >
            <Text style={styles.completeBtnText}>완료</Text>
          </TouchableOpacity>
        }
      >
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
      </BottomSheet>

      {/* 시작 날짜 모달 */}
      <BottomSheet
        visible={isDateSheetOpen}
        onClose={() => setIsDateSheetOpen(false)}
        title="시작일 설정"
        disableContentPadding
        footer={
          <TouchableOpacity style={styles.completeBtn} activeOpacity={0.8} onPress={handleCompleteDateSelection}>
            <Text style={styles.completeBtnText}>완료</Text>
          </TouchableOpacity>
        }
      >
        <DateWheelPicker value={tempStartDate} onChange={setTempStartDate} />
      </BottomSheet>

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
      <Popup
        visible={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        description="지금까지 입력한 내용이 저장되지 않아요"
        buttons={[
          { label: '머무르기', variant: 'secondary', onPress: () => setIsExitModalOpen(false) },
          { label: '나가기', variant: 'primary', onPress: () => router.replace('/(tabs)') },
        ]}
      />
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

  inputStack: { backgroundColor: colors.background.elevated, borderRadius: radius.lg, overflow: 'hidden' },

  // 입력 카드 공통 필드 (Figma 메타데이터: 라벨 14/600, 값 22/600, 값 바로 아래 1px 밑줄, 패딩 16)
  fieldBlock: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  fieldLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.secondary, marginBottom: spacing.sm },
  fieldLabelActive: { color: colors.primary },
  fieldUnderline: { borderBottomWidth: 1, borderBottomColor: colors.text.dim, paddingBottom: spacing.sm },
  fieldUnderlineActive: { borderBottomColor: colors.primary },
  fieldValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  fieldValue: { flex: 1, fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.text.primary, minHeight: 33 },
  fieldPlaceholder: { color: colors.text.secondary },
  fieldInput: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.text.primary, padding: 0, minHeight: 33 },

  footer: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: colors.primaryLight },
  btnTextCancel: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.primary },
  btnDisabled: { backgroundColor: 'rgba(101,97,255,0.3)' },
  btnActive: { backgroundColor: colors.primary },
  btnTextActive: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.white },

  // 성경 선택 BottomSheet 내부 콘텐츠 스타일
  sheetScroll: { height: 300, paddingHorizontal: spacing.lg },
  bookRow: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookText: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  bookTextSelected: { color: colors.primary, fontWeight: fontWeight.bold },
  completeBtn: { height: 48, backgroundColor: colors.primary, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  completeBtnDisabled: { backgroundColor: 'rgba(101,97,255,0.3)' },
  completeBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
