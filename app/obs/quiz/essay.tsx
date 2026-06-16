import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontWeight } from '@/constants/tokens';
import { OBSHeader } from '@/components/obs/obs-header';
import { QuizProgress } from '@/components/obs/quiz-progress';
import { completeObsReview, fetchObsQuizzes } from '@/hooks/useObs';

export default function ObsQ3Screen() {
  const insets = useSafeAreaInsets();
  const [revealed, setRevealed] = useState(false);
  const params = useLocalSearchParams<{
    title?: string;
    question?: string;
    answer?: string;
    contentId?: string;
    reviewId?: string;
    preview?: string;
    step1Result?: string;
    step2Result?: string;
  }>();

  const contentId = params.contentId ? Number(params.contentId) : null;
  const reviewId = params.reviewId ? Number(params.reviewId) : 0;
  const isPreview = params.preview === 'true';
  const step1Result = (params.step1Result === 'correct' || params.step1Result === 'incorrect') ? params.step1Result : null;
  const step2Result = (params.step2Result === 'correct' || params.step2Result === 'incorrect') ? params.step2Result : null;

  const [fetchedQuestion, setFetchedQuestion] = useState<string | null>(null);
  const [fetchedAnswer, setFetchedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!contentId);

  useEffect(() => {
    if (!contentId) return;
    fetchObsQuizzes(contentId)
      .then((quizzes) => {
        const essay = quizzes.find((q) => q.questionType === 'ESSAY');
        if (essay) {
          setFetchedQuestion(essay.questionText);
          setFetchedAnswer(essay.correctAnswer ?? '');
        }
      })
      .catch(() => console.warn('[Essay] fetchObsQuizzes 실패'))
      .finally(() => setIsLoading(false));
  }, [contentId]);

  const question = fetchedQuestion ?? params.question ?? '';
  const answer = fetchedAnswer ?? params.answer ?? '';

  const handleNext = async () => {
    if (!isPreview && reviewId > 0) {
      try { await completeObsReview(reviewId); } catch { console.warn('[Essay] completeObsReview 실패'); }
    }
    router.replace(isPreview ? '/obs/admin' : '/obs/content/complete');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <OBSHeader />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card 1: OBS 타이틀 + 진행 상황 */}
          <View style={styles.sectionWrapper}>
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.obsTitle}>{params.title ?? 'OBS'}</Text>
              </View>
              <QuizProgress currentStep={3} results={[step1Result, step2Result, null]} />
            </View>
          </View>

          {/* Card 2: 짧은 서술형 질문 */}
          <View style={styles.sectionWrapper}>
            <View style={styles.questionCard}>
              {/* 태그 */}
              <View style={styles.tagRow}>
                <View style={styles.tagPill}>
                  <Text style={styles.tagText}>짧은 서술형</Text>
                </View>
              </View>

              {/* Q. + 질문 텍스트 */}
              {isLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
              ) : (
              <View style={styles.questionRow}>
                <View style={styles.qCol}>
                  <Text style={styles.qMark}>Q.</Text>
                </View>
                <Text style={styles.questionText}>{question || '문제 데이터가 없습니다'}</Text>
              </View>
              )}

              {/* 답변 영역 */}
              <View style={styles.answerArea}>
                {/* 답변 필드 — 미공개 시 blur filter 적용 */}
                <View style={[styles.answerField, !revealed && styles.answerFieldBlurred]}>
                  <Text style={styles.answerTextRevealed}>
                    {answer || '정답 데이터가 없습니다'}
                  </Text>
                </View>

                {/* 정답 보기 오버레이 — 텍스트가 blur된 위에 버튼만 표시 */}
                {!revealed && (
                  <View style={[StyleSheet.absoluteFillObject, styles.blurOverlay]}>
                    <TouchableOpacity
                      style={styles.revealButton}
                      activeOpacity={0.85}
                      onPress={() => setRevealed(true)}
                    >
                      <Text style={styles.revealButtonText}>정답 보기</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* CTA — 정답 공개 후에만 노출. 절대위치라 bottom inset 직접 적용 */}
        {revealed && (
          <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 14 }]}>
            <LinearGradient
              colors={['rgba(242,244,247,0)', '#F2F4F7']}
              style={styles.bottomGradient}
              pointerEvents="none"
            />
            <TouchableOpacity
              style={styles.nextButton}
              activeOpacity={0.85}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>다음으로 넘어가기</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  sectionWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ─── Card 1 ──────────────────────────────────
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    paddingBottom: 16,
  },
  cardTitleRow: {
    padding: 16,
  },
  obsTitle: {
    fontSize: 20,
    lineHeight: 20 * 1.4,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  progressRow: {
    paddingHorizontal: 20,
  },
  progressImage: {
    width: '100%',
    height: 52,
  },

  // ─── Card 2 ──────────────────────────────────
  questionCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  tagRow: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagText: {
    fontSize: 12,
    lineHeight: 12 * 1.5,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  qCol: {
    paddingTop: 21,
    paddingBottom: 20,
    paddingLeft: 16,
    paddingRight: 8,
  },
  qMark: {
    fontSize: 20,
    lineHeight: 20 * 1.4,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  questionText: {
    flex: 1,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    fontSize: 20,
    lineHeight: 20 * 1.4,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },

  // ─── 답변 영역 ────────────────────────────────
  // Figma KXC5UQ: padding 40 16
  answerArea: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden', // 자식 오버레이가 borderRadius 안에서 클리핑
  },
  // Figma 887WQD: padding 40 20, bg rgba(101,97,255,0.2)
  answerField: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: 130,
  },
  answerFieldBlurred: {
    filter: [{ blur: 8 }] as any,
  },
  answerTextRevealed: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  blurOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
    backgroundColor: 'rgba(224, 223, 255, 0.35)',
  },
  revealButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  revealButtonText: {
    fontSize: 16,
    lineHeight: 16 * 1.6,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
  },

  // ─── 하단 CTA ─────────────────────────────────
  bottomCta: {
    backgroundColor: colors.background.base,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -20,
    height: 20,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
  },
});
