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
        
        <TouchableOpacity onPress={handleLater} activeOpacity={0.7} style={s.laterBtn}>
          <Text style={s.laterText}>다음에 읽을게요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
  },
  
  textGroup: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.xxl,
  },
  weekTag: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    backgroundColor: '#F3F2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  desc: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  imgBox: {
    marginTop: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { flex: 1 },

  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  laterBtn: {
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  laterText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  btn: {
    height: 54,
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
