import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { colors, fontSize, fontWeight } from '@/constants/tokens';

const ARROW_BACK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.16"/></svg>`;

interface OBSHeaderProps {
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}

export function OBSHeader({ title, right, onBack }: OBSHeaderProps) {
  return (
    <View style={[styles.navBar, !!(title || right) && styles.navBarSpaced]}>
      <TouchableOpacity
        style={styles.backBtn}
        activeOpacity={0.8}
        onPress={onBack ?? (() => router.back())}
      >
        <SvgXml xml={ARROW_BACK_SVG} width={24} height={24} />
      </TouchableOpacity>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {right ?? (title ? <View style={styles.backBtn} /> : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navBarSpaced: {
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    paddingHorizontal: 8,
  },
});
