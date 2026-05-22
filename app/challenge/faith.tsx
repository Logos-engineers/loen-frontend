import { ChallengeCalendar } from '@/components/challenge/ChallengeCalendar';
import { MyCertificationCard, OtherCertificationCard } from '@/components/challenge/CertificationFeedCard';
import { ChallengeGoalCard } from '@/components/challenge/ChallengeGoalCard';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import type { CertificationFeedResponse, ChallengeDetail } from '@/hooks/useChallenge';
import { useChallengeDetail, useChallengeCertifications } from '@/hooks/useChallenge';
import { apiClient } from '@/utils/apiClient';
import { formatShortDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── 테스트 데이터 ──────────────────────────────────────────────────────────────

const TEST_DETAIL: ChallengeDetail = {
  challengeId: 'test-faith-1',
  type: 'FAITH',
  name: '매일 감사 고백하기',
  goal: '하루 한 가지 감사 기록하기',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  dDay: 225,
  verificationMethod: 'MEDITATION',
  visibility: 'PUBLIC',
  participantCount: 8,
  isJoined: true,
  isCreator: true,
  isPinned: false,
  notificationEnabled: true,
  myProgress: {
    completedDays: 4,
    lastCertifiedDate: '2026-05-20',
    weeklyCalendar: {
      '2026-05-17': true,
      '2026-05-18': true,
      '2026-05-20': true,
    },
    allCertifiedDates: [
      '2026-05-09', '2026-05-13', '2026-05-17', '2026-05-18', '2026-05-20',
    ],
  },
};

const TEST_FEED: CertificationFeedResponse = {
  myCertification: {
    certId: 'test-faith-cert-1',
    date: '2026-05-20',
    meditationText: '오늘 감사한 일을 돌아보며 하나님이 주신 하루를 기록했습니다.',
    photoUrl: null,
    isPrivate: false,
    likeCount: 4,
    isLikedByMe: false,
    commentCount: 1,
  },
  otherCertifications: [
    {
      certId: 'test-faith-cert-2',
      writerName: '박서준',
      writerProfileImage: null,
      date: '2026-05-19',
      meditationText: '작은 감사도 놓치지 않으려고 적어봤습니다.',
      photoUrl: null,
      likeCount: 6,
      isLikedByMe: true,
      commentCount: 2,
    },
    {
      certId: 'test-faith-cert-3',
      writerName: '최하은',
      writerProfileImage: null,
      date: '2026-05-18',
      meditationText: '오늘도 감사로 하루를 마무리했습니다.',
      photoUrl: null,
      likeCount: 2,
      isLikedByMe: false,
      commentCount: 0,
    },
  ],
};

export default function FaithChallengeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isTestChallenge = !id || id.startsWith('test-');
  const challengeId = isTestChallenge ? null : id;
  const { detail: apiDetail, isLoading, error } = useChallengeDetail(challengeId);
  const { feed: apiFeed, refetch: refetchFeed } = useChallengeCertifications(challengeId);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [certText, setCertText] = useState('');
  const [certSubmitting, setCertSubmitting] = useState(false);

  const detail = isTestChallenge ? TEST_DETAIL : apiDetail;
  const feed = isTestChallenge ? TEST_FEED : apiFeed;
  const certifiedDates = detail?.myProgress?.allCertifiedDates ?? [];

  const handleCertSubmit = async () => {
    if (!certText.trim() || certSubmitting) return;
    setCertSubmitting(true);
    try {
      await apiClient(`/challenges/${id}/certifications`, {
        method: 'POST',
        body: JSON.stringify({ meditationText: certText, isPrivate: false }),
      });
      setCertText('');
      setIsCertOpen(false);
      if (!isTestChallenge) refetchFeed();
    } catch {
      // silent
    } finally {
      setCertSubmitting(false);
    }
  };

  if (isLoading && !isTestChallenge) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  if ((error && !isTestChallenge) || !detail) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error ?? '챌린지 정보를 불러오지 못했습니다'}</Text>
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* 챌린지 제목 + 날짜 — layout_YGLWZD: padding 16 16 8 */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{detail.name}</Text>
          <Text style={styles.dateText}>
            {formatShortDate(detail.startDate)} ~ {formatShortDate(detail.endDate)}
          </Text>
        </View>

        {/* 태그 행 — layout_UGT135: padding 8 16, gap 10 */}
        <View style={styles.tagSection}>
          <TagChip label="신앙 챌린지" />
          <TagChip label={`${detail.participantCount}명 참여중`} />
          {detail.isCreator && <TagChip label="내가 만든 챌린지" />}
        </View>

        {/* 챌린지 목표 — layout_WGJNX2: padding 8 16 */}
        <View style={styles.section}>
          <ChallengeGoalCard goal={detail.goal} />
        </View>

        {/* 섹션 타이틀 — layout_YGLWZD: padding 16 16 8, Title1_20_B */}
        <Text style={styles.sectionTitle}>챌린지 인증</Text>

        {/* 캘린더 — layout_NW1AG7: padding 8 16 */}
        <View style={styles.section}>
          <ChallengeCalendar certifiedDates={certifiedDates} />
        </View>

        {/* 인증 피드 — layout_1QJZ47: padding 8 16 */}
        {feed?.myCertification ? (
          <View style={styles.section}>
            <MyCertificationCard item={feed.myCertification} />
          </View>
        ) : null}
        {(feed?.otherCertifications ?? []).map(item => (
          <View key={item.certId} style={styles.section}>
            <OtherCertificationCard item={item} />
          </View>
        ))}
        {!feed?.myCertification && (feed?.otherCertifications ?? []).length === 0 ? (
          <View style={styles.section}>
            <View style={styles.feedPlaceholder}>
              <Text style={styles.placeholderText}>아직 인증이 없습니다</Text>
            </View>
          </View>
        ) : null}

        {/* 추천 챌린지 섹션 */}
        <Text style={styles.sectionTitle}>추천 챌린지</Text>
        <View style={styles.section}>
          <View style={styles.feedPlaceholder}>
            <Text style={styles.placeholderText}>추천 챌린지 준비 중입니다</Text>
          </View>
        </View>
      </ScrollView>

      {/* 하단 인증 바 — Figma layout_G34ZD3, layout_48FMB9 */}
      <View style={styles.bottomBar}>
        <View style={[styles.bottomBarInner, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.bottomAvatar}>
            <Ionicons name="person" size={16} color={colors.white} />
          </View>
          <TouchableOpacity style={styles.commentInput} activeOpacity={0.7}>
            <Text style={styles.commentPlaceholder}>댓글을 입력해주세요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.certBtn}
            onPress={() => setIsCertOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.certBtnText}>인증하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 인증하기 바텀시트 */}
      <Modal
        visible={isCertOpen}
        transparent
        animationType="slide"
        onRequestClose={() => { setCertText(''); setIsCertOpen(false); }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kvContainer}
        >
          <TouchableOpacity
            style={styles.kvOverlay}
            activeOpacity={1}
            onPress={() => { setCertText(''); setIsCertOpen(false); }}
          />
          <View style={[styles.certSheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <View style={styles.certHandleWrapper}>
              <View style={styles.certHandle} />
            </View>
            <Text style={styles.certSheetTitle}>인증하기</Text>
            <View style={styles.certInputWrapper}>
              <TextInput
                style={styles.certTextInput}
                placeholder="한 줄 묵상을 입력해주세요"
                placeholderTextColor={colors.text.secondary}
                value={certText}
                onChangeText={setCertText}
                multiline
                maxLength={200}
                autoFocus
                textAlignVertical="top"
              />
            </View>
            <View style={styles.certSheetFooter}>
              <TouchableOpacity
                style={styles.certCancelBtn}
                onPress={() => { setCertText(''); setIsCertOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={styles.certCancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.certSubmitBtn, !certText.trim() && styles.certSubmitBtnDisabled]}
                onPress={handleCertSubmit}
                disabled={!certText.trim() || certSubmitting}
                activeOpacity={0.8}
              >
                <Text style={styles.certSubmitBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
            <SheetOption
              label="챌린지 수정하기"
              onPress={() => {
                setMenuVisible(false);
                router.push('/challenge/edit');
              }}
            />
            <SheetOption label="챌린지 공유하기" onPress={() => setMenuVisible(false)} />
            <SheetOption label="챌린지 종료하기" onPress={() => setMenuVisible(false)} destructive />
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

  // layout_J42PIH 대응 — height 48, row, space-between
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

  scroll: { flex: 1 },

  // 챌린지 제목 + 날짜 — layout_YGLWZD: padding 16 16 8
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

  // 태그 행 — layout_UGT135: padding 8 16, gap 10
  tagSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.smd,
  },

  // 섹션 래퍼 — layout_NW1AG7 / layout_WGJNX2: padding 8 16
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // 섹션 타이틀 — layout_YGLWZD: padding 16 16 8, Title1_20_B
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  // 피드/추천 placeholder
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

  // 오버레이 & 바텀시트
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

  // ─── 하단 인증 바 (Figma layout_G34ZD3 / layout_48FMB9) ──────────
  bottomBar: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingLeft: spacing.smd,
    paddingRight: spacing.md,
    gap: spacing.sm,
  },
  bottomAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma: layout_6AFTYI — padding 8 16, trans/gray/a5 bg, radius 12
  commentInput: {
    flex: 1,
    backgroundColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    minHeight: 36,
  },
  commentPlaceholder: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  // Figma: layout_I02N6M — padding 10 16, trans/primary/a5 bg, radius 12
  certBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
  },
  certBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },

  // ─── 인증하기 바텀시트 ────────────────────────────────────────────
  kvContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  kvOverlay: {
    flex: 1,
    backgroundColor: colors.overlay.default,
  },
  certSheet: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.smmd,
    paddingHorizontal: spacing.xl,
  },
  certHandleWrapper: {
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  certHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  certSheetTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    paddingBottom: spacing.md,
  },
  certInputWrapper: {
    backgroundColor: colors.border,
    borderRadius: radius.md,
    minHeight: 100,
    marginBottom: spacing.xl,
  },
  certTextInput: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    padding: spacing.md,
    minHeight: 100,
  },
  certSheetFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  certCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  certCancelBtnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  certSubmitBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  certSubmitBtnDisabled: {
    backgroundColor: 'rgba(101,97,255,0.3)',
  },
  certSubmitBtnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
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
