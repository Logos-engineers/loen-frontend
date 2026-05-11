/**
 * ChapterNav.tsx
 * Figma: "arrow button" (node 6570:61717)
 * - Absolute positioned at bottom of screen
 * - Left & Right pill arrow buttons (glassmorphism)
 * Note: Using rgba background instead of BlurView (expo-blur not installed)
 */
import LeftArrowIcon from '@/assets/icons/LeftArrow.svg';
import RightArrowIcon from '@/assets/icons/RightArrow.svg';
import { shadow } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ChapterNavProps = {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
};

export function ChapterNav({ onPrev, onNext, hasPrev, hasNext }: ChapterNavProps) {
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
    // Figma: bg rgba(255,255,255,0.7), rounded-full, shadow, p 5
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 1248,
    padding: 5,
    shadowColor: shadow.color,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
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
});
