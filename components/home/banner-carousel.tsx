import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    ImageBackground,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - spacing.md * 2;

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string; // 실제 이미지 URL로 교체 필요
}

// 더미 배너 데이터 — API 연동 시 props로 교체
const BANNERS: BannerItem[] = [
  {
    id: '1',
    title: '2025년 로고스 스키 캠프 오픈!',
    subtitle: '만국의 스키러들이여 단결하라!',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
  },
  {
    id: '2',
    title: '새벽 기도회 안내',
    subtitle: '매주 월~금 오전 5:30',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
  },
  {
    id: '3',
    title: '2025 청년부 수련회',
    subtitle: '7월 25일 ~ 27일',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
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
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.65)']}
          style={styles.gradient}
        >
          <View style={styles.textContainer}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
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
        snapToInterval={BANNER_WIDTH + spacing.sm}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
      />
      {/* 1/N 페이지 인디케이터 뱃지 */}
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
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    position: 'relative',
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: 160,
    marginRight: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    borderRadius: radius.lg,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  textContainer: {
    gap: 2,
  },
  bannerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  badge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.badge.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.badge.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
