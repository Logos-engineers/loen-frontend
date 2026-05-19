import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { formatKoreanDate, useObsContents } from '@/hooks/useObs';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ObsSection() {
  const router = useRouter();
  const { contents, isLoading, error } = useObsContents();
  const latestObs = contents[0];

  return (
    <View>
      <SectionHeader
        title="OBS 모아보기"
        showArrow
        onPress={() => router.push('/obs')}
      />

      {/* Figma: wrapper px:16, py:8 */}
      <View style={styles.wrapper}>
        <Card style={styles.card}>
          {isLoading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>OBS를 불러오지 못했습니다</Text>
            </View>
          ) : latestObs ? (
            <>
              <View style={styles.cardHeader}>
                <Text style={styles.tag}>이번주 OBS</Text>
                <Text style={styles.title}>{latestObs.title}</Text>
                <Text style={styles.meta}>{latestObs.biblePassage} • {formatKoreanDate(latestObs.publishedDate)}</Text>
              </View>

              <View style={styles.buttonWrapper}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    activeOpacity={0.8}
                    onPress={() => router.push('/obs')}
                  >
                    <Text style={styles.secondaryButtonText}>OBS 보기</Text>
                  </TouchableOpacity>
                  <PrimaryButton
                    label={latestObs.reviewStatus === 'DONE' ? '복습하기' : 'OBS 시작하기'}
                    onPress={() => router.push({
                      pathname: '/review/intro',
                      params: {
                        contentId: String(latestObs.id),
                        title: latestObs.title,
                        verse: latestObs.biblePassage,
                        date: formatKoreanDate(latestObs.publishedDate),
                      },
                    })}
                    style={styles.actionButton}
                  />
                </View>
              </View>
            </>
          ) : (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>등록된 OBS가 없습니다</Text>
            </View>
          )}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  card: {
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  tag: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  title: {
    fontSize: fontSize.lg,          // 20px Bold
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 28,
  },
  meta: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  buttonWrapper: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  stateBox: {
    minHeight: 132,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  stateText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
});
