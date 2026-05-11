import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── noteType → 한글 라벨 ────────────────────────────────────────────────────

function getNoteLabel(noteType: string | undefined) {
  if (noteType === 'PRAYER') return '기도노트';
  if (noteType === 'WORD') return '말씀노트';
  return '감사노트';
}

// ─── 공개 옵션 ────────────────────────────────────────────────────────────────

type PublishOption = 'ALL' | 'GROUP' | 'PRIVATE';

const PUBLISH_OPTIONS: {
  key: PublishOption;
  icon: 'earth-outline' | 'people-outline' | 'lock-closed-outline';
  label: string;
  description: string;
}[] = [
  { key: 'ALL', icon: 'earth-outline', label: '전체 공개', description: '모든 그룹원이 볼 수 있어요' },
  { key: 'GROUP', icon: 'people-outline', label: '그룹만 공개', description: '나의 그룹원만 볼 수 있어요' },
  { key: 'PRIVATE', icon: 'lock-closed-outline', label: '비공개', description: '나만 볼 수 있어요' },
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
              <Text style={[ms.btnText, { color: colors.text.primary }]}>{cancelLabel}</Text>
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
  overlay: { flex: 1, backgroundColor: colors.overlay.default, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  card: { width: '100%', backgroundColor: colors.background.elevated, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.sm },
  title: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'center' },
  desc: { fontSize: fontSize.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: colors.border },
  btnConfirm: { backgroundColor: colors.primary },
  btnDanger: { backgroundColor: colors.reaction.red },
  btnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PublishScreen() {
  const router = useRouter();
  const { noteType } = useLocalSearchParams<{ noteType?: string }>();
  const noteLabel = getNoteLabel(noteType);

  const [selected, setSelected] = useState<PublishOption>('ALL');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const handleConfirmComplete = () => {
    setShowCompleteModal(false);
    router.replace(`/faith-note/complete?noteType=${noteType ?? 'THANKS'}`);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.headerRight}>노트 작성하기</Text>
      </View>

      {/* 콘텐츠 */}
      <View style={s.content}>
        <Text style={s.question}>{noteLabel}를 공개하시겠어요?</Text>

        <View style={s.optionList}>
          {PUBLISH_OPTIONS.map((opt) => {
            const isSel = selected === opt.key;
            return (
              <TouchableOpacity key={opt.key} style={[s.optionRow, isSel && s.optionRowSelected]} onPress={() => setSelected(opt.key)} activeOpacity={0.7}>
                <View style={[s.iconBox, isSel && s.iconBoxSelected]}>
                  <Ionicons name={opt.icon} size={20} color={isSel ? colors.primary : colors.text.secondary} />
                </View>
                <View style={s.textCol}>
                  <Text style={[s.optLabel, isSel && s.optLabelSelected]}>{opt.label}</Text>
                  <Text style={s.optDesc}>{opt.description}</Text>
                </View>
                <View style={[s.radio, isSel && s.radioSelected]}>
                  {isSel && <View style={s.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={s.footer}>
        <TouchableOpacity style={[s.footerBtn, s.footerBtnCancel]} onPress={() => setShowQuitModal(true)} activeOpacity={0.7}>
          <Text style={[s.footerBtnText, { color: colors.text.primary }]}>이전으로</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.footerBtn, s.footerBtnPublish]} onPress={() => setShowCompleteModal(true)} activeOpacity={0.8}>
          <Text style={[s.footerBtnText, { color: '#fff' }]}>완료하기</Text>
        </TouchableOpacity>
      </View>

      {/* 완료 확인 모달 */}
      <ConfirmModal
        visible={showCompleteModal}
        title={`${noteLabel} 작성을 완료하시겠어요?`}
        desc={`작성한 ${noteLabel} 피드에 게재됩니다.\n게시 후에도 수정하거나 나눌 수 있어요.`}
        cancelLabel="다시 작성하기"
        confirmLabel="완료하기"
        onCancel={() => setShowCompleteModal(false)}
        onConfirm={handleConfirmComplete}
      />

      {/* 그만두기 모달 */}
      <ConfirmModal
        visible={showQuitModal}
        title="노트 작성을 그만두시겠어요?"
        desc="작성 중인 내용은 저장되지 않아요."
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
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.background.elevated },
  headerRight: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text.accent },
  content: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.xl, gap: spacing.lg },
  question: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  optionList: { gap: spacing.sm },
  optionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.elevated, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, gap: 12, borderWidth: 1.5, borderColor: 'transparent' },
  optionRowSelected: { borderColor: colors.primary },
  iconBox: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconBoxSelected: { backgroundColor: colors.primaryLight },
  textCol: { flex: 1, gap: 2 },
  optLabel: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  optLabelSelected: { color: colors.primary },
  optDesc: { fontSize: fontSize.sm, color: colors.text.secondary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  footer: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.sm },
  footerBtn: { flex: 1, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  footerBtnCancel: { backgroundColor: colors.border },
  footerBtnPublish: { backgroundColor: colors.primary },
  footerBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
