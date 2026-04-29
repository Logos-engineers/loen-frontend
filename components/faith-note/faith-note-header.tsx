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
    // Figma: height:44, bg:#FFF, px:16, flex-row, justify:space-between, align:center
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      {/* 우측: 노트 작성하기 — onWritePress가 있으면 터치 가능 */}
      {onWritePress ? (
        <TouchableOpacity
          onPress={onWritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.writeLabel}>노트 작성하기</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.writeLabel}>노트 작성하기</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma: height:44, px:16, bg:#FFFFFF
  container: {
    height: 44,
    backgroundColor: colors.background.elevated,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    // hitSlop으로 터치 영역 확보
  },
  // Figma: fg/accent/default = #6561FF, 14px Medium
  writeLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.accent,
  },
});
