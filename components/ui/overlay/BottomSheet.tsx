/**
 * components/ui/overlay/BottomSheet.tsx
 * 하단 슬라이드 바텀시트 (선언형).
 * Figma dim screen > overlay/bottom sheet:
 *   딤 overlay.heavy + 하단 카드(L/R/bottom 16, radius.lg, 흰 배경) + handle + 제목 + 내용 + footer.
 */

import Handle from '@/components/ui/overlay/Handle';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import React, { ReactNode } from 'react';
import { Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
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
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={dismissOnBackdrop ? onClose : undefined}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.sheet, { marginBottom: Math.max(insets.bottom, spacing.md) }]}>
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
        </View>
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
