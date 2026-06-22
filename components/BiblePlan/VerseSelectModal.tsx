/**
 * VerseSelectModal.tsx — 한 장의 절(節) 멀티선택 모달
 * ChapterSelectModal과 동일한 가운데 팝업 스타일. 말씀노트 구절 선택용.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutRectangle,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { BibleBook } from '@/constants/BibleMeta';
import { getBibleBook } from '@/constants/bibleLoader';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';

type Props = {
  visible: boolean;
  book: BibleBook | null;
  chapter: number;
  selectedVerses: number[];
  onClose: () => void;
  onConfirm: (verses: number[]) => void;
};

export default function VerseSelectModal({
  visible,
  book,
  chapter,
  selectedVerses,
  onClose,
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // 드래그 멀티선택용 (qa-bot#57 — 장 선택과 동일 UX)
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  const cellLayouts = useRef<Map<number, LayoutRectangle>>(new Map());
  const dragRef = useRef<{ base: Set<number>; start: number; mode: 'add' | 'remove' } | null>(null);

  useEffect(() => {
    if (visible) setSelected(new Set(selectedVerses));
    else cellLayouts.current.clear();
  }, [visible, selectedVerses]);

  // 해당 장의 절 개수 (앱 로컬 성경 데이터)
  const verseCount = useMemo(() => {
    if (!book) return 0;
    const chap = getBibleBook(book.code)?.chapters.find((c) => c.chapter === chapter);
    return chap?.verses.length ?? 0;
  }, [book, chapter]);

  const toggleVerse = (v: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  };

  const verseAt = (x: number, y: number): number | null => {
    for (const [v, r] of cellLayouts.current) {
      if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) return v;
    }
    return null;
  };

  const applyRange = (start: number, end: number, base: Set<number>, mode: 'add' | 'remove') => {
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    const next = new Set(base);
    for (let n = lo; n <= hi; n++) {
      if (mode === 'add') next.add(n);
      else next.delete(n);
    }
    setSelected(next);
  };

  // 꾹 눌러 드래그하면 범위 선택. 평소 드래그는 스크롤(롱프레스 후 활성).
  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(200)
        .shouldCancelWhenOutside(false)
        .runOnJS(true)
        .onStart((e) => {
          const v = verseAt(e.x, e.y);
          if (v == null) { dragRef.current = null; return; }
          const mode: 'add' | 'remove' = selectedRef.current.has(v) ? 'remove' : 'add';
          dragRef.current = { base: new Set(selectedRef.current), start: v, mode };
          applyRange(v, v, dragRef.current.base, mode);
        })
        .onUpdate((e) => {
          const d = dragRef.current;
          if (!d) return;
          const v = verseAt(e.x, e.y);
          if (v == null) return;
          applyRange(d.start, v, d.base, d.mode);
        })
        .onFinalize(() => { dragRef.current = null; }),
    [],
  );

  if (!book) return null;

  const verses = Array.from({ length: verseCount }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* RN Modal 안에서 제스처가 동작하려면 GestureHandlerRootView 로 감싸야 한다 */}
      <GestureHandlerRootView style={styles.root}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              {/* 헤더 */}
              <View style={styles.dialogHeader}>
                <Text style={styles.bookKorName}>{book.korName} {chapter}장</Text>
                <Text style={styles.bookEngName}>{book.engName}</Text>
                <Text style={styles.guideText}>읽은 절을 선택하세요 · 꾹 눌러 드래그하면 여러 절 한 번에</Text>
              </View>

              {/* 절 번호 그리드 */}
              <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
                <GestureDetector gesture={dragGesture}>
                  <View style={styles.grid}>
                    {verses.map((v) => {
                      const isSelected = selected.has(v);
                      return (
                        <TouchableOpacity
                          key={v}
                          style={styles.cellWrap}
                          activeOpacity={0.7}
                          onPress={() => toggleVerse(v)}
                          onLayout={(e) => { cellLayouts.current.set(v, e.nativeEvent.layout); }}
                        >
                          <View style={[styles.verseBox, isSelected && styles.verseBoxSelected]}>
                            <Text style={[styles.verseText, isSelected && styles.verseTextSelected]}>
                              {v}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </GestureDetector>
              </ScrollView>

              {/* 하단 버튼 (1:1) */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  activeOpacity={0.8}
                  onPress={() => onConfirm([...selected].sort((a, b) => a - b))}
                >
                  <Text style={styles.confirmBtnText}>완료</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.default,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  dialog: {
    width: '100%',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.xl,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  dialogHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm + 4,
  },
  bookKorName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: 2 },
  bookEngName: { fontSize: fontSize.sm, fontWeight: fontWeight.regular, color: colors.text.secondary, marginBottom: spacing.sm + 2 },
  guideText: { fontSize: fontSize.sm, fontWeight: fontWeight.regular, color: colors.text.secondary },
  gridScroll: { flexGrow: 0 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  // 6열을 폭에 맞춰 균등 분할 → 좌우 여백 동일 (고정폭+gap 시 우측 여백 쏠림 방지)
  cellWrap: {
    width: `${100 / 6}%`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  verseBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseBoxSelected: { backgroundColor: colors.primary },
  verseText: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text.secondary },
  verseTextSelected: { color: colors.white, fontWeight: fontWeight.bold },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 4,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelBtn: { flex: 1, height: 48, borderRadius: radius.md, backgroundColor: colors.background.base, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.secondary },
  confirmBtn: { flex: 1, height: 48, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.white },
});
