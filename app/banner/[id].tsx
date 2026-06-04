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
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>배너</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error || !banner ? (
        <Text style={styles.errorText}>{error ?? '배너를 찾을 수 없습니다.'}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: banner.imageUrl }} style={styles.image} contentFit="cover" />
          {banner.title ? <Text style={styles.title}>{banner.title}</Text> : null}
          {banner.subtitle ? <Text style={styles.subtitle}>{banner.subtitle}</Text> : null}
          {banner.content ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.body}>{banner.content}</Text>
            </>
          ) : null}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  errorText: { textAlign: 'center', color: colors.text.secondary, padding: spacing.xl },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  image: {
    width: '100%',
    aspectRatio: 361 / 124,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    lineHeight: 30,
  },
  subtitle: { fontSize: fontSize.base, color: colors.text.secondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  body: { fontSize: fontSize.base, color: colors.text.primary, lineHeight: 24 },
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
