import { colors, fontSize, fontWeight } from '@/constants/tokens';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type FaithNoteTab = 'THANKS' | 'PRAYER' | 'WORD';

const TABS: { key: FaithNoteTab; label: string }[] = [
  { key: 'THANKS', label: '감사노트' },
  { key: 'PRAYER', label: '기도노트' },
  { key: 'WORD', label: '말씀노트' },
];

interface FaithNoteTabBarProps {
  selectedTab: FaithNoteTab;
  onSelectTab: (tab: FaithNoteTab) => void;
}

export function FaithNoteTabBar({ selectedTab, onSelectTab }: FaithNoteTabBarProps) {
  return (
    // Week selector 배경과 동일하게 base 배경 사용
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.key === selectedTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {/* Figma: 활성 탭 하단 인디케이터 바 — 2px, primary 색상 */}
            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.base,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: colors.background.base,
  },
  // Figma: 14px Medium, 비활성 = fg/basic/subtle
  tabLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  // Figma: 활성 탭 — fg/accent/default (#6561FF), SemiBold
  tabLabelActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  // Figma: 탭 하단 2px 인디케이터, primary 색상, absolute bottom
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
});
