import BookIcon from '@/assets/icons/book.svg';
import PencilIcon from '@/assets/icons/pencil.svg';
import PrayIcon from '@/assets/icons/pray.svg';
import { FaithNoteCard, FaithNoteItem } from '@/components/faith-note/faith-note-card';
import { FaithNoteEmpty } from '@/components/faith-note/faith-note-empty';
import { FaithNoteHeader } from '@/components/faith-note/faith-note-header';
import { FaithNoteTab, FaithNoteTabBar } from '@/components/faith-note/faith-note-tab-bar';
import { FaithNoteWeekSelector } from '@/components/faith-note/faith-note-week-selector';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import { getTodayKey } from '@/utils/faith-note-store';
import { useFaithNotes } from '@/hooks/useFaithNotes';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  { tab: 'THANKS', label: '감사노트', Icon: PencilIcon },
  { tab: 'PRAYER', label: '기도노트', Icon: PrayIcon },
  { tab: 'WORD', label: '말씀노트', Icon: BookIcon },
];

// ─── 오늘 요일 ──────────────────────────────────────────────────────────────────
const TODAY_KEY = getTodayKey();

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FaithNoteListScreen() {
  const router = useRouter();

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<FaithNoteTab>('THANKS');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownBtnRef = useRef<View>(null);

  const { notes, isLoading, error, toggleLike, refetch } = useFaithNotes(selectedTab);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const handleToggleDate = (key: string) => {
    setSelectedDates((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key],
    );
  };

  const handleLikeToggle = useCallback((id: string) => {
    toggleLike(id, selectedTab);
  }, [toggleLike, selectedTab]);

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
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.dropdownOverlay}>
            {/* 드롭다운 카드 — 우측 상단 */}
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.dropdownCard}>
                {/* 제목 */}
                <Text style={styles.dropdownTitle}>신앙노트 작성하기</Text>

                {/* 옵션 목록 */}
                {DROPDOWN_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.tab}
                    style={styles.dropdownRow}
                    onPress={() => handleDropdownSelect(opt.tab)}
                    activeOpacity={0.7}
                  >
                    {/* 아이콘 박스 */}
                    <View style={styles.dropdownIconBox}>
                      <opt.Icon width={20} height={20} />
                    </View>
                    <Text style={styles.dropdownLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
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
    paddingBottom: 40,
  },
  listContentEmpty: {
    flex: 1,
  },

  // ── 드롭다운 오버레이
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  // Figma: 우측 상단 헤더 근처 플로팅 카드
  dropdownCard: {
    position: 'absolute',
    top: 48,          // 헤더 높이(44) + 4px 여백
    right: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    minWidth: 180,
    shadowColor: shadow.color,
    shadowOffset: shadow.floating.offset,
    shadowOpacity: shadow.floating.opacity,
    shadowRadius: shadow.floating.radius,
    elevation: shadow.floating.elevation,
  },
  dropdownTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  dropdownIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
});
