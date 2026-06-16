/**
 * BibleHeader.tsx
 * Figma: top navigator
 * - Back button (chevron-left)
 * - Center: "Book N장" title + 역본 tag (static)
 * - Right: search icon
 * 불투명 배경 + 하단 그라데이션 페이드(홈 헤더 패턴) — 스크롤 본문이 헤더 밑으로
 * 자연스럽게 사라지게. (반투명 글래스 대신)
 */
import SearchIcon from '@/assets/icons/search.svg';
import ChevronLeftIcon from '@/assets/icons/back.svg';
import { colors } from '@/constants/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BibleHeaderProps = {
  bookName: string;
  chapterNum: number;
  onSearchPress: () => void;
  onTitlePress: () => void;
};

export function BibleHeader({ bookName, chapterNum, onSearchPress, onTitlePress }: BibleHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.side}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <ChevronLeftIcon width={24} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.center} pointerEvents="box-none">
          <TouchableOpacity onPress={onTitlePress} activeOpacity={0.7} style={styles.titleButton}>
            <Text style={styles.title} numberOfLines={1}>
              {bookName} {chapterNum}장
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightGroup}>
          <View style={styles.versionTag}>
            <Text style={styles.versionText}>개역한글</Text>
          </View>
          <TouchableOpacity onPress={onSearchPress} hitSlop={8} style={styles.iconBtn}>
            <SearchIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 헤더 아래 흰색 페이드 — 스크롤 본문이 헤더 밑으로 자연스럽게 사라지게 (홈 헤더와 동일) */}
      <LinearGradient
        colors={['#FFFFFF', 'rgba(255,255,255,0)']}
        style={styles.fade}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    zIndex: 10,
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  // 헤더 바로 아래로 이어지는 흰색→투명 페이드 (full-bleed: 좌우 패딩 12 상쇄)
  fade: {
    position: 'absolute',
    left: -12,
    right: -12,
    bottom: -16,
    height: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  side: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 52,
    right: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  rightGroup: {
    width: 104,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 18 * 1.4,
    color: colors.text.primary,
  },
  versionTag: {
    backgroundColor: colors.background.base,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  versionText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.secondary,
  },
});
