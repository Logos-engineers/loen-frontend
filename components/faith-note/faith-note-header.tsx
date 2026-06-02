import { colors, fontSize, fontWeight } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FaithNoteHeaderProps {
  onWritePress?: () => void;  // 리스트 화면에서만 사용 (작성 플로우 진입)
}

export function FaithNoteHeader({ onWritePress }: FaithNoteHeaderProps) {
  const router = useRouter();

  return (
    // Figma top navigator: translucent fill with 46px navigation row
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
      </TouchableOpacity>

      {onWritePress ? (
        <TouchableOpacity
          onPress={onWritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.writeButton}
        >
          <Text style={styles.writeLabel}>노트 작성하기</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.writeButton}>
          <Text style={styles.writeLabel}>노트 작성하기</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 46,
    backgroundColor: 'rgba(242,244,247,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  writeButton: {
    minWidth: 100,
    alignItems: 'flex-end',
  },
  writeLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.accent,
  },
});
