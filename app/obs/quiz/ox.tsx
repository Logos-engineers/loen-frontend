import { ObsQuiz, fetchObsQuizzes } from '@/hooks/useObs';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

// tokens
import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';
import { QuizProgress } from '@/components/obs/quiz-progress';

import OMarkIcon from '@/assets/icons/O mark.svg';
import XMarkIcon from '@/assets/icons/X mark.svg';
import HumanOMarkIcon from '@/assets/icons/humanOmark.svg';
import HumanXMarkIcon from '@/assets/icons/humanXmark.svg';
import WhiteOMarkIcon from '@/assets/icons/whiteO mark.svg';
import WhiteXMarkIcon from '@/assets/icons/whiteX mark.svg';

// Navigation SVGs
const ARROW_BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;

export default function OXQuizScreen() {
  const params = useLocalSearchParams<{ contentId?: string; reviewId?: string; preview?: string }>();
  const contentId = params.contentId ? Number(params.contentId) : null;
  const reviewId = params.reviewId ?? '0';
  const isPreview = params.preview === 'true';

  const [quiz, setQuiz] = useState<ObsQuiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(!!contentId);
  const [selectedAnswer, setSelectedAnswer] = useState<'O' | 'X' | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (!contentId) return;
    fetchObsQuizzes(contentId)
      .then((quizzes) => {
        const oxQuiz = quizzes.find((q) => q.questionType === 'OX');
        if (oxQuiz) setQuiz(oxQuiz);
      })
      .catch(() => {})
      .finally(() => setIsLoadingQuiz(false));
  }, [contentId]);

  const correctAnswer = quiz?.correctAnswer ?? 'O';
  const isCorrect = selectedAnswer === correctAnswer;

  const handleSubmit = () => {
    if (selectedAnswer) setIsModalVisible(true);
  };

  const handleNextQuiz = () => {
    setIsModalVisible(false);
    router.push({ pathname: '/obs/quiz/multiple', params: { contentId: String(contentId ?? ''), reviewId, ...(isPreview ? { preview: 'true' } : {}) } });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
            <SvgXml xml={ARROW_BACK_SVG} width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          <View style={styles.quizCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>OBS</Text>
            </View>
            <QuizProgress currentStep={1} />
          </View>

          {/* Question Area */}
          <View style={styles.questionCard}>
            <View style={styles.tagWrapper}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>O/X퀴즈</Text>
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
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[styles.optionBtn, { backgroundColor: selectedAnswer === 'O' ? '#6561FF' : '#F2F4F7' }]}
                activeOpacity={0.8}
                onPress={() => setSelectedAnswer('O')}
              >
                {selectedAnswer === 'O' ? <WhiteOMarkIcon width={80} height={80} /> : <OMarkIcon width={80} height={80} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionBtn, { backgroundColor: selectedAnswer === 'X' ? '#6561FF' : '#F2F4F7' }]}
                activeOpacity={0.8}
                onPress={() => setSelectedAnswer('X')}
              >
                {selectedAnswer === 'X' ? <WhiteXMarkIcon width={80} height={80} /> : <XMarkIcon width={80} height={80} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom CTA Area */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity 
            style={[
              styles.ctaButton,
              { backgroundColor: selectedAnswer ? colors.primary : 'rgba(101, 97, 255, 0.4)' }
            ]} 
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!selectedAnswer}
          >
            <Text style={[
              styles.ctaButtonText,
              { color: '#FFFFFF' }
            ]}>
              선택할게요
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>

      {/* Result Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsModalVisible(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Top Handle */}
              <View style={styles.modalHandleWrapper}>
                <View style={styles.modalHandle} />
              </View>

              {/* Illustration Area */}
              <View style={styles.modalImageWrapper}>
                {isCorrect ? (
                  <HumanOMarkIcon width={80} height={80} />
                ) : (
                  <HumanXMarkIcon width={80} height={80} />
                )}
              </View>

              {/* Text Area */}
              <View style={styles.modalTextWrapper}>
                <Text style={styles.modalTitle}>{isCorrect ? '정답이에요!' : '오답이에요!'}</Text>
                <Text style={styles.modalDesc}>
                  {quiz?.explanation || '해설 데이터가 없습니다'}
                </Text>
              </View>

              {/* Next Button */}
              <View style={styles.modalBtnWrapper}>
                <TouchableOpacity 
                  style={styles.modalBtn} 
                  activeOpacity={0.8}
                  onPress={handleNextQuiz}
                >
                  <Text style={styles.modalBtnText}>다음 퀴즈 풀기</Text>
                </TouchableOpacity>
              </View>

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
    backgroundColor: '#F2F4F7', // background/fill/elevated
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
    backgroundColor: '#FFFFFF', // white
    borderRadius: radius.lg, // 16px
    paddingBottom: 16,
  },
  cardHeader: {
    padding: 16,
  },
  cardTitle: {
    fontSize: fontSize.xl, // 20px
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
    paddingBottom: 24,
  },
  tagWrapper: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  tagBadge: {
    backgroundColor: 'rgba(101, 97, 255, 0.2)', // Light primary
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm, // 8px
    alignSelf: 'flex-start',
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
    paddingBottom: 20,
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
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  optionBtn: {
    flex: 1,
    height: 160,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  ctaWrapper: {
    backgroundColor: '#FFFFFF', // white
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  ctaButton: {
    borderRadius: radius.md, // 12px
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: fontSize.lg, // 18px
    fontWeight: fontWeight.semibold,
  },
  // Modal Styles
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
    paddingBottom: 32, // More spacing before the button 
    gap: 12, // Increased gap slightly
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: 'rgba(13, 28, 45, 0.8)',
  },
  modalDesc: {
    fontSize: 16,
    fontWeight: fontWeight.semibold, // Figma 6413-29693 SemiBold
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
    fontWeight: fontWeight.bold, // Figma 6413-29693 Bold
  },
});
