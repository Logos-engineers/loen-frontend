import { ObsCard } from '@/components/obs/obs-card';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, spacing } from '@/constants/tokens';
import { formatKoreanDate, formatWeekLabel, useObsContents } from '@/hooks/useObs';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function ObsSection() {
  const router = useRouter();
  const { contents, isLoading, error, refetch } = useObsContents();
  useRefetchOnFocus(refetch);
  const previousObs = contents[1] ?? contents[0];

  return (
    <View>
      <SectionHeader
        title="OBS 모아보기"
        showArrow
        onPress={() => router.push('/obs')}
      />

      {isLoading ? (
        <View style={styles.wrapper}>
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        </View>
      ) : error ? (
        <View style={styles.wrapper}>
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>OBS를 불러오지 못했습니다</Text>
          </View>
        </View>
      ) : previousObs ? (
        <ObsCard
          item={previousObs}
          reviewLabel="OBS 복습하기"
          singleLineTitle
          noShadow
          onPressView={() => router.push({
            pathname: '/obs/content/intro',
            params: {
              contentId: String(previousObs.id),
              title: previousObs.title,
              verse: previousObs.biblePassage,
              weekLabel: formatWeekLabel(previousObs.publishedDate),
            },
          })}
          onPressReview={() => router.push({
            pathname: '/obs/quiz/intro',
            params: {
              contentId: String(previousObs.id),
              title: previousObs.title,
              verse: previousObs.biblePassage,
              date: formatKoreanDate(previousObs.publishedDate),
            },
          })}
        />
      ) : (
        <View style={styles.wrapper}>
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>등록된 OBS가 없습니다</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stateBox: {
    minHeight: 132,
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  stateText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
});
