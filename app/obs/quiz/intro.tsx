import { startObsReview } from '@/hooks/useObs';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop, SvgXml } from 'react-native-svg';

// tokens
import { colors, fontWeight } from '@/constants/tokens';
import { formatWeekLabel } from '@/utils/date';

import BigbookIcon from '@/assets/icons/Bigbook.svg';

// Back Icon 
const ARROW_BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;

// "YYYY년 M월 D일" 형태의 표시용 날짜를 받아 공용 주차 계산(formatWeekLabel)에 위임.
function getWeekOfMonth(dateString?: string) {
  if (!dateString) return '';
  const match = dateString.match(/(\d+)년\s+(\d+)월\s+(\d+)일/);
  if (!match) return dateString;
  const [, y, mo, d] = match;
  return formatWeekLabel(`${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`);
}

export default function ReviewIntroScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ contentId?: string; title?: string; verse?: string; date?: string }>();
  const [isStarting, setIsStarting] = useState(false);

  const weekText = getWeekOfMonth(params.date);
  const titleText = params.title || 'OBS 제목 데이터가 없습니다';
  const verseText = params.verse || '성경 범위 데이터가 없습니다';
  const contentId = params.contentId ? Number(params.contentId) : null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.background}>
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient id="grad" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
              <Stop offset="0%" stopColor="#E0DFFF" stopOpacity="1" />
              <Stop offset="100%" stopColor="#F2F4F7" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
        </Svg>
      </View>
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
            <SvgXml xml={ARROW_BACK_SVG} width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          <View style={styles.titleWrapper}>
            <Text style={styles.titleBadge}>{weekText}</Text>
            <Text style={styles.titleMain}>{titleText}</Text>
            <Text style={styles.titleSub}>{verseText}</Text>
          </View>

          {/* Illustration Area */}
          <View style={styles.illustrationWrapper}>
            <BigbookIcon width={160} height={133} />
          </View>
        </View>

        {/* Bottom CTA Area — 기준: 좌우 16 / 하단 inset+14 */}
        <View style={[styles.ctaWrapper, { paddingBottom: insets.bottom + 14 }]}>
          <TouchableOpacity 
            style={styles.skipButton} 
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.skipButtonText}>다음에 할래요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.8}
            disabled={isStarting}
            onPress={async () => {
              if (!contentId) { router.push('/obs/quiz/ox'); return; }
              setIsStarting(true);
              let reviewId = 0;
              try { reviewId = await startObsReview(contentId); } catch { /* 409 or error — proceed without reviewId */ }
              setIsStarting(false);
              router.push({ pathname: '/obs/quiz/ox', params: { contentId: String(contentId), reviewId: String(reviewId) } });
            }}
          >
            {isStarting ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaButtonText}>복습 시작하기</Text>}
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  safe: {
    flex: 1,
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
    paddingHorizontal: 20,
    marginTop: 16,
  },
  titleWrapper: {
    gap: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  titleBadge: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  titleMain: {
    fontSize: 32,
    color: 'rgba(13, 28, 45, 0.8)',
    fontWeight: fontWeight.bold,
    lineHeight: 48,
    textAlign: 'center',
  },
  titleSub: {
    fontSize: 16,
    color: 'rgba(13, 28, 45, 0.5)',
    marginTop: 4,
    fontWeight: fontWeight.medium,
  },
  illustrationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaWrapper: {
    paddingHorizontal: 16,
    gap: 12,
  },
  skipButton: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    alignSelf: 'center',
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: fontWeight.semibold,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: fontWeight.semibold,
  },
});
