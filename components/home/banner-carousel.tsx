import { radius, spacing, colors, fontSize, fontWeight } from '@/constants/tokens';
import { useBanners } from '@/hooks/useBanners';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

// 등록된 배너가 없을 때 보여줄 기본 배너 (Figma 홈 '광고 배너' 361×124 @3x)
const FALLBACK_BANNER = require('../../assets/images/home-banner.png');

export function BannerCarousel() {
  const { banners } = useBanners();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  // 등록된 활성 배너가 없으면 기본 배너
  if (banners.length === 0) {
    return (
      <View style={styles.wrapper}>
        <Image source={FALLBACK_BANNER} style={styles.banner} contentFit="cover" />
      </View>
    );
  }

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        data={banners}
        keyExtractor={(b) => b.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <TouchableOpacity
              activeOpacity={item.linkUrl ? 0.85 : 1}
              disabled={!item.linkUrl}
              onPress={() => item.linkUrl && Linking.openURL(item.linkUrl)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.banner} contentFit="cover" />
            </TouchableOpacity>
          </View>
        )}
      />
      {banners.length > 1 ? (
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {index + 1} / {banners.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  carouselWrapper: {
    paddingVertical: spacing.sm,
  },
  page: {
    paddingHorizontal: spacing.md,   // 각 페이지 폭=화면폭, 좌우 16 마진으로 카드 inset
  },
  banner: {
    width: '100%',
    aspectRatio: 361 / 124,   // Figma 배너 카드 361×124 (≈2.91)
    borderRadius: radius.lg,   // 16px
  },
  pill: {
    position: 'absolute',
    right: spacing.md + 8,
    top: spacing.sm + 8,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
});
