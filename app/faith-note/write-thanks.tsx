import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { faithNoteStore, getTodayKey } from '@/utils/faith-note-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
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

// ─── 색상 상수 ────────────────────────────────────────────────────────────────
const DARK_BG = '#0D1C2D';
const INPUT_BG = 'rgba(255,255,255,0.08)';
const INPUT_BG_FILLED = 'rgba(255,255,255,0.14)';

// ─── 입력 항목 ────────────────────────────────────────────────────────────────
const THANK_LABELS = ['첫번째 감사', '두번째 감사', '세번째 감사', '네번째 감사', '다섯번째 감사'];
const THANK_PLACEHOLDERS = [
  '감사한 일을 적어보세요.',
  '감사한 일을 적어보세요.',
  '감사한 일을 적어보세요.',
  '감사한 일을 적어보세요.',
  '감사한 일을 적어보세요.',
];

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
  const [inputs, setInputs] = useState<string[]>(['', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // 하나라도 입력값이 있으면 활성화
  const isSubmitEnabled = inputs.some((v) => v.trim().length > 0);

  const handleChange = (index: number, value: string) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
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

  const handleSubmit = () => {
    if (!isSubmitEnabled) return;

    // 입력된 항목만 content 배열로 구성
    const content = inputs.filter((v) => v.trim().length > 0);

    // 스토어에 새 노트 추가
    faithNoteStore.addNote({
      id: `thanks-${Date.now()}`,
      tab: 'THANKS',
      dayKey: getTodayKey(),
      author: { handle: 'me', name: '나', hasAvatar: false, initial: '나' },
      timeAgo: '방금',
      content,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
    });

    router.replace('/faith-note/publish?noteType=THANKS');
  };

  return (
    // Figma: 어두운 네이비 배경 (#0D1C2D)
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* ── 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        {/* 우측 — 이 화면에서는 탭 지정 없이 라벨만 */}
        <Text style={styles.headerRight}>노트 작성하기</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── 타이틀 영역 */}
          <View style={styles.titleSection}>
            <Text style={styles.subtitle}>감사노트 작성하기</Text>
            <Text style={styles.title}>오늘도 감사로 하루를 열어요</Text>
          </View>

          {/* ── 입력 항목 목록 */}
          <View style={styles.inputList}>
            {THANK_LABELS.map((label, index) => {
              const isFocused = focusedIndex === index;
              const isFilled = inputs[index].trim().length > 0;

              return (
                <View key={index}>
                  {/* 레이블 */}
                  <Text style={styles.inputLabel}>{label}</Text>

                  {/* 입력 Row */}
                  <View
                    style={[
                      styles.inputRow,
                      isFocused && styles.inputRowFocused,
                      isFilled && !isFocused && styles.inputRowFilled,
                    ]}
                  >
                    {/* 번호 */}
                    <Text
                      style={[
                        styles.inputNumber,
                        (isFocused || isFilled) && styles.inputNumberActive,
                      ]}
                    >
                      {index + 1}
                    </Text>

                    {/* TextInput */}
                    <TextInput
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      style={styles.input}
                      value={inputs[index]}
                      onChangeText={(v) => handleChange(index, v)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      placeholder={THANK_PLACEHOLDERS[index]}
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      returnKeyType={index < 4 ? 'next' : 'done'}
                      onSubmitEditing={() => {
                        if (index < 4) inputRefs.current[index + 1]?.focus();
                      }}
                      blurOnSubmit={index === 4}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── 작성 완료 버튼 */}
          <View style={styles.submitWrapper}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitEnabled && styles.submitButtonActive,
              ]}
              onPress={handleSubmit}
              activeOpacity={isSubmitEnabled ? 0.8 : 1}
              disabled={!isSubmitEnabled}
            >
              <Text
                style={[
                  styles.submitText,
                  isSubmitEnabled && styles.submitTextActive,
                ]}
              >
                작성 완료하기
              </Text>
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
    backgroundColor: DARK_BG,
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
  headerRight: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.primary,
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
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.5)',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    lineHeight: 28,
  },

  // ── 입력 항목
  inputList: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
    paddingLeft: 4,
  },
  // Figma: 기본 — 반투명 어두운 배경
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  // Figma: 포커스 — primary 테두리
  inputRowFocused: {
    borderColor: colors.primary,
    backgroundColor: INPUT_BG_FILLED,
  },
  // Figma: 입력됨 — 약간 더 밝은 배경
  inputRowFilled: {
    backgroundColor: INPUT_BG_FILLED,
  },
  inputNumber: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: 'rgba(255,255,255,0.3)',
    width: 16,
    flexShrink: 0,
  },
  inputNumberActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: '#FFFFFF',
    padding: 0,
  },

  // ── 작성 완료 버튼
  submitWrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  // Figma 비활성: 반투명 회색
  submitButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma 활성: primary(#6561FF)
  submitButtonActive: {
    backgroundColor: colors.primary,
  },
  submitText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.4)',
  },
  submitTextActive: {
    color: '#FFFFFF',
  },
});
