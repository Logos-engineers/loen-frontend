import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
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

function formatSelectedBooks(selected: string[]) {
  if (selected.length === 0) return '';
  if (selected.length === 1) return selected[0];
  if (selected.length === 2) return `${selected[0]}, ${selected[1]}`;
  return `${selected[0]}, ${selected[1]} 외 ${selected.length - 2}권`;
}

function getTotalChapters(selected: string[]) {
  return selected.reduce((acc, book) => acc + (BIBLE_CHAPTERS[book] || 0), 0);
}

function formatDateFrom(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일부터`;
}

function formatDateUntil(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일까지`;
}

// 두 날짜 사이의 일수 계산 (당일 포함이면 +1, 마감일-시작일+1 로 계산)
function getDaysDiff(start: Date, end: Date) {
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays + 1 : 1;
}

type DurationTab = 'duration' | 'daily' | 'end';

export default function ChallengeCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 흐름 상태: 1 (이름) -> 2 (성경) -> 3 (날짜) -> 4 (기간 설정)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // 폼 상태
  const [challengeName, setChallengeName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // 성경 선택 상태
  const [isBibleSheetOpen, setIsBibleSheetOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [tempSelectedBooks, setTempSelectedBooks] = useState<string[]>([]);

  // 시작 날짜 선택 상태
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());

  // 기간 설정 (멀티 스텝 바텀시트) 상태
  const [isDurationSheetOpen, setIsDurationSheetOpen] = useState(false);
  const [durationDays, setDurationDays] = useState(7);
  const [dailyChapters, setDailyChapters] = useState(3);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<DurationTab>('duration');

  const [tempDurationDays, setTempDurationDays] = useState(7);
  const [tempDailyChapters, setTempDailyChapters] = useState(3);
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());
  const [tempActiveTab, setTempActiveTab] = useState<DurationTab>('duration');

  const [isDurationSet, setIsDurationSet] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const hasInput = challengeName.trim().length > 0;
  const formattedBooks = formatSelectedBooks(selectedBooks);
  const totalChapters = getTotalChapters(selectedBooks);

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      setIsExitModalOpen(true);
    }
  };

  const handleQuit = () => {
    setIsExitModalOpen(true);
  };

  // 단계 진행
  const handleNextStep = () => {
    if (!hasInput) return;
    Keyboard.dismiss();
    if (step === 1) setStep(2);
  };

  // 최종 완료 (임시)
  const handleFinalComplete = () => {
    if (!hasInput || selectedBooks.length === 0) return;
    router.back();
  };

  // --- 성경 바텀시트 ---
  const openBibleSheet = () => {
    Keyboard.dismiss();
    setTempSelectedBooks([...selectedBooks]);
    setIsBibleSheetOpen(true);
  };

  const closeBibleSheet = () => {
    setIsBibleSheetOpen(false);
  };

  const toggleBook = (book: string) => {
    setTempSelectedBooks((prev) => {
      if (prev.includes(book)) return prev.filter((b) => b !== book);
      return [...prev, book];
    });
  };

  const handleCompleteBibleSelection = () => {
    if (tempSelectedBooks.length === 0) return;
    const sorted = [...tempSelectedBooks].sort((a, b) => BIBLE_BOOKS.indexOf(a) - BIBLE_BOOKS.indexOf(b));
    setSelectedBooks(sorted);
    closeBibleSheet();
    if (step === 2) setStep(3); // 성경 선택 완료 후 3단계
  };

  // --- 시작 날짜 바텀시트 ---
  const openDateSheet = () => {
    Keyboard.dismiss();
    setTempStartDate(new Date(startDate));
    setIsDateSheetOpen(true);
  };

  const closeDateSheet = () => {
    setIsDateSheetOpen(false);
  };

  const handleCompleteDateSelection = () => {
    setStartDate(new Date(tempStartDate));
    // 마감 날짜 기본값 세팅 (마감일이 시작일보다 이전인 경우 대비)
    if (endDate.getTime() < tempStartDate.getTime()) {
      setEndDate(new Date(tempStartDate));
      setTempEndDate(new Date(tempStartDate));
    }
    closeDateSheet();
    if (step === 3) setStep(4); // 시작 날짜 선택 완료 후 4단계
  };

  // --- 기간 설정 바텀시트 ---
  const openDurationSheet = () => {
    Keyboard.dismiss();
    setTempDurationDays(durationDays);
    setTempDailyChapters(dailyChapters);
    setTempEndDate(new Date(endDate));
    setTempActiveTab(activeTab);
    setIsDurationSheetOpen(true);
  };

  const closeDurationSheet = () => {
    setIsDurationSheetOpen(false);
  };

  const handleCompleteDurationSelection = () => {
    if (tempActiveTab === 'duration') {
      setTempActiveTab('daily');
    } else if (tempActiveTab === 'daily') {
      setTempActiveTab('end');
    } else {
      // 마감기준 탭에서 완료 누를 때 진짜 반영
      setDurationDays(tempDurationDays);
      setDailyChapters(tempDailyChapters);
      setEndDate(new Date(tempEndDate));
      setActiveTab(tempActiveTab); // 마지막 탭 유지
      setIsDurationSet(true);
      closeDurationSheet();
    }
  };

  // 기간 설정 카드에 표시할 텍스트 렌더링
  const renderDurationSummary = () => {
    if (step < 4 && activeTab === 'duration' && durationDays === 7) return '읽을 기간 설정'; // 기본 placeholder 느낌
    if (activeTab === 'duration') return `${durationDays}일 동안`;
    if (activeTab === 'daily') return `하루 ${dailyChapters}장씩`;
    if (activeTab === 'end') return formatDateUntil(endDate);
    return '읽을 기간 설정';
  };

  // 바텀시트 하단 요약 텍스트 렌더링
  const renderDurationFooterSummary = () => {
    if (tempActiveTab === 'duration') {
      return `${Math.max(1, tempDurationDays)}일동안 읽어요`;
    }
    if (tempActiveTab === 'daily') {
      return `하루에 약 ${Math.max(1, tempDailyChapters)}장씩 읽어요`;
    }
    if (tempActiveTab === 'end') {
      return `${Math.max(1, tempDurationDays)}일동안, 하루 약 ${Math.max(1, tempDailyChapters)}장씩 읽어요`;
    }
    return '';
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
        <Text style={styles.headerTitle}>성경 챌린지 만들기</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            
            {/* 4단계: 기간 설정 영역 */}
            {step >= 4 && (
              <View style={styles.section}>
                <Text style={styles.label}>읽을 기간을 정해주세요</Text>
                <TouchableOpacity
                  style={[styles.inputBorder, styles.inputBorderActive]}
                  activeOpacity={0.7}
                  onPress={openDurationSheet}
                >
                  <Text style={styles.inputText}>
                    {renderDurationSummary()}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.text.primary}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* 3단계 이상: 시작일 선택 영역 */}
            {step >= 3 && (
              <View style={styles.section}>
                <Text style={styles.label}>언제부터 읽을까요?</Text>
                <TouchableOpacity
                  style={[styles.inputBorder, styles.inputBorderActive]}
                  activeOpacity={0.7}
                  onPress={openDateSheet}
                >
                  <Text style={styles.inputText}>
                    {formatDateFrom(startDate)}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.text.primary}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* 2단계 이상: 성경 선택 영역 */}
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
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={selectedBooks.length > 0 ? colors.text.primary : colors.text.secondary}
                  />
                </TouchableOpacity>
                {selectedBooks.length > 0 && (
                  <Text style={styles.subLabel}>
                    {selectedBooks.length}권, 총 {totalChapters}장이에요
                  </Text>
                )}
              </View>
            )}

            {/* 1~4단계 공통: 챌린지 이름 영역 */}
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
                  onSubmitEditing={step === 1 ? handleNextStep : handleFinalComplete}
                />
              </View>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* 하단 버튼 영역 */}
        <View style={styles.footer}>
          {isFocused ? (
            <TouchableOpacity
              style={[styles.btn, !hasInput && styles.btnDisabled]}
              onPress={step === 1 ? handleNextStep : handleFinalComplete}
              activeOpacity={0.8}
              disabled={!hasInput}
            >
              <Text style={styles.btnTextActive}>완료</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={handleQuit}
                activeOpacity={0.7}
              >
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
                    endDate: endDate.toISOString()
                  }
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

      {/* 성경 선택 바텀시트 */}
      <Modal visible={isBibleSheetOpen} transparent animationType="slide" onRequestClose={closeBibleSheet}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeBibleSheet}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>

          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandleWrapper}>
              <View style={styles.sheetHandle} />
            </View>

            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {BIBLE_BOOKS.map((book) => {
                const isSelected = tempSelectedBooks.includes(book);
                return (
                  <TouchableOpacity
                    key={book}
                    style={styles.bookRow}
                    activeOpacity={0.7}
                    onPress={() => toggleBook(book)}
                  >
                    <Text style={[styles.bookText, isSelected && styles.bookTextSelected]}>
                      {book}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-outline" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <TouchableOpacity
                style={[styles.completeBtn, tempSelectedBooks.length === 0 && styles.completeBtnDisabled]}
                disabled={tempSelectedBooks.length === 0}
                activeOpacity={0.8}
                onPress={handleCompleteBibleSelection}
              >
                <Text style={styles.completeBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 시작 날짜 바텀시트 */}
      <Modal visible={isDateSheetOpen} transparent animationType="slide" onRequestClose={closeDateSheet}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeDateSheet}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>

          <View style={[styles.bottomSheet, { maxHeight: 'auto' }]}>
            <View style={styles.sheetHandleWrapper}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={tempStartDate}
                mode="date"
                display="spinner"
                locale="ko-KR"
                onChange={(_, date) => {
                  if (date) setTempStartDate(date);
                }}
                style={styles.datePicker}
                textColor={colors.text.primary}
              />
            </View>

            <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <TouchableOpacity
                style={styles.completeBtn}
                activeOpacity={0.8}
                onPress={handleCompleteDateSelection}
              >
                <Text style={styles.completeBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 읽을 기간 설정 (멀티 스텝) 바텀시트 */}
      <Modal visible={isDurationSheetOpen} transparent animationType="slide" onRequestClose={closeDurationSheet}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeDurationSheet}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>

          <View style={[styles.bottomSheet, { maxHeight: 'auto' }]}>
            <View style={styles.sheetHandleWrapper}>
              <View style={styles.sheetHandle} />
            </View>

            {/* 탭 헤더 */}
            <View style={styles.durationTabRow}>
              {(['duration', 'daily', 'end'] as DurationTab[]).map((tab) => {
                const isActive = tempActiveTab === tab;
                const label = tab === 'duration' ? '기간기준' : tab === 'daily' ? '하루기준' : '마감기준';
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.durationTab, isActive && styles.durationTabActive]}
                    onPress={() => setTempActiveTab(tab)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.durationTabText, isActive && styles.durationTabTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 탭 콘텐츠 영역 */}
            <View style={styles.durationContent}>
              {tempActiveTab === 'duration' && (
                <View style={styles.counterRow}>
                  <View style={styles.counterWrapper}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setTempDurationDays(Math.max(1, tempDurationDays - 1))}
                    >
                      <Ionicons name="remove" size={24} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{tempDurationDays}</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setTempDurationDays(tempDurationDays + 1)}
                    >
                      <Ionicons name="add" size={24} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.counterLabel}>일 동안</Text>
                </View>
              )}

              {tempActiveTab === 'daily' && (
                <View style={styles.counterRow}>
                  <Text style={styles.counterLabel}>하루에</Text>
                  <View style={styles.counterWrapper}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setTempDailyChapters(Math.max(1, tempDailyChapters - 1))}
                    >
                      <Ionicons name="remove" size={24} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{tempDailyChapters}</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setTempDailyChapters(tempDailyChapters + 1)}
                    >
                      <Ionicons name="add" size={24} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.counterLabel}>장씩</Text>
                </View>
              )}

              {tempActiveTab === 'end' && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={tempEndDate}
                    mode="date"
                    display="spinner"
                    locale="ko-KR"
                    onChange={(_, date) => {
                      if (date) setTempEndDate(date);
                    }}
                    style={styles.datePicker}
                    textColor={colors.text.primary}
                    minimumDate={startDate}
                  />
                </View>
              )}
            </View>

            {/* 하단 요약 및 버튼 */}
            <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              {/* 요약 텍스트 */}
              <View style={styles.summaryRow}>
                <Ionicons name="disc" size={20} color="#FF5A5A" style={{ marginRight: 6 }} />
                <Text style={styles.summaryText}>{renderDurationFooterSummary()}</Text>
              </View>

              <TouchableOpacity
                style={styles.completeBtn}
                activeOpacity={0.8}
                onPress={handleCompleteDurationSelection}
              >
                <Text style={styles.completeBtnText}>완료</Text>
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
  flex: {
    flex: 1,
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },

  // 카드
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLast: {
    marginBottom: 0,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  subLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  inputBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  inputBorderActive: {
    borderBottomColor: colors.primary,
  },
  inputText: {
    fontSize: fontSize.lg,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  inputTextPlaceholder: {
    color: colors.text.secondary,
  },
  input: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
    padding: 0,
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
  btnDisabled: {
    backgroundColor: 'rgba(101,97,255,0.3)',
  },
  btnTextDisabled: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  btnActive: {
    backgroundColor: colors.primary,
  },
  btnTextActive: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },

  // 모달 바텀시트
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.default,
  },
  bottomSheet: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    paddingTop: 12,
  },
  sheetHandleWrapper: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  sheetScroll: {
    paddingHorizontal: spacing.xl,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  bookText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  bookTextSelected: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  sheetFooter: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  completeBtn: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnDisabled: {
    backgroundColor: 'rgba(101,97,255,0.3)',
  },
  completeBtnText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  // Date Picker
  datePickerContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  datePicker: {
    width: '100%',
    height: 200,
  },

  // 기간 설정 바텀시트 전용
  durationTabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  durationTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: colors.background.base,
  },
  durationTabActive: {
    backgroundColor: colors.primaryLight,
  },
  durationTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  durationTabTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  durationContent: {
    paddingHorizontal: spacing.xl,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  counterLabel: {
    fontSize: fontSize.lg,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  counterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.base,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  counterBtn: {
    padding: spacing.sm,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryText: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
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
