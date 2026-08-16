import { ObsQuiz, fetchObsQuizzes } from '@/hooks/useObs';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';
import { BottomModal } from '@/components/obs/bottom-modal';
import { OBSHeader } from '@/components/obs/obs-header';
import { QuizProgress } from '@/components/obs/quiz-progress';

import HumanOMarkIcon from '@/assets/icons/humanOmark.svg';

// 정답 비교용 정규화: 앞뒤 공백 제거 + 연속 공백을 하나로. ('하나님의  선물' 같은 띄어쓰기 차이 허용)
const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');

// 조합 중인 한글 낱자(자모: ㆍ, ㅡ, ㅅ 등)는 '완성 글자'로 세지 않는다.
// 천지인은 모음을 아래아(ㆍ) 등 여러 낱자로 조합하는데, 그 중간 버퍼가 정답 글자수를
// 순간적으로 초과한다. 낱자를 길이에서 빼고 세야 조합이 막히지 않고 음절이 완성된다.
const isPendingJamo = (c: string) => /[ᄀ-ᇿ㄰-㆏]/.test(c);
const committedLen = (s: string) => [...s].filter((c) => !isPendingJamo(c)).length;

export default function MultipleChoiceQuizScreen() {
  const params = useLocalSearchParams<{ contentId?: string; reviewId?: string; preview?: string; step1Result?: string }>();
  const contentId = params.contentId ? Number(params.contentId) : null;
  const reviewId = params.reviewId ? Number(params.reviewId) : 0;
  const isPreview = params.preview === 'true';
  const step1Result = (params.step1Result === 'correct' || params.step1Result === 'incorrect') ? params.step1Result : null;

  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [quiz, setQuiz] = useState<ObsQuiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(!!contentId);
  const [inputText, setInputText] = useState('');
  const [quizState, setQuizState] = useState<'idle' | 'incorrect'>('idle');
  const [modalType, setModalType] = useState<'none' | 'correct' | 'showAnswer' | 'quit'>('none');

  useEffect(() => {
    if (!contentId) return;
    fetchObsQuizzes(contentId)
      .then((quizzes) => {
        const shortQuiz = quizzes.find((q) => q.questionType === 'SHORT');
        if (shortQuiz) setQuiz(shortQuiz);
      })
      .catch(() => console.warn('[Multiple] fetchObsQuizzes 실패'))
      .finally(() => setIsLoadingQuiz(false));
  }, [contentId]);

  const CORRECT_ANSWER = quiz?.correctAnswer ?? '';
  // 정답 길이만큼 다 채워야 제출 활성 (빈·부분 입력은 비활성)
  const isAnswerFilled = CORRECT_ANSWER.length > 0 && inputText.length === CORRECT_ANSWER.length;

  // 입력 중에는 채점하지 않는다. 길이가 정답과 같아지는 순간 즉시 채점하면
  // 한글 마지막 음절을 조합하는 도중(자음만 입력된 상태)에 오답으로 처리된다.
  // 채점은 '완료'(onSubmitEditing)/제출 시점에만 수행.
  const handleInputChange = (text: string) => {
    setInputText(text);
    setQuizState('idle');
  };

  const handleSubmit = () => {
    if (normalize(inputText) === normalize(CORRECT_ANSWER)) {
      setModalType('correct');
    } else {
      setQuizState('incorrect');
    }
  };

  const handleShowAnswer = () => {
    setInputText(CORRECT_ANSWER);
    setQuizState('idle');
    setModalType('showAnswer');
  };

  const handleNextQuiz = () => {
    setModalType('none');
    const step2Result = normalize(inputText) === normalize(CORRECT_ANSWER) ? 'correct' : 'incorrect';
    router.push({
      pathname: '/obs/quiz/essay',
      params: {
        contentId: String(contentId ?? ''),
        reviewId: String(reviewId),
        ...(step1Result ? { step1Result } : {}),
        step2Result,
        ...(isPreview ? { preview: 'true' } : {}),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        <OBSHeader />

        {/* 키보드가 올라와도 CTA는 하단에 고정(키보드 위로 따라 올리지 않음). 키보드 위에선 가려져도 무방 —
            제출은 키보드 '완료'(onSubmitEditing)나 키보드 내린 뒤 CTA로. */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.quizCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{quiz?.questionText ? '단답형 퀴즈' : 'OBS'}</Text>
              </View>
              <QuizProgress currentStep={2} results={[step1Result, null, null]} />
            </View>

            {/* Question Area */}
            <View style={styles.questionCard}>
              <View style={styles.tagWrapper}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>단답형</Text>
                </View>
              </View>

              {isLoadingQuiz ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
              ) : (
                <View style={styles.questionRow}>
                  <Text style={styles.questionQ}>Q.</Text>
                  <Text style={styles.questionText}>
                    {quiz?.questionText ?? '퀴즈 데이터가 없습니다'}
                  </Text>
                </View>
              )}

              {/* Character Box Input — 박스는 표시만(pointerEvents none), 실제 입력은 위에 덮은 투명 TextInput이 받는다.
                  0×0 hidden input은 재진입 시 focus()가 불발돼 키보드가 안 올라오는 문제가 있어 풀사이즈 오버레이로 교체. */}
              <View style={styles.charBoxContainer}>
                <View style={styles.charBoxRow} pointerEvents="none">
                  {CORRECT_ANSWER.length > 0
                    ? Array.from({ length: CORRECT_ANSWER.length }).map((_, i) => {
                        const char = inputText[i];
                        const isFilled = i < inputText.length;
                        const isActive = i === inputText.length;
                        const isError = quizState === 'incorrect' && isFilled;
                        return (
                          <View
                            key={i}
                            style={[
                              styles.charBox,
                              isError
                                ? styles.charBoxError
                                : isFilled
                                ? styles.charBoxFilled
                                : isActive
                                ? styles.charBoxActive
                                : styles.charBoxEmpty,
                            ]}
                          >
                            <Text style={[styles.charText, isError && styles.charTextError]}>
                              {char ?? ''}
                            </Text>
                          </View>
                        );
                      })
                    : [0, 1, 2].map((i) => (
                        <View key={i} style={[styles.charBox, styles.charBoxEmpty]} />
                      ))}
                </View>
                <TextInput
                  ref={inputRef}
                  value={inputText}
                  onChangeText={(text) => {
                    // 길이 제한은 '완성 글자수'로만 판단. 조합 중 낱자(천지인 아래아 등)는 세지 않아
                    // 음절 조합이 중간에 막히지 않게 하되, 완성 글자가 정답 길이를 넘으면(진짜 초과) 거부.
                    if (!CORRECT_ANSWER.length || committedLen(text) <= CORRECT_ANSWER.length) {
                      handleInputChange(text);
                    }
                  }}
                  // maxLength는 두지 않는다 — 마지막 칸이 자음으로 찼을 때 모음을 못 붙여
                  // 한글 음절 조합이 막히는 문제(모음 입력 불가)를 유발한다. 길이 제한은 위 onChangeText 가드가 담당.
                  style={styles.overlayInput}
                  caretHidden
                  autoFocus
                  autoCorrect={false}
                  spellCheck={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>

              {quizState === 'incorrect' && (
                <View style={styles.feedbackWrapper}>
                  <Text style={styles.feedbackText}>다시 고민해볼까요?</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* 하단 CTA — 항상 노출. idle엔 '제출하기'(답 채우면 활성), 오답엔 '정답 보기' + '제출하기'.
              오답 뒤 글자를 고치면 idle로 돌아가도 제출 버튼이 그대로 남아 재제출이 끊기지 않는다(qa-bot#33). */}
          <View style={[styles.ctaWrapper, { paddingBottom: insets.bottom + 14 }]}>
            {quizState === 'incorrect' ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={[styles.ctaButton, { flex: 1, backgroundColor: colors.primaryLight }]}
                  activeOpacity={0.8}
                  onPress={handleShowAnswer}
                >
                  <Text style={[styles.ctaButtonText, { color: colors.primary }]}>정답 보기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ctaButton, { flex: 1, backgroundColor: isAnswerFilled ? colors.primary : 'rgba(101, 97, 255, 0.4)' }]}
                  activeOpacity={0.8}
                  disabled={!isAnswerFilled}
                  onPress={handleSubmit}
                >
                  <Text style={[styles.ctaButtonText, { color: colors.white }]}>제출하기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.ctaButton, { backgroundColor: isAnswerFilled ? colors.primary : 'rgba(101, 97, 255, 0.4)' }]}
                activeOpacity={0.8}
                disabled={!isAnswerFilled}
                onPress={handleSubmit}
              >
                <Text style={[styles.ctaButtonText, { color: colors.white }]}>제출하기</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      <BottomModal visible={modalType !== 'none'} onClose={() => setModalType('none')}>
        {modalType === 'correct' && (
          <>
            <View style={styles.modalImageWrapper}>
              <HumanOMarkIcon width={120} height={120} />
            </View>
            <View style={styles.modalTextWrapper}>
              <Text style={styles.modalTitle}>정답이에요!</Text>
              <Text style={styles.modalDesc}>
                {quiz?.explanation || '해설 데이터가 없습니다'}
              </Text>
            </View>
            <View style={styles.modalBtnWrapper}>
              <TouchableOpacity style={styles.modalBtn} activeOpacity={0.8} onPress={handleNextQuiz}>
                <Text style={styles.modalBtnText}>다음 퀴즈 풀기</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {modalType === 'showAnswer' && (
          <>
            <View style={[styles.modalTextWrapper, { paddingTop: 32 }]}>
              <Text style={[styles.modalTitle, { marginBottom: 8 }]}>정답은 {CORRECT_ANSWER || '데이터 없음'} 이에요!</Text>
              <Text style={styles.modalDesc}>
                {quiz?.explanation || '해설 데이터가 없습니다'}
              </Text>
            </View>
            <View style={styles.modalBtnWrapper}>
              <TouchableOpacity style={styles.modalBtn} activeOpacity={0.8} onPress={handleNextQuiz}>
                <Text style={styles.modalBtnText}>다음 퀴즈 풀기</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {modalType === 'quit' && (
          <>
            <View style={[styles.modalTextWrapper, { paddingTop: 32 }]}>
              <Text style={[styles.modalTitle, { marginBottom: 8 }]}>나가시겠어요?</Text>
              <Text style={styles.modalDesc}>
                돌아오실 때 이어서 할 수 있도록 진행상황을 저장해둘게요
              </Text>
            </View>
            <View style={[styles.modalBtnWrapper, { flexDirection: 'row', gap: 12 }]}>
              <TouchableOpacity
                style={[styles.modalBtn, { flex: 1, backgroundColor: colors.primaryLight }]}
                activeOpacity={0.8}
                onPress={() => setModalType('none')}
              >
                <Text style={[styles.modalBtnText, { color: colors.primary }]}>머무르기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { flex: 1 }]}
                activeOpacity={0.8}
                onPress={() => {
                  setModalType('none');
                  router.dismissAll();
                  router.replace('/(tabs)');
                }}
              >
                <Text style={styles.modalBtnText}>나가기</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </BottomModal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 24,
  },
  quizCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    paddingBottom: 16,
    marginBottom: 24,
  },
  cardHeader: {
    padding: 16,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  questionCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    paddingTop: 16,
    paddingBottom: 32,
  },
  tagWrapper: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  tagBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 21,
    paddingBottom: 40,
  },
  questionQ: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    paddingLeft: 16,
    paddingRight: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    paddingRight: 16,
    lineHeight: 28,
  },
  charBoxContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  charBoxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  charBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charBoxEmpty: {
    backgroundColor: 'rgba(101, 97, 255, 0.10)',
  },
  charBoxActive: {
    backgroundColor: 'rgba(101, 97, 255, 0.20)',
  },
  charBoxFilled: {
    backgroundColor: 'rgba(101, 97, 255, 0.20)',
  },
  charBoxError: {
    backgroundColor: `rgba(255, 83, 88, 0.2)`,
    borderRadius: 12,
  },
  charText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.primary,
    textAlign: 'center',
  },
  charTextError: {
    color: colors.incorrect,
  },
  // 박스 전체를 덮는 투명 입력 — 어디를 탭해도 네이티브 포커스(키보드)가 확실히 뜬다.
  overlayInput: {
    ...StyleSheet.absoluteFillObject,
    color: 'transparent',
    textAlign: 'center',
    fontSize: 1,
  },
  feedbackWrapper: {
    alignItems: 'center',
    marginTop: 24,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.incorrect,
  },
  ctaWrapper: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  ctaButton: {
    borderRadius: radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  modalImageWrapper: {
    height: 152,
    backgroundColor: colors.background.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
  },
  modalTextWrapper: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  modalDesc: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: 25.6,
  },
  modalBtnWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: fontWeight.bold,
  },
});
