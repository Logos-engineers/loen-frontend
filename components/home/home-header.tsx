import { BELL_SVG, LOGO_SVG } from '@/constants/icons';
import { colors } from '@/constants/tokens';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

export function HomeHeader() {
  return (
    // Figma: width:393, height:46, bg:#FFF, justifyContent:center, alignItems:center
    <View style={styles.container}>
      {/* 로고 — 42×25px, fill rgba(13,28,45,0.16) */}
      <SvgXml xml={LOGO_SVG} width={42} height={25} />

      {/* 벨 아이콘 — 24×24px */}
      <TouchableOpacity
        onPress={() => Alert.alert('알림')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <SvgXml xml={BELL_SVG} width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma: height:46, px:16, bg:#FFF, flex-row, justify:space-between, align:center
  container: {
    height: 46,
    backgroundColor: colors.background.elevated,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
