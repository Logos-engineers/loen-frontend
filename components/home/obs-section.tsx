import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

interface ObsData {
  tag: string;
  title: string;
  verse: string;
  date: string;
}

// 더미 데이터 — API 연동 시 props로 교체
const OBS_DATA: ObsData = {
  tag: '이번주 OBS',
  title: '시들어버린 박넝쿨의 역사',
  verse: '요나 4:1-11',
  date: '2025년 6월 15일',
};

export function ObsSection() {
  return (
    <View>
      <SectionHeader
        title="OBS 모아보기"
        showArrow
        onPress={() => Alert.alert('OBS 모아보기')}
      />
      <Card style={styles.card}>
        <Text style={styles.tag}>{OBS_DATA.tag}</Text>
        <Text style={styles.title}>{OBS_DATA.title}</Text>
        <Text style={styles.meta}>
          {OBS_DATA.verse} · {OBS_DATA.date}
        </Text>
        <PrimaryButton
          label="OBS 시작하기"
          onPress={() => Alert.alert('OBS 시작하기')}
          style={styles.button}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  tag: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.regular,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 30,
    marginTop: 2,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  button: {
    marginTop: spacing.md,
  },
});
