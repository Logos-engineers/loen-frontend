/**
 * components/plan/BibleSelectSheet.tsx
 * 성경책 선택 바텀시트 — 드래그 dismiss 지원.
 *
 * 구현:
 * - react-native-reanimated + react-native-gesture-handler 기반 draggable
 * - 내부 FlatList 스크롤과 시트 드래그 충돌 방지
 * - backdrop 터치 → 닫힘
 */

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { BIBLE_BOOKS } from '@/constants/BibleMeta';
import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureDetector, Gesture, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// ─── 상수 ─────────────────────────────────────────────────────────────
const SHEET_HEIGHT = 500;
const DRAG_THRESHOLD = 150;
const SPRING_CONFIG = { damping: 20, stiffness: 200 };

type Props = {
  visible: boolean;
  selectedCode: string | null;
  onSelect: (code: string) => void;
  onClose: () => void;
};

export default function BibleSelectSheet({ visible, selectedCode, onSelect, onClose }: Props) {
  const translateY = useSharedValue(0);
  const scrollY = useSharedValue(0);       // 내부 리스트 스크롤 위치

  // ── 드래그 제스처 ─────────────────────────────────────────────────
  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    // 리스트가 최상단일 때만 시트 드래그 활성화
    .onStart(() => {
      // OK
    })
    .onUpdate((e) => {
      // 리스트가 스크롤 중이면 무시
      if (scrollY.value > 0 && e.translationY < 0) return;
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > DRAG_THRESHOLD) {
        translateY.value = withSpring(SHEET_HEIGHT, SPRING_CONFIG, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = useCallback(() => {
    translateY.value = withSpring(SHEET_HEIGHT, SPRING_CONFIG, () => {
      runOnJS(onClose)();
    });
  }, [onClose, translateY]);

  // 모달 표시 시 translateY 초기화
  const handleShow = useCallback(() => {
    translateY.value = 0;
  }, [translateY]);

  // 선택만 하고 닫지는 않음
  const handleSelect = useCallback(
    (code: string) => {
      onSelect(code);
    },
    [onSelect]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onShow={handleShow}
    >
      {/* 배경 딤 */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      />

      {/* 시트 본체 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetAnimStyle]}>
          {/* 드래그 핸들 */}
          <View style={styles.handle} />

          {/* 헤더 */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>성경을 선택해주세요</Text>
          </View>

          {/* 리스트 */}
          <FlatList
            data={BIBLE_BOOKS}
            keyExtractor={(item) => item.code}
            style={styles.list}
            onScroll={(e) => {
              scrollY.value = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = item.code === selectedCode;
              return (
                <TouchableOpacity
                  style={[styles.bookRow, isSelected && styles.bookRowSelected]}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item.code)}
                >
                  <View style={styles.bookRowInner}>
                    <Text style={[styles.bookKor, isSelected && styles.bookKorSelected]}>
                      {item.korName}
                    </Text>
                  </View>
                  {isSelected && <View style={styles.checkDot} />}
                </TouchableOpacity>
              );
            }}
          />

          {/* 하단 CTA */}
          <View style={styles.sheetCta}>
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.85}
              onPress={handleClose}
            >
              <Text style={styles.ctaBtnText}>완료</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay.heavy,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  sheetHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  list: {
    flex: 1,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  bookRowSelected: {
    backgroundColor: colors.primaryLight,
  },
  bookRowInner: {
    flex: 1,
  },
  bookKor: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  bookKorSelected: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  sheetCta: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaBtn: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
