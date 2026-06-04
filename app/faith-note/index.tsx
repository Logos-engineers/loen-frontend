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
import { getTodayKey } from '@/utils/faith-note-store';
import { useFaithNotes } from '@/hooks/useFaithNotes';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

// ─── 오늘 요일 ──────────────────────────────────────────────────────────────────
const TODAY_KEY = getTodayKey();

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FaithNoteListScreen() {
  const router = useRouter();

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<FaithNoteTab>('THANKS');
  const [showDropdown, setShowDropdown] = useState(false);

  const { notes, isLoading, error, toggleLike, toggleReaction, deleteNote, refetch } = useFaithNotes(selectedTab);
  const [pendingDelete, setPendingDelete] = useState<FaithNoteItem | null>(null);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const handleToggleDate = (key: string) => {
    setSelectedDates((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key],
    );
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
    } catch (e) {
      Alert.alert('오류', '삭제에 실패했습니다.');
    }
  }, [pendingDelete, deleteNote]);

  const filteredNotes = useMemo(() => {
    if (selectedDates.length === 0) return notes;
    return notes.filter((n) => !n.dayKey || selectedDates.includes(n.dayKey));
  }, [notes, selectedDates]);

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

      {/* 주간 요일 선택기 */}
      <FaithNoteWeekSelector
        selectedDates={selectedDates}
        todayKey={TODAY_KEY}
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
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            filteredNotes.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <FaithNoteEmpty tabLabel={TAB_LABELS[selectedTab]} />
          }
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
