/**
 * BibleHeader.tsx
 * Figma: top navigator (glassmorphism)
 * - Back button (chevron-left)
 * - Center: "Book N장" title + 역본 tag (static)
 * - Right: search icon
 * Note: Using rgba background instead of BlurView (expo-blur not installed)
 */
import SearchIcon from '@/assets/icons/search.svg';
import ChevronLeftIcon from '@/assets/icons/back.svg';
import { colors, shadow } from '@/constants/tokens';
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
            <Text style={styles.versionText}>개역개정</Text>
          </View>
          <TouchableOpacity onPress={onSearchPress} hitSlop={8} style={styles.iconBtn}>
            <SearchIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.72)',
    zIndex: 10,
    paddingBottom: 12,
    paddingHorizontal: 12,
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
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
