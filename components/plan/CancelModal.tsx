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
          <Text style={styles.body}>
            지금까지 입력한 내용이 저장되지 않습니다. 그래도{'\n'}나가시겠어요?
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              activeOpacity={0.7}
              onPress={onKeepEditing}
            >
              <Text style={[styles.btnText, styles.btnTextSecondary]}>계속 작성하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              activeOpacity={0.85}
              onPress={onLeave}
            >
              <Text style={[styles.btnText, styles.btnTextPrimary]}>나가기</Text>
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
    display: 'none', // 제거됨
  },
  body: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
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
    backgroundColor: '#EBE9FF', // 연보라색
  },
  btnPrimary: {
    backgroundColor: colors.primary, // 진한 보라색
  },
  btnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  btnTextSecondary: {
    color: colors.primary, // 연보라색 위 진보라 텍스트
  },
  btnTextPrimary: {
    color: colors.white,
  },
});
