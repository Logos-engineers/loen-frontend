import BackIcon from '@/assets/icons/back.svg';
import ChevronDownSmIcon from '@/assets/icons/chevron-down-sm.svg';
import ChevronRightSmIcon from '@/assets/icons/chevron-right-sm.svg';
import SearchIcon from '@/assets/icons/search.svg';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { BIBLE_BOOKS as BIBLE_BOOK_META } from '@/constants/BibleMeta';
import { useChallenge, type ChallengeItem as ApiChallenge } from '@/hooks/useChallenge';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── 챌린지 이미지 ────────────────────────────────────────────────────────────
const BIBLE_IMAGE = require('@/assets/images/challenge-bible.png');
const FAITH_IMAGE = require('@/assets/images/challenge-faith.png');

// ─── 타입 ─────────────────────────────────────────────────────────────────────
interface ChallengeCardItem {
  id: string;
  tags: string[];
  period: string;
  title: string;
  desc: string;
  image: ImageSourcePropType;
}

// ─── API → 카드 매핑 ──────────────────────────────────────────────────────────
function toDateStr(iso: string) {
  return iso.replace(/-/g, '.').slice(2); // "2026-01-28" → "26.01.28"
}

function toCardItem(item: ApiChallenge): ChallengeCardItem {
  const tags = [
    item.type === 'BIBLE' ? '성경 챌린지' : '신앙 챌린지',
    `${item.participantCount}명 참여중`,
    item.isOwner ? '내가 만든 챌린지' : null,
  ].filter(Boolean) as string[];

  const bookNames = (item.bibleBooks ?? []).map(
    code => BIBLE_BOOK_META.find(b => b.code === code)?.korName ?? code
  );
  const desc = bookNames.length > 0
    ? bookNames.slice(0, 2).join(', ') + (bookNames.length > 2 ? ` 외 ${bookNames.length - 2}권` : '')
    : '';

  return {
    id: String(item.id),
    tags,
    period: `${toDateStr(item.startDate)} ~ ${toDateStr(item.endDate)}`,
    title: item.name,
    desc,
    image: item.type === 'BIBLE' ? BIBLE_IMAGE : FAITH_IMAGE,
  };
}

// ─── ChallengeListCard ─────────────────────────────────────────────────────────
function ChallengeListCard({ item }: { item: ChallengeCardItem }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      {/* Tags row */}
      <View style={styles.cardTagRow}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Item row */}
      <View style={styles.cardItemRow}>
        <Image source={item.image} style={styles.challengeImage} />
        <View style={styles.textCol}>
          <Text style={styles.periodText}>{item.period}</Text>
          <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.descText} numberOfLines={1}>{item.desc}</Text>
        </View>
        <ChevronRightSmIcon width={10} height={17} color={colors.text.dim} />
      </View>
    </TouchableOpacity>
  );
}

// ─── 메인 화면 ─────────────────────────────────────────────────────────────────
export default function ChallengeListScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const { challenges, isLoading, error, fetchChallenges } = useChallenge();

  useFocusEffect(useCallback(() => {
    fetchChallenges(searchText || undefined, showActiveOnly);
  }, [fetchChallenges, searchText, showActiveOnly]));

  const displayedItems = useMemo(() => challenges.map(toCardItem), [challenges]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={[]}>
        {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <BackIcon width={24} height={24} fill={colors.text.dim} color={colors.text.dim} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>챌린지 모아보기</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Input */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <SearchIcon width={17} height={17} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="검색어를 입력해주세요"
              placeholderTextColor={colors.text.secondary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Filter Row */}
        <View style={styles.filterRow}>
          <View style={styles.filterLeft}>
            <TouchableOpacity style={styles.filterChip} activeOpacity={0.7}>
              <Text style={styles.filterChipText}>전체 챌린지</Text>
              <ChevronDownSmIcon width={8} height={5} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} activeOpacity={0.7}>
              <Text style={styles.filterChipText}>최신순</Text>
              <ChevronDownSmIcon width={8} height={5} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={showActiveOnly ? styles.filterChipActive : styles.filterChip}
            onPress={() => setShowActiveOnly(!showActiveOnly)}
          >
            <Text style={showActiveOnly ? styles.filterToggleTextActive : styles.filterToggleText}>
              진행 중인 챌린지만 보기
            </Text>
          </TouchableOpacity>
        </View>

        {/* Challenge Card List */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={{ textAlign: 'center', color: colors.text.secondary, padding: spacing.xl }}>{error}</Text>
          ) : (
            displayedItems.map((item) => (
              <ChallengeListCard key={item.id} item={item} />
            ))
          )}
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}

// ─── 스타일 ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
    paddingTop: 44, // Match OBS screen top safe spacing since we removed edges=['top']
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    backgroundColor: colors.background.base,
    // explicitly match OBS screen where paddingHorizontal is 0 and backBtn has paddingLeft
  },
  backBtn: {
    width: 100,
    paddingLeft: 16,
    paddingRight: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 100, // balance the 100px backBtn so the title is perfectly centered
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Search
  searchWrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    height: 42,
    paddingHorizontal: spacing.sm + 3, // ~11px
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    padding: 0,
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterLeft: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 2,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  filterChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary, // The purple background color seen in screenshot
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 2,
  },
  filterToggleTextActive: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
  filterToggleText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },

  // List
  listContainer: {
    paddingHorizontal: spacing.md,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    paddingTop: spacing.md + 4, // ~20px
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTagRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.sm + 4, // ~12px
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  cardItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2, // ~10px
  },
  challengeImage: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  periodText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  titleText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  descText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
});
