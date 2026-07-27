import { Popup } from '@/components/ui/overlay';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { OIKOS_MANAGE_POSITIONS } from '@/hooks/useOikosManagement';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/utils/apiClient';
import { googleSignOut } from '@/utils/googleAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 개인정보처리방침/이용약관 — 저장소 루트 legal/ 의 정적 HTML(Vercel 호스팅).
// 소스/재배포 방법은 legal/README.md 참고.
const PRIVACY_POLICY_URL = 'https://legal-eight-eta.vercel.app/privacy.html';
const TERMS_URL = 'https://legal-eight-eta.vercel.app/terms.html';

export default function SettingsScreen() {
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const role = useAuthStore((s) => s.role);
  const { profile } = useProfile();

  // 오이코스 관리 접근 가능 직책 또는 ADMIN → '관리' 그룹 노출 (more.tsx와 동일 규칙)
  const canManageOikos =
    role === 'ADMIN' || (!!profile?.position && OIKOS_MANAGE_POSITIONS.includes(profile.position));

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);

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
        {/* 알림 — 전용 화면으로 진입(마스터+카테고리는 그 안에서). qa-bot#39 */}
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/mypage/notification-setting')}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowLabel}>알림</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* 관리 — 매니저/관리자 조건부 */}
        {canManageOikos && (
          <View style={styles.group}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => router.push('/oikos/management')}
            >
              <Ionicons name="people-outline" size={22} color={colors.text.primary} />
              <Text style={styles.rowLabel}>오이코스 관리</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
            </TouchableOpacity>

            {role === 'ADMIN' && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.row}
                  activeOpacity={0.7}
                  onPress={() => router.push('/admin' as never)}
                >
                  <Ionicons name="shield-outline" size={22} color={colors.text.primary} />
                  <Text style={styles.rowLabel}>관리자 메뉴</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* 의견 · 지원 */}
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/feedback')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowLabel}>피드백 보내기</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/mypage/bug-report')}
          >
            <Ionicons name="bug-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowLabel}>버그 신고</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/mypage/blocked-users')}
          >
            <Ionicons name="ban-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowLabel}>차단한 사용자</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* 정보 — 시스템 공지·약관·정책 */}
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/notice')}
          >
            <Ionicons name="megaphone-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowLabel}>공지사항</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          >
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowLabel}>개인정보처리방침</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(TERMS_URL)}
          >
            <Ionicons name="document-text-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowLabel}>이용약관</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* 개발 전용 — 온보딩 화면 미리보기 (프로덕션 빌드에선 숨김) */}
        {__DEV__ && (
          <View style={styles.group}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => router.push('/profile-setup')}
            >
              <Ionicons name="construct-outline" size={22} color={colors.text.secondary} />
              <Text style={styles.rowLabel}>[DEV] 온보딩 화면 보기</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* 계정 — 가장 하단 */}
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
