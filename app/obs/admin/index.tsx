import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { AdminObsContent, useAdminObsContents } from '@/hooks/useObsAdmin';

export default function ObsAdminIndexScreen() {
  const { contents, isLoading, error, refetch } = useAdminObsContents();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>OBS 관리</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/obs/admin/upload')}>
            <Ionicons name="add" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={contents}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <ObsContentCard item={item} />}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>등록된 OBS 자료가 없습니다</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

function ObsContentCard({ item }: { item: AdminObsContent }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: '/obs/admin/review',
          params: { existingId: String(item.id), title: item.title, verse: item.biblePassage, publishedDate: item.publishedDate, isPublished: item.isPublished ? 'true' : 'false' },
        })
      }
    >
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardSub}>{item.biblePassage} · {item.publishedDate}</Text>
      </View>
      <View style={[styles.badge, item.isPublished ? styles.badgePublished : styles.badgeDraft]}>
        <Text style={[styles.badgeText, item.isPublished ? styles.badgeTextPublished : styles.badgeTextDraft]}>
          {item.isPublished ? '발행됨' : '미발행'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 32 },
  headerTitle: { flex: 1, fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'center' },
  addBtn: { width: 32, alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.text.secondary, fontSize: fontSize.base, textAlign: 'center', marginBottom: spacing.md },
  retryBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md },
  retryText: { color: colors.white, fontWeight: fontWeight.semibold },
  emptyText: { color: colors.text.secondary, fontSize: fontSize.base },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  cardSub: { fontSize: fontSize.sm, color: colors.text.secondary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgePublished: { backgroundColor: '#E6F4EA' },
  badgeDraft: { backgroundColor: '#F5F5F5' },
  badgeText: { fontSize: 12, fontWeight: fontWeight.semibold },
  badgeTextPublished: { color: '#2E7D32' },
  badgeTextDraft: { color: colors.text.secondary },
});
