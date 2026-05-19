import { Stack, router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

import { colors, fontWeight } from '@/constants/tokens';

export default function ObsCompleteScreen() {
  const { width, height } = useWindowDimensions();

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

          {/* 일러스트 */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('@/assets/icons/obs/obs_complete_book.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* 홈으로 버튼 */}
          <View style={styles.bottomArea}>
            <TouchableOpacity
              style={styles.homeButton}
              activeOpacity={0.85}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.homeButtonText}>홈으로</Text>
            </TouchableOpacity>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingVertical: 6,
  },
  illustration: {
    width: '100%',
    height: 360,
  },
  bottomArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  homeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    fontSize: 18,
    lineHeight: 18 * 1.4,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
  },
});
