import { ChallengeCalendar } from '@/components/challenge/ChallengeCalendar';
import { MyCertificationCard, OtherCertificationCard } from '@/components/challenge/CertificationFeedCard';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import type { CertificationFeedResponse, ChallengeDetail } from '@/hooks/useChallenge';
import { useChallengeDetail, useChallengeCertifications } from '@/hooks/useChallenge';
import { formatShortDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── 테스트 데이터 ──────────────────────────────────────────────────────────────

const MOCK_DETAIL: ChallengeDetail = {
  challengeId: 'mock-bible-1',
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

const MOCK_FEED: CertificationFeedResponse = {
  myCertification: {
    certId: 'mock-cert-1',
    date: '2026-05-20',
    meditationText: '오늘은 출애굽기 1장부터 10장까지 읽었습니다. 말씀을 통해 큰 은혜를 받았습니다.',
    photoUrl: null,
    isPrivate: false,
    likeCount: 3,
    isLikedByMe: false,
    commentCount: 2,
  },
  otherCertifications: [
    {
      certId: 'mock-cert-2',
      writerName: '김민준',
      writerProfileImage: null,
      date: '2026-05-19',
      meditationText: '말씀을 통해 큰 은혜를 받았습니다.',
      photoUrl: null,
      likeCount: 5,
      isLikedByMe: true,
      commentCount: 1,
    },
    {
      certId: 'mock-cert-3',
      writerName: '이수진',
      writerProfileImage: null,
      date: '2026-05-18',
      meditationText: null,
      photoUrl: null,
      likeCount: 2,
      isLikedByMe: false,
      commentCount: 0,
    },
  ],
};

// ─── 메인 화면 ──────────────────────────────────────────────────────────────────

export default function BibleChallengeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { detail: apiDetail, isLoading, error } = useChallengeDetail(id ?? null);
  const { feed: apiFeed } = useChallengeCertifications(id ?? null);
  const [menuVisible, setMenuVisible] = useState(false);

  const detail = apiDetail ?? MOCK_DETAIL;
  const feed = apiFeed ?? MOCK_FEED;
  const certifiedDates = detail.myProgress?.allCertifiedDates ?? [];
  const bibleRange = detail.bibleBooks?.join(', ') ?? '';

  if (isLoading && id) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
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

        {feed.myCertification ? (
          <View style={styles.section}>
            <MyCertificationCard item={feed.myCertification} />
          </View>
        ) : null}
        {feed.otherCertifications.map(item => (
          <View key={item.certId} style={styles.section}>
            <OtherCertificationCard item={item} />
          </View>
        ))}
        {!feed.myCertification && feed.otherCertifications.length === 0 ? (
          <View style={styles.section}>
            <View style={styles.feedPlaceholder}>
              <Text style={styles.placeholderText}>아직 인증이 없습니다</Text>
            </View>
          </View>
        ) : null}

        {/* 추천 챌린지 */}
        <Text style={styles.sectionTitle}>추천 챌린지</Text>
        <View style={styles.section}>
          <View style={styles.feedPlaceholder}>
            <Text style={styles.placeholderText}>추천 챌린지 준비 중입니다</Text>
          </View>
        </View>
      </ScrollView>

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
            <View style={styles.sheetHandle} />
            <SheetOption label="챌린지 수정하기" onPress={() => setMenuVisible(false)} />
            <SheetOption label="챌린지 공유하기" onPress={() => setMenuVisible(false)} />
            <SheetOption label="챌린지 종료하기" onPress={() => setMenuVisible(false)} last />
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

function SheetOption({ label, onPress, last }: { label: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity
      style={[sheetStyles.option, last && sheetStyles.optionLast]}
      onPress={onPress}
    >
      <Text style={sheetStyles.optionText}>{label}</Text>
    </TouchableOpacity>
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
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.default,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.base,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: spacing.xxl + spacing.sm,
    height: spacing.xs,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing.smmd,
    marginBottom: spacing.md,
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
});
