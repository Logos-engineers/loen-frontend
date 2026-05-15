import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useChallenge } from '@/hooks/useChallenge';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FaithChallengeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => router.back();
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const { challenges, isLoading, error } = useChallenge();
  const challenge = challenges.find(item => item.type === 'FAITH');

  const formatShortDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const yy = d.getFullYear().toString().slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 동적 달력 생성 (bible.tsx 참고)
  const getCalendarDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0(일) ~ 6(토)
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const dates = [];
    for (let i = 0; i < firstDay; i++) {
      dates.push({ day: '', dateString: '' });
    }
    for (let i = 1; i <= lastDate; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      dates.push({ day: String(i), dateString: dateStr });
    }
    const remain = dates.length % 7;
    if (remain > 0) {
      for (let i = 0; i < 7 - remain; i++) {
        dates.push({ day: '', dateString: '' });
      }
    }
    return dates;
  };

  const fullDates = getCalendarDates();
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const weekDates = useMemo(() => {
    const todayIndex = fullDates.findIndex(d => d.dateString === todayStr);
    if (todayIndex !== -1) {
      const startIndex = Math.floor(todayIndex / 7) * 7;
      return fullDates.slice(startIndex, startIndex + 7);
    }
    return fullDates.slice(0, 7); // 현재 달에 오늘이 없으면 첫 번째 주 표시
  }, [fullDates, todayStr]);

  const datesToRender = isCalendarExpanded ? fullDates : weekDates;

  const toggleDate = (dateStr: string) => {
    if (!dateStr) return;
    const newSet = new Set(selectedDates);
    if (newSet.has(dateStr)) {
      newSet.delete(dateStr);
    } else {
      newSet.add(dateStr);
    }
    setSelectedDates(newSet);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, spacing.xxl) }}
      >
        {/* 상단 챌린지 정보 */}
        <View style={styles.infoSection}>
          <Text style={styles.mainTitle}>{challenge?.name ?? '신앙 챌린지'}</Text>
          <Text style={styles.dateText}>
            {challenge ? `${formatShortDate(challenge.startDate)} ~ ${formatShortDate(challenge.endDate)}` : '등록된 챌린지가 없습니다'}
          </Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>신앙 챌린지</Text></View>
            {challenge && <View style={styles.badge}><Text style={styles.badgeText}>{challenge.participantCount}명 참여중</Text></View>}
            {challenge?.isOwner && <View style={styles.badge}><Text style={styles.badgeText}>내가 만든 챌린지</Text></View>}
          </View>
        </View>

        {/* 챌린지 목표 카드 */}
        <View style={styles.rangeCard}>
          <View style={[styles.rangeIconWrapper, { backgroundColor: colors.reaction?.red || '#FF3B30' }]}>
            <Ionicons name="locate" size={24} color={colors.white} />
          </View>
          <View>
            <Text style={styles.rangeLabel}>챌린지 목표</Text>
            <Text style={styles.rangeValue}>목표 정보 API가 필요합니다</Text>
          </View>
        </View>

        {/* 챌린지 인증 섹션 */}
        <Text style={styles.sectionTitle}>챌린지 인증</Text>
        
        {/* 달력 카드 */}
        <View style={styles.calendarCardContainer}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                <Ionicons name="chevron-back" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              <Text style={styles.calendarMonth}>{`${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}`}</Text>
              <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* 요일 헤더 한 번만 렌더링 */}
            <View style={styles.calendarRow}>
              {weekDays.map((day, idx) => (
                <View key={idx} style={styles.calendarCell}>
                  <Text style={styles.calendarDayText}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {datesToRender.map((item, index) => {
                const isSelected = selectedDates.has(item.dateString);
                const isToday = item.dateString === todayStr;

                return (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.calendarGridCell}
                    activeOpacity={0.7}
                    onPress={() => toggleDate(item.dateString)}
                    disabled={!item.dateString}
                  >
                    {item.day === '' ? (
                      <View style={styles.dateCircle} />
                    ) : isSelected ? (
                      <View style={[styles.dateCircle, styles.dateChecked]}>
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                      </View>
                    ) : isToday ? (
                      <View style={[styles.dateCircle, styles.dateHighlight]}>
                        <Text style={styles.dateCircleTextWhite}>{item.day}</Text>
                      </View>
                    ) : (
                      <View style={styles.dateCircle}>
                        <Text style={styles.dateCircleText}>{item.day}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={styles.calendarFullView}
              onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
            >
              <Text style={styles.calendarFullViewText}>{isCalendarExpanded ? '달력 접기' : '달력 전체보기'}</Text>
              <Ionicons name={isCalendarExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 인증 피드 리스트 */}
        <View style={styles.feedCard}>
          <Text style={styles.emptyText}>챌린지 인증 피드 API가 필요합니다</Text>
        </View>

        {/* 추천 챌린지 섹션 */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>추천 챌린지</Text>
        <View style={styles.challengeCard}>
          <Text style={styles.emptyText}>
            {isLoading ? '추천 챌린지를 불러오는 중입니다' : error ? '추천 챌린지를 불러오지 못했습니다' : '추천 챌린지 API가 필요합니다'}
          </Text>
        </View>
        
      </ScrollView>

      {/* 바텀시트 모달 */}
      <Modal
        visible={isBottomSheetVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBottomSheetVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsBottomSheetVisible(false)}
        >
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.bottomSheetHandle} />
            <TouchableOpacity style={styles.bottomSheetOption} onPress={() => { console.log('챌린지 수정하기'); setIsBottomSheetVisible(false); }}>
              <Text style={styles.bottomSheetOptionText}>챌린지 수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomSheetOption} onPress={() => { console.log('챌린지 공유하기'); setIsBottomSheetVisible(false); }}>
              <Text style={styles.bottomSheetOptionText}>챌린지 공유하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bottomSheetOption, { borderBottomWidth: 0 }]} onPress={() => { console.log('챌린지 종료하기'); setIsBottomSheetVisible(false); }}>
              <Text style={styles.bottomSheetOptionText}>챌린지 종료하기</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  headerButton: { width: 32, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  
  infoSection: { marginBottom: spacing.xl },
  mainTitle: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.xs },
  dateText: { fontSize: fontSize.sm, color: colors.text.secondary, marginBottom: spacing.md },
  
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: { backgroundColor: colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md },
  badgeText: { fontSize: 11, color: colors.text.secondary, fontWeight: fontWeight.medium },

  rangeCard: { backgroundColor: colors.background.elevated, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xxl },
  rangeIconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  rangeLabel: { fontSize: 11, color: colors.text.secondary, marginBottom: 2 },
  rangeValue: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },

  sectionTitle: { fontSize: 18, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.lg },

  calendarCardContainer: { position: 'relative', zIndex: 1 },
  calendarCard: { backgroundColor: colors.background.elevated, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xl },
  calendarMonth: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },
  
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  calendarCell: { alignItems: 'center', gap: spacing.xs, flex: 1 },
  calendarDayText: { fontSize: 12, color: colors.text.secondary, marginBottom: 4 },
  
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarGridCell: { width: '14.28%', alignItems: 'center', marginBottom: spacing.md },
  
  dateCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dateChecked: { backgroundColor: '#5E5CE6' },
  dateHighlight: { backgroundColor: '#FF3B30' },
  dateCircleText: { fontSize: 14, color: colors.text.primary, fontWeight: fontWeight.medium },
  dateCircleTextWhite: { fontSize: 14, color: colors.white, fontWeight: fontWeight.bold },

  calendarFullView: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  calendarFullViewText: { fontSize: 12, color: colors.text.secondary, fontWeight: fontWeight.medium },

  // 모달 바텀시트 스타일
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: colors.background.base, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingBottom: 32 },
  bottomSheetHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: spacing.md },
  bottomSheetOption: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  bottomSheetOptionText: { fontSize: fontSize.base, color: colors.text.primary, fontWeight: fontWeight.medium },

  // 피드 스타일
  feedCard: { backgroundColor: colors.background.elevated, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  feedUserInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  feedNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2 },
  feedNickname: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text.primary },
  feedTime: { fontSize: 11, color: colors.text.secondary },
  feedName: { fontSize: 11, color: colors.text.secondary },
  feedText: { fontSize: fontSize.md, color: colors.text.primary, lineHeight: 20, marginBottom: spacing.md },
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.md },
  
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: colors.border, borderRadius: radius.md, marginBottom: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  pageIndicatorContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginBottom: spacing.md },
  pageDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text.dim },
  pageDotActive: { backgroundColor: colors.primary },

  feedActions: { flexDirection: 'row', gap: spacing.sm },
  actionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.base, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  actionPillText: { fontSize: 12, color: colors.text.secondary, fontWeight: fontWeight.medium },

  // 댓글 스타일
  commentsList: { marginTop: spacing.md, gap: spacing.xs },
  commentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background.base, padding: spacing.sm, borderRadius: radius.md },
  commentText: { fontSize: fontSize.sm, color: colors.text.primary, flex: 1 },

  commentInputWrapper: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  cameraButton: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  commentInput: { flex: 1, height: 40, backgroundColor: colors.background.base, borderRadius: radius.xl, paddingHorizontal: spacing.md, fontSize: fontSize.sm, color: colors.text.primary },

  // 추천 챌린지 카드 공통
  challengeCard: { backgroundColor: colors.background.elevated, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  cardBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrapper: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  cardTextContainer: { flex: 1, marginRight: spacing.xs },
  cardDate: { fontSize: 11, color: colors.text.secondary, marginBottom: 2 },
  cardTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: colors.text.secondary },
  emptyText: { color: colors.text.secondary, fontSize: fontSize.md, textAlign: 'center' },
});
