/**
 * app/plan/goal-success.tsx — 목표 설정 완료 화면
 * Figma 정합: "N월 N째주 / 목표 설정 완료 / {책} {장}장 읽기에 도전해요!"
 *   + 중앙 과녁 뒤 보라 라디얼 블러 (OBS 완료 화면과 동일 방식)
 *
 * 흐름: goal.tsx 저장 → (router.replace, params 전달) → 이 화면
 */

import { colors } from '@/constants/tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { BigTargetIcon } from '@/components/plan/PlanIcons';

export default function GoalSuccessScreen() {
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{ weekLabel?: string; bookName?: string; chapters?: string }>();

  const weekLabel = params.weekLabel ?? '';
  const bookName = params.bookName ?? '창세기';
  const challengeText = params.chapters
    ? `${bookName} ${params.chapters}장 읽기에 도전해요!`
    : `${bookName} 읽기에 도전해요!`;

  const handleDone = async () => {
    try {
      const posStr = await AsyncStorage.getItem('LOEN_BIBLE_POSITION_v1');
      if (posStr) {
        const pos = JSON.parse(posStr);
        if (pos && pos.bookCode && pos.chapterNum) {
          router.replace({
            pathname: '/bible/read',
            params: { book: pos.bookCode, chapter: String(pos.chapterNum) }
          });
          return;
        }
      }
    } catch (e) {
      console.warn('최근 읽은 성경 정보를 불러오지 못했습니다:', e);
    }
    // 기록이 없을 때 fallback
    router.replace({
      pathname: '/bible/read',
      params: { book: 'GEN', chapter: '1' }
    });
  };

  const handleLater = () => {
    router.replace('/plan');
  };

  return (
    <View style={s.container}>
      {/* 보라 라디얼 블러 배경 — Figma: 중앙(과녁 뒤) #E0DFFF → 가장자리 #F8F8FD */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="goalbg" cx="50%" cy="50%" r="55%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#E0DFFF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#F8F8FD" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#goalbg)" />
      </Svg>

      <SafeAreaView style={s.safe}>
        <View style={s.content}>

          {/* 상단 텍스트 구조 */}
          <View style={s.textGroup}>
            {!!weekLabel && <Text style={s.weekTag}>{weekLabel}</Text>}
            <Text style={s.title}>목표 설정 완료</Text>
            <Text style={s.desc}>{challengeText}</Text>
          </View>

          {/* 중앙 과녁 이미지 — 텍스트와 하단 사이 중앙 정렬 */}
          <View style={s.spacer} />
          <View style={s.imgBox}>
            <BigTargetIcon width={209} height={209} />
          </View>
          <View style={s.spacer} />
        </View>

        {/* 하단 CTA — Figma: '다음에 읽을게요'(링크) 위, '성경 읽으러 가기'(버튼) 아래 */}
        <View style={s.footer}>
          <TouchableOpacity onPress={handleLater} activeOpacity={0.7} style={s.laterBtn}>
            <Text style={s.laterText}>다음에 읽을게요</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.btn} activeOpacity={0.85} onPress={handleDone}>
            <Text style={s.btnText}>성경 읽으러 가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FD' },
  safe: { flex: 1, backgroundColor: 'transparent' },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
  },

  textGroup: {
    alignItems: 'center',
  },
  weekTag: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6554FF',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B1E26',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
    textAlign: 'center',
  },

  imgBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { flex: 1 },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  btn: {
    height: 56,
    width: '100%',
    backgroundColor: '#6554FF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  laterBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  laterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6554FF',
    textDecorationLine: 'underline',
  },
});
