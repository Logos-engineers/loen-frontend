import { ChallengeCalendar } from '@/components/challenge/ChallengeCalendar';
import { ChallengeListCard } from '@/components/challenge/ChallengeListCard';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import type { ChallengeDetail } from '@/hooks/useChallenge';
import { useChallengeDetail, useRecommendedChallenges, joinChallenge, leaveChallenge } from '@/hooks/useChallenge';
import { formatShortDate, toDateString } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── 테스트 데이터 ──────────────────────────────────────────────────────────────

const TEST_DETAIL: ChallengeDetail = {
  challengeId: 'test-bible-1',
  type: 'BIBLE',
  name: '출애굽기 완독하기',
  goal: null,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  dDay: 225,
  verificationMethod: 'BIBLE_READ',
  visibility: 'PUBLIC',
  participantCount: 10,
  isJoined: true,
  isCreator: true,
  isPinned: false,
  notificationEnabled: true,
  bibleBooks: ['출애굽기 1:1 ~ 40:38'],
  myProgress: {
    completedDays: 5,
    lastCertifiedDate: '2026-05-20',
    weeklyCalendar: {
      '2026-05-18': true,
      '2026-05-19': true,
      '2026-05-20': true,
    },
    allCertifiedDates: [
      '2026-05-10', '2026-05-14', '2026-05-18', '2026-05-19', '2026-05-20',
    ],
  },
};

type WeeklyProgressItem = {
  id: string;
  name: string;
  subtitle: string;
  completedDates: string[];
  isMe?: boolean;
};

const TEST_WEEKLY_PROGRESS: WeeklyProgressItem[] = [
  {
    id: 'test-bible-progress-me',
    name: '나',
    subtitle: '내 달성 현황',
    completedDates: ['2026-05-18', '2026-05-19', '2026-05-20'],
    isMe: true,
  },
  {
    id: 'test-bible-progress-1',
    name: '김민준',
    subtitle: '말씀 읽기',
    completedDates: ['2026-05-17', '2026-05-18', '2026-05-20'],
  },
  {
    id: 'test-bible-progress-2',
    name: '이수진',
    subtitle: '출애굽기 읽기',
    completedDates: ['2026-05-17', '2026-05-18', '2026-05-19', '2026-05-20'],
  },
];

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const TODAY_COLOR = '#F75D42';

function buildWeekDates(baseDate: Date) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      week: WEEK_DAYS[index],
      day: date.getDate(),
      dateString: toDateString(date),
    };
  });
}

// ─── 메인 화면 ──────────────────────────────────────────────────────────────────

export default function BibleChallengeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isTestChallenge = !id || id.startsWith('test-');
  const challengeId = isTestChallenge ? null : id;
  const { detail: apiDetail, isLoading, error, refetch: refetchDetail } = useChallengeDetail(challengeId);
  const { items: recommendedItems } = useRecommendedChallenges();
  const [menuVisible, setMenuVisible] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  const detail = isTestChallenge ? TEST_DETAIL : apiDetail ?? TEST_DETAIL;
  const certifiedDates = useMemo(
    () => detail.myProgress?.allCertifiedDates ?? [],
    [detail.myProgress],
  );
  const bibleRange = detail.bibleBooks?.join(', ') ?? '';
  const isEnded = new Date(detail.endDate) < new Date();
  const canInteract = detail.isJoined;
  const canManage = detail.isCreator;
  const canJoin = !detail.isJoined && !isEnded;

  const handleJoin = async () => {
    if (joinLoading || isTestChallenge) return;
    setJoinLoading(true);
    try {
      await joinChallenge(id!);
      refetchDetail();
    } catch (err) {
      Alert.alert('참여 실패', (err as Error)?.message || '챌린지 참여에 실패했습니다.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = () => {
    if (isTestChallenge) return;
    Alert.alert('챌린지 탈퇴', '정말 챌린지에서 탈퇴하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴하기',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveChallenge(id!);
            router.back();
          } catch (err) {
            Alert.alert('탈퇴 실패', (err as Error)?.message || '챌린지 탈퇴에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const weeklyProgressItems = useMemo<WeeklyProgressItem[]>(() => {
    if (isTestChallenge) return TEST_WEEKLY_PROGRESS;

    return [{
      id: `${detail.challengeId}-me`,
      name: '나',
      subtitle: '내 달성 현황',
      completedDates: certifiedDates,
      isMe: true,
    }];
  }, [certifiedDates, detail.challengeId, isTestChallenge]);

  if (isLoading && !isTestChallenge) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error && !isTestChallenge) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
          style={styles.headerBtn}
        >
          <Ionicons name="chevron-back" size={spacing.xl} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>성경 챌린지</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
          style={styles.headerBtn}
        >
          <Ionicons name="ellipsis-horizontal" size={spacing.xl} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, spacing.xxl) }}
      >
        {/* 챌린지 제목 + 날짜 */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{detail.name}</Text>
          <Text style={styles.dateText}>
            {formatShortDate(detail.startDate)} ~ {formatShortDate(detail.endDate)}
          </Text>
        </View>

        {/* 태그 행 */}
        <View style={styles.tagSection}>
          <TagChip label="성경 챌린지" />
          <TagChip label={`${detail.participantCount}명 참여중`} />
          {detail.isCreator && <TagChip label="내가 만든 챌린지" />}
        </View>

        {/* 읽을 범위 카드 */}
        {bibleRange ? (
          <View style={styles.section}>
            <View style={styles.rangeCard}>
              <View style={styles.rangeIconWrapper}>
                <Ionicons name="book" size={22} color={colors.white} />
              </View>
              <View style={styles.rangeTextCol}>
                <Text style={styles.rangeLabel}>읽을 범위</Text>
                <Text style={styles.rangeValue}>{bibleRange}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* 챌린지 인증 */}
        <Text style={styles.sectionTitle}>챌린지 인증</Text>

        <View style={styles.section}>
          <ChallengeCalendar certifiedDates={certifiedDates} />
        </View>

        {canInteract ? (
          <>
            {weeklyProgressItems.map(item => (
              <View key={item.id} style={styles.section}>
                <WeeklyProgressCard item={item} />
              </View>
            ))}
            {weeklyProgressItems.length === 0 ? (
              <View style={styles.section}>
                <View style={styles.feedPlaceholder}>
                  <Text style={styles.placeholderText}>아직 달성 현황이 없습니다</Text>
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.section}>
            <View style={styles.feedPlaceholder}>
              <Text style={styles.placeholderText}>참여 후 달성 현황을 볼 수 있습니다</Text>
            </View>
          </View>
        )}

        {/* 추천 챌린지 */}
        <Text style={styles.sectionTitle}>추천 챌린지</Text>
        {recommendedItems.length > 0 ? (
          recommendedItems.map(item => (
            <View key={item.challengeId} style={styles.section}>
              <ChallengeListCard
                item={item}
                onPress={() => router.push(
                  item.type === 'FAITH'
                    ? `/challenge/faith?id=${item.challengeId}`
                    : `/challenge/bible?id=${item.challengeId}`
                )}
              />
            </View>
          ))
        ) : (
          <View style={styles.section}>
            <View style={styles.feedPlaceholder}>
              <Text style={styles.placeholderText}>추천 챌린지가 없습니다</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 하단 참여하기 바 */}
      {!canInteract && canJoin ? (
        <View style={styles.bottomBar}>
          <View style={{ paddingTop: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md), paddingHorizontal: spacing.md }}>
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={handleJoin}
              activeOpacity={0.8}
              disabled={joinLoading}
            >
              <Text style={styles.joinBtnText}>{joinLoading ? '참여 중...' : '챌린지 참여하기'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* 옵션 바텀시트 */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            {canManage ? (
              <>
                <SheetOption
                  label="챌린지 수정하기"
                  onPress={() => { setMenuVisible(false); router.push('/challenge/edit'); }}
                />
                <SheetOption label="챌린지 공유하기" onPress={() => setMenuVisible(false)} />
                <SheetOption label="챌린지 종료하기" onPress={() => setMenuVisible(false)} destructive />
              </>
            ) : canInteract ? (
              <>
                <SheetOption label="챌린지 공유하기" onPress={() => setMenuVisible(false)} />
                <SheetOption
                  label="챌린지 탈퇴하기"
                  onPress={() => { setMenuVisible(false); handleLeave(); }}
                  destructive
                />
              </>
            ) : (
              <SheetOption label="챌린지 공유하기" onPress={() => setMenuVisible(false)} />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── 서브 컴포넌트 ──────────────────────────────────────────────────────────────

function TagChip({ label }: { label: string }) {
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.text}>{label}</Text>
    </View>
  );
}

function SheetOption({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={sheetStyles.option}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[sheetStyles.optionText, destructive && sheetStyles.optionTextDestructive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function WeeklyProgressCard({ item }: { item: WeeklyProgressItem }) {
  const weekDates = useMemo(() => buildWeekDates(new Date()), []);
  const completed = useMemo(() => new Set(item.completedDates), [item.completedDates]);
  const today = toDateString(new Date());

  return (
    <View style={styles.weeklyCard}>
      <View style={styles.progressHeader}>
        <View style={[styles.progressAvatar, item.isMe && styles.progressAvatarMe]}>
          {item.isMe ? (
            <Ionicons name="person" size={spacing.md} color={colors.white} />
          ) : (
            <Text style={styles.progressAvatarText}>{item.name.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.progressMeta}>
          <Text style={styles.progressName}>{item.name}</Text>
          <Text style={styles.progressSubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.secondary} />
      </View>

      <View style={styles.weekStatusGrid}>
        {weekDates.map(date => {
          const isCompleted = completed.has(date.dateString);
          const isToday = date.dateString === today;

          return (
            <View key={date.dateString} style={styles.weekStatusCell}>
              <Text style={styles.weekStatusLabel}>{date.week}</Text>
              <View
                style={[
                  styles.weekStatusCircle,
                  isCompleted && styles.weekStatusCircleCompleted,
                  isToday && !isCompleted && styles.weekStatusCircleToday,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={spacing.md} color={colors.white} />
                ) : (
                  <Text style={[styles.weekStatusDay, isToday && styles.weekStatusDayToday]}>
                    {date.day}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── 스타일 ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  loader: {
    flex: 1,
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerBtn: {
    width: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  scroll: { flex: 1 },
  infoSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  dateText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  tagSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.smd,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  // 읽을 범위 카드
  rangeCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: shadow.color,
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
  },
  rangeIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeTextCol: {
    flex: 1,
    gap: 2,
  },
  rangeLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  rangeValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },

  // 참여자별 주간 달성 현황
  weeklyCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    paddingBottom: spacing.md,
    shadowColor: shadow.color,
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  progressAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressAvatarMe: {
    backgroundColor: colors.primary,
  },
  progressAvatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  progressMeta: {
    flex: 1,
  },
  progressName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  progressSubtitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  weekStatusGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  weekStatusCell: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.nano,
  },
  weekStatusLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  weekStatusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekStatusCircleCompleted: {
    backgroundColor: colors.primary,
  },
  weekStatusCircleToday: {
    backgroundColor: TODAY_COLOR,
  },
  weekStatusDay: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  weekStatusDayToday: {
    color: colors.white,
  },

  feedPlaceholder: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: shadow.color,
    shadowOffset: shadow.card.offset,
    shadowOpacity: shadow.card.opacity,
    shadowRadius: shadow.card.radius,
    elevation: shadow.card.elevation,
  },
  placeholderText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  bottomBar: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  joinBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.smd,
    alignItems: 'center' as const,
  },
  joinBtnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.default,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.md,
  },
});

const chipStyles = StyleSheet.create({
  chip: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
  },
});

const sheetStyles = StyleSheet.create({
  option: {
    padding: spacing.md,
  },
  optionText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
    lineHeight: 26,
  },
  optionTextDestructive: {
    color: colors.reaction.red,
  },
});
