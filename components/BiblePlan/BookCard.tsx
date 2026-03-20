/**
 * BookCard.tsx — 성경 통독표 책별 카드
 * [2026-03-20] 디자인 시스템 토큰 리팩토링
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BibleBook } from '@/constants/BibleMeta';
import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';

type Props = {
  book: BibleBook;
  readChapters: number[];
  onPress: () => void;
};

export default function BookCard({ book, readChapters, onPress }: Props) {
  const readSet = new Set(readChapters);
  const chapters = Array.from({ length: book.chapterCount }, (_, i) => i + 1);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      {/* 책 제목 세로 스택 */}
      <View style={styles.titleBlock}>
        <Text style={styles.korName}>{book.korName}</Text>
        <Text style={styles.engName}>{book.engName}</Text>
      </View>

      {/* 장 번호 그리드 */}
      <View style={styles.chapterGrid}>
        {chapters.map(ch => {
          const isRead = readSet.has(ch);
          return (
            <View
              key={ch}
              style={[
                styles.chapterCircle,
                isRead ? styles.chapterCircleRead : styles.chapterCircleUnread,
              ]}
            >
              <Text
                style={[
                  styles.chapterNum,
                  isRead ? styles.chapterNumRead : styles.chapterNumUnread,
                ]}
              >
                {ch}
              </Text>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const CIRCLE_SIZE = 28; // 컴포넌트 전용 고정값 — 장 번호 원형 크기

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: 14,       // 일회성: 카드 수직 여백 세부조정
    paddingBottom: 14,
  },

  // 세로 스택 타이틀
  titleBlock: {
    marginBottom: 10,     // 일회성: 제목↔그리드 간격 세부조정
    gap: 2,               // 일회성: 한글/영문명 줄간격 세부조정
  },
  korName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  engName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.text.secondary,
  },

  // 장 번호 그리드
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,               // 일회성: 원형 버튼 간격 세부조정
  },
  chapterCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterCircleRead: {
    backgroundColor: colors.readingPlan.chapter.read,    // 신규 시멘틱 토큰
  },
  chapterCircleUnread: {
    backgroundColor: colors.readingPlan.chapter.unread,  // 신규 시멘틱 토큰
  },
  chapterNum: {
    fontSize: fontSize.micro,   // 10px — fontSize.micro
    fontWeight: fontWeight.medium,
  },
  chapterNumRead: {
    color: colors.white,        // colors.white (신규 토큰)
    fontWeight: fontWeight.bold,
  },
  chapterNumUnread: {
    color: colors.readingPlan.chapter.unreadText, // 신규 시멘틱 토큰
  },
});
