/**
 * app/admin/feedback.tsx — 관리자 피드백함.
 * 상태 필터 + 카드 목록(카테고리/상태/내용/스크린샷/작성자) + 상태 변경/삭제.
 */
import { usePopup } from '@/components/shared/usePopup';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import {
  createFeedbackGithubIssue,
  deleteFeedback,
  FEEDBACK_CATEGORY_LABEL,
  FEEDBACK_STATUS_LABEL,
  getAdminFeedbacks,
  updateFeedbackStatus,
  type AdminFeedback,
  type AdminFeedbackFilter,
  type FeedbackStatus,
} from '@/utils/feedback';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mi = `${d.getMinutes()}`.padStart(2, '0');
  return `${mm}.${dd} ${hh}:${mi}`;
}

const FILTERS: AdminFeedbackFilter[] = ['ALL', 'RECEIVED', 'IN_REVIEW', 'RESOLVED', 'DECLINED'];
const FILTER_LABEL: Record<AdminFeedbackFilter, string> = {
  ALL: '전체',
  RECEIVED: '접수',
  IN_REVIEW: '검토중',
  RESOLVED: '반영',
  DECLINED: '반려',
};

const STATUS_STYLE: Record<FeedbackStatus, { bg: string; fg: string }> = {
  RECEIVED: { bg: '#FFE9E0', fg: '#E8590C' },
  IN_REVIEW: { bg: colors.primaryLight, fg: colors.primary },
  RESOLVED: { bg: colors.border, fg: colors.text.secondary },
  DECLINED: { bg: colors.border, fg: colors.text.dim },
};

// 상태 변경 액션 (현재 상태가 아닌 것만 노출)
const STATUS_ACTIONS: { status: FeedbackStatus; label: string }[] = [
  { status: 'IN_REVIEW', label: '검토중' },
  { status: 'RESOLVED', label: '반영' },
  { status: 'DECLINED', label: '반려' },
];

export default function AdminFeedbackScreen() {
  const [filter, setFilter] = useState<AdminFeedbackFilter>('ALL');
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { confirm, info, node: popupNode } = usePopup();

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setFeedbacks(await getAdminFeedbacks(filter));
    } catch (e: any) {
      setError(e?.message ?? '피드백 목록을 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (item: AdminFeedback, status: FeedbackStatus) => {
    try {
      await updateFeedbackStatus(item.id, status);
      load();
    } catch (e: any) {
      info('변경 실패', e?.message ?? '상태 변경에 실패했어요.');
    }
  };

  const handleCreateIssue = (item: AdminFeedback) => {
    confirm({
      title: 'GitHub 이슈로 보낼까요?',
      description: '이 피드백을 개발 저장소 이슈로 등록해요.',
      confirmLabel: '보내기',
      onConfirm: async () => {
        try {
          await createFeedbackGithubIssue(item.id);
          load();
        } catch (e: any) {
          info('등록 실패', e?.message ?? 'GitHub 이슈 생성에 실패했어요.');
        }
      },
    });
  };

  const handleDelete = (item: AdminFeedback) => {
    confirm({
      title: '피드백을 삭제할까요?',
      description: '되돌릴 수 없어요.',
      confirmLabel: '삭제',
      onConfirm: async () => {
        try {
          await deleteFeedback(item.id);
          load();
        } catch (e: any) {
          info('삭제 실패', e?.message ?? '삭제에 실패했어요.');
        }
      },
    });
  };

  const renderItem = ({ item }: { item: AdminFeedback }) => {
    const s = STATUS_STYLE[item.status];
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
        {item.content ? <Text style={styles.content}>{item.content}</Text> : null}

        {item.imageUrls && item.imageUrls.length > 0 ? (
          <View style={styles.imageRow}>
            {item.imageUrls.map((url) => (
              <Image key={url} source={{ uri: url }} style={styles.thumb} contentFit="cover" />
            ))}
          </View>
        ) : null}

        <Text style={styles.metaLine}>작성자: {item.userNickname ?? item.userId}</Text>

        {item.githubIssueUrl ? (
          <TouchableOpacity
            style={styles.issueLink}
            onPress={() => Linking.openURL(item.githubIssueUrl!)}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-github" size={15} color={colors.text.secondary} />
            <Text style={styles.issueLinkText}>GitHub 이슈 #{item.githubIssueNumber} 보기</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.issueCreateBtn}
            onPress={() => handleCreateIssue(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-github" size={15} color={colors.text.primary} />
            <Text style={styles.issueCreateText}>GitHub 이슈로 보내기</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          {STATUS_ACTIONS.filter((a) => a.status !== item.status).map((a) => (
            <TouchableOpacity
              key={a.status}
              style={[styles.actionBtn, styles.statusBtn]}
              onPress={() => handleStatus(item, a.status)}
              activeOpacity={0.7}
            >
              <Text style={styles.statusBtnText}>{a.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>피드백 관리</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{FILTER_LABEL[f]}</Text>
          </TouchableOpacity>
        ))}
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
          ListEmptyComponent={<Text style={styles.message}>피드백이 없어요.</Text>}
          onRefresh={load}
          refreshing={isLoading}
        />
      )}

      {popupNode}
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
  filterRow: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background.elevated,
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.secondary },
  filterTextActive: { color: colors.white },
  message: { textAlign: 'center', color: colors.text.secondary, marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
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
  content: { fontSize: fontSize.sm, color: colors.text.primary, lineHeight: fontSize.sm * 1.5 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  thumb: { width: 64, height: 64, borderRadius: radius.sm },
  metaLine: { fontSize: fontSize.xs, color: colors.text.secondary, marginTop: 2 },
  issueLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  issueLinkText: { fontSize: fontSize.xs, color: colors.text.secondary, textDecorationLine: 'underline' },
  issueCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  issueCreateText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.primary },
  actions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  actionBtn: { height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  statusBtn: { flex: 1, backgroundColor: colors.primaryLight },
  statusBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  deleteBtn: { width: 48, backgroundColor: colors.reaction.red },
});
