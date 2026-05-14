import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { colors, fontWeight } from '@/constants/tokens';

const ARROW_BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;

const DashedLine = ({ height, flex }: { height?: number; flex?: number }) => (
  <View style={{ width: 2, height, flex, alignItems: 'center' }}>
    <SvgXml
      xml={`<svg width="2" height="100%" preserveAspectRatio="none">
        <line x1="1" y1="0" x2="1" y2="100%" stroke="rgba(13,28,45,0.08)" stroke-width="2" stroke-dasharray="2,4" />
      </svg>`}
      width="2"
      height="100%"
    />
  </View>
);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SUMMARY_TEXT =
  '이스라엘 백성들은 출애굽 후, 약속의 땅 가나안에 들어갈 때까지 수많은 기적을 체험했다. 바로가 이스라엘 백성들이 애굽을 떠나려는 것을 막자, 하나님께서는 이스라엘 백성들이 거주하던 고센 땅을 제외한 애굽 전역에 10가지 재앙을 내리셨다. 애굽을 떠나기 직전에는 홍해 바다가 갈라지는 기적을 보여주셨다. 광야 생활 40년 동안, 만나와 메추라기를 하늘로부터 내려주셨고, 마실 물이 필요할 때는 반석을 갈라서 물을 주셨다. 또한, 갈 길을 몰라하는 이스라엘 민족을 위해서 구름 기둥과 불 기둥으로 인도해 주셨다.';

const QUESTIONS = [
  {
    id: 'first',
    title: '첫번째 질문',
    items: [
      {
        number: '1',
        text: '오늘 성경 본문에 나오는 구름 기둥과 불 기둥의 역사가 다른 기적들과는 조금 다른 특별한 의미가 있는 이유를 생각해 봅시다.',
      },
    ],
  },
  {
    id: 'second',
    title: '두번째 질문',
    items: [
      {
        number: '2',
        text: '그렇다면, 구름 기둥과 불 기둥의 역사는 우리에게 어떤 영적 교훈을 주고 있을까요?',
      },
      {
        number: '2-1',
        textParts: ['"하나님의 인도하심은', '항상 계속된다"라는 진리를 보여줍니다.'] as [string, string],
      },
      {
        number: '2-2',
        text: '하나님께서 낮이나 밤이나, 오늘도 어제도, 이 땅에서 내 삶이 끝날 때까지 나를 인도하시고 보호하시는 이유는 무엇일까요?',
      },
    ],
  },
];

type QuestionSectionProps = {
  title: string;
  items: { number: string; text?: string; textParts?: [string, string] }[];
  initiallyExpanded?: boolean;
};

function QuestionSection({ title, items, initiallyExpanded = true }: QuestionSectionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  };

  return (
    <View style={styles.sectionWrapper}>
      <View style={styles.sectionCard}>
        <TouchableOpacity style={styles.sectionHeader} activeOpacity={0.82} onPress={toggleExpanded}>
          <View style={styles.questionIcon}>
            <Text style={styles.questionIconText}>Q</Text>
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Ionicons
            name="chevron-up"
            size={22}
            color="rgba(13,28,45,0.16)"
            style={!expanded && styles.chevronCollapsed}
          />
        </TouchableOpacity>

        {expanded ? (
          <>
            <View style={styles.divider} />
            <View style={styles.sectionBody}>
              {items.map((item, index) => (
                <View key={item.number} style={styles.questionRow}>
                  <View style={styles.timelineColumn}>
                    {/* 상단 라인: 첫 줄 텍스트 중앙 정렬을 위해 13px 고정 */}
                    {index > 0 ? (
                      <DashedLine height={13} />
                    ) : (
                      <View style={styles.timelineSpacer} />
                    )}
                    
                    <View style={styles.numberBox}>
                      <Text style={styles.numberText}>{item.number}</Text>
                    </View>
                    
                    {/* 하단 라인: 다음 요소까지 이어지도록 유동적 확장 */}
                    {index < items.length - 1 ? (
                      <DashedLine flex={1} />
                    ) : (
                      <View style={[styles.timelineSpacer, { flex: 1 }]} />
                    )}
                  </View>
                  <View style={styles.questionTextWrapper}>
                    {item.textParts ? (
                      <Text style={styles.questionText}>
                        {item.textParts[0]}
                        <View style={[styles.blankBox, { marginHorizontal: 4, marginBottom: -6 }]} />
                        {item.textParts[1]}
                      </Text>
                    ) : (
                      <Text style={styles.questionText}>{item.text}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.inputWrapper}>
              <View style={styles.fakeInput}>
                <Text style={styles.fakeInputText}>자신의 생각을 자유롭게 적어보세요</Text>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

export default function ObsSummaryScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
            <SvgXml xml={ARROW_BACK_SVG} width={24} height={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryWrapper}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <Ionicons name="brush" size={18} color={colors.text.secondary} />
                </View>
                <Text style={styles.summaryTitle}>말씀 정리하기</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.summaryText}>{SUMMARY_TEXT}</Text>
            </View>
          </View>

          {QUESTIONS.map((question, index) => (
            <QuestionSection
              key={question.id}
              title={question.title}
              items={question.items}
              initiallyExpanded={index === 0}
            />
          ))}
        </ScrollView>

        <View style={styles.bottomCta}>
          <View style={styles.bottomBlur} />
          <TouchableOpacity style={[styles.ctaButton, styles.prevButton]} activeOpacity={0.85} onPress={() => router.back()}>
            <Text style={styles.prevButtonText}>이전으로</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctaButton, styles.nextButton]} activeOpacity={0.85} onPress={() => router.push('/obs/q3')}>
            <Text style={styles.nextButtonText}>다음으로</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 112,
  },
  summaryWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryCard: {
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
    borderRadius: 9.6,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTitle: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.bold,
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
    lineHeight: 26,
    fontWeight: fontWeight.medium,
  },
  sectionWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  questionIcon: {
    width: 32,
    height: 32,
    borderRadius: 9.6,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionIconText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: fontWeight.bold,
  },
  sectionTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.bold,
  },
  chevronCollapsed: {
    transform: [{ rotate: '180deg' }],
  },
  sectionBody: {
    paddingTop: 8,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  timelineColumn: {
    width: 56,
    paddingLeft: 16,
    alignItems: 'center',
  },
  timelineSpacer: {
    width: 2,
    height: 13,
  },
  numberBox: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 5,
    borderRadius: 8,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.semibold,
    flexShrink: 0,
    includeFontPadding: false,
  },
  questionTextWrapper: {
    flex: 1,
    paddingRight: 16,
    paddingVertical: 16,
    minWidth: 0,
  },
  questionText: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.medium,
  },
  blankBox: {
    width: 58,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.background.base,
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  fakeInput: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fakeInputText: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: fontWeight.semibold,
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
  bottomBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -20,
    height: 20,
    backgroundColor: 'rgba(242,244,247,0.88)',
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
});
