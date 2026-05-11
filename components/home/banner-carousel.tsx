import SkiIcon from '@/assets/icons/ski 1.svg';
import Snow1Icon from '@/assets/icons/snow.svg';
import Snow2Icon from '@/assets/icons/snow2.svg';
import Snow3Icon from '@/assets/icons/snow3.svg';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - spacing.md * 2;

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  gradientColors: readonly [string, string, ...string[]];
  hasSkiAssets?: boolean; // 1번 배너만 snow/ski SVG 표시
}

const BANNERS: BannerItem[] = [
  {
    id: '1',
    title: '2025년 로고스 스키 캠프 오픈!',
    subtitle: '만국의 스키러들이여 단결하라!',
    gradientColors: ['rgba(146,161,242,1)', 'rgba(222,107,100,1)'],
    hasSkiAssets: true,
  },
  {
    id: '2',
    title: '새벽 기도회 안내',
    subtitle: '매주 월~금 오전 5:30',
    gradientColors: ['rgba(100,140,220,1)', 'rgba(80,120,200,1)'],
  },
  {
    id: '3',
    title: '2025 청년부 수련회',
    subtitle: '7월 25일 ~ 27일',
    gradientColors: ['rgba(120,180,140,1)', 'rgba(80,150,100,1)'],
  },
];

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: BannerItem }) => (
    <View style={styles.bannerContainer}>
      <LinearGradient
        colors={item.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* 1번 배너: snow + ski SVG 배치 */}
        {item.hasSkiAssets && (
          <View style={styles.skiAssetsWrapper} pointerEvents="none">
            {/* ski 이미지 — 우측 배치 */}
            <SkiIcon
              width={140}
              height={112}
              style={styles.skiImg}
            />
            {/* snow 아이콘 3개 — 배너 배경에 흩뿌린 효과 */}
            <Snow3Icon
              width={50}
              height={31}
              style={styles.snow3}
            />
            <Snow2Icon
              width={36}
              height={22}
              style={styles.snow2}
            />
            <Snow1Icon
              width={23}
              height={14}
              style={styles.snow1}
            />
          </View>
        )}

        {/* 텍스트 — 좌측 하단 */}
        <View style={styles.textBlock}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        </View>
        {/* ❌ 라벨(날짜/카테고리) 없음 */}
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
      />

      {/* 1/N 배지 */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {currentIndex + 1} / {BANNERS.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: 124,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  // ski + snow 레이어 (절대 위치)
  skiAssetsWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  skiImg: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  snow3: {
    position: 'absolute',
    left: 20,
    top: 8,
  },
  snow2: {
    position: 'absolute',
    left: 60,
    top: 28,
  },
  snow1: {
    position: 'absolute',
    left: 110,
    top: 14,
  },
  // 텍스트
  textBlock: {
    position: 'absolute',
    left: 16,
    bottom: 16,
  },
  bannerTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  bannerSubtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  // 1/N 배지
  badge: {
    position: 'absolute',
    right: spacing.md + spacing.sm,
    bottom: spacing.sm + 12,
    backgroundColor: colors.badge.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.badge.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
