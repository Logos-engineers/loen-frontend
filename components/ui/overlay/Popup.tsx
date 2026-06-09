/**
 * components/ui/overlay/Popup.tsx
 * 중앙 다이얼로그 팝업 (선언형).
 * Figma dim screen > overlay/modal:
 *   딤 overlay.heavy + 세로 중앙 카드(L/R 16, radius.lg, 흰 배경) + 제목 + 설명 + CTA 버튼.
 */

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import React, { ReactNode } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type PopupButton = {
  label: string;
  onPress: () => void;
  /** primary=보라 배경/흰 텍스트, secondary=연보라 배경/보라 텍스트 (기본 primary) */
  variant?: 'primary' | 'secondary';
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  /** 본문 커스텀 영역(제목/설명 대신 또는 함께) */
  children?: ReactNode;
  /** 하단 버튼들 (1~2개). 비우면 버튼 없음 */
  buttons?: PopupButton[];
  /** 딤 영역 터치로 닫기 (기본 false — 팝업은 명시적 선택 유도) */
  dismissOnBackdrop?: boolean;
};

export default function Popup({
  visible,
  onClose,
  title,
  description,
  children,
  buttons,
  dismissOnBackdrop = false,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={dismissOnBackdrop ? onClose : undefined}
      >
        <TouchableOpacity activeOpacity={1} style={styles.dialog}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!description && <Text style={styles.description}>{description}</Text>}
          {children}

          {!!buttons?.length && (
            <View style={styles.btnRow}>
              {buttons.map((b, i) => {
                const secondary = b.variant === 'secondary';
                return (
                  <TouchableOpacity
                    key={`${b.label}-${i}`}
                    style={[styles.btn, secondary ? styles.btnSecondary : styles.btnPrimary]}
                    activeOpacity={0.8}
                    onPress={b.onPress}
                  >
                    <Text style={[styles.btnText, secondary ? styles.btnTextSecondary : styles.btnTextPrimary]}>
                      {b.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.heavy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  dialog: {
    width: '100%',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  description: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  btn: { flex: 1, height: 49, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnSecondary: { backgroundColor: colors.primaryLight },
  btnText: { fontSize: fontSize.heading, fontWeight: fontWeight.semibold },
  btnTextPrimary: { color: colors.white },
  btnTextSecondary: { color: colors.primary },
});
