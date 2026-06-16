import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { OBSHeader } from '@/components/obs/obs-header';
import { getBibleBook } from '@/constants/bibleLoader';
import { colors, fontWeight } from '@/constants/tokens';
import { fetchObsContent, saveObsSummaryAnswers, startObsReview } from '@/hooks/useObs';
import type { ObsTreeNode } from '@/utils/obs-normalize';

const KOR_TO_CODE: Record<string, string> = {
  창세기: 'GEN', 창: 'GEN',
  출애굽기: 'EXO', 출: 'EXO',
  레위기: 'LEV', 레: 'LEV',
  민수기: 'NUM', 민: 'NUM',
  신명기: 'DEU', 신: 'DEU',
  여호수아: 'JOS', 수: 'JOS',
  사사기: 'JDG', 삿: 'JDG',
  룻기: 'RUT', 룻: 'RUT',
  사무엘상: '1SA', 삼상: '1SA',
  사무엘하: '2SA', 삼하: '2SA',
  열왕기상: '1KI', 왕상: '1KI',
  열왕기하: '2KI', 왕하: '2KI',
  역대상: '1CH', 대상: '1CH',
  역대하: '2CH', 대하: '2CH',
  에스라: 'EZR', 스: 'EZR',
  느헤미야: 'NEH', 느: 'NEH',
  에스더: 'EST', 에: 'EST',
  욥기: 'JOB', 욥: 'JOB',
  시편: 'PSA', 시: 'PSA',
  잠언: 'PRO', 잠: 'PRO',
  전도서: 'ECC', 전: 'ECC',
  아가: 'SNG', 아: 'SNG',
  이사야: 'ISA', 사: 'ISA',
  예레미야: 'JER', 렘: 'JER',
  예레미야애가: 'LAM', 애: 'LAM',
  에스겔: 'EZK', 겔: 'EZK',
  다니엘: 'DAN', 단: 'DAN',
  호세아: 'HOS', 호: 'HOS',
  요엘: 'JOL', 욜: 'JOL',
  아모스: 'AMO', 암: 'AMO',
  오바댜: 'OBA', 옵: 'OBA',
  요나: 'JON', 욘: 'JON',
  미가: 'MIC', 미: 'MIC',
  나훔: 'NAM', 나: 'NAM',
  하박국: 'HAB', 합: 'HAB',
  스바냐: 'ZEP', 습: 'ZEP',
  학개: 'HAG', 학: 'HAG',
  스가랴: 'ZEC', 슥: 'ZEC',
  말라기: 'MAL', 말: 'MAL',
  마태복음: 'MAT', 마태: 'MAT', 마: 'MAT',
  마가복음: 'MRK', 마가: 'MRK', 막: 'MRK',
  누가복음: 'LUK', 누가: 'LUK', 눅: 'LUK',
  요한복음: 'JHN', 요한: 'JHN', 요: 'JHN',
  사도행전: 'ACT', 행: 'ACT',
  로마서: 'ROM', 롬: 'ROM',
  고린도전서: '1CO', 고전: '1CO',
  고린도후서: '2CO', 고후: '2CO',
  갈라디아서: 'GAL', 갈: 'GAL',
  에베소서: 'EPH', 엡: 'EPH',
  빌립보서: 'PHP', 빌: 'PHP',
  골로새서: 'COL', 골: 'COL',
  데살로니가전서: '1TH', 살전: '1TH',
  데살로니가후서: '2TH', 살후: '2TH',
  디모데전서: '1TI', 딤전: '1TI',
  디모데후서: '2TI', 딤후: '2TI',
  디도서: 'TIT', 딛: 'TIT',
  빌레몬서: 'PHM', 몬: 'PHM',
  히브리서: 'HEB', 히: 'HEB',
  야고보서: 'JAS', 약: 'JAS',
  베드로전서: '1PE', 벧전: '1PE',
  베드로후서: '2PE', 벧후: '2PE',
  요한일서: '1JN', 요일: '1JN',
  요한이서: '2JN', 요이: '2JN',
  요한삼서: '3JN', 요삼: '3JN',
  유다서: 'JUD', 유: 'JUD',
  요한계시록: 'REV', 계: 'REV',
};

type SubItem = {
  count: string;
  text: string;
  level: number;
  answer?: string | null;
  reference?: string | null;
};

type QuestionCardData = {
  titlePrefix: string;
  subItems: SubItem[];
  reference?: string;
};

type BiblePopup = {
  ref: string;
  verses: { number: number; text: string }[];
} | null;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function getIndentByLevel(level: number): number {
  if (level <= 0) return 0;
  if (level === 1) return 14;
  if (level === 2) return 28;
  if (level === 3) return 42;
  if (level === 4) return 58;
  return 74;
}

function getTextStartOffset(level: number): number {
  const parentLevel = Math.max(level - 1, 0);
  return 16 + getIndentByLevel(parentLevel) + 44;
}

function fillBlank(text: string, answer?: string | null): string {
  if (!text) return '';
  return answer ? text.replace(/\(\s*\)/g, `(${answer})`) : text;
}

function flattenTree(nodes: ObsTreeNode[], depth = 1): SubItem[] {
  const rows: SubItem[] = [];

  nodes.forEach((node) => {
    rows.push({
      count: node.number,
      text: fillBlank(node.text, node.answer),
      level: depth,
      answer: node.answer,
      reference: node.reference,
    });

    rows.push(...flattenTree(node.children ?? [], depth + 1));
  });

  return rows;
}

function toOrdinalLabel(num: number): string {
  const labels = ['', '첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
  return labels[num] ? `${labels[num]}번째 질문` : `${num}번째 질문`;
}

function parseCompactRef(ref: string) {
  const match = ref.trim().match(/^([가-힣]+)(\d+)장?(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;
  const [, bookRaw, chapterStr, startStr, endStr] = match;
  const bookCode = KOR_TO_CODE[bookRaw];
  if (!bookCode) return null;

  const chapter = Number(chapterStr);
  const startVerse = startStr !== undefined ? Number(startStr) : 1;
  const endVerse = endStr !== undefined ? Number(endStr) : startStr !== undefined ? startVerse : 999;

  if (Number.isNaN(chapter) || Number.isNaN(startVerse) || Number.isNaN(endVerse) || endVerse < startVerse) return null;
  return { bookCode, chapter, startVerse, endVerse };
}

function getVersesForRef(ref: string): BiblePopup {
  const parsed = parseCompactRef(ref);
  if (!parsed) return null;
  const bibleDoc = getBibleBook(parsed.bookCode);
  const chapter = bibleDoc?.chapters.find((item) => item.chapter === parsed.chapter);
  const endVerse = parsed.endVerse >= 999 ? Number.MAX_SAFE_INTEGER : parsed.endVerse;
  const verses = chapter?.verses
    .filter((verse) => verse.verse >= parsed.startVerse && verse.verse <= endVerse)
    .map((verse) => ({ number: verse.verse, text: verse.text })) ?? [];

  return { ref, verses };
}

function renderInlineText(text: string, answer: string | null | undefined, onBibleRefPress: (ref: string) => void) {
  const IS_BIBLE_REF = /^[가-힣]{1,4}\d+[장:]/;
  return (fillBlank(text, answer) || '').split('(').map((part, partIndex) => {
    if (partIndex === 0) return <Fragment key={`plain-${partIndex}`}>{part}</Fragment>;

    const closingIndex = part.indexOf(')');
    if (closingIndex === -1) return <Fragment key={`open-${partIndex}`}>{`(${part}`}</Fragment>;

    const inside = part.slice(0, closingIndex);
    const after = part.slice(closingIndex + 1);
    const trimmed = inside.trim();

    if (IS_BIBLE_REF.test(trimmed)) {
      const refs = trimmed.split(/,\s*/);
      return (
        <Fragment key={`ref-${partIndex}`}>
          (
          {refs.map((refPart, refIndex) => {
            const cleanRef = refPart.trim();
            const isRef = IS_BIBLE_REF.test(cleanRef);
            return (
              <Fragment key={`${cleanRef}-${refIndex}`}>
                {refIndex > 0 ? ', ' : ''}
                {isRef ? (
                  <Text style={styles.bibleRefText} onPress={() => onBibleRefPress(cleanRef)}>
                    {cleanRef}
                  </Text>
                ) : (
                  cleanRef
                )}
              </Fragment>
            );
          })}
          )
          {after}
        </Fragment>
      );
    }

    const blankText = inside.trim().length > 0 ? inside : '\u00A0\u00A0\u00A0\u00A0';
    return (
      <Fragment key={`blank-${partIndex}`}>
        (
        <Text style={styles.blankWord}>{blankText}</Text>
        )
        {after}
      </Fragment>
    );
  });
}

function QuestionCard({
  card,
  index,
  answer,
  onAnswerChange,
  onBibleRefPress,
}: {
  card: QuestionCardData;
  index: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  onBibleRefPress: (ref: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.sectionWrapper}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.questionHeader} activeOpacity={0.82} onPress={toggleExpanded}>
          <View style={styles.questionIcon}>
            <Text style={styles.questionIconText}>Q</Text>
          </View>
          <Text style={styles.questionTitle}>{card.titlePrefix}</Text>
          <Ionicons
            name="chevron-up"
            size={24}
            color="rgba(13,28,45,0.28)"
            style={!expanded && styles.chevronCollapsed}
          />
        </TouchableOpacity>

        {expanded ? (
          <>
            <View style={styles.divider} />
            <View style={styles.questionBody}>
              {card.subItems.map((sub, subIndex) => {
                const isUnnumbered = !sub.count;
                const indent = getIndentByLevel(sub.level);

                if (isUnnumbered) {
                  return (
                    <View
                      key={`${index}-${subIndex}`}
                      style={[
                        styles.unnumberedRow,
                        { paddingLeft: getTextStartOffset(sub.level) },
                      ]}
                    >
                      <Text style={styles.questionText}>
                        {renderInlineText(sub.text, sub.answer, onBibleRefPress)}
                      </Text>
                    </View>
                  );
                }

                return (
                  <View
                    key={`${index}-${subIndex}`}
                    style={[
                      styles.questionRow,
                      { paddingLeft: 16 + indent },
                    ]}
                  >
                    <View style={styles.numberBox}>
                      <Text style={styles.numberText}>{sub.count}</Text>
                    </View>
                    <View style={styles.questionTextWrapper}>
                      <Text style={styles.questionText}>
                        {renderInlineText(sub.text, sub.answer, onBibleRefPress)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="자신의 생각을 자유롭게 적어보세요"
                placeholderTextColor="rgba(13,28,45,0.5)"
                multiline
                value={answer}
                onChangeText={onAnswerChange}
                textAlignVertical="top"
              />
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

export default function ObsSummaryScreen() {
  const insets = useSafeAreaInsets();
  const kb = useKeyboardHeight();
  const params = useLocalSearchParams<{ contentId?: string; reviewId?: string; title?: string; verse?: string; preview?: string; origin?: string }>();
  const isPreview = params.preview === 'true';
  const contentId = params.contentId ? Number(params.contentId) : null;
  // 좌상단 쉐브론: OBS 보기 플로우 전체를 빠져나감 (단계 뒤로는 하단 '이전으로'가 담당)
  const exitFlow = () => router.dismissTo(isPreview ? '/obs/admin' : '/obs');
  const initialReviewId = params.reviewId ? Number(params.reviewId) : null;
  const [introText, setIntroText] = useState('');
  const [questionCards, setQuestionCards] = useState<QuestionCardData[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [reviewId, setReviewId] = useState<number | null>(initialReviewId && initialReviewId > 0 ? initialReviewId : null);
  const [isLoading, setIsLoading] = useState(!!contentId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biblePopup, setBiblePopup] = useState<BiblePopup>(null);
  // 바텀시트: 백드롭은 페이드, 시트는 슬라이드 업으로 분리 애니메이션.
  // 닫힘 애니메이션을 끝까지 보여주기 위해 Modal 마운트(sheetMounted)와 내용(biblePopup)을 분리한다.
  const [sheetMounted, setSheetMounted] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const openBibleSheet = (popup: BiblePopup) => {
    if (!popup) return;
    setBiblePopup(popup);
    setSheetMounted(true);
    sheetAnim.setValue(0);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeBibleSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSheetMounted(false);
        setBiblePopup(null);
      }
    });
  };

  useEffect(() => {
    let active = true;
    if (!contentId) {
      setIsLoading(false);
      setError('OBS 데이터가 없습니다.');
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    setError(null);
    fetchObsContent(contentId)
      .then((data) => {
        if (!active) return;
        if (data.reviewId) setReviewId(data.reviewId);
        if (data.summaryAnswers) {
          const restored: Record<number, string> = {};
          Object.entries(data.summaryAnswers).forEach(([key, value]) => {
            restored[Number(key)] = value;
          });
          setAnswers(restored);
        }

        const sections = data.sections ?? [];
        const introSection = sections.find((section) => section.type === 'intro');
        setIntroText(introSection?.type === 'intro' ? introSection.text : '');

        const pointSections = sections.filter((section) => section.type === 'point');
        const cards: QuestionCardData[] = pointSections.map((section, pointIndex) => {
            const questionNumber = pointIndex + 1;
            return {
              titlePrefix: toOrdinalLabel(questionNumber),
              reference: section.reference || data.biblePassage,
              subItems: [
                {
                  count: String(questionNumber),
                  text: fillBlank(section.title, section.answer),
                  level: 0,
                  answer: section.answer,
                  reference: section.reference,
                },
                ...flattenTree(section.items ?? []),
              ],
            };
          });

        setQuestionCards(cards);
        if (sections.length === 0) setError('말씀 정리 데이터가 없습니다.');
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [contentId]);

  const hasContent = useMemo(() => !!introText || questionCards.length > 0, [introText, questionCards.length]);

  const handleBibleRefPress = (ref: string) => {
    openBibleSheet(getVersesForRef(ref));
  };

  const handleNext = async () => {
    const nonEmpty = Object.fromEntries(
      Object.entries(answers).filter(([, value]) => value.trim().length > 0),
    );

    if (contentId && Object.keys(nonEmpty).length > 0) {
      setIsSaving(true);
      try {
        let currentReviewId = reviewId;
        if (!currentReviewId) {
          currentReviewId = await startObsReview(contentId);
          setReviewId(currentReviewId);
        }
        if (currentReviewId) {
          await saveObsSummaryAnswers(currentReviewId, nonEmpty);
        }
      } catch {
        // 저장 실패가 OBS 진행 자체를 막지 않도록 다음 화면으로 이동한다.
      } finally {
        setIsSaving(false);
      }
    }

    router.push({
      pathname: '/obs/content/finish',
      params: {
        contentId: contentId ? String(contentId) : undefined,
        reviewId: reviewId ? String(reviewId) : undefined,
        title: params.title,
        verse: params.verse,
        flow: 'view',
        ...(isPreview ? { preview: 'true' } : {}),
        ...(params.origin ? { origin: params.origin } : {}),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <OBSHeader onBack={exitFlow} />

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, kb > 0 && { paddingBottom: 112 + kb }]}
            showsVerticalScrollIndicator={false}
          >
            {introText ? (
              <View style={styles.sectionWrapper}>
                <View style={styles.card}>
                  <View style={styles.summaryHeader}>
                    <View style={styles.summaryIcon}>
                      <Ionicons name="brush" size={18} color={colors.text.secondary} />
                    </View>
                    <Text style={styles.summaryTitle}>말씀 정리하기</Text>
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.summaryText}>{introText}</Text>
                </View>
              </View>
            ) : null}

            {questionCards.map((card, index) => (
              <QuestionCard
                key={`${card.titlePrefix}-${index}`}
                card={card}
                index={index}
                answer={answers[index] ?? ''}
                onAnswerChange={(value) => setAnswers((prev) => ({ ...prev, [index]: value }))}
                onBibleRefPress={handleBibleRefPress}
              />
            ))}

            {!hasContent ? (
              <View style={styles.sectionWrapper}>
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>{error ?? '말씀 정리 데이터가 없습니다'}</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>
        )}

        {/* 키보드 등장 시 bottom을 키보드 높이만큼 올려 CTA가 키보드 바로 위에 붙음 */}
        <View style={[styles.bottomCta, { bottom: kb, paddingBottom: kb > 0 ? 14 : insets.bottom + 14 }]}>
          <LinearGradient
            colors={['rgba(242,244,247,0)', '#F2F4F7']}
            style={styles.bottomGradient}
            pointerEvents="none"
          />
          <TouchableOpacity style={[styles.ctaButton, styles.prevButton]} activeOpacity={0.85} onPress={() => router.back()}>
            <Text style={styles.prevButtonText}>이전으로</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctaButton, styles.nextButton]} activeOpacity={0.85} disabled={isSaving} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{isSaving ? '저장 중...' : '다음으로'}</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={sheetMounted} transparent animationType="none" statusBarTranslucent onRequestClose={closeBibleSheet}>
          <View style={styles.modalRoot}>
            <Animated.View style={[styles.modalBackdrop, { opacity: sheetAnim }]} pointerEvents="none" />
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeBibleSheet} />
            <View style={styles.sheetContainer} pointerEvents="box-none">
              <Animated.View
                style={[
                  styles.biblePopup,
                  {
                    transform: [
                      {
                        translateY: sheetAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [sheetHeight || Dimensions.get('window').height * 0.6, 0],
                        }),
                      },
                    ],
                  },
                ]}
                onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
              >
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>{biblePopup?.ref}</Text>
                  <TouchableOpacity style={styles.popupClose} onPress={closeBibleSheet}>
                    <Ionicons name="close" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.popupBody} showsVerticalScrollIndicator={false}>
                  {biblePopup?.verses.length ? (
                    biblePopup.verses.map((verse) => (
                      <View style={styles.popupVerseRow} key={verse.number}>
                        <View style={styles.popupVerseBadge}>
                          <Text style={styles.popupVerseNum}>{verse.number}</Text>
                        </View>
                        <Text style={styles.popupVerseText}>{verse.text}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.popupEmpty}>본문을 불러올 수 없습니다.</Text>
                  )}
                </ScrollView>
              </Animated.View>
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 112,
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
  summaryHeader: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTitle: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.semibold,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: colors.background.base,
  },
  summaryText: {
    padding: 16,
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 28,
    fontWeight: fontWeight.medium,
  },
  questionHeader: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
  questionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  questionIconText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: fontWeight.bold,
  },
  questionTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.bold,
  },
  chevronCollapsed: {
    transform: [{ rotate: '180deg' }],
  },
  questionBody: {
    paddingVertical: 4,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 16,
  },
  numberBox: {
    width: 32,
    minHeight: 32,
    borderRadius: 8,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  numberText: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeight.semibold,
    includeFontPadding: false,
  },
  questionTextWrapper: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 12,
    paddingBottom: 20,
  },
  unnumberedRow: {
    paddingRight: 16,
    paddingTop: 2,
    paddingBottom: 10,
  },
  questionText: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.medium,
  },
  blankWord: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.background.base,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  bibleRefText: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textDecorationLine: 'underline',
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  textInput: {
    minHeight: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(13,28,45,0.08)',
    padding: 16,
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.medium,
  },
  emptyCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    padding: 24,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  bottomCta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: colors.background.base,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -20,
    height: 20,
  },
  ctaButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: colors.primaryLight,
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  prevButtonText: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: fontWeight.semibold,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: fontWeight.semibold,
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  biblePopup: {
    width: '100%',
    maxHeight: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.white,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  popupTitle: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeight.bold,
  },
  popupClose: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupBody: {
    maxHeight: 360,
  },
  popupVerseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  popupVerseBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupVerseNum: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeight.bold,
  },
  popupVerseText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 26,
    fontWeight: fontWeight.medium,
  },
  popupEmpty: {
    paddingVertical: 20,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
