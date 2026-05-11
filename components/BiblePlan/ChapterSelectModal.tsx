/**
 * ChapterSelectModal.tsx — 성경 통독 장 선택 모달
 * [2026-03-20] 디자인 시스템 토큰 리팩토링
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
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

  useEffect(() => {
    if (visible) setSelected(new Set(readChapters));
  }, [visible, readChapters]);

  const toggleChapter = (ch: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch);
      else next.add(ch);
      return next;
    });
  };

  if (!book) return null;

  const chapters = Array.from({ length: book.chapterCount }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={styles.dialog}>
            {/* 헤더 */}
            <View style={styles.dialogHeader}>
              <Text style={styles.bookKorName}>{book.korName}</Text>
              <Text style={styles.bookEngName}>{book.engName}</Text>
              <Text style={styles.guideText}>읽은 장을 선택하세요</Text>
            </View>

            {/* 장 번호 그리드 */}
            <ScrollView
              style={styles.gridScroll}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
            >
              {chapters.map(ch => {
                const isSelected = selected.has(ch);
                return (
                  <TouchableOpacity
                    key={ch}
                    style={[styles.chapterBtn, isSelected && styles.chapterBtnSelected]}
                    activeOpacity={0.7}
                    onPress={() => toggleChapter(ch)}
                  >
                    <Text style={[styles.chapterText, isSelected && styles.chapterTextSelected]}>
                      {ch}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
    </Modal>
  );
}

const BTN_SIZE = 46; // 컴포넌트 전용: 장 선택 버튼 고정 크기

const styles = StyleSheet.create({
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
