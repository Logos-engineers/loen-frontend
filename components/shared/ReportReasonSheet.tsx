/**
 * ReportReasonSheet — 신고 사유 선택 바텀시트 (재사용).
 * 인증글/댓글 등 UGC 신고 흐름에서 공통으로 쓴다.
 */
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { REPORT_REASONS } from '@/utils/moderation';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (reason: string) => void;
}

export function ReportReasonSheet({ visible, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>신고 사유를 선택해주세요</Text>
          {REPORT_REASONS.map((reason, i) => (
            <TouchableOpacity
              key={reason}
              style={[styles.option, i === REPORT_REASONS.length - 1 && styles.optionLast]}
              onPress={() => {
                onClose();
                onSelect(reason);
              }}
            >
              <Text style={styles.optionText}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.default,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl,
  },
  handle: {
    width: spacing.xxl + spacing.sm,
    height: spacing.xs,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing.smmd,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  option: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
});
