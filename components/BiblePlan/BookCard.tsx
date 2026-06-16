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
  // 지정 시 각 장 셀이 이 콜백을 장 번호와 함께 호출 (말씀노트 절 선택용). 없으면 onPress 폴백.
  onChapterPress?: (chapter: number) => void;
  // true면 10열을 화면 양끝(좌우 패딩 16)에 딱 맞춰 space-between 정렬 — 양 끝 셀이 화면 끝에서 16px.
  edgeToEdge?: boolean;
};

export default function BookCard({ book, readChapters, onPress, onChapterPress, edgeToEdge }: Props) {
  const readSet = new Set(readChapters);
  const chapters = Array.from({ length: book.chapterCount }, (_, i) => i + 1);

  const renderCell = (ch: number) => {
    const isRead = readSet.has(ch);
    return (
      <TouchableOpacity
        key={ch}
        style={[styles.cellWrap, edgeToEdge && styles.cellWrapEdge]}
        activeOpacity={0.7}
        onPress={() => (onChapterPress ? onChapterPress(ch) : onPress())}
      >
        <View style={[styles.cellBox, isRead ? styles.cellBoxRead : styles.cellBoxUnread]}>
          <Text style={[styles.cellNum, isRead ? styles.cellNumRead : styles.cellNumUnread]}>
            {ch}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 책 제목 — 회색 밴드 (Figma: title 393x60, bg #F2F4F7, pad 16/8) */}
      <TouchableOpacity style={styles.titleBand} activeOpacity={0.8} onPress={onPress}>
        <Text style={styles.korName}>{book.korName}</Text>
        <Text style={styles.engName}>{book.engName}</Text>
      </TouchableOpacity>

      {edgeToEdge ? (
        // 행 단위로 끊어 렌더 → 각 행을 space-between으로 양끝(16px)에 정렬.
        // 마지막 행은 빈 칸(spacer)으로 10개를 채워 좌측 정렬을 유지.
        <View style={styles.edgeGrid}>
          {Array.from({ length: Math.ceil(chapters.length / 10) }, (_, ri) => {
            const row = chapters.slice(ri * 10, ri * 10 + 10);
            const fillers = 10 - row.length;
            return (
              <View key={ri} style={styles.edgeRow}>
                {row.map(renderCell)}
                {fillers > 0 &&
                  Array.from({ length: fillers }, (_, i) => (
                    <View key={`s${i}`} style={styles.cellSpacer} />
                  ))}
              </View>
            );
          })}
        </View>
      ) : (
        // 장 번호 그리드 — 한 행에 10개 (통독표 기본)
        <View style={styles.chapterGrid}>{chapters.map(renderCell)}</View>
      )}
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
  // edgeToEdge: 양끝(16px) 정렬 그리드 — 세로 패딩만, 가로는 각 행이 담당
  edgeGrid: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  // 한 행 — 좌우 16, 10개를 space-between으로 끝까지 폄
  edgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  // 마지막 행 빈 칸 — 셀(24)과 같은 폭의 투명 spacer
  cellSpacer: {
    width: 24,
  },
  // 10열 고정 — 화면 폭에 무관하게 한 행에 10개
  cellWrap: {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,             // 행 간격 (Figma gap 4 → 위아래 2)
  },
  // edgeToEdge 모드 셀 — 박스 폭(24)에 고정 (space-between이 간격을 분배)
  cellWrapEdge: {
    width: 24,
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
