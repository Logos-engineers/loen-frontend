import { Popup } from '@/components/ui/overlay';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useAlarms } from '@/hooks/useAlarms';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/utils/apiClient';
import { googleSignOut } from '@/utils/googleAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NOTIFY_KEY = 'loen_notify_enabled';

export default function SettingsScreen() {
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const { requestPermission } = useAlarms();

  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFY_KEY).then((v) => setNotifyEnabled(v === 'true'));
  }, []);

  const handleToggleNotify = async (next: boolean) => {
    if (next) {
      const granted = await requestPermission();
      if (!granted) {
        setNotifyEnabled(false);
        await AsyncStorage.setItem(NOTIFY_KEY, 'false');
        return;
      }
    }
    setNotifyEnabled(next);
    await AsyncStorage.setItem(NOTIFY_KEY, String(next));
  };

  const handleLogout = async () => {
    setLogoutVisible(false);
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // 서버 로그아웃 실패해도 로컬 토큰은 제거
    }
    await googleSignOut();   // 구글 세션 해제 → 재로그인 시 계정 선택 화면 표시
    await clearTokens();
    // 루트 레이아웃이 isLoggedIn=false 를 감지해 /login 으로 이동
  };

  const handleWithdraw = async () => {
    setWithdrawVisible(false);
    try {
      await apiClient('/users/me', { method: 'DELETE' });
      await googleSignOut();   // 구글 세션 해제
      await clearTokens();
    } catch (e: any) {
      // 실패 시 팝업 닫고 알림은 토스트 대신 콘솔 (회원탈퇴 실패는 드묾)
      console.warn('[settings] 회원탈퇴 실패', e);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        {/* 알림 */}
        <View style={styles.group}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowLabel}>알림</Text>
            <Switch
              value={notifyEnabled}
              onValueChange={handleToggleNotify}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* 계정 */}
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => setLogoutVisible(true)}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowLabel}>로그아웃</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => setWithdrawVisible(true)}
          >
            <Ionicons name="trash-outline" size={22} color={colors.reaction.red} />
            <Text style={[styles.rowLabel, styles.danger]}>회원탈퇴</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 로그아웃 확인 */}
      <Popup
        visible={logoutVisible}
        onClose={() => setLogoutVisible(false)}
        title="로그아웃"
        description="정말 로그아웃 하시겠어요?"
        buttons={[
          { label: '취소', variant: 'secondary', onPress: () => setLogoutVisible(false) },
          { label: '로그아웃', onPress: handleLogout },
        ]}
      />

      {/* 회원탈퇴 확인 */}
      <Popup
        visible={withdrawVisible}
        onClose={() => setWithdrawVisible(false)}
        title="회원탈퇴"
        description="탈퇴 시 계정 정보가 삭제되며 복구할 수 없어요. 정말 탈퇴하시겠어요?"
        buttons={[
          { label: '취소', variant: 'secondary', onPress: () => setWithdrawVisible(false) },
          { label: '탈퇴하기', onPress: handleWithdraw },
        ]}
      />
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
  body: { padding: spacing.md, gap: spacing.md },
  group: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  rowLabel: { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  danger: { color: colors.reaction.red },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md },
});
