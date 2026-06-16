import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import {
  BiblePassage,
  clearPendingPassages,
  getPendingPassages,
} from '@/utils/faith-note-store';
import { BIBLE_BOOKS } from '@/constants/BibleMeta';
import { apiClient } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

// ─── 색상 상수 (Figma: 라이트 테마) ──────────────────────────────────────────────
const SCREEN_BG = '#F2F4F7';
const INPUT_BG = 'rgba(13,28,45,0.08)';
const PLACEHOLDER_COLOR = 'rgba(13,28,45,0.3)';
const SUBMIT_DISABLED_BG = 'rgba(101,97,255,0.4)'; // primary 40% 불투명

interface CreatedBibleNote {
  id: string;
}

// ─── 선택된 구절 표시 문자열 ───────────────────────────────────────────────────

// 절 번호 목록 → "1-5"(연속) 또는 "1, 3, 5"(비연속)
function formatVerseRange(verses?: number[]): string {
  if (!verses || verses.length === 0) return '';
  const sorted = [...verses].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const contiguous = max - min + 1 === sorted.length;
  return contiguous && sorted.length > 1 ? `${min}-${max}` : sorted.join(', ');
}

// 단일 구절 라벨: "창세기 1장 1-5절"
function formatPassages(passages: BiblePassage[]): string {
  if (passages.length === 0) return '';
  const p = passages[0];
  const vr = formatVerseRange(p.verses);
  return `${p.book} ${p.chapter}장${vr ? ` ${vr}절` : ''}`;
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
  const insets = useSafeAreaInsets();
  const kb = useKeyboardHeight();
  const { noteId } = useLocalSearchParams<{ noteId?: string }>();
  const isEdit = !!noteId;
  const [passages, setPassages] = useState<BiblePassage[]>([]);
  const [bodyText, setBodyText] = useState('');
  const [isBodyFocused, setIsBodyFocused] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bodyRef = useRef<TextInput>(null);

  // select-bible에서 돌아올 때 pending 데이터 읽기
  useFocusEffect(
    useCallback(() => {
      const pending = getPendingPassages();
      if (pending.length > 0) setPassages(pending);
    }, []),
  );

  // 편집 모드: 기존 노트 불러와 prefill (구절 + 묵상 내용)
  useEffect(() => {
    if (!noteId) return;
    let cancelled = false;
    (async () => {
      try {
        const detail = await apiClient<{ bibleName: string; chapter: number; phaseStart?: number; phaseEnd?: number; description: string }>(
          `/bible/notes/${noteId}`,
        );
        if (cancelled) return;
        if (detail.bibleName) {
          const start = detail.phaseStart ?? 0;
          const end = detail.phaseEnd ?? 0;
          const verses: number[] = [];
          for (let v = start; v <= end; v++) if (v > 0) verses.push(v);
          setPassages([{ book: detail.bibleName, chapter: detail.chapter, verses }]);
        }
        setBodyText(detail.description ?? '');
      } catch {
        Alert.alert('오류', '노트를 불러오지 못했습니다.');
      }
    })();
    return () => { cancelled = true; };
  }, [noteId]);

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
    if (!hasContent || isSubmitting) return;
    setIsSubmitting(true);
    const firstPassage = passages[0];
    const bookMeta = firstPassage
      ? BIBLE_BOOKS.find(b => b.korName === firstPassage.book)
      : null;
    const verses = firstPassage?.verses ?? [];
    const payload = {
      bibleName: firstPassage?.book ?? '',
      bibleEnglishShort: bookMeta?.code ?? '',
      chapter: firstPassage?.chapter ?? 1,
      phaseStart: verses.length ? Math.min(...verses) : 1,
      phaseEnd: verses.length ? Math.max(...verses) : 1,
      title: passageLabel || (firstPassage?.book ?? ''),
      description: bodyText.trim(),
    };
    try {
      if (isEdit) {
        await apiClient(`/bible/notes/${noteId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        clearPendingPassages();
        router.back();
        return;
      }
      const note = await apiClient<CreatedBibleNote>('/bible/notes', {
        method: 'POST',
        body: JSON.stringify({ ...payload, isHidden: false, isOpenToOikos: false }),
      });
      clearPendingPassages();
      router.replace(`/faith-note/publish?noteType=WORD&noteId=${note.id}`);
    } catch {
      Alert.alert('오류', '노트 저장에 실패했습니다.');
      setIsSubmitting(false); // 실패 시에만 재활성화 (성공 시 화면 전환되므로 유지)
    }
  };

  return (
    // Figma: 라이트 배경 (#F2F4F7)
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* 키보드가 올라오면 스크롤+CTA 영역 전체를 키보드 높이만큼 올림 → CTA가 키보드 바로 위에 붙음 */}
      <View style={[s.flex, { marginBottom: kb }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
              <Ionicons name="chevron-down" size={18} color="rgba(13,28,45,0.5)" />
            </TouchableOpacity>
          </View>

          {/* 묵상 내용 입력 — 남은 공간을 채움 */}
          <View style={[s.section, s.bodySection]}>
            <Text style={[s.sectionLabel, isBodyFocused && s.sectionLabelFocused]}>묵상 내용 작성</Text>
            <View style={s.textAreaBox}>
              <TextInput
                ref={bodyRef}
                style={s.textArea}
                value={bodyText}
                onChangeText={setBodyText}
                onFocus={() => setIsBodyFocused(true)}
                onBlur={() => setIsBodyFocused(false)}
                placeholder="묵상 내용을 입력해주세요"
                placeholderTextColor={PLACEHOLDER_COLOR}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* 하단 고정 버튼 — 키보드 등장 시 위 영역과 함께 올라가 키보드 위에 붙음(패딩 축소) */}
        <View style={[s.footer, { paddingBottom: kb > 0 ? 14 : insets.bottom + 14 }]}>
          <TouchableOpacity
            style={[s.submitButton, hasContent && s.submitButtonActive]}
            onPress={handleSubmit}
            activeOpacity={hasContent && !isSubmitting ? 0.8 : 1}
            disabled={!hasContent || isSubmitting}
          >
            <Text style={s.submitText}>작성 완료하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      <QuitModal visible={showQuitModal} onContinue={() => setShowQuitModal(false)} onQuit={handleQuit} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SCREEN_BG },
  flex: { flex: 1 },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  scroll: { flex: 1 },
  // flexGrow로 콘텐츠가 화면을 채워 묵상 입력칸이 늘어나도록
  scrollContent: { flexGrow: 1, paddingBottom: spacing.md },

  // 타이틀
  titleSection: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: 6 },
  subtitle: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.secondary },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.text.primary, lineHeight: 34 },

  // 섹션
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.md, gap: 8 },
  bodySection: { flex: 1 },
  sectionLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.secondary, paddingLeft: 4 },
  sectionLabelFocused: { color: colors.primary },

  // 성경 선택 드롭다운
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: INPUT_BG,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  selectorText: { flex: 1, fontSize: fontSize.base, color: colors.text.primary },
  selectorPlaceholder: { color: PLACEHOLDER_COLOR },

  // 묵상 텍스트 영역 — 남은 공간 채움
  textAreaBox: { flex: 1, backgroundColor: INPUT_BG, borderRadius: radius.md, padding: spacing.md, minHeight: 200 },
  textArea: { flex: 1, fontSize: fontSize.base, color: colors.text.primary, lineHeight: 24 },

  // 하단 고정 버튼
  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  submitButton: { height: 49, borderRadius: radius.md, backgroundColor: SUBMIT_DISABLED_BG, alignItems: 'center', justifyContent: 'center' },
  submitButtonActive: { backgroundColor: colors.primary },
  submitText: { fontSize: fontSize.heading, fontWeight: fontWeight.semibold, color: colors.white },
});
