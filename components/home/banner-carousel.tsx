import { radius, spacing } from '@/constants/tokens';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// 임시 배너 (Figma '스키장 홍보' 1560×880) — 추후 서버 연동 배너로 교체 예정
const BANNER = require('../../assets/images/home-banner.png');

export function BannerCarousel() {
  return (
    <View style={styles.wrapper}>
      <Image source={BANNER} style={styles.banner} contentFit="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  banner: {
    width: '100%',
    aspectRatio: 1560 / 880,
    borderRadius: radius.lg,
  },
});
