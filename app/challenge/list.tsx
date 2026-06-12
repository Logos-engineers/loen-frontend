import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { ChallengeItem, useChallenge } from '@/hooks/useChallenge';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChallengeListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { challenges, isLoading, error, fetchChallenges, togglePin } = useChallenge();
  
  const [searchText, setSearchText] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'faith' | 'bible'>('all');
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [sortFilter, setSortFilter] = useState<'latest' | 'oldest'>('latest');
  const [isSortModalVisible, setSortModalVisible] = useState(false);

  useEffect(() => {
    fetchChallenges(searchText.trim() || undefined, showOnlyActive);
  }, [fetchChallenges, searchText, showOnlyActive]);

  // 화면 재진입 시 현재 검색/필터 기준으로 다시 불러온다 (등록·수정 반영).
  useRefetchOnFocus(() => fetchChallenges(searchText.trim() || undefined, showOnlyActive));

  const handleBack = () => router.back();

  const formatShortDate = (isoStr: string) => {
    const d = new Date(isoStr);
    const yy = d.getFullYear().toString().slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };

  const getChallengeSubtitle = (item: ChallengeItem) => {
    if (item.type === 'BIBLE') {
      return item.bibleBooks && item.bibleBooks.length > 0
        ? item.bibleBooks.join(', ')
        : '읽기 범위 정보 없음';
    }
    return '챌린지 목표 정보 없음';
  };

  const handleShare = (id: string) => {
    console.log(`[Share] 공유하기 모달 열기: ${id}`);
  };

  const renderLeftActions = (
    onShare: () => void,
    onTogglePin: () => void,
    isPinned: boolean
  ) => (
    <View style={styles.actionContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={onShare}>
        <Ionicons name="share-social" size={24} color={colors.text.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={onTogglePin}>
        <Ionicons name={isPinned ? "pin" : "pin-outline"} size={24} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderChallengeCard = (item: ChallengeItem) => {
    if (showOnlyActive && item.isCompleted) return null;

    return (
      <Swipeable
        key={item.id}
        renderLeftActions={() => renderLeftActions(() => handleShare(item.id), () => togglePin(item.id), item.isPinned)}
        containerStyle={{ marginBottom: spacing.md }}
      >
        <TouchableOpacity style={[styles.challengeCard, { marginBottom: 0 }]} activeOpacity={0.7}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>{item.type === 'BIBLE' ? '성경 챌린지' : '신앙 챌린지'}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>{item.participantCount}명 참여중</Text></View>
            {item.isOwner && <View style={styles.badge}><Text style={styles.badgeText}>내가 만든 챌린지</Text></View>}
            {item.isCompleted && <View style={styles.badge}><Text style={styles.badgeText}>종료된 챌린지</Text></View>}
            {item.isPinned && <View style={styles.badge}><Text style={styles.badgeText}>고정됨</Text></View>}
          </View>
          <View style={styles.cardContent}>
            <View style={[styles.cardIconWrapper, { backgroundColor: item.type === 'BIBLE' ? '#007AFF' : '#FFB800' }]}>
              <Ionicons name={item.type === 'BIBLE' ? 'book' : 'sunny'} size={24} color={colors.white} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardDate}>{formatShortDate(item.startDate)} ~ {formatShortDate(item.endDate)}</Text>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{getChallengeSubtitle(item)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const parseDateToMs = (dateStr: string) => {
    try {
      const startPart = dateStr.split('~')[0].trim();
      if (startPart.includes('.')) {
        const [yy, mm, dd] = startPart.split('.');
        return new Date(`20${yy}-${mm}-${dd}`).getTime();
      }
      return new Date(dateStr).getTime();
    } catch {
      return 0;
    }
  };

  const sortData = (list: ChallengeItem[]) => {
    return [...list].sort((a, b) => {
      if (b.isPinned !== a.isPinned) {
        return Number(b.isPinned) - Number(a.isPinned);
      }
      const timeA = parseDateToMs(a.startDate);
      const timeB = parseDateToMs(b.startDate);
      return sortFilter === 'latest' ? timeB - timeA : timeA - timeB;
    });
  };

  const filteredChallenges = useMemo(() => challenges.filter(item => {
    if (categoryFilter === 'bible') return item.type === 'BIBLE';
    if (categoryFilter === 'faith') return item.type === 'FAITH';
    return true;
  }), [categoryFilter, challenges]);
  const myChallenges = sortData(filteredChallenges.filter(item => item.isOwner));
  const participatingChallenges = sortData(filteredChallenges.filter(item => !item.isOwner));

  const getCategoryLabel = () => {
    if (categoryFilter === 'all') return '전체 챌린지';
    if (categoryFilter === 'faith') return '신앙 챌린지';
    return '성경 챌린지';
  };

  const getSortLabel = () => {
    return sortFilter === 'latest' ? '최신순' : '오래된순';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 챌린지</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, spacing.xxl) }}>
        
        {/* 검색창 */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="검색어를 입력해주세요"
            placeholderTextColor={colors.text.dim}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* 필터 영역 */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterChip} onPress={() => setCategoryModalVisible(true)}>
            <Text style={styles.filterText}>{getCategoryLabel()}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.text.secondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip} onPress={() => setSortModalVisible(true)}>
            <Text style={styles.filterText}>{getSortLabel()}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.text.secondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, showOnlyActive && styles.filterChipActive]}
            onPress={() => setShowOnlyActive(!showOnlyActive)}
          >
            <Text style={[styles.filterText, showOnlyActive && styles.filterTextActive]}>진행 중인 챌린지만 보기</Text>
          </TouchableOpacity>
        </View>

        {/* A. 내가 만든 챌린지 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleNoMargin}>내가 만든 챌린지</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : error ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>챌린지를 불러오지 못했습니다</Text>
            </View>
          ) : myChallenges.length > 0 ? (
            myChallenges.map(renderChallengeCard)
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>해당하는 내가 만든 챌린지가 없어요</Text>
            </View>
          )}
        </View>

        {/* B. 참여 중인 챌린지 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>참여 중인 챌린지</Text>
          {participatingChallenges.length > 0 ? participatingChallenges.map(renderChallengeCard) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>참여 중인 챌린지가 없어요</Text>
            </View>
          )}
        </View>

        {/* C. 추천 챌린지 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추천 챌린지</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>추천 챌린지 API가 필요합니다</Text>
          </View>
        </View>

      </ScrollView>

      {/* 바텀시트 모달 */}
      <Modal visible={isCategoryModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setCategoryModalVisible(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.handleBar} />
            
            <TouchableOpacity style={styles.optionRow} onPress={() => { setCategoryFilter('all'); setCategoryModalVisible(false); }}>
              <Text style={[styles.optionText, categoryFilter === 'all' && styles.optionTextSelected]}>전체 챌린지 보기</Text>
              {categoryFilter === 'all' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionRow} onPress={() => { setCategoryFilter('faith'); setCategoryModalVisible(false); }}>
              <Text style={[styles.optionText, categoryFilter === 'faith' && styles.optionTextSelected]}>신앙 챌린지 보기</Text>
              {categoryFilter === 'faith' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionRow} onPress={() => { setCategoryFilter('bible'); setCategoryModalVisible(false); }}>
              <Text style={[styles.optionText, categoryFilter === 'bible' && styles.optionTextSelected]}>성경 챌린지만 보기</Text>
              {categoryFilter === 'bible' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 정렬 바텀시트 모달 */}
      <Modal visible={isSortModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSortModalVisible(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.handleBar} />
            
            <TouchableOpacity style={styles.optionRow} onPress={() => { setSortFilter('latest'); setSortModalVisible(false); }}>
              <Text style={[styles.optionText, sortFilter === 'latest' && styles.optionTextSelected]}>최신순으로 보기</Text>
              {sortFilter === 'latest' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionRow} onPress={() => { setSortFilter('oldest'); setSortModalVisible(false); }}>
              <Text style={[styles.optionText, sortFilter === 'oldest' && styles.optionTextSelected]}>오래된 순으로 보기</Text>
              {sortFilter === 'oldest' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  backButton: { width: 32, alignItems: 'flex-start' },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerRightSpace: { width: 32 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  
  // 검색바
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 44, marginBottom: spacing.md },
  searchIcon: { marginRight: spacing.xs },
  searchInput: { flex: 1, fontSize: fontSize.base, color: colors.text.primary },
  
  // 필터
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxl },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: fontWeight.medium },
  filterTextActive: { color: colors.white },

  // 섹션
  section: { marginBottom: spacing.xxl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.lg },
  sectionTitleNoMargin: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  editBtn: { backgroundColor: colors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  editBtnText: { fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: fontWeight.medium },

  // 액션 버튼 (Swipeable)
  actionContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingRight: spacing.sm },
  actionButton: { width: 64, height: 64, backgroundColor: colors.border, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },

  // 카드 공통
  challengeCard: { backgroundColor: colors.background.elevated, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  badge: { backgroundColor: '#F2F2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  badgeText: { fontSize: 10, color: colors.text.secondary, fontWeight: fontWeight.medium },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrapper: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  cardTextContainer: { flex: 1, marginRight: spacing.xs },
  cardDate: { fontSize: 11, color: colors.text.secondary, marginBottom: 2 },
  cardTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: 4 },
  cardSubtitle: { fontSize: fontSize.xs, color: colors.text.secondary },
  
  // 빈 상태
  emptyCard: { backgroundColor: colors.background.elevated, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  emptyText: { color: colors.text.secondary, fontSize: fontSize.sm },

  // 바텀시트
  modalOverlay: { flex: 1, backgroundColor: 'rgba(13,28,45,0.55)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingBottom: spacing.xxl, paddingTop: spacing.sm, paddingHorizontal: spacing.xl },
  handleBar: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: radius.full, alignSelf: 'center', marginBottom: spacing.xl },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  optionText: { fontSize: fontSize.base, color: colors.text.secondary },
  optionTextSelected: { color: colors.text.primary, fontWeight: fontWeight.bold },
});
