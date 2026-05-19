import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { fetchObsContent, saveObsEmotions, saveObsApplication, completeObsReview } from '@/hooks/useObs';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { colors, fontWeight } from '@/constants/tokens';

const BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9395 3.93934C12.5252 3.35355 13.4748 3.35355 14.0606 3.93934C14.6463 4.52513 14.6463 5.47465 14.0606 6.06043L8.1211 11.9999L14.0606 17.9393C14.6463 18.5251 14.6463 19.4746 14.0606 20.0604C13.4748 20.6462 12.5252 20.6462 11.9395 20.0604L4.93946 13.0604C4.35368 12.4746 4.35368 11.5251 4.93946 10.9393L11.9395 3.93934Z" fill="#0D1C2D" fill-opacity="0.8"/></svg>`;

const EMOTIONS = [
  '마음이 편해졌어요',
  '궁금증이 생겨요',
  '하나님께 감사해요',
  '의지가 커졌어요',
  '마음이 흔들려요',
  '나를 돌아보게 돼요',
];

const EMOTION_TO_TAG: Record<string, string> = {
  '마음이 편해졌어요': 'PEACE',
  '궁금증이 생겨요': 'WONDER',
  '하나님께 감사해요': 'GRATITUDE',
  '의지가 커졌어요': 'HOPE',
  '마음이 흔들려요': 'CHALLENGE',
  '나를 돌아보게 돼요': 'REPENTANCE',
};

const TAG_TO_EMOTION: Record<string, string> = {
  PEACE: '마음이 편해졌어요',
  WONDER: '궁금증이 생겨요',
  GRATITUDE: '하나님께 감사해요',
  HOPE: '의지가 커졌어요',
  CHALLENGE: '마음이 흔들려요',
  REPENTANCE: '나를 돌아보게 돼요',
};

export default function ObsFinishScreen() {
  const params = useLocalSearchParams<{ flow?: string; preview?: string; contentId?: string; title?: string; verse?: string; reviewId?: string }>();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [goalText, setGoalText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [applicationText, setApplicationText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isViewFlow = params.flow === 'view';
  const isPreview = params.preview === 'true';
  const contentId = params.contentId ? Number(params.contentId) : null;
  const [reviewId, setReviewId] = useState<number | null>(params.reviewId ? Number(params.reviewId) : null);

  useEffect(() => {
    if (!isViewFlow) {
      router.replace('/obs/content/complete');
    }
  }, [isViewFlow]);

  useEffect(() => {
    if (!contentId) return;
    fetchObsContent(contentId)
      .then((data) => {
        if (data.reviewId) setReviewId(data.reviewId);
        const appSection = data.sections.find((s) => s.type === 'application');
        if (appSection?.type === 'application' && appSection.items.length > 0) {
          const texts = appSection.items.map((item) => item.text).filter(Boolean).join('\n');
          setApplicationText(texts);
        }
        if (data.emotions && data.emotions.length > 0) {
          const restored = data.emotions.map((tag) => TAG_TO_EMOTION[tag]).filter(Boolean);
          if (restored.length > 0) setSelectedEmotions(restored);
        }
        if (data.applicationAnswer) {
          setGoalText(data.applicationAnswer);
        }
      })
      .catch(() => {});
  }, [contentId]);

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(prev => prev.filter(e => e !== emotion));
    } else {
      setSelectedEmotions(prev => [...prev, emotion]);
    }
  };

  if (!isViewFlow) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
      </>
    );
  }

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
          {/* 감정 선택 섹션 */}
          <View style={styles.sectionWrapper}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Image
                  source={require('@/assets/icons/obs/obs_finish_emotion.png')}
                  style={styles.sectionIcon}
                />
                <Text style={styles.headerTitle}>OBS를 통해 어떤 감정을 느꼈나요?</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.emotionSection}>
                {Array.from({ length: Math.ceil(EMOTIONS.length / 2) }).map((_, rowIndex) => (
                  <View key={rowIndex} style={styles.emotionRow}>
                    {EMOTIONS.slice(rowIndex * 2, rowIndex * 2 + 2).map(emotion => {
                      const isSelected = selectedEmotions.includes(emotion);
                      return (
                        <TouchableOpacity
                          key={emotion}
                          style={[styles.emotionButton, isSelected && styles.emotionButtonSelected]}
                          activeOpacity={0.8}
                          onPress={() => toggleEmotion(emotion)}
                        >
                          <Text style={[styles.emotionText, isSelected && styles.emotionTextSelected]}>
                            {emotion}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 적용하기 섹션 */}
          <View style={styles.sectionWrapper}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Image
                  source={require('@/assets/icons/obs/obs_finish_apply.png')}
                  style={styles.sectionIcon}
                />
                <Text style={styles.headerTitle}>적용하기</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.questionSection}>
                <Text style={styles.questionText}>
                  {applicationText || '적용하기 데이터가 없습니다.'}
                </Text>
              </View>
              <View style={styles.inputSection}>
                <View style={styles.inputField}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="이번 주 나의 목표를 입력해주세요"
                    placeholderTextColor={colors.text.secondary}
                    multiline
                    value={goalText}
                    onChangeText={setGoalText}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomCta}>
          <LinearGradient
            colors={['rgba(242,244,247,0)', '#F2F4F7']}
            style={styles.bottomGradient}
            pointerEvents="none"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.ctaButton, styles.prevButton]}
              activeOpacity={0.85}
              onPress={() => router.back()}
            >
              <Text style={styles.prevButtonText}>이전으로</Text>
            </TouchableOpacity>
            {isPreview ? (
              <TouchableOpacity
                style={[styles.ctaButton, styles.finishButton]}
                activeOpacity={0.85}
                onPress={() => router.push({
                  pathname: '/obs/quiz/ox',
                  params: {
                    contentId: params.contentId,
                    preview: 'true',
                  },
                })}
              >
                <Text style={styles.finishButtonText}>퀴즈 보기</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.ctaButton, styles.finishButton]}
                activeOpacity={0.85}
                onPress={() => setShowModal(true)}
              >
                <Text style={styles.finishButtonText}>OBS 완료하기</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>완료하시겠어요?</Text>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.modalBodyText}>복습하신 내용을 저장할게요.</Text>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSecondary]}
                  activeOpacity={0.85}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalBtnSecondaryText}>머무르기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  activeOpacity={0.85}
                  disabled={isSaving}
                  onPress={async () => {
                    if (!isPreview && reviewId) {
                      setIsSaving(true);
                      try {
                        const tags = selectedEmotions.map((e) => EMOTION_TO_TAG[e]).filter(Boolean);
                        if (tags.length > 0) await saveObsEmotions(reviewId, tags);
                        if (goalText.trim()) await saveObsApplication(reviewId, goalText.trim());
                        await completeObsReview(reviewId);
                      } catch { /* 저장 실패 시 흐름 유지 */ } finally {
                        setIsSaving(false);
                      }
                    }
                    setShowModal(false);
                    router.replace(isPreview ? '/obs/admin' : '/obs/content/complete');
                  }}
                >
                  <Text style={styles.modalBtnPrimaryText}>{isSaving ? '저장 중...' : '완료하기'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingBottom: 120,
  },
  sectionWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 9.6,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16 * 1.6,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: colors.background.base,
  },
  emotionSection: {
    padding: 16,
    gap: 10,
  },
  emotionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emotionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionButtonSelected: {
    backgroundColor: colors.primary,
  },
  emotionText: {
    fontSize: 14,
    lineHeight: 14 * 1.5,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emotionTextSelected: {
    color: colors.white,
  },
  questionSection: {
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 16 * 1.6,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  inputSection: {
    padding: 16,
  },
  inputField: {
    backgroundColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 88,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 15,
    lineHeight: 15 * 1.6,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    textAlignVertical: 'center',
  },
  bottomCta: {
    backgroundColor: colors.background.base,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -20,
    height: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  ctaButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: colors.primaryLight,
  },
  prevButtonText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textAlign: 'center',
  },
  finishButton: {
    backgroundColor: colors.primary,
  },
  finishButtonText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 28, 45, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: 361,
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    lineHeight: 20 * 1.4,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  modalBodyText: {
    fontSize: 16,
    lineHeight: 16 * 1.6,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: colors.primaryLight,
  },
  modalBtnSecondaryText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textAlign: 'center',
  },
  modalBtnPrimary: {
    backgroundColor: colors.primary,
  },
  modalBtnPrimaryText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
  },
});
