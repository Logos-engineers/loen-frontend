import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import {
  BiblePassage,
  clearPendingPassages,
  getPendingPassages,
} from '@/utils/faith-note-store';
import { BIBLE_BOOKS } from '@/constants/BibleMeta';
import { apiClient } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
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

const DARK_BG = '#0D1C2D';
const CARD_BG = 'rgba(255,255,255,0.08)';
const CARD_BG_FILLED = 'rgba(255,255,255,0.14)';

// ─── 선택된 구절 표시 문자열 ───────────────────────────────────────────────────

function formatPassages(passages: BiblePassage[]): string {
  if (passages.length === 0) return '';
  // 같은 book끼리 연속 장을 묶어 표시: "창세기 1, 2, 출애굽기 3"
  const groups: Record<string, number[]> = {};
  passages.forEach(({ book, chapter }) => {
    if (!groups[book]) groups[book] = [];
    groups[book].push(chapter);
  });
  return Object.entries(groups)
    .map(([book, chs]) => `${book} ${chs.join(', ')}`)
    .join(', ');
}

// ─── Quit Modal ───────────────────────────────────────────────────────────────

function QuitModal({ visible, onContinue, onQuit }: { visible: boolean; onContinue: () => void; onQuit: () => void }) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={ms.overlay}>
        <View style={ms.card}>
          <Text style={ms.title}>노트 작성을 그만두시겠어요?</Text>
          <Text style={ms.desc}>작성 중인 내용은 저장되지 않아요.</Text>
          <View style={ms.row}>
            <TouchableOpacity style={[ms.btn, { backgroundColor: colors.border }]} onPress={onContinue} activeOpacity={0.7}>
              <Text style={[ms.btnText, { color: colors.text.primary }]}>계속하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ms.btn, { backgroundColor: colors.reaction.red }]} onPress={onQuit} activeOpacity={0.7}>
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
  btnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WriteWordScreen() {
  const router = useRouter();
  const [passages, setPassages] = useState<BiblePassage[]>([]);
  const [bodyText, setBodyText] = useState('');
  const [isBodyFocused, setIsBodyFocused] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const bodyRef = useRef<TextInput>(null);

  // select-bible에서 돌아올 때 pending 데이터 읽기
  useFocusEffect(
    useCallback(() => {
      const pending = getPendingPassages();
      if (pending.length > 0) setPassages(pending);
    }, []),
  );

  const hasContent = passages.length > 0 || bodyText.trim().length > 0;
  const passageLabel = formatPassages(passages);

  const handleBack = () => {
    if (hasContent) setShowQuitModal(true);
    else { clearPendingPassages(); router.back(); }
  };

  const handleQuit = () => {
    clearPendingPassages();
    setShowQuitModal(false);
    router.back();
  };

  const handleSelectBible = () => {
    router.push('/faith-note/select-bible');
  };

  const handleSubmit = async () => {
    if (!hasContent) return;
    const firstPassage = passages[0];
    const bookMeta = firstPassage
      ? BIBLE_BOOKS.find(b => b.korName === firstPassage.book)
      : null;
    try {
      await apiClient('/bible/notes', {
        method: 'POST',
        body: JSON.stringify({
          bibleName: firstPassage?.book ?? '',
          bibleEnglishShort: bookMeta?.code ?? '',
          chapter: firstPassage?.chapter ?? 1,
          phaseStart: 1,
          phaseEnd: 1,
          title: passageLabel || (firstPassage?.book ?? ''),
          description: bodyText.trim(),
          isHidden: false,
          isOpenToOikos: false,
        }),
      });
      clearPendingPassages();
      router.replace('/faith-note/publish?noteType=WORD');
    } catch (e) {
      Alert.alert('오류', '노트 저장에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={s.headerRight}>노트 작성하기</Text>
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* 타이틀 */}
          <View style={s.titleSection}>
            <Text style={s.subtitle}>말씀노트 작성하기</Text>
            <Text style={s.title}>묵상한 내용을 기록해봐요</Text>
          </View>

          {/* 성경 선택 */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>어느 구절을 읽었나요?</Text>
            <TouchableOpacity style={s.selector} onPress={handleSelectBible} activeOpacity={0.7}>
              <Text style={[s.selectorText, !passageLabel && s.selectorPlaceholder]} numberOfLines={2}>
                {passageLabel || '성경을 선택해주세요'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          {/* 묵상 내용 입력 */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>묵상내용 작성</Text>
            <View style={[s.textAreaBox, isBodyFocused && s.textAreaBoxFocused]}>
              <TextInput
                ref={bodyRef}
                style={s.textArea}
                value={bodyText}
                onChangeText={setBodyText}
                onFocus={() => setIsBodyFocused(true)}
                onBlur={() => setIsBodyFocused(false)}
                placeholder="묵상 내용을 입력해주세요"
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* 제출 버튼 */}
          <View style={s.submitWrapper}>
            <TouchableOpacity
              style={[s.submitButton, hasContent && s.submitButtonActive]}
              onPress={handleSubmit}
              activeOpacity={hasContent ? 0.8 : 1}
              disabled={!hasContent}
            >
              <Text style={[s.submitText, hasContent && s.submitTextActive]}>다음으로</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <QuitModal visible={showQuitModal} onContinue={() => setShowQuitModal(false)} onQuit={handleQuit} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.md, gap: 8 },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: 'rgba(255,255,255,0.5)', paddingLeft: 4 },
  // 성경 선택 드롭다운
  selector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD_BG, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, borderWidth: 1, borderColor: 'transparent', gap: spacing.sm },
  selectorText: { flex: 1, fontSize: fontSize.md, color: '#FFFFFF' },
  selectorPlaceholder: { color: 'rgba(255,255,255,0.3)' },
  // 묵상 텍스트 영역
  textAreaBox: { backgroundColor: CARD_BG, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: 'transparent', minHeight: 200 },
  textAreaBoxFocused: { borderColor: colors.primary, backgroundColor: CARD_BG_FILLED },
  textArea: { fontSize: fontSize.md, color: '#FFFFFF', lineHeight: 22, minHeight: 180 },
  // 제출 버튼
  submitWrapper: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  submitButton: { height: 52, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  submitButtonActive: { backgroundColor: colors.primary },
  submitText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: 'rgba(255,255,255,0.4)' },
  submitTextActive: { color: '#FFFFFF' },
});
