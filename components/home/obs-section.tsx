import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

// Figma: 단일 카드 (스와이프 없음)
const OBS_DATA = {
  tag: '이번주 OBS',
  title: '시들어버린 박넝쿨의 역사',
  verse: '요나 4:1-11',
  date: '2025년 6월 15일',
};

export function ObsSection() {
  const router = useRouter();

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
          {/* 카드 상단 텍스트 */}
          <View style={styles.cardHeader}>
            <Text style={styles.tag}>{OBS_DATA.tag}</Text>
            <Text style={styles.title}>{OBS_DATA.title}</Text>
            <Text style={styles.meta}>{OBS_DATA.verse} • {OBS_DATA.date}</Text>
          </View>

          {/* Figma 버튼: #6561FF bg, 전체 너비, py:10, px:22, radius:12, 텍스트 #FAFAFA 16px SemiBold */}
          <View style={styles.buttonWrapper}>
            <PrimaryButton
              label="OBS 시작하기"
              onPress={() => Alert.alert('OBS 시작하기')}
            />
          </View>
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
});
