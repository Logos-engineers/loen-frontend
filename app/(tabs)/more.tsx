import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { OIKOS_MANAGE_POSITIONS } from '@/hooks/useOikosManagement';
import { useProfile } from '@/hooks/useProfile';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useAuthStore } from '@/store/auth-store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const BASE_MENU_ITEMS: MenuItem[] = [
  { label: '마이페이지', icon: 'person-outline', onPress: () => router.push('/mypage') },
  { label: '공지사항', icon: 'notifications-outline', onPress: () => router.push('/notice') },
  { label: '피드백 보내기', icon: 'chatbubble-ellipses-outline', onPress: () => router.push('/feedback') },
];

export default function MoreScreen() {
  const role = useAuthStore((s) => s.role);
  const { profile, refetch } = useProfile();
  useRefetchOnFocus(refetch);

  // 오이코스 관리 접근 가능 직책(그룹장/리더/S리더/임원/코치/회장/부회장/서기)이거나 ADMIN이면 노출
  // (총무/회계/부원은 제외 — 권한 없음)
  const canManageOikos =
    role === 'ADMIN' || (!!profile?.position && OIKOS_MANAGE_POSITIONS.includes(profile.position));

  const MENU_ITEMS: MenuItem[] = [
    ...BASE_MENU_ITEMS,
    ...(canManageOikos
      ? [
          { label: '오이코스 관리', icon: 'people-outline' as keyof typeof Ionicons.glyphMap, onPress: () => router.push('/oikos/management') },
        ]
      : []),
    ...(role === 'ADMIN'
      ? [
          { label: 'OBS 관리', icon: 'settings-outline' as keyof typeof Ionicons.glyphMap, onPress: () => router.push('/obs/admin') },
          { label: '공지 등록', icon: 'megaphone-outline' as keyof typeof Ionicons.glyphMap, onPress: () => router.push('/notice/write') },
          { label: '배너 관리', icon: 'image-outline' as keyof typeof Ionicons.glyphMap, onPress: () => router.push('/banner/admin') },
          { label: '신고 관리', icon: 'flag-outline' as keyof typeof Ionicons.glyphMap, onPress: () => router.push('/admin/reports') },
          { label: '피드백 관리', icon: 'chatbubbles-outline' as keyof typeof Ionicons.glyphMap, onPress: () => router.push('/admin/feedback') },
        ]
      : []),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>더보기</Text>
      </View>
      <View style={styles.menuList}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuRow} activeOpacity={0.7} onPress={item.onPress}>
            <Ionicons name={item.icon} size={22} color={colors.text.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* 하단 탭바 위 흰색 페이드 — 홈 화면과 동일 */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', '#FFFFFF']}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
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
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 24,
  },
});
