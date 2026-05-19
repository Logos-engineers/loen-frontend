import { ObsQuiz, fetchObsQuizzes } from '@/hooks/useObs';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

// tokens
import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';

import HumanOMarkIcon from '@/assets/icons/humanOmark.svg';

const PROGRESS_RING_SVG = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="43.3333" height="43.3333" rx="21.6667" fill="#0D1C2D" fill-opacity="0.5"/><path d="M21.6667 12.9665C26.4644 12.9667 30.3677 16.8686 30.3669 21.6667C30.3658 26.4643 26.4636 30.3666 21.6667 30.3669C16.8704 30.3669 12.9675 26.4644 12.9665 21.6667C12.9665 16.8695 16.8695 12.9665 21.6667 12.9665ZM21.6667 15.3669C18.3022 15.3669 15.5437 18.0192 15.3747 21.3424L15.3669 21.6715C15.3706 25.1432 18.1963 27.9665 21.6667 27.9665C25.031 27.9663 27.789 25.3139 27.9587 21.9899L27.9665 21.6667L27.9587 21.3424C27.7895 18.0193 25.0318 15.3671 21.6667 15.3669Z" fill="white"/></svg>`;
const PROGRESS_2_ACTIVE_SVG = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="43.3333" height="43.3333" rx="21.6667" fill="#6561FF"/><path d="M16.6102 29.9497V28.1441L22.2751 22.434C24.0581 20.5608 24.9609 19.5226 24.9609 18.1007C24.9609 16.4983 23.6518 15.4601 21.9366 15.4601C20.131 15.4601 18.9574 16.6111 18.9574 18.349H16.6102C16.5876 15.3698 18.8671 13.3837 21.9817 13.3837C25.1414 13.3837 27.3081 15.3698 27.3307 18.033C27.3081 19.8611 26.4504 21.3056 23.381 24.3299L20.0633 27.6927V27.8281H27.6015V29.9497H16.6102Z" fill="white"/></svg>`;
const PROGRESS_3_INACTIVE_SVG = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="43.3333" height="43.3333" rx="21.6667" fill="#0D1C2D" fill-opacity="0.08"/><path d="M22.5006 30.0625C19.1152 30.0625 16.7003 28.2344 16.61 25.5712H19.1378C19.2281 27.0156 20.6499 27.9184 22.4781 27.9184C24.4416 27.9184 25.886 26.8351 25.886 25.2552C25.886 23.6528 24.5319 22.4792 22.2072 22.4792H20.8079V20.4479H22.2072C24.0579 20.4479 25.3669 19.4097 25.3669 17.8524C25.3669 16.3628 24.261 15.3472 22.5232 15.3472C20.8756 15.3472 19.4312 16.25 19.3635 17.7396H16.9711C17.0388 15.0764 19.4989 13.2708 22.5458 13.2708C25.7506 13.2708 27.7819 15.3021 27.7593 17.717C27.7819 19.5677 26.6308 20.9219 24.8704 21.3507V21.4635C27.1048 21.7795 28.3913 23.2691 28.3913 25.3455C28.3913 28.0764 25.886 30.0625 22.5006 30.0625Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;

// Navigation SVGs
const ARROW_BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;

// Progress Indicator SVG Components
const ID_LINE_COMPLETED = `<svg width="100%" height="2" preserveAspectRatio="none" viewBox="0 0 100 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 1H100" stroke="#0D1C2D" stroke-opacity="0.08" stroke-width="2"/></svg>`;
const ID_LINE_INACTIVE = `<svg width="100%" height="2" preserveAspectRatio="none" viewBox="0 0 100 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 1H100" stroke="#0D1C2D" stroke-opacity="0.08" stroke-width="2"/></svg>`;

export default function MultipleChoiceQuizScreen() {
  const params = useLocalSearchParams<{ contentId?: string; reviewId?: string }>();
  const contentId = params.contentId ? Number(params.contentId) : null;
  const reviewId = params.reviewId ? Number(params.reviewId) : 0;

  const [quiz, setQuiz] = useState<ObsQuiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(!!contentId);
  const [inputText, setInputText] = useState('');
  const [quizState, setQuizState] = useState<'idle' | 'incorrect'>('idle');
  const [modalType, setModalType] = useState<'none' | 'correct' | 'showAnswer' | 'quit'>('none');
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!contentId) return;
    fetchObsQuizzes(contentId)
      .then((quizzes) => {
        const shortQuiz = quizzes.find((q) => q.questionType === 'SHORT');
        if (shortQuiz) setQuiz(shortQuiz);
      })
      .catch(() => {})
      .finally(() => setIsLoadingQuiz(false));
  }, [contentId]);

  const CORRECT_ANSWER = quiz?.correctAnswer ?? '';

  const handleInputChange = (text: string) => {
    setInputText(text);
    setQuizState('idle');
  };

  const handleBoxPress = () => { inputRef.current?.focus(); };

  const handleSubmit = () => {
    if (inputText.trim() === CORRECT_ANSWER) {
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
    router.push({
      pathname: '/obs/q3',
      params: {
        contentId: String(contentId ?? ''),
        reviewId: String(reviewId),
      },
    });
  };

  // Calculate generic active progress item
  const renderProgressIndicator = (step: number, isActive: boolean) => {
    let xml = "";
    if (step === 1) xml = PROGRESS_RING_SVG;
    else if (step === 2) xml = PROGRESS_2_ACTIVE_SVG;
    else xml = PROGRESS_3_INACTIVE_SVG;

    if (isActive) {
      return (
        <View style={styles.progressItemActiveContainer}>
          <View style={styles.progressItemInner}>
            <SvgXml xml={xml} width={43.33} height={43.33} />
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.progressItemInactiveContainer}>
          <View style={styles.progressItemInner}>
             <SvgXml xml={xml} width={43.33} height={43.33} />
          </View>
        </View>
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => setModalType('quit')}>
            <SvgXml xml={ARROW_BACK_SVG} width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Content Area - compressed gracefully without gap */}
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.content} 
            contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.quizCard}>
              
              {/* Header: Title */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{quiz?.questionText ? '단답형 퀴즈' : 'OBS'}</Text>
              </View>

              {/* Progress Indicator */}
              <View style={styles.progressRow}>
                {renderProgressIndicator(1, false)}
                <View style={styles.progressLine}>
                  <SvgXml xml={ID_LINE_COMPLETED} width="100%" height={2} />
                </View>
                {renderProgressIndicator(2, true)}
                <View style={styles.progressLine}>
                  <SvgXml xml={ID_LINE_INACTIVE} width="100%" height={2} />
                </View>
                {renderProgressIndicator(3, false)}
              </View>
              
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

              {/* Text Input */}
              <TouchableOpacity activeOpacity={1} onPress={handleBoxPress} style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={[styles.answerInput, quizState === 'incorrect' && styles.answerInputError]}
                  value={inputText}
                  onChangeText={handleInputChange}
                  placeholder="답을 입력하세요"
                  placeholderTextColor="rgba(13,28,45,0.3)"
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </TouchableOpacity>

              {/* Incorrect Feedback Message */}
              {quizState === 'incorrect' && (
                <View style={styles.feedbackWrapper}>
                  <Text style={styles.feedbackText}>다시 고민해볼까요?</Text>
                </View>
              )}

            </View>
          </ScrollView>

          {/* Bottom CTA Area - Secured to the bottom of the padded container */}
          <View style={[styles.ctaWrapper, { 
             paddingBottom: Platform.OS === 'ios' ? 20 : 20 
          }]}>
            {quizState === 'incorrect' ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={[styles.ctaButton, { flex: 1, backgroundColor: 'rgba(101, 97, 255, 0.2)' }]}
                  activeOpacity={0.8}
                  onPress={handleShowAnswer}
                >
                  <Text style={[styles.ctaButtonText, { color: colors.primary }]}>정답 보기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ctaButton, { flex: 1, backgroundColor: 'rgba(101, 97, 255, 0.4)' }]}
                  activeOpacity={0.8}
                  disabled={true} 
                >
                  <Text style={[styles.ctaButtonText, { color: '#FFFFFF' }]}>다음 퀴즈 풀기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.ctaButton,
                  { backgroundColor: inputText.trim().length > 0 ? colors.primary : 'rgba(101, 97, 255, 0.4)' }
                ]} 
                activeOpacity={0.8}
                onPress={handleSubmit}
                disabled={inputText.trim().length === 0}
              >
                <Text style={[
                  styles.ctaButtonText,
                  { color: '#FFFFFF' }
                ]}>
                  선택할게요  
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Dynamic Modal */}
      <Modal
        visible={modalType !== 'none'}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalType('none')}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              
              {modalType === 'correct' && (
                <>
                  <View style={styles.modalHandleWrapper}>
                    <View style={styles.modalHandle} />
                  </View>
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
                      style={[styles.modalBtn, { flex: 1, backgroundColor: 'rgba(101, 97, 255, 0.1)' }]} 
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

            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F4F7', 
  },
  navBar: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 24,
  },
  quizCard: {
    backgroundColor: '#FFFFFF', 
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
    color: 'rgba(13, 28, 45, 0.8)',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressItemInactiveContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressItemActiveContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(101, 97, 255, 0.2)', // Light primary bg shell
  },
  progressItemInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    paddingTop: 16,
    paddingBottom: 32,
  },
  tagWrapper: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  tagBadge: {
    backgroundColor: 'rgba(101, 97, 255, 0.2)', 
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
    color: 'rgba(13, 28, 45, 0.8)',
    paddingRight: 16,
    lineHeight: 28,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerInput: {
    borderWidth: 1.5,
    borderColor: 'rgba(101, 97, 255, 0.3)',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: 'rgba(13, 28, 45, 0.8)',
    backgroundColor: 'rgba(101, 97, 255, 0.05)',
  },
  answerInputError: {
    borderColor: 'rgba(255, 84, 73, 0.5)',
    backgroundColor: 'rgba(255, 84, 73, 0.05)',
  },
  feedbackWrapper: {
    alignItems: 'center',
    marginTop: 24,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: '#FF5449', // Red error text
  },
  ctaWrapper: {
    backgroundColor: '#FFFFFF', 
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
  
  // Modal Styles (Copied from ox.tsx to maintain standard)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 28, 45, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalHandle: {
    width: 80,
    height: 5,
    backgroundColor: 'rgba(13, 28, 45, 0.08)',
    borderRadius: 10,
  },
  modalImageWrapper: {
    height: 152,
    backgroundColor: '#F2F4F7', 
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
    color: 'rgba(13, 28, 45, 0.8)',
  },
  modalDesc: {
    fontSize: 16,
    fontWeight: fontWeight.semibold, 
    color: 'rgba(13, 28, 45, 0.8)',
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: fontWeight.bold, 
  },
});
