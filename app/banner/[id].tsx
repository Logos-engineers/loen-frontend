import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useBanner } from '@/hooks/useBanners';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BannerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { banner, isLoading, error } = useBanner(id ?? '');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error || !banner ? (
        <Text style={styles.errorText}>{error ?? '배너를 찾을 수 없습니다.'}</Text>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 히어로 이미지 — 둥근 카드로 띄움 */}
          <View style={styles.heroWrap}>
            <Image
              source={{ uri: banner.imageUrl }}
              style={styles.image}
              contentFit="cover"
              contentPosition="center"
            />
          </View>

          {/* 본문 카드 */}
          <View style={styles.card}>
            <View style={styles.headerGroup}>
              {banner.title ? <Text style={styles.title}>{banner.title}</Text> : null}
              {banner.subtitle ? <Text style={styles.subtitle}>{banner.subtitle}</Text> : null}
            </View>

            <View style={styles.divider} />

            {banner.content ? (
              <Text style={styles.body}>{banner.content}</Text>
            ) : (
              <Text style={styles.bodyEmpty}>세부 내용이 없습니다.</Text>
            )}
          </View>

          {banner.linkUrl ? (
            <TouchableOpacity
              style={styles.linkBtn}
              activeOpacity={0.85}
              onPress={() => banner.linkUrl && Linking.openURL(banner.linkUrl)}
            >
              <Text style={styles.linkBtnText}>자세히 보기</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  errorText: { textAlign: 'center', color: colors.text.secondary, padding: spacing.xl },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xxl },

  // 히어로 이미지 — 둥근 카드
  heroWrap: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: radius.xl,       // 20
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 361 / 124,        // 원래 배너 비율 고정
    backgroundColor: colors.border,
  },

  // 본문 카드 (화이트 라운드, 그림자 없음 — 라운드+여백으로 깊이)
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.xl,       // 20
    padding: spacing.lg,           // 20
    gap: spacing.md,
  },
  headerGroup: { gap: spacing.xs },
  title: {
    fontSize: fontSize.xxl,        // 28
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: fontSize.md,         // 14
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  divider: { height: 1, backgroundColor: colors.border },
  body: { fontSize: fontSize.base, color: colors.text.primary, lineHeight: 26 },
  bodyEmpty: { fontSize: fontSize.base, color: colors.text.dim, lineHeight: 26 },

  // CTA — 풀폭 알약 버튼
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: radius.lg,       // 16
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  linkBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
