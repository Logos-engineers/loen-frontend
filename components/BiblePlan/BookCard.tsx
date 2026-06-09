/**
 * BookCard.tsx — 성경 통독표 책별 카드
 * [2026-03-20] 디자인 시스템 토큰 리팩토링
 * [2026-06-02] Figma 6443-84905 싱크: 회색 제목 밴드 + 10열 라운드8 셀(24×24)
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BibleBook } from '@/constants/BibleMeta';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';

type Props = {
  book: BibleBook;
  readChapters: number[];
  onPress: () => void;
};

export default function BookCard({ book, readChapters, onPress }: Props) {
  const readSet = new Set(readChapters);
  const chapters = Array.from({ length: book.chapterCount }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* 책 제목 — 회색 밴드 (Figma: title 393x60, bg #F2F4F7, pad 16/8) */}
      <TouchableOpacity style={styles.titleBand} activeOpacity={0.8} onPress={onPress}>
        <Text style={styles.korName}>{book.korName}</Text>
        <Text style={styles.engName}>{book.engName}</Text>
      </TouchableOpacity>

      {/* 장 번호 그리드 — 한 행에 10개 */}
      <View style={styles.chapterGrid}>
        {chapters.map(ch => {
          const isRead = readSet.has(ch);
          return (
            <TouchableOpacity
              key={ch}
              style={styles.cellWrap}
              activeOpacity={0.7}
              onPress={onPress}
            >
              <View
                style={[
                  styles.cellBox,
                  isRead ? styles.cellBoxRead : styles.cellBoxUnread,
                ]}
              >
                <Text
                  style={[
                    styles.cellNum,
                    isRead ? styles.cellNumRead : styles.cellNumUnread,
                  ]}
                >
                  {ch}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma: book 프레임 — 흰 배경
  container: {
    backgroundColor: colors.background.elevated,
  },

  // Figma: 회색 제목 밴드 (#F2F4F7), pad L/R 16, T/B 8
  titleBand: {
    backgroundColor: colors.background.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  korName: {
    fontSize: fontSize.base,        // 16px
    fontWeight: fontWeight.bold,    // 700
    color: colors.text.primary,     // rgba(13,28,45,0.8)
  },
  engName: {
    fontSize: fontSize.sm,          // 12px
    fontWeight: fontWeight.medium,  // 500
    color: colors.text.secondary,   // rgba(13,28,45,0.5)
  },

  // Figma: total page — pad L/R 16, T 8, B 16, 10열 wrap
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  // 10열 고정 — 화면 폭에 무관하게 한 행에 10개
  cellWrap: {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,             // 행 간격 (Figma gap 4 → 위아래 2)
  },
  // Figma: count 24x24, radius 8
  cellBox: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,        // 8
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellBoxRead: {
    backgroundColor: colors.readingPlan.chapter.read,
  },
  cellBoxUnread: {
    backgroundColor: colors.readingPlan.chapter.unread,  // #F2F4F7
  },
  // Figma: #number 12/600
  cellNum: {
    fontSize: fontSize.sm,          // 12px
    fontWeight: fontWeight.semibold,
  },
  cellNumRead: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  cellNumUnread: {
    color: colors.readingPlan.chapter.unreadText,  // rgba(13,28,45,0.8)
  },
});
