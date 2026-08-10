import { Popup } from '@/components/ui/overlay';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { fetchSelectableOikos, joinOikos, useOikos, type SelectableOikos } from '@/hooks/useOikos';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function oikosLabel(o: SelectableOikos): string {
  return o.leaderName ? `${o.name} (리더:${o.leaderName})` : o.name;
}

export default function OikosChangeScreen() {
  // 현재 소속 (없으면 null) — 하이라이트 + 초기 선택에 사용
  const { oikos: current, isLoading: currentLoading, refetch: refetchCurrent } = useOikos();

  const [list, setList] = useState<SelectableOikos[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const loadList = () => {
    setListLoading(true);
    setListError(false);
    fetchSelectableOikos()
      .then(setList)
      .catch(() => setListError(true))
      .finally(() => setListLoading(false));
  };
  useEffect(loadList, []);

  // 현재 소속을 기본 선택으로
  useEffect(() => {
    if (current?.id && selectedId === null) setSelectedId(current.id);
  }, [current?.id, selectedId]);

  const isChanged = !!selectedId && selectedId !== current?.id;
  const selectedName = list.find((o) => o.id === selectedId)?.name ?? '';

  const handleConfirm = async () => {
    if (!selectedId) return;
    setConfirmVisible(false);
    setSubmitting(true);
    try {
      await joinOikos(selectedId);
      await refetchCurrent();
      router.back();
    } catch (e: any) {
      console.warn('[oikos-change] 변경 실패', e);
      setListError(true); // 간단 처리 — 상단 재시도 노출
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>오이코스 변경</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.caption}>
        {current?.id ? `현재 소속: ${current.name}` : '아직 소속된 오이코스가 없어요. 오이코스를 선택해 가입하세요.'}
      </Text>

      {listLoading || currentLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : listError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>목록을 불러오지 못했어요.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadList} activeOpacity={0.8}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {list.map((o) => {
            const selected = o.id === selectedId;
            const isCurrent = o.id === current?.id;
            return (
              <Pressable
                key={o.id}
                style={[styles.row, selected && styles.rowSelected]}
                onPress={() => setSelectedId(o.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{oikosLabel(o)}</Text>
                  {isCurrent && <Text style={styles.currentTag}>현재 소속</Text>}
                </View>
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selected ? colors.primary : colors.text.secondary}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, (!isChanged || submitting) && styles.ctaDisabled]}
          activeOpacity={0.85}
          disabled={!isChanged || submitting}
          onPress={() => setConfirmVisible(true)}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>{current?.id ? '변경하기' : '가입하기'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Popup
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        title={current?.id ? '오이코스 변경' : '오이코스 가입'}
        description={
          current?.id
            ? `'${current.name}'에서 '${selectedName}'(으)로 변경할까요?`
            : `'${selectedName}'에 가입할까요?`
        }
        buttons={[
          { label: '취소', variant: 'secondary', onPress: () => setConfirmVisible(false) },
          { label: current?.id ? '변경하기' : '가입하기', onPress: handleConfirm },
        ]}
      />
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
  caption: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorText: { fontSize: fontSize.base, color: colors.text.secondary },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background.elevated,
  },
  retryText: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.primary },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowSelected: { borderColor: colors.primary },
  rowLabel: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  currentTag: { fontSize: fontSize.sm, color: colors.primary, marginTop: 2 },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cta: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: colors.text.secondary, opacity: 0.4 },
  ctaText: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: '#fff' },
});
