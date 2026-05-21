import { ChallengeCalendar } from '@/components/challenge/ChallengeCalendar';
import { MyCertificationCard, OtherCertificationCard } from '@/components/challenge/CertificationFeedCard';
import { ChallengeGoalCard } from '@/components/challenge/ChallengeGoalCard';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
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

export default function FaithChallengeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { detail, isLoading, error } = useChallengeDetail(id ?? null);
  const { feed } = useChallengeCertifications(id ?? null);
  const [menuVisible, setMenuVisible] = useState(false);

  const certifiedDates = detail?.myProgress?.allCertifiedDates ?? [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !detail) {
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
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, spacing.xxl) }}
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
