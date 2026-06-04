import { radius, spacing } from '@/constants/tokens';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// 임시 배너 (Figma 홈 '광고 배너' node 6528:53491, 361×124 @3x) — 추후 서버 연동 배너로 교체 예정
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
    aspectRatio: 361 / 124,   // Figma 배너 카드 361×124 (≈2.91) — 가로마진 16·세로패딩 8은 wrapper에서
    borderRadius: radius.lg,   // 16px
  },
});
