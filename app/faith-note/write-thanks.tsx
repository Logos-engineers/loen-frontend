import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { apiClient } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── 색상 상수 (Figma: 라이트 테마) ──────────────────────────────────────────────
const SCREEN_BG = '#F2F4F7';                  // background/fill/elevated
const INPUT_BG = 'rgba(13,28,45,0.08)';       // 입력칸 배경
const NUMBER_BOX_BG = '#F2F4F7';              // 번호 배지 박스
const PLACEHOLDER_COLOR = 'rgba(13,28,45,0.3)';
const SUBMIT_DISABLED_BG = 'rgba(101,97,255,0.4)'; // primary 40% 불투명

// ─── 입력 항목 ────────────────────────────────────────────────────────────────
const DEFAULT_INPUT_COUNT = 5;
const THANK_PLACEHOLDER = '감사한 일을 적어보세요.';
const KOREAN_ORDINALS = ['첫번째', '두번째', '세번째', '네번째', '다섯번째', '여섯번째', '일곱번째', '여덟번째', '아홉번째', '열번째'];

const getInputLabel = (index: number) => {
  const ordinal = KOREAN_ORDINALS[index] ?? `${index + 1}번째`;
  return `${ordinal} 감사`;
};

interface CreatedThanksNote {
  id: string;
}

// ─── 그만두기 모달 ─────────────────────────────────────────────────────────────

interface QuitModalProps {
  visible: boolean;
  onContinue: () => void;
  onQuit: () => void;
}

function QuitConfirmModal({ visible, onContinue, onQuit }: QuitModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          <Text style={modalStyles.title}>노트 작성을 그만두시겠어요?</Text>
          <Text style={modalStyles.desc}>작성 중인 내용은 저장되지 않아요.</Text>
          <View style={modalStyles.buttonRow}>
            <TouchableOpacity
              style={[modalStyles.btn, modalStyles.btnCancel]}
              onPress={onContinue}
              activeOpacity={0.7}
            >
              <Text style={[modalStyles.btnText, modalStyles.btnTextCancel]}>계속하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.btn, modalStyles.btnQuit]}
              onPress={onQuit}
              activeOpacity={0.7}
            >
              <Text style={[modalStyles.btnText, modalStyles.btnTextQuit]}>그만두기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.default,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  desc: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: { backgroundColor: colors.border },
  btnQuit: { backgroundColor: colors.reaction.red },
  btnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  btnTextCancel: { color: colors.text.primary },
  btnTextQuit: { color: '#FFFFFF' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WriteThanksScreen() {
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId?: string }>();
  const isEdit = !!noteId;
  const [inputs, setInputs] = useState<string[]>(Array(DEFAULT_INPUT_COUNT).fill(''));
  // 현재 작성 중(focus)인 항목. 이 index 직전 항목이 상단 네비게이션 아래에 고정(sticky)된다.
  const [activeIndex, setActiveIndex] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const rowY = useRef<number[]>([]); // 각 입력 행의 contentContainer 기준 y 위치
  const didMountRef = useRef(false);

  // activeIndex가 바뀔 때(엔터 / 행 탭) 해당 입력칸 focus +
  // 직전 항목이 상단에 고정되도록 스크롤. 첫 진입은 네비게이션 전환 후 focus.
  useEffect(() => {
    const delay = didMountRef.current ? 50 : 300;
    didMountRef.current = true;
    const timer = setTimeout(() => {
      inputRefs.current[activeIndex]?.focus();
      const targetY = activeIndex > 0 ? rowY.current[activeIndex - 1] ?? 0 : 0;
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, delay);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  // 편집 모드: 기존 노트 불러와 prefill
  useEffect(() => {
    if (!noteId) return;
    let cancelled = false;
    (async () => {
      try {
        const detail = await apiClient<{ answers: string[] }>(`/notes/thanks/${noteId}`);
        if (cancelled) return;
        const filled = [...(detail.answers ?? [])];
        while (filled.length < DEFAULT_INPUT_COUNT) filled.push('');
        setInputs(filled);
      } catch {
        Alert.alert('오류', '노트를 불러오지 못했습니다.');
      }
    })();
    return () => { cancelled = true; };
  }, [noteId]);

  // 하나라도 입력값이 있으면 활성화
  const isSubmitEnabled = inputs.some((v) => v.trim().length > 0);

  const ctaLabel = '작성 완료하기';
  const ctaEnabled = isSubmitEnabled;

  const handleChange = (index: number, value: string) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleFocusNext = (index: number) => {
    const nextIndex = index + 1;
    if (nextIndex >= inputs.length) {
      setInputs((prev) => [...prev, '']);
    }
    setActiveIndex(nextIndex);
  };

  const handleBackPress = () => {
    const hasAnyInput = inputs.some((v) => v.trim().length > 0);
    if (hasAnyInput) {
      setShowQuitModal(true);
    } else {
      router.back();
    }
  };

  const handleQuitConfirm = () => {
    setShowQuitModal(false);
    router.back();
  };

  const handleSubmit = async () => {
    if (!isSubmitEnabled) return;
    const answers = inputs.map((v) => v.trim()).filter((v) => v.length > 0);
    let createdNoteId: string | null = null;
    try {
      if (isEdit) {
        await apiClient(`/notes/thanks/${noteId}`, {
          method: 'PUT',
          body: JSON.stringify({ answers }),
        });
        router.back();
        return;
      }
      const note = await apiClient<CreatedThanksNote>('/notes/thanks', {
        method: 'POST',
        body: JSON.stringify({ answers, isFixed: false, isHidden: false, isOpenToOikos: false }),
      });
      createdNoteId = note.id;
    } catch {
      Alert.alert('오류', '노트 저장에 실패했습니다.');
      return;
    }
    router.replace(`/faith-note/publish?noteType=THANKS&noteId=${createdNoteId}`);
  };

  return (
    // Figma: 라이트 배경 (#F2F4F7)
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* ── 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={inputs.map((_, index) => index + 1)}
        >
          {/* index 0 — 타이틀 (스크롤되며 위로 사라짐) */}
          <View style={styles.titleSection}>
            <Text style={styles.subtitle}>감사노트 작성하기</Text>
            <Text style={styles.title}>오늘도 감사로 하루를 열어요</Text>
          </View>

          {/* index 1~ — 입력 행. 각 행이 sticky 헤더 → 다음 행이 올라오면 교체되며 nav 아래 고정 */}
          {inputs.map((_, index) => {
            const isActive = index === activeIndex;

            return (
              <View
                key={index}
                style={styles.stickyRow}
                onLayout={(e) => {
                  rowY.current[index] = e.nativeEvent.layout.y;
                }}
              >
                {/* 레이블 — 현재 작성 항목은 보라색 (Figma) */}
                <Text style={[styles.inputLabel, isActive && styles.inputLabelFocused]}>
                  {getInputLabel(index)}
                </Text>

                {/* 입력 Row */}
                <View style={styles.inputRow}>
                  {/* 번호 배지 (Figma: 밝은 박스 안 숫자) */}
                  <View style={styles.inputNumberBox}>
                    <Text style={styles.inputNumberText}>{index + 1}</Text>
                  </View>

                  {/* TextInput */}
                  <TextInput
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    style={styles.input}
                    value={inputs[index]}
                    onChangeText={(v) => handleChange(index, v)}
                    onFocus={() => setActiveIndex(index)}
                    placeholder={THANK_PLACEHOLDER}
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    returnKeyType="next"
                    onSubmitEditing={() => handleFocusNext(index)}
                    blurOnSubmit={false}
                  />
                </View>
              </View>
            );
          })}

          {/* ── 작성 완료 버튼 */}
          <View style={styles.submitWrapper}>
            <TouchableOpacity
              style={[styles.submitButton, ctaEnabled && styles.submitButtonActive]}
              onPress={handleSubmit}
              activeOpacity={ctaEnabled ? 0.8 : 1}
              disabled={!ctaEnabled}
            >
              <Text style={styles.submitText}>{ctaLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 그만두기 확인 모달 */}
      <QuitConfirmModal
        visible={showQuitModal}
        onContinue={() => setShowQuitModal(false)}
        onQuit={handleQuitConfirm}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  flex: { flex: 1 },

  // ── 헤더
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // ── 타이틀
  titleSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: 6,
  },
  subtitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 34,
  },

  // ── 입력 행 (각 행이 sticky 헤더 → 고정 시 뒤 내용 가리도록 불투명 배경)
  stickyRow: {
    backgroundColor: SCREEN_BG,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: 6,
    paddingLeft: 4,
  },
  // Figma: focus된 항목의 라벨은 primary(#6561FF) 보라색
  inputLabelFocused: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  // Figma: 반투명 어두운 배경 (모든 행 동일, focus 표시는 라벨 색상으로)
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  // Figma: 번호 배지 — 밝은 박스(24×24, rounded 8)
  inputNumberBox: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    backgroundColor: NUMBER_BOX_BG,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inputNumberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    color: colors.text.primary,
    padding: 0,
    // 입력 여부와 상관없이 박스 높이 고정 (Android 폰트 패딩으로 인한 높이 변동 방지)
    height: 24,
    lineHeight: 20,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },

  // ── 작성 완료 버튼
  submitWrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  // Figma 비활성: primary 40% 불투명
  submitButton: {
    height: 49,
    borderRadius: radius.md,
    backgroundColor: SUBMIT_DISABLED_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma 활성: primary(#6561FF)
  submitButtonActive: {
    backgroundColor: colors.primary,
  },
  submitText: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
