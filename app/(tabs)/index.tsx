import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerCarousel } from '@/components/home/banner-carousel';
import { BibleReadingSection } from '@/components/home/bible-reading-section';
import { ChallengeSection } from '@/components/home/challenge-section';
import { FaithNoteCard } from '@/components/home/faith-note-card';
import { GoalSection } from '@/components/home/goal-section';
import { HomeHeader } from '@/components/home/home-header';
import { ObsSection } from '@/components/home/obs-section';
import { PrayerSection } from '@/components/home/prayer-section';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
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
        
        {/* --- 임시 버튼 시작 --- */}
        <TouchableOpacity
          style={styles.tempButton}
          onPress={() => router.push('/challenge/create')}
        >
          <Text style={styles.tempButtonText}>성경 챌린지 만들기 테스트</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tempButton, { backgroundColor: colors.primaryLight, marginTop: 10 }]}
          onPress={() => router.push('/challenge/list')}
        >
          <Text style={[styles.tempButtonText, { color: colors.primary }]}>내가 참여한 성경챌린지</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tempButton, { backgroundColor: colors.primaryLight, marginTop: 10 }]}
          onPress={() => router.push('/challenge/bible')}
        >
          <Text style={[styles.tempButtonText, { color: colors.primary }]}>성경챌린지</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tempButton, { backgroundColor: colors.primaryLight, marginTop: 10 }]}
          onPress={() => router.push('/challenge/faith')}
        >
          <Text style={[styles.tempButtonText, { color: colors.primary }]}>신앙챌린지</Text>
        </TouchableOpacity>
        {/* --- 임시 버튼 끝 --- */}

        <ObsSection />
        <FaithNoteCard />
        <BibleReadingSection />
        <ChallengeSection />
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
  tempButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
