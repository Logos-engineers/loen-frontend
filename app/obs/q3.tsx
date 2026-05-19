import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { colors, fontWeight } from '@/constants/tokens';
import { QuizProgress } from '@/components/obs/quiz-progress';
import { completeObsReview, fetchObsQuizzes } from '@/hooks/useObs';

const BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9395 3.93934C12.5252 3.35355 13.4748 3.35355 14.0606 3.93934C14.6463 4.52513 14.6463 5.47465 14.0606 6.06043L8.1211 11.9999L14.0606 17.9393C14.6463 18.5251 14.6463 19.4746 14.0606 20.0604C13.4748 20.6462 12.5252 20.6462 11.9395 20.0604L4.93946 13.0604C4.35368 12.4746 4.35368 11.5251 4.93946 10.9393L11.9395 3.93934Z" fill="#0D1C2D" fill-opacity="0.8"/></svg>`;

export default function ObsQ3Screen() {
  const [revealed, setRevealed] = useState(false);
  const params = useLocalSearchParams<{
    title?: string;
    question?: string;
    answer?: string;
    contentId?: string;
    reviewId?: string;
    preview?: string;
  }>();

  const contentId = params.contentId ? Number(params.contentId) : null;
  const reviewId = params.reviewId ? Number(params.reviewId) : 0;
  const isPreview = params.preview === 'true';

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
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [contentId]);

  const question = fetchedQuestion ?? params.question ?? '';
  const answer = fetchedAnswer ?? params.answer ?? '';

  const handleNext = async () => {
    if (!isPreview && reviewId > 0) {
      try { await completeObsReview(reviewId); } catch { /* ignore */ }
    }
    router.replace('/obs/complete');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
            <SvgXml xml={BACK_SVG} width={24} height={24} />
          </TouchableOpacity>
        </View>

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
              <QuizProgress currentStep={3} />
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

              {/* 답변 영역 — 오버레이로 가려진 상태 / 공개 상태 토글 */}
              <View style={styles.answerArea}>
                {/* 답변 필드 */}
                <View style={styles.answerField}>
                  <Text style={revealed ? styles.answerTextRevealed : styles.answerTextHidden}>
                    {answer || '정답 데이터가 없습니다'}
                  </Text>
                </View>

                {/* 정답 보기 오버레이 */}
                {!revealed && (
                  <View style={StyleSheet.absoluteFillObject}>
                    <View style={styles.blurOverlay}>
                      <TouchableOpacity
                        style={styles.revealButton}
                        activeOpacity={0.85}
                        onPress={() => setRevealed(true)}
                      >
                        <Text style={styles.revealButtonText}>정답 보기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* CTA — 정답 공개 후에만 노출 */}
        {revealed && (
          <View style={styles.bottomCta}>
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
  navBar: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  answerTextHidden: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontWeight: fontWeight.semibold,
    color: 'transparent', // 오버레이 아래 텍스트는 투명하게
  },
  answerTextRevealed: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  // Figma D8VQ16: frosted glass overlay
  blurOverlay: {
    flex: 1,
    backgroundColor: 'rgba(224, 223, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
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
