import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { usePopup } from '@/components/shared/usePopup';
import {
  ObsManager,
  grantObsManager,
  revokeObsManager,
  searchObsManagerCandidates,
  useObsManagers,
} from '@/hooks/useObsManagers';
import { useAuthStore } from '@/store/auth-store';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function displayName(u: ObsManager): string {
  return (u.name && u.name.trim()) || (u.nickname && u.nickname.trim()) || u.email || '이름 없음';
}

export default function ObsManagersScreen() {
  const role = useAuthStore((s) => s.role);
  const { confirm, info, node: popupNode } = usePopup();
  const { managers, isLoading, error, refetch } = useObsManagers();

  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<ObsManager[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    const q = keyword.trim();
    if (!q) return;
    setSearching(true);
    try {
      setResults(await searchObsManagerCandidates(q));
    } catch (e: any) {
      info('검색 실패', e?.message ?? '검색에 실패했어요.');
    } finally {
      setSearching(false);
    }
  }, [keyword, info]);

  const handleGrant = useCallback(
    (u: ObsManager) => {
      confirm({
        title: 'OBS 관리자로 지정',
        description: `${displayName(u)}님에게 OBS 교안 관리 권한을 줄까요?`,
        confirmLabel: '지정',
        onConfirm: async () => {
          setBusyId(u.userId);
          try {
            await grantObsManager(u.userId);
            await refetch();
            setResults((prev) =>
              prev ? prev.map((r) => (r.userId === u.userId ? { ...r, role: 'OBS_ADMIN' } : r)) : prev,
            );
            info('지정 완료', `${displayName(u)}님이 OBS 관리자가 됐어요.`);
          } catch (e: any) {
            info('지정 실패', e?.message ?? '지정에 실패했어요.');
          } finally {
            setBusyId(null);
          }
        },
      });
    },
    [confirm, info, refetch],
  );

  const handleRevoke = useCallback(
    (u: ObsManager) => {
      confirm({
        title: 'OBS 관리자 해제',
        description: `${displayName(u)}님의 OBS 관리 권한을 해제할까요?`,
        confirmLabel: '해제',
        onConfirm: async () => {
          setBusyId(u.userId);
          try {
            await revokeObsManager(u.userId);
            await refetch();
            setResults((prev) =>
              prev ? prev.map((r) => (r.userId === u.userId ? { ...r, role: 'USER' } : r)) : prev,
            );
            info('해제 완료', `${displayName(u)}님의 OBS 관리 권한을 해제했어요.`);
          } catch (e: any) {
            info('해제 실패', e?.message ?? '해제에 실패했어요.');
          } finally {
            setBusyId(null);
          }
        },
      });
    },
    [confirm, info, refetch],
  );

  // 슈퍼관리자(ADMIN)만 접근. OBS_ADMIN·일반은 차단(백엔드도 ADMIN 전용).
  if (role !== 'ADMIN') {
    return <Redirect href="/mypage/settings" />;
  }

  const renderRow = (u: ObsManager, mode: 'result' | 'manager') => {
    const busy = busyId === u.userId;
    return (
      <View key={u.userId} style={styles.row}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName} numberOfLines={1}>
            {displayName(u)}
          </Text>
          <Text style={styles.rowEmail} numberOfLines={1}>
            {u.email}
          </Text>
        </View>

        {mode === 'manager' ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionRevoke]}
            disabled={busy}
            onPress={() => handleRevoke(u)}
            activeOpacity={0.7}
          >
            {busy ? (
              <ActivityIndicator size="small" color={colors.reaction.red} />
            ) : (
              <Text style={styles.actionRevokeText}>해제</Text>
            )}
          </TouchableOpacity>
        ) : u.role === 'ADMIN' ? (
          <View style={[styles.actionBtn, styles.actionDisabled]}>
            <Text style={styles.actionDisabledText}>관리자</Text>
          </View>
        ) : u.role === 'OBS_ADMIN' ? (
          <View style={[styles.actionBtn, styles.actionDisabled]}>
            <Text style={styles.actionDisabledText}>지정됨</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionGrant]}
            disabled={busy}
            onPress={() => handleGrant(u)}
            activeOpacity={0.7}
          >
            {busy ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.actionGrantText}>지정</Text>
            )}
          </TouchableOpacity>
        )}
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
        <Text style={styles.headerTitle}>OBS 관리자 지정</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* 검색 */}
        <Text style={styles.sectionTitle}>이름 또는 이메일로 검색</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={keyword}
            onChangeText={setKeyword}
            placeholder="이름 또는 이메일 입력"
            placeholderTextColor={colors.text.secondary}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.7}>
            {searching ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.searchBtnText}>검색</Text>
            )}
          </TouchableOpacity>
        </View>

        {results !== null && (
          <View style={styles.card}>
            {results.length === 0 ? (
              <Text style={styles.emptyText}>검색 결과가 없어요.</Text>
            ) : (
              results.map((u) => renderRow(u, 'result'))
            )}
          </View>
        )}

        {/* 현재 OBS 관리자 */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>현재 OBS 관리자</Text>
        <View style={styles.card}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.md }} />
          ) : error ? (
            <Text style={styles.emptyText}>{error}</Text>
          ) : managers.length === 0 ? (
            <Text style={styles.emptyText}>아직 지정된 OBS 관리자가 없어요.</Text>
          ) : (
            managers.map((u) => renderRow(u, 'manager'))
          )}
        </View>
      </ScrollView>

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
  headerTitle: { fontSize: fontSize.heading, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerSpacer: { width: 24 },
  body: { padding: spacing.md },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  searchRow: { flexDirection: 'row', gap: spacing.sm },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  searchBtn: {
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  card: {
    marginTop: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowInfo: { flex: 1, minWidth: 0, gap: 2 },
  rowName: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  rowEmail: { fontSize: fontSize.sm, color: colors.text.secondary },
  actionBtn: {
    minWidth: 60,
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrant: { backgroundColor: colors.primary },
  actionGrantText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  actionRevoke: { backgroundColor: 'rgba(229,72,77,0.12)' },
  actionRevokeText: { color: colors.reaction.red, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  actionDisabled: { backgroundColor: colors.background.base },
  actionDisabledText: { color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
