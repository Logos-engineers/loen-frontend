/**
 * components/ui/overlay/BottomSheet.tsx
 * 하단 슬라이드 바텀시트 (선언형).
 * Figma dim screen > overlay/bottom sheet:
 *   딤 overlay.heavy + 하단 카드(L/R/bottom 16, radius.lg, 흰 배경) + handle + 제목 + 내용 + footer.
 */

import Handle from '@/components/ui/overlay/Handle';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  /** 본문 영역 */
  children?: ReactNode;
  /** 하단 고정 영역(버튼 등) */
  footer?: ReactNode;
  /** 딤 영역 터치로 닫기 (기본 true) */
  dismissOnBackdrop?: boolean;
  /** children 좌우 기본 패딩 제거 (자체 패딩을 갖는 콘텐츠용) */
  disableContentPadding?: boolean;
  /**
   * 닫힘 애니메이션이 끝나 Modal이 완전히 사라진 뒤 호출된다.
   * 시트를 닫자마자 다른 Modal(Popup/Alert)을 열면 iOS/iPad에서 화면이 멈추므로,
   * 후속 Modal은 여기서 열어 두 Modal이 겹치지 않게 한다.
   */
  onClosed?: () => void;
};

export default function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  dismissOnBackdrop = true,
  disableContentPadding = false,
  onClosed,
}: Props) {
  const insets = useSafeAreaInsets();
  const [renderVisible, setRenderVisible] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(40)).current;
  const closingRef = useRef(false);
  const openedRef = useRef(false);
  // 닫힘 콜백은 항상 최신 참조를 쓰도록 ref에 보관(effect deps에 넣어 애니를 재트리거하지 않기 위함).
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;

  useEffect(() => {
    if (visible) {
      if (!renderVisible) {
        setRenderVisible(true);
        return;
      }
      if (openedRef.current) return;
      openedRef.current = true;
      closingRef.current = false;
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(40);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(sheetTranslateY, {
            toValue: 0,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
      return;
    }

    if (renderVisible && !closingRef.current) {
      openedRef.current = false;
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 40,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderVisible(false);
        onClosedRef.current?.();
      });
    }
  }, [backdropOpacity, renderVisible, sheetTranslateY, visible]);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    openedRef.current = false;
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 40,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRenderVisible(false);
      closingRef.current = false;
      onClose();
      onClosedRef.current?.();
    });
  };

  return (
    <Modal visible={renderVisible} transparent animationType="none" statusBarTranslucent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={dismissOnBackdrop ? handleClose : undefined}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              marginBottom: Math.max(insets.bottom, spacing.md),
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <Handle />
          {(title || subtitle) && (
            <View style={styles.header}>
              {!!title && <Text style={styles.title}>{title}</Text>}
              {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}
          {!!children && (
            <View style={disableContentPadding ? undefined : styles.content}>{children}</View>
          )}
          {!!footer && <View style={styles.footer}>{footer}</View>}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay.heavy },
  sheet: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    overflow: 'hidden',
    paddingBottom: spacing.md,
  },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  subtitle: { marginTop: spacing.xs, fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text.secondary },
  content: { paddingHorizontal: spacing.lg },
  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
});
