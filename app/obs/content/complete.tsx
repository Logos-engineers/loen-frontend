import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

import { colors, fontWeight } from '@/constants/tokens';

// 완료 이모지 등장 인터랙션 — 작게 시작해 살짝 오버슈트 후 안착(팝업 + 바운스)
const POP_IN = {
  animationName: {
    '0%': { transform: [{ scale: 0 }, { rotate: '-8deg' }] },
    '55%': { transform: [{ scale: 1.15 }, { rotate: '4deg' }] },
    '75%': { transform: [{ scale: 0.96 }, { rotate: '-2deg' }] },
    '100%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
  },
  animationDuration: '700ms',
  animationTimingFunction: 'ease-out',
} as const;

export default function ObsCompleteScreen() {
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{ origin?: string }>();
  const isFromHome = params.origin === 'home';

  // 완료 화면을 1.5초간 보여준 뒤 자동 이동 (별도 CTA 없음)
  // 홈에서 시작한 플로우면 플로우를 모두 닫고 홈(탭)으로, 아니면 OBS 모아보기로
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isFromHome) router.dismissAll();
      // replace는 완료 화면만 교체해 플로우 화면들이 스택에 남는다 → 모아보기 뒤로가기가
      // 플로우로 되돌아감. dismissTo로 플로우 전체를 닫고 기존 /obs로 복귀해야 [홈, 모아보기]가 됨.
      else router.dismissTo('/obs');
    }, 1500);
    return () => clearTimeout(timer);
  }, [isFromHome]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* 라디얼 그라데이언트 배경 — Figma: circle at 50% 52%, #E0DFFF → #F2F4F7 */}
        <Svg
          width={width}
          height={height}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <RadialGradient
              id="bg"
              cx="50%"
              cy="52%"
              r="60%"
              fx="50%"
              fy="52%"
            >
              <Stop offset="0%" stopColor="#E0DFFF" stopOpacity="1" />
              <Stop offset="100%" stopColor="#F2F4F7" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={width} height={height} fill="url(#bg)" />
        </Svg>

        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          {/* 빈 네비게이션 바 */}
          <View style={styles.navBar} />

          {/* 타이틀 영역 */}
          <View style={styles.titleSection}>
            <Text style={styles.subtitle}>10월 3째주</Text>
            <Text style={styles.title}>OBS 완료</Text>
          </View>

          {/* 일러스트 — 등장 시 팝업 + 살짝 바운스(완료 축하 인터랙션) */}
          <View style={styles.illustrationContainer}>
            <Animated.Image
              source={require('@/assets/icons/obs/obs_complete_book.png')}
              style={[styles.illustration, POP_IN]}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  navBar: {
    height: 46,
  },
  titleSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 16 * 1.6,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    lineHeight: 48,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  illustrationContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  illustration: {
    width: '100%',
    height: 360,
  },
});
