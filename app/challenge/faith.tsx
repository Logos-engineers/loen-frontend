import { ChallengeCalendar } from '@/components/challenge/ChallengeCalendar';
import { ChallengeListCard } from '@/components/challenge/ChallengeListCard';
import { MyCertificationCard, OtherCertificationCard } from '@/components/challenge/CertificationFeedCard';
import { ChallengeGoalCard } from '@/components/challenge/ChallengeGoalCard';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/tokens';
import type { CertificationFeedResponse, ChallengeDetail } from '@/hooks/useChallenge';
import { useChallengeDetail, useChallengeCertifications, useRecommendedChallenges, joinChallenge, leaveChallenge } from '@/hooks/useChallenge';
import { apiClient, apiClientFormData } from '@/utils/apiClient';
import { formatShortDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { SvgXml } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const CAMERA_XML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.7 3.87012C15.1541 3.86997 15.5915 4.04148 15.9245 4.35026C16.2575 4.65905 16.4614 5.08228 16.4955 5.53512L16.5 5.67012C16.5 5.89056 16.581 6.10332 16.7274 6.26805C16.8739 6.43278 17.0758 6.53803 17.2947 6.56382L17.4 6.57012H18.3C18.9887 6.57008 19.6514 6.83321 20.1524 7.30567C20.6535 7.77814 20.9551 8.42421 20.9955 9.11172L21 9.27012V17.3701C21 18.0588 20.7369 18.7215 20.2644 19.2226C19.792 19.7236 19.1459 20.0252 18.4584 20.0656L18.3 20.0701H5.7C5.01131 20.0702 4.34864 19.807 3.84757 19.3346C3.34649 18.8621 3.0449 18.216 3.0045 17.5285L3 17.3701V9.27012C2.99996 8.58143 3.26309 7.91875 3.73556 7.41768C4.20802 6.91661 4.8541 6.61502 5.5416 6.57462L5.7 6.57012H6.6C6.83869 6.57012 7.06761 6.4753 7.2364 6.30651C7.40518 6.13773 7.5 5.90881 7.5 5.67012C7.49986 5.216 7.67137 4.77861 7.98015 4.44562C8.28893 4.11264 8.71216 3.90868 9.165 3.87462L9.3 3.87012H14.7ZM12 10.1701C11.3309 10.1701 10.6857 10.4184 10.1893 10.8671C9.69296 11.3157 9.38085 11.9327 9.3135 12.5983L9.3036 12.7351L9.3 12.8701L9.3036 13.0051C9.33001 13.5327 9.51062 14.041 9.82305 14.467C10.1355 14.8929 10.566 15.2179 11.0613 15.4016C11.5566 15.5853 12.0949 15.6197 12.6096 15.5005C13.1242 15.3812 13.5926 15.1137 13.9566 14.7309C14.3207 14.3481 14.5645 13.8669 14.6578 13.347C14.7511 12.827 14.6898 12.2911 14.4815 11.8056C14.2732 11.3201 13.9271 10.9064 13.486 10.6157C13.0449 10.325 12.5283 10.1701 12 10.1701Z" fill="rgba(13,28,45,0.8)"/></svg>`;

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
  const { detail: apiDetail, isLoading, error, refetch: refetchDetail } = useChallengeDetail(challengeId);
  const { feed: apiFeed, refetch: refetchFeed } = useChallengeCertifications(challengeId);
  const { items: recommendedItems } = useRecommendedChallenges();
  const [menuVisible, setMenuVisible] = useState(false);
  const [certText, setCertText] = useState('');
  const [certSubmitting, setCertSubmitting] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  const detail = isTestChallenge ? TEST_DETAIL : apiDetail;
  const feed = isTestChallenge ? TEST_FEED : apiFeed;
  const certifiedDates = detail?.myProgress?.allCertifiedDates ?? [];
  const isEnded = detail ? new Date(detail.endDate) < new Date() : false;
  const canInteract = !!detail?.isJoined;
  const canManage = !!detail?.isCreator;
  const canJoin = detail ? (!detail.isJoined && !isEnded) : false;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('사진 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleJoin = async () => {
    if (joinLoading || isTestChallenge) return;
    setJoinLoading(true);
    try {
      await joinChallenge(id!);
      refetchDetail();
      showToast('챌린지에 참여했습니다!');
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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleCertSubmit = async () => {
    if (certSubmitting) return;
    if (!certText.trim() && !photoUri) return;
    setCertSubmitting(true);
    try {
      if (photoUri) {
        const formData = new FormData();
        if (certText.trim()) formData.append('meditationText', certText.trim());
        formData.append('isPrivate', 'false');
        const filename = photoUri.split('/').pop() ?? 'photo.jpg';
        formData.append('photo', { uri: photoUri, name: filename, type: 'image/jpeg' } as any);
        // apiClientFormData: 401 시 토큰 자동 갱신·재시도 (raw fetch는 만료 시 그냥 실패했음)
        await apiClientFormData(`/challenges/${id}/certify`, formData);
      } else {
        await apiClient(`/challenges/${id}/certify`, {
          method: 'POST',
          body: JSON.stringify({ meditationText: certText.trim() || null, isPrivate: false }),
        });
      }
      setCertText('');
      setPhotoUri(null);
      if (!isTestChallenge) refetchFeed();
      showToast('인증이 완료되었습니다!');
    } catch (err) {
      console.error('[handleCertSubmit]', err);
      Alert.alert('인증 실패', (err as Error)?.message || '인증 등록에 실패했습니다.');
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
        {canInteract ? (
          <>
            {feed?.myCertification ? (
              <View style={styles.section}>
                <MyCertificationCard
                  item={feed.myCertification}
                  onDelete={() => { if (!isTestChallenge) refetchFeed(); }}
                  onEditDone={() => { if (!isTestChallenge) refetchFeed(); }}
                />
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
          </>
        ) : (
          <View style={styles.section}>
            <View style={styles.feedPlaceholder}>
              <Text style={styles.placeholderText}>참여 후 인증 피드를 볼 수 있습니다</Text>
            </View>
          </View>
        )}

        {/* 추천 챌린지 섹션 */}
        <Text style={styles.sectionTitle}>추천 챌린지</Text>
        {recommendedItems.length > 0 ? (
          recommendedItems.map(item => (
            <View key={item.challengeId} style={styles.section}>
              <ChallengeListCard
                item={item}
                onPress={() => router.push(`/challenge/faith?id=${item.challengeId}`)}
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

      {/* 하단 인증/참여 바 */}
      {canInteract ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.bottomBar}>
            <View style={[styles.bottomBarInner, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage} activeOpacity={0.7}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoThumb} />
                ) : (
                  <SvgXml xml={CAMERA_XML} width={24} height={24} />
                )}
                {photoUri && (
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => setPhotoUri(null)}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <Ionicons name="close-circle" size={16} color={colors.text.primary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              <TextInput
                style={styles.certInput}
                placeholder="댓글을 입력해주세요"
                placeholderTextColor={colors.text.secondary}
                value={certText}
                onChangeText={setCertText}
                returnKeyType="send"
                onSubmitEditing={handleCertSubmit}
              />
              <TouchableOpacity
                style={styles.certBtn}
                onPress={handleCertSubmit}
                activeOpacity={0.7}
                disabled={certSubmitting}
              >
                <Text style={styles.certBtnText}>인증하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : canJoin ? (
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

      {/* 인증 완료 토스트 */}
      {toastMsg && (
        <View style={[styles.toastContainer, { bottom: insets.bottom + 90 }]}>
          <View style={styles.toastContent}>
            <View style={styles.toastIcon}>
              <Ionicons name="checkmark" size={14} color={colors.white} />
            </View>
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        </View>
      )}

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
                  onPress={() => {
                    setMenuVisible(false);
                    router.push(`/challenge/edit?id=${detail.challengeId}&type=FAITH`);
                  }}
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
  // Figma: icon frame size=40, camera icon 24×24
  cameraBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoThumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  photoRemove: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.background.elevated,
    borderRadius: 8,
  },
  // Figma: layout_6AFTYI — padding 8 16, trans/gray/a5 bg, radius 12
  certInput: {
    flex: 1,
    backgroundColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    color: colors.text.primary,
    minHeight: 36,
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

  toastContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40,40,50,0.95)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 100,
  },
  toastIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  toastText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
