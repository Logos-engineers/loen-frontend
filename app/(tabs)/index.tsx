import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerCarousel } from '@/components/home/banner-carousel';
import { BibleReadingSection } from '@/components/home/bible-reading-section';
import { ChallengeSection } from '@/components/home/challenge-section';
import { FaithNoteCard } from '@/components/home/faith-note-card';
import { GoalSection } from '@/components/home/goal-section';
import { HomeHeader } from '@/components/home/home-header';
import { ObsSection } from '@/components/home/obs-section';
import { PrayerSection } from '@/components/home/prayer-section';
import { colors, spacing } from '@/constants/tokens';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* 고정 헤더 — 스크롤해도 상단 고정 */}
      <HomeHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 적용하기 아코디언 */}
        <GoalSection />

        {/* 배너 캐러셀 */}
        <BannerCarousel />

        {/* OBS 모아보기 */}
        <ObsSection />

        {/* 신앙노트 */}
        <FaithNoteCard />

        {/* 성경 읽기 */}
        <BibleReadingSection />

        {/* 섹션 사이 간격 */}
        <View style={styles.sectionGap} />

        {/* 챌린지 */}
        <ChallengeSection />

        {/* 섹션 사이 간격 */}
        <View style={styles.sectionGap} />

        {/* 같이 기도해요 */}
        <PrayerSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  sectionGap: {
    height: spacing.sm,
  },
});
