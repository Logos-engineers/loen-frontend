/**
 * app/feedback/index.tsx — 내 피드백 내역 + 처리 상태.
 * 우상단 + 버튼으로 작성 화면(/feedback/write)으로 이동한다.
 */
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useMyFeedbacks } from '@/hooks/useFeedback';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import {
  FEEDBACK_CATEGORY_LABEL,
  FEEDBACK_STATUS_LABEL,
  type FeedbackStatus,
  type MyFeedback,
} from '@/utils/feedback';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mi = `${d.getMinutes()}`.padStart(2, '0');
  return `${mm}.${dd} ${hh}:${mi}`;
}

const STATUS_STYLE: Record<FeedbackStatus, { bg: string; fg: string }> = {
  RECEIVED: { bg: colors.border, fg: colors.text.secondary },
  IN_REVIEW: { bg: '#FFE9E0', fg: '#E8590C' },
  RESOLVED: { bg: colors.primaryLight, fg: colors.primary },
  DECLINED: { bg: colors.border, fg: colors.text.dim },
};

export default function FeedbackListScreen() {
  const { feedbacks, isLoading, error, refetch } = useMyFeedbacks();
  useRefetchOnFocus(refetch);

  const renderItem = ({ item }: { item: MyFeedback }) => {
    const s = STATUS_STYLE[item.status];
    const imageCount = item.imageUrls?.length ?? 0;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badges}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{FEEDBACK_CATEGORY_LABEL[item.category]}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
              <Text style={[styles.statusText, { color: s.fg }]}>{FEEDBACK_STATUS_LABEL[item.status]}</Text>
            </View>
          </View>
          <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        {item.content ? (
          <Text style={styles.content} numberOfLines={2}>
            {item.content}
          </Text>
        ) : null}

        {imageCount > 0 ? (
          <View style={styles.imageMeta}>
            <Ionicons name="image-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.imageMetaText}>스크린샷 {imageCount}장</Text>
          </View>
        ) : null}

        {item.adminNote ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>운영자 답변</Text>
            <Text style={styles.noteText}>{item.adminNote}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>피드백</Text>
        <TouchableOpacity onPress={() => router.push('/feedback/write')} hitSlop={8}>
          <Ionicons name="add" size={26} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <Text style={styles.message}>{error}</Text>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(f) => f.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.message}>아직 보낸 피드백이 없어요.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/feedback/write')} activeOpacity={0.8}>
                <Text style={styles.emptyBtnText}>첫 피드백 보내기</Text>
              </TouchableOpacity>
            </View>
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
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
  message: { textAlign: 'center', color: colors.text.secondary, marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  empty: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.md },
  emptyBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  listContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badges: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  typeBadge: { backgroundColor: colors.primaryLight, borderRadius: radius.xs, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary },
  statusBadge: { borderRadius: radius.xs, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  time: { fontSize: fontSize.xs, color: colors.text.dim },
  title: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary, marginTop: 2 },
  content: { fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: fontSize.sm * 1.5 },
  imageMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  imageMetaText: { fontSize: fontSize.xs, color: colors.text.secondary },
  noteBox: {
    backgroundColor: colors.background.base,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    gap: 2,
  },
  noteLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary },
  noteText: { fontSize: fontSize.sm, color: colors.text.primary, lineHeight: fontSize.sm * 1.5 },
});
