import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerCarousel } from '@/components/home/banner-carousel';
import { BibleReadingSection } from '@/components/home/bible-reading-section';
// TODO(MVP v2): 챌린지 기능 활성화 시 주석 해제
// import { ChallengeSection } from '@/components/home/challenge-section';
import { FaithNoteCard } from '@/components/home/faith-note-card';
import { GoalSection } from '@/components/home/goal-section';
import { HomeHeader } from '@/components/home/home-header';
import { ObsSection } from '@/components/home/obs-section';
import { PrayerSection } from '@/components/home/prayer-section';
import { colors } from '@/constants/tokens';

export default function HomeScreen() {
  return (
    // Figma: background/fill/common = #FFFFFF
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <HomeHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GoalSection />
        <BannerCarousel />
        <ObsSection />
        <FaithNoteCard />
        <BibleReadingSection />
        {/* TODO(MVP v2): 챌린지 기능 활성화 시 주석 해제 */}
        {/* <ChallengeSection /> */}
        <PrayerSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base, // #F2F4F7 = background/fill/elevated
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
});
