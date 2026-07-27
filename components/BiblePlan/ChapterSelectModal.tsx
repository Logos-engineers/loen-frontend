/**
 * ChapterSelectModal.tsx — 성경 통독 장 선택 모달
 * [2026-03-20] 디자인 시스템 토큰 리팩토링
 * [qa-bot#57] 꾹 눌러 드래그하면 여러 장 일괄 선택(범위) — 단일 탭은 기존대로 1개 토글.
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
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';

type Props = {
  visible: boolean;
  book: BibleBook | null;
  readChapters: number[];
  onClose: () => void;
  onConfirm: (selected: number[]) => void;
};

export default function ChapterSelectModal({
  visible,
  book,
  readChapters,
  onClose,
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // 제스처 콜백에서 최신 selected 를 stale 없이 읽기 위한 ref
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // 각 장 셀의 그리드 내 위치(hit-test용). key=장 번호
  const cellLayouts = useRef<Map<number, LayoutRectangle>>(new Map());
  // 드래그 1회의 기준값(시작 시 스냅샷)
  const dragRef = useRef<{ base: Set<number>; start: number; mode: 'add' | 'remove' } | null>(null);

  useEffect(() => {
    if (visible) setSelected(new Set(readChapters));
  }, [visible, readChapters]);

  // 모달이 닫히면 다음 책을 위해 셀 레이아웃 캐시 비움
  useEffect(() => {
    if (!visible) cellLayouts.current.clear();
  }, [visible]);

  const toggleChapter = (ch: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch);
      else next.add(ch);
      return next;
    });
  };

  const chapterAt = (x: number, y: number): number | null => {
    for (const [ch, r] of cellLayouts.current) {
      if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) return ch;
    }
    return null;
  };

  const applyRange = (start: number, end: number, base: Set<number>, mode: 'add' | 'remove') => {
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    const next = new Set(base);
    for (let c = lo; c <= hi; c++) {
      if (mode === 'add') next.add(c);
      else next.delete(c);
    }
    setSelected(next);
  };

  // 롱프레스로 활성화되는 Pan — 평소 드래그는 ScrollView 스크롤, 꾹 누르면 범위 선택.
  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(200)
        .shouldCancelWhenOutside(false)
        .runOnJS(true)
        .onStart((e) => {
          const ch = chapterAt(e.x, e.y);
          if (ch == null) {
            dragRef.current = null;
            return;
          }
          // 시작 칸이 이미 선택돼 있으면 드래그=해제, 아니면 드래그=선택
          const mode: 'add' | 'remove' = selectedRef.current.has(ch) ? 'remove' : 'add';
          dragRef.current = { base: new Set(selectedRef.current), start: ch, mode };
          applyRange(ch, ch, dragRef.current.base, mode);
        })
        .onUpdate((e) => {
          const d = dragRef.current;
          if (!d) return;
          const ch = chapterAt(e.x, e.y);
          if (ch == null) return;
          applyRange(d.start, ch, d.base, d.mode);
        })
        .onFinalize(() => {
          dragRef.current = null;
        }),
    [],
  );

  if (!book) return null;

  const chapters = Array.from({ length: book.chapterCount }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* RN Modal 안에서 제스처가 동작하려면 GestureHandlerRootView 로 감싸야 한다 */}
      <GestureHandlerRootView style={styles.root}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              {/* 헤더 */}
              <View style={styles.dialogHeader}>
                <Text style={styles.bookKorName}>{book.korName}</Text>
                <Text style={styles.bookEngName}>{book.engName}</Text>
                <Text style={styles.guideText}>읽은 장을 선택하세요 · 꾹 눌러 드래그하면 여러 장 한 번에</Text>
              </View>

              {/* 장 번호 그리드 */}
              <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
                <GestureDetector gesture={dragGesture}>
                  <View style={styles.grid}>
                    {chapters.map(ch => {
                      const isSelected = selected.has(ch);
                      return (
                        <TouchableOpacity
                          key={ch}
                          style={[styles.chapterBtn, isSelected && styles.chapterBtnSelected]}
                          activeOpacity={0.7}
                          onPress={() => toggleChapter(ch)}
                          onLayout={(e) => {
                            cellLayouts.current.set(ch, e.nativeEvent.layout);
                          }}
                        >
                          <Text style={[styles.chapterText, isSelected && styles.chapterTextSelected]}>
                            {ch}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </GestureDetector>
              </ScrollView>

              {/* 하단 버튼 (1:1 균등) */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  activeOpacity={0.8}
                  onPress={() => onConfirm(Array.from(selected))}
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

const BTN_SIZE = 46; // 컴포넌트 전용: 장 선택 버튼 고정 크기

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.default, // 신규 시멘틱 토큰
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },

  dialog: {
    width: '100%',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.xl,   // 20px — radius.xl (신규 토큰)
    maxHeight: '80%',
    overflow: 'hidden',
  },

  dialogHeader: {
    paddingHorizontal: spacing.lg, // 20px — spacing.lg
    paddingTop: spacing.lg,        // 20px — spacing.lg
    paddingBottom: spacing.sm + 4, // 12px — spacing.sm(8) + 일회성 4
  },
  bookKorName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,               // 일회성: 한글↔영문 미세 간격
  },
  bookEngName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.text.secondary,
    marginBottom: spacing.sm + 2,  // 10px — spacing.sm(8) + 일회성 2
  },
  guideText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.text.secondary,
  },

  gridScroll: {
    flexGrow: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,  // 16px — spacing.md
    paddingBottom: spacing.md,      // 16px — spacing.md
    gap: spacing.sm,                // 8px — spacing.sm
  },
  chapterBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: 10,               // 일회성: 피그마 버튼 반경 (radius.md=12와 다름)
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterBtnSelected: {
    backgroundColor: colors.primary,
  },
  chapterText: {
    fontSize: fontSize.md,          // 14px — fontSize.md
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  chapterTextSelected: {
    color: colors.white,            // colors.white (신규 토큰)
    fontWeight: fontWeight.bold,
  },

  footer: {
    flexDirection: 'row',
    gap: 10,                        // 일회성: 버튼 사이 간격
    paddingHorizontal: spacing.md,  // 16px — spacing.md
    paddingTop: spacing.sm + 4,     // 12px — spacing.sm(8) + 일회성 4
    paddingBottom: spacing.md,      // 16px — spacing.md
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelBtn: {
    flex: 1,
    height: 48,                     // 일회성: CTA 버튼 고정 높이
    borderRadius: radius.md,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  confirmBtn: {
    flex: 1,
    height: 48,                     // 일회성: CTA 버튼 고정 높이
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,            // colors.white (신규 토큰)
  },
});
