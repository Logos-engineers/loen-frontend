/**
 * components/plan/CancelModal.tsx
 * 목표 설정 취소 확인 모달.
 * 변경사항이 있을 때 뒤로가기 시 표시.
 */

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  onKeepEditing: () => void;
  onLeave: () => void;
};

export default function CancelModal({ visible, onKeepEditing, onLeave }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>변경사항이 있어요</Text>
          <Text style={styles.body}>
            저장하지 않고 나가면{'\n'}변경한 내용이 사라져요.
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              activeOpacity={0.7}
              onPress={onLeave}
            >
              <Text style={[styles.btnText, styles.btnTextSecondary]}>나가기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              activeOpacity={0.85}
              onPress={onKeepEditing}
            >
              <Text style={[styles.btnText, styles.btnTextPrimary]}>계속 편집</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.heavy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  dialog: {
    width: '100%',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondary: {
    backgroundColor: colors.background.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  btnTextSecondary: {
    color: colors.text.secondary,
  },
  btnTextPrimary: {
    color: colors.white,
  },
});
