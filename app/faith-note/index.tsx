import ThanksNoteIcon from '@/assets/icons/note-thanks.svg';
import PrayerNoteIcon from '@/assets/icons/note-prayer.svg';
import WordNoteIcon from '@/assets/icons/note-word.svg';
import { FaithNoteCard, FaithNoteItem } from '@/components/faith-note/faith-note-card';
import { FaithNoteEmpty } from '@/components/faith-note/faith-note-empty';
import Popup from '@/components/ui/overlay/Popup';
import { FaithNoteHeader } from '@/components/faith-note/faith-note-header';
import { FaithNoteTab, FaithNoteTabBar } from '@/components/faith-note/faith-note-tab-bar';
import { FaithNoteWeekSelector } from '@/components/faith-note/faith-note-week-selector';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import { getTodayKey, getWeekEnd, getWeekStart } from '@/utils/faith-note-store';
import { blockUser, reportContent } from '@/utils/moderation';
import { ReportReasonSheet } from '@/components/shared/ReportReasonSheet';
import { usePopup } from '@/components/shared/usePopup';
import { useFaithNotes } from '@/hooks/useFaithNotes';
import { useWrittenDays } from '@/hooks/useWrittenDays';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── 탭별 라벨 & 드롭다운 데이터 ─────────────────────────────────────────────────

const TAB_LABELS: Record<FaithNoteTab, string> = {
  THANKS: '감사노트',
  PRAYER: '기도노트',
  WORD: '말씀노트',
};

interface DropdownOption {
  tab: FaithNoteTab;
  label: string;
  Icon: React.ComponentType<{ width: number; height: number; color?: string }>;
}

const DROPDOWN_OPTIONS: DropdownOption[] = [
  { tab: 'THANKS', label: '감사노트', Icon: ThanksNoteIcon },
  { tab: 'PRAYER', label: '기도노트', Icon: PrayerNoteIcon },
  { tab: 'WORD', label: '말씀노트', Icon: WordNoteIcon },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FaithNoteListScreen() {
  const router = useRouter();

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<FaithNoteTab>('THANKS');
  const [showDropdown, setShowDropdown] = useState(false);
  // 주간 스트립·요일 필터 기준 = 이번 주 시작(일요일). 주차 네비게이션은 없음(피드는 전체 최신순).
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart());
  const [todayKey, setTodayKey] = useState<string>(() => getTodayKey());

  const { notes, isLoading, isLoadingMore, error, loadMore, toggleLike, toggleReaction, deleteNote, refetch } = useFaithNotes(selectedTab);
  // 주간 스트립 체크 — 서버 집계(피드 로드량과 무관하게 정확). 탭별 요일 집합을 한 번에 받아 맵에서 참조.
  const { writtenDaysMap, refetchWrittenDays } = useWrittenDays();
  const [pendingDelete, setPendingDelete] = useState<FaithNoteItem | null>(null);
  const [reportTarget, setReportTarget] = useState<FaithNoteItem | null>(null);
  const { confirm, info, node: popupNode } = usePopup();

  // 자정/주 경계를 넘겨 다시 볼 때 '오늘'·'이번 주'를 최신화. 실제로 바뀐 경우에만 setState
  // (weekStart는 filteredNotes useMemo 의존값이라 매번 새 Date로 바꾸면 불필요한 재계산 발생).
  const syncDate = useCallback(() => {
    const t = getTodayKey();
    const w = getWeekStart();
    setTodayKey((prev) => (prev === t ? prev : t));
    setWeekStart((prev) => (prev.getTime() === w.getTime() ? prev : w));
  }, []);

  // ① 화면 포커스 — 피드·주간현황 갱신 + 날짜 동기화
  useFocusEffect(useCallback(() => {
    refetch();
    refetchWrittenDays();
    syncDate();
  }, [refetch, refetchWrittenDays, syncDate]));

  // ② 앱 포그라운드 복귀 — 이 화면을 띄워둔 채 백그라운드→재실행(밤샘)한 경우 focus가 안 뛰므로 별도 처리
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') { syncDate(); refetchWrittenDays(); }
    });
    return () => sub.remove();
  }, [syncDate, refetchWrittenDays]);

  // ⋯ → 신고 (남의 노트)
  const handleReport = useCallback(async (reason: string) => {
    const target = reportTarget;
    setReportTarget(null);
    if (!target) return;
    try {
      await reportContent('NOTE', target.id, reason);
      info('신고가 접수되었어요', '검토 후 조치할게요.');
    } catch (e: any) {
      info('신고 실패', e?.message ?? '신고에 실패했어요.');
    }
  }, [reportTarget, info]);

  // ⋯ → 차단 (남의 노트) → 차단 후 피드 새로고침(서버가 차단자 글 제외)
  const handleBlock = useCallback((item: FaithNoteItem) => {
    if (!item.writerId) return;
    confirm({
      title: '사용자 차단',
      description: `${item.author.nickname || item.author.name}님을 차단할까요?\n차단하면 이 사용자의 글과 댓글이 더 이상 보이지 않아요.`,
      confirmLabel: '차단',
      onConfirm: async () => {
        try {
          await blockUser(item.writerId!);
          refetch();
        } catch (e: any) {
          info('차단 실패', e?.message ?? '차단에 실패했어요.');
        }
      },
    });
  }, [refetch, confirm, info]);

  // 단일 선택 — 같은 요일을 다시 누르면 해제(전체 보기)
  const handleToggleDate = (key: string) => {
    setSelectedDates((prev) => (prev.includes(key) ? [] : [key]));
  };

  const handleLikeToggle = useCallback((id: string) => {
    toggleLike(id, selectedTab);
  }, [toggleLike, selectedTab]);

  // ⋯ → 수정: 해당 노트의 작성 화면을 편집 모드(noteId)로 진입
  const handleEdit = useCallback((item: FaithNoteItem) => {
    const route =
      item.tab === 'THANKS' ? '/faith-note/write-thanks'
      : item.tab === 'PRAYER' ? '/faith-note/write-prayer'
      : '/faith-note/write-word';
    router.push({ pathname: route, params: { noteId: item.id } });
  }, [router]);

  // ⋯ → 삭제: 확인 후 삭제
  const handleDeleteConfirm = useCallback(async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) return;
    try {
      await deleteNote(target.id, target.tab);
      // 그날의 마지막 노트를 지웠을 수 있으니 주간 체크도 갱신
      refetchWrittenDays();
    } catch {
      Alert.alert('오류', '삭제에 실패했습니다.');
    }
  }, [pendingDelete, deleteNote, refetchWrittenDays]);

  // 피드 = 전체 노트 최신순(요일 미선택). 요일 선택 시 그 요일(이번 주)만 필터.
  const filteredNotes = useMemo(() => {
    if (selectedDates.length === 0) return notes;
    const weekEnd = getWeekEnd(weekStart);
    return notes.filter((n) => {
      if (!n.dayKey || !selectedDates.includes(n.dayKey) || !n.createdAt) return false;
      const t = new Date(n.createdAt);
      return t >= weekStart && t <= weekEnd; // 이번 주의 그 요일
    });
  }, [notes, selectedDates, weekStart]);

  // 이번 주에 '내가' 작성한 요일 집합 → 주간 스트립 체크 (서버 집계, 현재 탭 기준)
  const writtenDays = writtenDaysMap[selectedTab];

  // ── 드롭다운 옵션 선택
  const handleDropdownSelect = (tab: FaithNoteTab) => {
    setShowDropdown(false);
    if (tab === 'THANKS') router.push('/faith-note/write-thanks');
    else if (tab === 'PRAYER') router.push('/faith-note/write-prayer');
    else router.push('/faith-note/write-word');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* 헤더 — 우측 "노트 작성하기" 클릭 → 드롭다운 토글 */}
      <FaithNoteHeader onWritePress={() => setShowDropdown((v) => !v)} />

      {/* 주간 요일 선택기 (이번 주 고정) */}
      <FaithNoteWeekSelector
        selectedDates={selectedDates}
        writtenDays={writtenDays}
        todayKey={todayKey}
        onToggleDate={handleToggleDate}
      />

      {/* 탭 바 */}
      <FaithNoteTabBar selectedTab={selectedTab} onSelectTab={setSelectedTab} />

      {/* 피드 리스트 */}
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <Text style={{ textAlign: 'center', color: colors.text.secondary, padding: spacing.xl, flex: 1 }}>{error}</Text>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FaithNoteCard
              item={item}
              onLikeToggle={handleLikeToggle}
              onReactionToggle={toggleReaction}
              onEdit={handleEdit}
              onDelete={setPendingDelete}
              onReport={setReportTarget}
              onBlock={handleBlock}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            filteredNotes.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator color={colors.primary} style={styles.listFooter} />
            ) : null
          }
          ListEmptyComponent={<FaithNoteEmpty tabLabel={TAB_LABELS[selectedTab]} />}
        />
      )}

      {/* ── 드롭다운 오버레이 ── */}
      {showDropdown && (
        <Pressable style={styles.dropdownOverlay} onPress={() => setShowDropdown(false)}>
          <Pressable style={styles.dropdownCard} onPress={() => {}}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>신앙노트 작성하기</Text>
            </View>

            {DROPDOWN_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.tab}
                style={styles.dropdownRow}
                onPress={() => handleDropdownSelect(opt.tab)}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownIconSlot}>
                  <opt.Icon width={24} height={24} />
                </View>
                <Text style={styles.dropdownLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      )}

      {/* ── 삭제 확인 팝업 ── */}
      <Popup
        visible={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="노트를 삭제하시겠어요?"
        description="삭제한 노트는 복구할 수 없어요."
        buttons={[
          { label: '취소', onPress: () => setPendingDelete(null), variant: 'secondary' },
          { label: '삭제', onPress: handleDeleteConfirm, variant: 'primary' },
        ]}
      />

      <ReportReasonSheet
        visible={!!reportTarget}
        onClose={() => setReportTarget(null)}
        onSelect={handleReport}
      />

      {popupNode}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 32,
  },
  listContentEmpty: {
    flex: 1,
  },
  listFooter: {
    paddingVertical: spacing.md,
  },

  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  dropdownCard: {
    position: 'absolute',
    top: 52,
    right: spacing.md,
    width: 232,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownHeader: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dropdownTitle: {
    fontSize: fontSize.base,
    lineHeight: 26,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  dropdownIconSlot: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  dropdownLabel: {
    fontSize: fontSize.md,
    lineHeight: 21,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
});
