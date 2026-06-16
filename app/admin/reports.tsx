import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { usePopup } from '@/components/shared/usePopup';
import {
  getAdminReports,
  resolveReport,
  takedownReportedContent,
  REPORT_TARGET_LABEL,
  type AdminReport,
} from '@/utils/moderation';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
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

export default function AdminReportsScreen() {
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { confirm, info, node: popupNode } = usePopup();

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setReports(await getAdminReports(filter));
    } catch (e: any) {
      setError(e?.message ?? '신고 목록을 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = (report: AdminReport) => {
    confirm({
      title: '처리완료로 표시할까요?',
      description: '콘텐츠는 그대로 두고 신고만 처리됨으로 표시해요.',
      confirmLabel: '처리완료',
      onConfirm: async () => {
        try {
          await resolveReport(report.reportId);
          load();
        } catch (e: any) {
          info('실패', e?.message ?? '처리에 실패했어요.');
        }
      },
    });
  };

  const handleTakedown = (report: AdminReport) => {
    confirm({
      title: '콘텐츠를 삭제할까요?',
      description: '신고된 콘텐츠가 삭제되고 신고는 처리완료로 표시돼요. 되돌릴 수 없어요.',
      confirmLabel: '삭제',
      onConfirm: async () => {
        try {
          await takedownReportedContent(report.reportId);
          load();
        } catch (e: any) {
          info('삭제 실패', e?.message ?? '삭제에 실패했어요.');
        }
      },
    });
  };

  const renderItem = ({ item }: { item: AdminReport }) => {
    const resolved = item.status === 'RESOLVED';
    return (
      <View style={[styles.card, resolved && styles.cardResolved]}>
        <View style={styles.cardHeader}>
          <View style={styles.badges}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{REPORT_TARGET_LABEL[item.targetType] ?? item.targetType}</Text>
            </View>
            {item.reason ? (
              <View style={styles.reasonBadge}>
                <Text style={styles.reasonBadgeText}>{item.reason}</Text>
              </View>
            ) : null}
            <View style={[styles.statusBadge, resolved ? styles.statusResolved : styles.statusPending]}>
              <Text style={[styles.statusText, resolved ? styles.statusTextResolved : styles.statusTextPending]}>
                {resolved ? '처리완료' : '대기중'}
              </Text>
            </View>
          </View>
          <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.previewBox}>
          <Text style={styles.previewText} numberOfLines={4}>
            {item.contentPreview ?? '(삭제되었거나 내용을 찾을 수 없는 콘텐츠)'}
          </Text>
        </View>

        <Text style={styles.metaLine}>
          작성자: {item.targetAuthorNickname ?? item.targetAuthorId ?? '알 수 없음'}
        </Text>
        <Text style={styles.metaLine}>신고자: {item.reporterNickname ?? item.reporterId}</Text>

        {!resolved ? (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, styles.resolveBtn]} onPress={() => handleResolve(item)} activeOpacity={0.7}>
              <Text style={styles.resolveBtnText}>처리완료</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleTakedown(item)} activeOpacity={0.7}>
              <Text style={styles.deleteBtnText}>콘텐츠 삭제</Text>
            </TouchableOpacity>
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
        <Text style={styles.headerTitle}>신고 관리</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterRow}>
        {(['PENDING', 'ALL'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'PENDING' ? '대기중' : '전체'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <Text style={styles.message}>{error}</Text>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(r) => r.reportId}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.message}>{filter === 'PENDING' ? '대기중인 신고가 없어요.' : '신고 내역이 없어요.'}</Text>}
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
  filterRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
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
  cardResolved: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1, flexWrap: 'wrap' },
  typeBadge: { backgroundColor: colors.primaryLight, borderRadius: radius.xs, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary },
  reasonBadge: { backgroundColor: colors.border, borderRadius: radius.xs, paddingHorizontal: 8, paddingVertical: 2 },
  reasonBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.text.secondary },
  statusBadge: { borderRadius: radius.xs, paddingHorizontal: 8, paddingVertical: 2 },
  statusPending: { backgroundColor: '#FFE9E0' },
  statusResolved: { backgroundColor: colors.border },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  statusTextPending: { color: '#E8590C' },
  statusTextResolved: { color: colors.text.secondary },
  time: { fontSize: fontSize.xs, color: colors.text.dim },
  previewBox: {
    backgroundColor: colors.background.base,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  previewText: { fontSize: fontSize.sm, color: colors.text.primary, lineHeight: fontSize.sm * 1.5 },
  metaLine: { fontSize: fontSize.xs, color: colors.text.secondary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: { flex: 1, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  resolveBtn: { backgroundColor: colors.primaryLight },
  resolveBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  deleteBtn: { backgroundColor: colors.reaction.red },
  deleteBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.white },
});
