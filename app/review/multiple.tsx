import { ObsQuiz, fetchObsQuizzes } from '@/hooks/useObs';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

// tokens
import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';
import { QuizProgress } from '@/components/obs/quiz-progress';

import HumanOMarkIcon from '@/assets/icons/humanOmark.svg';

// Navigation SVGs
const ARROW_BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;

export default function MultipleChoiceQuizScreen() {
  const params = useLocalSearchParams<{ contentId?: string; reviewId?: string; preview?: string }>();
  const contentId = params.contentId ? Number(params.contentId) : null;
  const reviewId = params.reviewId ? Number(params.reviewId) : 0;
  const isPreview = params.preview === 'true';

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
      .catch(() => {})
      .finally(() => setIsLoadingQuiz(false));
  }, [contentId]);

  const CORRECT_ANSWER = quiz?.correctAnswer ?? '';

  const handleInputChange = (text: string) => {
    setInputText(text);
    setQuizState('idle');
  };

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
        ...(isPreview ? { preview: 'true' } : {}),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        
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
              <QuizProgress currentStep={2} />
              
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
              <View style={styles.inputContainer}>
                <TextInput
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
              </View>

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
