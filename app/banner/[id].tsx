import { isEventWebLink } from '@/constants/event';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useBanner } from '@/hooks/useBanners';
import { apiClient } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
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

  // 배너 링크 열기. 천국의 계단 이벤트 웹이면 1회용 티켓을 발급해 `?ticket=`으로 실어 보내
  // 앱 로그인 세션을 웹으로 심리스 인계한다. 그 외 링크는 그대로 연다.
  const openLink = useCallback(async (url: string) => {
    if (isEventWebLink(url)) {
      try {
        const { ticket } = await apiClient<{ ticket: string; expiresInSeconds: number }>(
          '/event/ticket',
          { method: 'POST' },
        );
        const sep = url.includes('?') ? '&' : '?';
        await Linking.openURL(`${url}${sep}ticket=${encodeURIComponent(ticket)}`);
        return;
      } catch (e) {
        // 티켓 발급 실패(비로그인·네트워크 등) → 이벤트 페이지는 그래도 열어준다(웹이 안내 화면 처리).
        console.warn('[event] 티켓 발급 실패, 파라미터 없이 오픈:', e);
      }
    }
    await Linking.openURL(url);
  }, []);

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
              onPress={() => banner.linkUrl && openLink(banner.linkUrl)}
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
