import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { colors } from '@/constants/tokens';

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomModal({ visible, onClose, children }: BottomModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={styles.container}>
            <View style={styles.handleWrapper}>
              <View style={styles.handle} />
            </View>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.heavy,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: colors.background.elevated,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  handleWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 80,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 10,
  },
});
