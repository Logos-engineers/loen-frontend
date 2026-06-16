import { ObsQuiz, fetchObsQuizzes } from '@/hooks/useObs';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius } from '@/constants/tokens';
import { BottomModal } from '@/components/obs/bottom-modal';
import { OBSHeader } from '@/components/obs/obs-header';
import { QuizProgress } from '@/components/obs/quiz-progress';

import OMarkIcon from '@/assets/icons/O mark.svg';
import XMarkIcon from '@/assets/icons/X mark.svg';
import HumanOMarkIcon from '@/assets/icons/humanOmark.svg';
import HumanXMarkIcon from '@/assets/icons/humanXmark.svg';
import WhiteOMarkIcon from '@/assets/icons/whiteO mark.svg';
import WhiteXMarkIcon from '@/assets/icons/whiteX mark.svg';

export default function OXQuizScreen() {
  const insets = useSafeAreaInsets();
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
      .catch(() => console.warn('[OX] fetchObsQuizzes 실패'))
      .finally(() => setIsLoadingQuiz(false));
  }, [contentId]);

  const correctAnswer = quiz?.correctAnswer ?? 'O';
  const isCorrect = selectedAnswer === correctAnswer;

  const handleSubmit = () => {
    if (selectedAnswer) setIsModalVisible(true);
  };

  const handleNextQuiz = () => {
    setIsModalVisible(false);
    router.push({
      pathname: '/obs/quiz/multiple',
      params: {
        contentId: String(contentId ?? ''),
        reviewId,
        step1Result: isCorrect ? 'correct' : 'incorrect',
        ...(isPreview ? { preview: 'true' } : {}),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        <OBSHeader />

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
                style={[styles.optionBtn, { backgroundColor: selectedAnswer === 'O' ? colors.primary : colors.background.base }]}
                activeOpacity={0.8}
                onPress={() => setSelectedAnswer('O')}
              >
                {selectedAnswer === 'O' ? <WhiteOMarkIcon width={80} height={80} /> : <OMarkIcon width={80} height={80} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionBtn, { backgroundColor: selectedAnswer === 'X' ? colors.incorrect : colors.background.base }]}
                activeOpacity={0.8}
                onPress={() => setSelectedAnswer('X')}
              >
                {selectedAnswer === 'X' ? <WhiteXMarkIcon width={80} height={80} /> : <XMarkIcon width={80} height={80} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom CTA Area — 기준: 좌우 16 / 하단 inset+14 */}
        <View style={[styles.ctaWrapper, { paddingBottom: insets.bottom + 14 }]}>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              { backgroundColor: selectedAnswer ? colors.primary : 'rgba(101, 97, 255, 0.4)' }
            ]}
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!selectedAnswer}
          >
            <Text style={styles.ctaButtonText}>선택할게요</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>

      <BottomModal visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <View style={styles.modalImageWrapper}>
          {isCorrect ? (
            <HumanOMarkIcon width={80} height={80} />
          ) : (
            <HumanXMarkIcon width={80} height={80} />
          )}
        </View>
        <View style={styles.modalTextWrapper}>
          <Text style={styles.modalTitle}>{isCorrect ? '정답이에요!' : '오답이에요!'}</Text>
          <Text style={styles.modalDesc}>
            {quiz?.explanation || '해설 데이터가 없습니다'}
          </Text>
        </View>
        <View style={styles.modalBtnWrapper}>
          <TouchableOpacity
            style={styles.modalBtn}
            activeOpacity={0.8}
            onPress={handleNextQuiz}
          >
            <Text style={styles.modalBtnText}>다음 퀴즈 풀기</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 24,
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
    color: colors.text.primary,
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
    fontWeight: fontWeight.semibold,
    color: colors.white,
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
