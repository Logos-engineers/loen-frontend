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
          <Image
            source={{ uri: banner.imageUrl }}
            style={styles.image}
            contentFit="cover"
            contentPosition="center"
          />
          <View style={styles.article}>
            {banner.title ? <Text style={styles.title}>{banner.title}</Text> : null}
            {banner.subtitle ? <Text style={styles.subtitle}>{banner.subtitle}</Text> : null}
            <View style={styles.divider} />
            {banner.content ? (
              <Text style={styles.body}>{banner.content}</Text>
            ) : (
              <Text style={styles.bodyEmpty}>세부 내용이 없습니다.</Text>
            )}
            {banner.linkUrl ? (
              <TouchableOpacity
                style={styles.linkBtn}
                activeOpacity={0.8}
                onPress={() => banner.linkUrl && Linking.openURL(banner.linkUrl)}
              >
                <Text style={styles.linkBtnText}>자세히 보기</Text>
                <Ionicons name="open-outline" size={16} color={colors.white} />
              </TouchableOpacity>
            ) : null}
          </View>
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
  image: {
    width: '100%',
    aspectRatio: 16 / 9,   // 원본 비율과 무관하게 항상 16:9로 고정 (cover로 잘림)
    backgroundColor: colors.border,
  },
  article: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,   // 히어로 이미지 위로 살짝 겹치게
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 32,
  },
  subtitle: { fontSize: fontSize.base, color: colors.text.secondary, lineHeight: 22 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  body: { fontSize: fontSize.base, color: colors.text.primary, lineHeight: 24 },
  bodyEmpty: { fontSize: fontSize.base, color: colors.text.dim, lineHeight: 24 },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  linkBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
