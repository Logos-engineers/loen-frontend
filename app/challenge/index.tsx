import BackIcon from '@/assets/icons/back.svg';
import ChevronDownSmIcon from '@/assets/icons/chevron-down-sm.svg';
import ChevronRightSmIcon from '@/assets/icons/chevron-right-sm.svg';
import SearchIcon from '@/assets/icons/search.svg';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
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
  type: 'FAITH' | 'BIBLE';
  tags: string[];
  period: string;
  title: string;
  desc: string;
  image: ImageSourcePropType;
}

// ─── 테스트 데이터 ─────────────────────────────────────────────────────────────
const TEST_CHALLENGE_CARDS: ChallengeCardItem[] = [
  {
    id: 'test-faith-1',
    type: 'FAITH',
    tags: ['신앙 챌린지', '8명 참여중', '내가 만든 챌린지'],
    period: '26.01.01 ~ 26.12.31',
    title: '매일 감사 고백하기',
    desc: '하루 한 가지 감사 기록하기',
    image: FAITH_IMAGE,
  },
  {
    id: 'test-bible-1',
    type: 'BIBLE',
    tags: ['성경 챌린지', '10명 참여중', '내가 만든 챌린지'],
    period: '26.01.01 ~ 26.12.31',
    title: '출애굽기 완독하기',
    desc: '출애굽기 1:1 ~ 40:38',
    image: BIBLE_IMAGE,
  },
];

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
  const desc = item.type === 'FAITH'
    ? (item.goal ?? '')
    : bookNames.length > 0
      ? bookNames.slice(0, 2).join(', ') + (bookNames.length > 2 ? ` 외 ${bookNames.length - 2}권` : '')
      : '';

  return {
    id: String(item.id),
    type: item.type,
    tags,
    period: `${toDateStr(item.startDate)} ~ ${toDateStr(item.endDate)}`,
    title: item.name,
    desc,
    image: item.type === 'BIBLE' ? BIBLE_IMAGE : FAITH_IMAGE,
  };
}

// ─── ChallengeListCard ─────────────────────────────────────────────────────────
function ChallengeListCard({ item, onPress }: { item: ChallengeCardItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
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
          {item.desc ? <Text style={styles.descText} numberOfLines={1}>{item.desc}</Text> : null}
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

  const displayedItems = useMemo(() => {
    const apiItems = challenges.map(toCardItem);
    const normalizedSearchText = searchText.trim().toLowerCase();
    const testItems = TEST_CHALLENGE_CARDS.filter((testItem) => {
      const hasSameTypeFromApi = apiItems.some(item => item.type === testItem.type);
      const matchesSearch = !normalizedSearchText || [
        testItem.title,
        testItem.desc,
        ...testItem.tags,
      ].some(value => value.toLowerCase().includes(normalizedSearchText));

      return !hasSameTypeFromApi && matchesSearch;
    });

    return [...apiItems, ...testItems];
  }, [challenges, searchText]);

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
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
          ) : error && displayedItems.length === 0 ? (
            <Text style={{ textAlign: 'center', color: colors.text.secondary, padding: spacing.xl }}>{error}</Text>
          ) : (
            displayedItems.map((item) => (
              <View key={item.id} style={styles.cardWrapper}>
                <ChallengeListCard
                  item={item}
                  onPress={() => {
                    const route = item.type === 'BIBLE' ? '/challenge/bible' : '/challenge/faith';
                    router.push(`${route}?id=${item.id}`);
                  }}
                />
              </View>
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
  // layout_LLMYZY — 전체 화면
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
    paddingTop: 44, // iOS status bar height (system constant)
  },

  // layout_J42PIH — navigation bar: height 46, row, center
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    backgroundColor: colors.background.base,
  },
  // layout_HXTP7S — left: width 100, padding 0 8 0 16
  backBtn: {
    width: 100,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // Title/Title2_18_SB — fontSize 18, semibold, center
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.heading,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  // layout_NSPMUN — right: width 100 (타이틀 중앙 정렬 밸런스)
  headerRight: {
    width: 100,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },

  // layout_4TRKMX — search bar: padding 16 all sides, gap 8
  searchWrapper: {
    padding: spacing.md,
  },
  // layout_8O31IB — input field: padding 8, gap 8, borderRadius 8, bg trans/gray/a5
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  // Title/Title3_16_SB — fontSize 16, semibold
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    padding: 0,
  },

  // layout_J0M293 — filter row: padding 8 16, gap 8, row, center
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterLeft: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // layout_QCKHSD — chip: padding 4 8, gap 2, borderRadius 8, bg trans/gray/a5
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.nano,
  },
  // Caption/Caption_12_SB — fontSize 12, semibold
  filterChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  filterChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.nano,
  },
  filterToggleTextActive: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  filterToggleText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },

  // 카드 목록 컨테이너
  listContainer: {},
  // layout_JXADQJ — 카드 래퍼: padding 8 16
  cardWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // layout_YIA4CJ — 카드: column, borderRadius 16, bg #FFFFFF, width fills wrapper
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    shadowColor: shadow.color,
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
  },
  // layout_U5PGUR — 태그 행: padding 16 12 8 16, gap 10, row, center
  cardTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.smmd,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  // layout_QCKHSD — chip: padding 4 8, gap 2, borderRadius 8, bg trans/gray/a5
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.nano,
  },
  // Caption/Caption_12_SB
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  // layout_XV7ULH — 아이템 행: padding 6 16 16, row, center
  cardItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  challengeImage: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
  },
  textCol: {
    flex: 1,
    gap: spacing.xs,
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
