import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useAuthStore } from '@/store/auth-store';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AdminItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

// 관리자 전용 메뉴 허브 — 설정 › 관리 › 관리자 메뉴 에서 진입(ADMIN만).
const ADMIN_ITEMS: AdminItem[] = [
  { label: 'OBS 관리', icon: 'settings-outline', route: '/obs/admin' },
  { label: '공지 등록', icon: 'megaphone-outline', route: '/notice/write' },
  { label: '푸시 보내기', icon: 'paper-plane-outline', route: '/admin/push-broadcast' },
  { label: '배너 관리', icon: 'image-outline', route: '/banner/admin' },
  { label: '신고 관리', icon: 'flag-outline', route: '/admin/reports' },
  { label: '피드백 관리', icon: 'chatbubbles-outline', route: '/admin/feedback' },
];

export default function AdminHubScreen() {
  const role = useAuthStore((s) => s.role);

  // 비ADMIN 접근 차단(직접 딥링크 방어)
  if (role !== 'ADMIN') {
    return <Redirect href="/mypage/settings" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>관리자 메뉴</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.menuList}>
        {ADMIN_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => router.push(item.route as never)}
          >
            <Ionicons name={item.icon} size={22} color={colors.text.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.heading, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerSpacer: { width: 24 },
  menuList: { padding: spacing.md, gap: spacing.sm },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  menuLabel: { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
});
