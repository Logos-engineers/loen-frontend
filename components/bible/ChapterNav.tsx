/**
 * ChapterNav.tsx
 * Figma: "arrow button" (node 6570:61717)
 * - Absolute positioned at bottom of screen
 * - Left & Right pill arrow buttons (glassmorphism)
 * Note: Using rgba background instead of BlurView (expo-blur not installed)
 */
import LeftArrowIcon from '@/assets/icons/LeftArrow.svg';
import RightArrowIcon from '@/assets/icons/RightArrow.svg';
import CheckCircleIcon from '@/assets/icons/CheckCircle.svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ChapterNavProps = {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isChapterRead: boolean;
  onReadCheck: () => void;
  showReadCheck: boolean;
};

export function ChapterNav({ onPrev, onNext, hasPrev, hasNext, isChapterRead, onReadCheck, showReadCheck }: ChapterNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 18) + 16 },
      ]}
      pointerEvents="box-none"
    >
      {/* Left arrow */}
      <TouchableOpacity
        onPress={onPrev}
        disabled={!hasPrev}
        activeOpacity={0.8}
        style={[styles.arrowBtn, !hasPrev && styles.arrowDisabled]}
      >
        <View style={styles.arrowIcon}>
          <LeftArrowIcon width={30} height={30} />
        </View>
      </TouchableOpacity>

      {/* Center Read Check Button */}
      {showReadCheck ? (
        <TouchableOpacity
          onPress={onReadCheck}
          activeOpacity={0.8}
          style={[
            styles.readCheckBtn,
            isChapterRead ? styles.readCheckBtnActive : styles.readCheckBtnInactive
          ]}
        >
          <Text style={[
            styles.readCheckText,
            isChapterRead ? styles.readCheckTextActive : styles.readCheckTextInactive
          ]}>
            {isChapterRead ? '이미 읽은 장이에요' : '읽음 표시하고 다음장으로'}
          </Text>
          {isChapterRead ? (
            <Ionicons name="checkmark-circle" size={20} color={colors.correct} />
          ) : (
            <CheckCircleIcon width={20} height={20} color={colors.text.dim} />
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.readCheckPlaceholder} />
      )}

      {/* Right arrow */}
      <TouchableOpacity
        onPress={onNext}
        disabled={!hasNext}
        activeOpacity={0.8}
        style={[styles.arrowBtn, !hasNext && styles.arrowDisabled]}
      >
        <View style={styles.arrowIcon}>
          <RightArrowIcon width={30} height={30} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Figma: absolute bottom-0, px 16, pt 16, justify between
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    pointerEvents: 'box-none',
  },
  arrowBtn: {
    // 불투명 흰색 원형, 그림자 없음 (Figma — 플로팅 버튼 그림자 제거)
    backgroundColor: colors.white,
    borderRadius: 1248,
    padding: 5,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  arrowIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  readCheckPlaceholder: {
    width: 1, // 빈 공간일 때 좌우 화살표 간격 유지를 위한 최소 너비
  },
  readCheckBtnActive: {
    backgroundColor: '#384859', // 진한 남색
  },
  readCheckBtnInactive: {
    backgroundColor: colors.background.base, // 부드러운 밝은 회색
  },
  readCheckText: {
    fontSize: 15,
    fontWeight: '600',
  },
  readCheckTextActive: {
    color: colors.white,
  },
  readCheckTextInactive: {
    color: colors.text.primary, // 진한 회색 (dark gray) 토큰
  },
});
