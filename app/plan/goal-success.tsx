/**
 * app/plan/goal-success.tsx — 목표 설정 완료 화면
 * Figma: 퀴즈인트로 화면 시안1 (목표 달성 축하 화면)
 *
 * 흐름: goal.tsx 저장 → (router.replace) → 이 화면
 * CTA: "통독표로 돌아가기" → router.replace('/(tabs)/plan')
 */

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BigTargetIcon } from '@/components/plan/PlanIcons';

export default function GoalSuccessScreen() {
  const handleDone = () => {
    // 확인 후 plan 탭으로 이동 (또는 성경 읽기 뷰로 이동)
    router.replace('/(tabs)/plan');
  };

  const handleLater = () => {
    router.replace('/(tabs)/plan');
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.content}>

        {/* 상단 텍스트 구조 */}
        <View style={s.textGroup}>
          <Text style={s.weekTag}>7월 3째주</Text>
          <Text style={s.title}>목표 설정 완료</Text>
          <Text style={s.desc}>창세기 21장 읽기에 도전해요!</Text>
        </View>

        {/* 중앙 과녁 이미지 */}
        <View style={s.imgBox}>
          <BigTargetIcon width={209} height={209} />
        </View>
        <View style={s.spacer} />
      </View>

      {/* 하단 CTA */}
      <View style={s.footer}>
        <TouchableOpacity style={s.btn} activeOpacity={0.85} onPress={handleDone}>
          <Text style={s.btnText}>성경 읽으러 가기</Text>
        </TouchableOpacity>
        
        {/* FIX 6: "다음에 읽을게요" button MISSING */}
        <TouchableOpacity onPress={handleLater} activeOpacity={0.7} style={s.laterBtn}>
          <Text style={s.laterText}>다음에 읽을게요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// FIX 6: Goal Success Screen Formatting
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  
  textGroup: {
    alignItems: 'center',
    marginBottom: 48,
  },
  weekTag: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6554FF',
    backgroundColor: '#F0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1E26',
    marginBottom: 12,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B95A1',
    textAlign: 'center',
  },

  imgBox: {
    marginTop: 24,
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
    marginBottom: 12,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  laterBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B95A1',
  },
});
