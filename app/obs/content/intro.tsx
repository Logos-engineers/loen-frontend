import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { OBSHeader } from '@/components/obs/obs-header';
import { colors, fontWeight } from '@/constants/tokens';

import BigbookIcon from '@/assets/icons/Bigbook.svg';

export default function ObsIntroScreen() {
  const params = useLocalSearchParams<{
    contentId?: string;
    title?: string;
    verse?: string;
    weekLabel?: string;
    preview?: string;
    origin?: string;
  }>();
  const isPreview = params.preview === 'true';
  const titleText = params.title || 'OBS 제목 데이터가 없습니다';
  const verseText = params.verse || '성경 범위 데이터가 없습니다';

  // OBS 보기는 읽기 전용 — 복습 기록(리뷰)을 만들지 않는다.
  // 복습(진행중/완료)은 '복습하기'(퀴즈) 플로우에서만 시작한다.
  const handleStart = () => {
    const contentId = Number(params.contentId);
    const nextParams = {
      contentId: String(contentId || 0),
      title: params.title,
      verse: params.verse,
      ...(isPreview ? { preview: 'true' } : {}),
      ...(params.origin ? { origin: params.origin } : {}),
    };
    router.push({ pathname: '/obs/content/scripture', params: nextParams });
  };

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
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        <OBSHeader />

        {/* Content Area */}
        <View style={styles.content}>
          <View style={styles.titleWrapper}>
            {!!params.weekLabel && (
              <Text style={styles.titleBadge}>{params.weekLabel}</Text>
            )}
            <Text style={styles.titleMain}>{titleText}</Text>
            <Text style={styles.titleSub}>{verseText}</Text>
          </View>

          {/* Illustration Area */}
          <View style={styles.illustrationWrapper}>
            <BigbookIcon width={160} height={133} />
          </View>
        </View>

        {/* Bottom CTA Area */}
        <View style={styles.ctaWrapper}>
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
            onPress={handleStart}
          >
            <Text style={styles.ctaButtonText}>OBS 시작하기</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  safe: {
    flex: 1,
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
    fontSize: 14,
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
    paddingBottom: 24,
    gap: 12,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
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
