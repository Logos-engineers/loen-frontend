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

const DARK_BG = '#0D1C2D';
const INPUT_BG = 'rgba(255,255,255,0.08)';
const INPUT_BG_FILLED = 'rgba(255,255,255,0.14)';

const PRAYER_LABELS = ['첫번째 기도', '두번째 기도', '세번째 기도', '네번째 기도', '다섯번째 기도'];
const PRAYER_PLACEHOLDERS = Array(5).fill('기도 제목을 적어보세요.');

function QuitModal({ visible, onContinue, onQuit }: { visible: boolean; onContinue: () => void; onQuit: () => void }) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={ms.overlay}>
        <View style={ms.card}>
          <Text style={ms.title}>노트 작성을 그만두시겠어요?</Text>
          <Text style={ms.desc}>작성 중인 내용은 저장되지 않아요.</Text>
          <View style={ms.row}>
            <TouchableOpacity style={[ms.btn, ms.cancel]} onPress={onContinue} activeOpacity={0.7}>
              <Text style={[ms.btnText, { color: colors.text.primary }]}>계속하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ms.btn, ms.quit]} onPress={onQuit} activeOpacity={0.7}>
              <Text style={[ms.btnText, { color: '#fff' }]}>그만두기</Text>
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
  desc: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cancel: { backgroundColor: colors.border },
  quit: { backgroundColor: colors.reaction.red },
  btnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});

export default function WritePrayerScreen() {
  const router = useRouter();
  const [inputs, setInputs] = useState<string[]>(['', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const isSubmitEnabled = inputs.some((v) => v.trim().length > 0);

  const handleChange = (i: number, v: string) => {
    setInputs((prev) => { const next = [...prev]; next[i] = v; return next; });
  };

  const handleBack = () => {
    if (inputs.some((v) => v.trim().length > 0)) setShowQuitModal(true);
    else router.back();
  };

  const handleSubmit = () => {
    if (!isSubmitEnabled) return;
    faithNoteStore.addNote({
      id: `prayer-${Date.now()}`,
      tab: 'PRAYER',
      dayKey: getTodayKey(),
      author: { handle: 'me', name: '나', hasAvatar: false, initial: '나' },
      timeAgo: '방금',
      content: inputs.filter((v) => v.trim().length > 0),
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
    });
    router.replace('/faith-note/publish?noteType=PRAYER');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={s.headerRight}>노트 작성하기</Text>
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={s.titleSection}>
            <Text style={s.subtitle}>기도노트 작성하기</Text>
            <Text style={s.title}>오늘도 기도로 하루를 열어요</Text>
          </View>

          <View style={s.inputList}>
            {PRAYER_LABELS.map((label, index) => {
              const isFocused = focusedIndex === index;
              const isFilled = inputs[index].trim().length > 0;
              return (
                <View key={index}>
                  <Text style={s.inputLabel}>{label}</Text>
                  <View style={[s.inputRow, isFocused && s.inputRowFocused, isFilled && !isFocused && s.inputRowFilled]}>
                    <Text style={[s.inputNumber, (isFocused || isFilled) && s.inputNumberActive]}>{index + 1}</Text>
                    <TextInput
                      ref={(el) => { inputRefs.current[index] = el; }}
                      style={s.input}
                      value={inputs[index]}
                      onChangeText={(v) => handleChange(index, v)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      placeholder={PRAYER_PLACEHOLDERS[index]}
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      returnKeyType={index < 4 ? 'next' : 'done'}
                      onSubmitEditing={() => { if (index < 4) inputRefs.current[index + 1]?.focus(); }}
                      blurOnSubmit={index === 4}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={s.submitWrapper}>
            <TouchableOpacity
              style={[s.submitButton, isSubmitEnabled && s.submitButtonActive]}
              onPress={handleSubmit}
              activeOpacity={isSubmitEnabled ? 0.8 : 1}
              disabled={!isSubmitEnabled}
            >
              <Text style={[s.submitText, isSubmitEnabled && s.submitTextActive]}>작성 완료하기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <QuitModal visible={showQuitModal} onContinue={() => setShowQuitModal(false)} onQuit={() => { setShowQuitModal(false); router.back(); }} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK_BG },
  flex: { flex: 1 },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  headerRight: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  titleSection: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: 6 },
  subtitle: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: 'rgba(255,255,255,0.5)' },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: '#FFFFFF', lineHeight: 28 },
  inputList: { paddingHorizontal: spacing.md, gap: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: 'rgba(255,255,255,0.5)', marginBottom: 6, paddingLeft: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: INPUT_BG, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, gap: spacing.sm, borderWidth: 1, borderColor: 'transparent' },
  inputRowFocused: { borderColor: colors.primary, backgroundColor: INPUT_BG_FILLED },
  inputRowFilled: { backgroundColor: INPUT_BG_FILLED },
  inputNumber: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.3)', width: 16, flexShrink: 0 },
  inputNumberActive: { color: 'rgba(255,255,255,0.7)' },
  input: { flex: 1, fontSize: fontSize.md, color: '#FFFFFF', padding: 0 },
  submitWrapper: { paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  submitButton: { height: 52, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  submitButtonActive: { backgroundColor: colors.primary },
  submitText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: 'rgba(255,255,255,0.4)' },
  submitTextActive: { color: '#FFFFFF' },
});
