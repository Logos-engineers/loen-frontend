import { radius, spacing, colors, fontSize, fontWeight } from '@/constants/tokens';
import { useBanners, type Banner } from '@/hooks/useBanners';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

function BannerItem({ item, width }: { item: Banner; width: number }) {
  const hasText = !!(item.title || item.subtitle);
  return (
    <View style={[styles.page, { width }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/banner/[id]', params: { id: item.id } })}
      >
        <View style={styles.card}>
          <Image source={{ uri: item.imageUrl }} style={styles.banner} contentFit="cover" />
          {hasText ? (
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)']}
              style={styles.scrim}
              pointerEvents="none"
            />
          ) : null}
          {hasText ? (
            <View style={styles.textOverlay} pointerEvents="none">
              {item.title ? (
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              ) : null}
              {item.subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}

export function BannerCarousel() {
  const { banners } = useBanners();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  // 등록된 활성 배너가 없으면 흰색 기본 배너 (실서비스엔 배너가 1개 이상 등록됨)
  if (banners.length === 0) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.banner, styles.fallbackBanner]}>
          <Text style={styles.fallbackTitle}>loen</Text>
          <Text style={styles.fallbackSubtitle}>말씀과 함께하는 하루</Text>
        </View>
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
        renderItem={({ item }) => <BannerItem item={item} width={width} />}
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
  card: {
    borderRadius: radius.lg,   // 16px
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    aspectRatio: 361 / 124,   // Figma 배너 카드 361×124 (≈2.91)
    borderRadius: radius.lg,
  },
  fallbackBanner: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: spacing.md,
  },
  fallbackTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  fallbackSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  textOverlay: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.smd,
    right: spacing.md,
    gap: 2,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.base,        // 16px
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    color: colors.white,
    fontSize: fontSize.md,          // 14px
    fontWeight: fontWeight.medium,
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
