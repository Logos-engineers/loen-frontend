import CheckCircleOff from '@/assets/icons/CheckCircle.svg';
import CheckCircleOn from '@/assets/icons/check-circle-on.svg';
import IconAll from '@/assets/icons/icon-public-all.svg';
import IconLink from '@/assets/icons/icon-public-link.svg';
import IconOikos from '@/assets/icons/icon-public-oikos.svg';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { apiClient } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── noteType → 한글 라벨 ────────────────────────────────────────────────────

function getNoteLabel(noteType: string | undefined) {
  if (noteType === 'PRAYER') return '기도노트';
  if (noteType === 'WORD') return '말씀노트';
  return '감사노트';
}

// ─── 공개 옵션 ────────────────────────────────────────────────────────────────

type PublishOption = 'ALL' | 'OIKOS' | 'LINK';

function getVisibilityPayload(selected: PublishOption) {
  return {
    isHidden: selected === 'LINK',
    isOpenToOikos: selected === 'OIKOS',
  };
}

function getVisibilityEndpoint(noteType: string | undefined, noteId: string) {
  if (noteType === 'PRAYER') return `/notes/prayers/${noteId}/visibility`;
  if (noteType === 'WORD') return `/bible/notes/${noteId}/visibility`;
  return `/notes/thanks/${noteId}/visibility`;
}

// 수정 진입 시 현재 공개 범위를 프리셀렉트하기 위한 상세 조회 엔드포인트.
function getDetailEndpoint(noteType: string | undefined, noteId: string) {
  if (noteType === 'PRAYER') return `/notes/prayers/${noteId}`;
  if (noteType === 'WORD') return `/bible/notes/${noteId}`;
  return `/notes/thanks/${noteId}`;
}

// 서버 노출범위(isHidden/isOpenToOikos) → 화면 옵션.
function scopeFromVisibility(v: { isHidden?: boolean; isOpenToOikos?: boolean }): PublishOption {
  if (v.isHidden) return 'LINK';
  if (v.isOpenToOikos) return 'OIKOS';
  return 'ALL';
}

const PUBLISH_OPTIONS: {
  key: PublishOption;
  Icon: React.ComponentType<{ width: number; height: number }>;
  label: string;
  description: string;
}[] = [
  {
    key: 'ALL',
    Icon: IconAll,
    label: '전체 공개',
    description: '로고스 청년 모두에게 공개되며, 누구나 볼 수 있어요',
  },
  {
    key: 'OIKOS',
    Icon: IconOikos,
    label: '오이코스 공개',
    description: '오이코스원에게만 공개되며, 오이코스원만 볼 수 있어요',
  },
  {
    key: 'LINK',
    Icon: IconLink,
    label: '링크로 공개',
    description: '작성 완료 후 복사된 링크를 전달받은 사람만 볼 수 있어요',
  },
];

// ─── 공통 확인 모달 ───────────────────────────────────────────────────────────

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  desc: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDanger?: boolean;
}

function ConfirmModal({ visible, title, desc, cancelLabel, confirmLabel, onCancel, onConfirm, confirmDanger }: ConfirmModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={ms.overlay}>
        <View style={ms.card}>
          <Text style={ms.title}>{title}</Text>
          <Text style={ms.desc}>{desc}</Text>
          <View style={ms.row}>
            <TouchableOpacity style={[ms.btn, ms.btnCancel]} onPress={onCancel} activeOpacity={0.7}>
              <Text style={[ms.btnText, { color: colors.primary }]}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ms.btn, confirmDanger ? ms.btnDanger : ms.btnConfirm]} onPress={onConfirm} activeOpacity={0.7}>
              <Text style={[ms.btnText, { color: '#fff' }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay.heavy, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  card: {
    width: '100%',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  // Figma: Title1_20_B, 좌측 정렬
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'left' },
  // Figma: Title3_16_SB, 회색, 좌측 정렬
  desc: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.secondary, textAlign: 'left', lineHeight: 26 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btn: { flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: colors.primaryLight },
  btnConfirm: { backgroundColor: colors.primary },
  btnDanger: { backgroundColor: colors.reaction.red },
  btnText: { fontSize: fontSize.heading, fontWeight: fontWeight.semibold },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PublishScreen() {
  const router = useRouter();
  const { noteType, noteId, isEdit } = useLocalSearchParams<{ noteType?: string; noteId?: string; isEdit?: string }>();
  const editing = isEdit === 'true';
  const noteLabel = getNoteLabel(noteType);

  const [selected, setSelected] = useState<PublishOption>('ALL');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  // 수정 진입: 현재 공개 범위를 불러와 미리 선택(안 하면 '전체 공개'로 떠서 실수로 공개될 위험).
  useEffect(() => {
    if (!noteId || !editing) return;
    let cancelled = false;
    (async () => {
      try {
        const detail = await apiClient<{ isHidden?: boolean; isOpenToOikos?: boolean }>(
          getDetailEndpoint(noteType, noteId),
        );
        if (!cancelled) setSelected(scopeFromVisibility(detail));
      } catch {
        /* 실패 시 기본값(ALL) 유지 */
      }
    })();
    return () => { cancelled = true; };
  }, [noteId, editing, noteType]);

  const handleConfirmComplete = async () => {
    setShowCompleteModal(false);
    if (noteId) {
      try {
        const visibility = getVisibilityPayload(selected);
        await apiClient(getVisibilityEndpoint(noteType, noteId), {
          method: 'PATCH',
          body: JSON.stringify(
            noteType === 'THANKS' || !noteType
              ? { ...visibility, isFixed: false }
              : visibility,
          ),
        });
      } catch {
        Alert.alert('오류', '공개 범위 설정에 실패했습니다.');
        return;
      }

      // 링크로 공개: 노트 딥링크를 공유 시트로 전달 (복사/카톡 등). 취소/실패해도 진행.
      if (selected === 'LINK') {
        try {
          const url = Linking.createURL(`/faith-note/${noteId}`, {
            queryParams: { tab: noteType ?? 'THANKS' },
          });
          await Share.share({ message: `로엔에서 공유한 노트를 확인해보세요\n${url}` });
        } catch {
          /* 공유 취소/실패는 무시 */
        }
      }
    }
    // 수정은 '작성 완료' 축하 화면 대신 목록으로 복귀(목록은 포커스 시 재조회 → 변경 반영).
    router.replace(editing ? '/faith-note' : `/faith-note/complete?noteType=${noteType ?? 'THANKS'}`);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* 콘텐츠 */}
      <View style={s.content}>
        <Text style={s.question}>{editing ? `${noteLabel} 공개 범위를 변경할까요?` : `${noteLabel}를 공개하시겠어요?`}</Text>

        <View style={s.optionList}>
          {PUBLISH_OPTIONS.map((opt) => {
            const isSel = selected === opt.key;
            const Icon = opt.Icon;
            const Check = isSel ? CheckCircleOn : CheckCircleOff;
            return (
              <TouchableOpacity
                key={opt.key}
                style={s.card}
                onPress={() => setSelected(opt.key)}
                activeOpacity={0.7}
              >
                <Icon width={32} height={32} />
                <View style={s.cardText}>
                  <Text style={s.cardTitle}>{opt.label}</Text>
                  <Text style={s.cardDesc} numberOfLines={1}>
                    {opt.description}
                  </Text>
                </View>
                <Check width={24} height={24} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={s.footer}>
        <TouchableOpacity style={[s.footerBtn, s.footerBtnPrev]} onPress={() => setShowQuitModal(true)} activeOpacity={0.7}>
          <Text style={[s.footerBtnText, s.footerBtnTextPrev]}>이전으로</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.footerBtn, s.footerBtnComplete]} onPress={() => setShowCompleteModal(true)} activeOpacity={0.8}>
          <Text style={[s.footerBtnText, s.footerBtnTextComplete]}>{editing ? '변경하기' : '완료하기'}</Text>
        </TouchableOpacity>
      </View>

      {/* 완료 확인 모달 */}
      <ConfirmModal
        visible={showCompleteModal}
        title={editing ? '공개 범위를 변경하시겠어요?' : `${noteLabel} 작성을 완료하시겠어요?`}
        desc={
          editing
            ? '선택한 범위로 공개 설정이 바뀌어요.\n링크 공개를 고르면 공유 링크를 다시 받을 수 있어요.'
            : `작성한 ${noteLabel}는 피드에 게시돼요.\n게시 후에도 수정하거나 삭제할 수 있어요.`
        }
        cancelLabel={editing ? '취소' : '다시 작성하기'}
        confirmLabel={editing ? '변경하기' : '완료하기'}
        onCancel={() => setShowCompleteModal(false)}
        onConfirm={handleConfirmComplete}
      />

      {/* 그만두기 모달 */}
      <ConfirmModal
        visible={showQuitModal}
        title={editing ? '공개 범위 변경을 그만둘까요?' : '노트 작성을 그만두시겠어요?'}
        desc={editing ? '변경한 공개 범위는 저장되지 않아요.' : '작성 중인 내용은 저장되지 않아요.'}
        cancelLabel="계속하기"
        confirmLabel="그만두기"
        onCancel={() => setShowQuitModal(false)}
        onConfirm={() => { setShowQuitModal(false); router.navigate('/faith-note'); }}
        confirmDanger
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  content: { flex: 1, paddingHorizontal: spacing.md },
  // Figma: Heading2_24_B
  question: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 34,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  optionList: { gap: spacing.md, paddingTop: spacing.sm },
  // Figma: 흰 카드, rounded 16, p16, 아이콘·텍스트·체크써클 가로 배치
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  cardDesc: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.secondary },

  // Figma: CTA — 이전으로(primary 20%) + 완료하기(primary)
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 14,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnPrev: { backgroundColor: colors.primaryLight },
  footerBtnComplete: { backgroundColor: colors.primary },
  footerBtnText: { fontSize: fontSize.heading, fontWeight: fontWeight.semibold },
  footerBtnTextPrev: { color: colors.primary },
  footerBtnTextComplete: { color: colors.white },
});
