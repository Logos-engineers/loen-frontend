import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/utils/apiClient';

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export default function MoreScreen() {
  const { clearTokens } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await apiClient<UserProfile>('/users/me');
      setProfile(data);
    } catch {
      Alert.alert('오류', '프로필 조회에 실패했습니다.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient('/auth/logout', { method: 'POST' });
          } catch {
            // 서버 로그아웃 실패해도 로컬 토큰은 삭제
          }
          await clearTokens();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>더보기</Text>

        {profile ? (
          <View style={styles.profileCard}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={fetchProfile}
            disabled={loadingProfile}
          >
            {loadingProfile
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Text style={styles.buttonText}>내 정보 보기</Text>
            }
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base },
  inner: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.sm },
  profileCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  profileName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  profileEmail: { fontSize: fontSize.md, color: colors.text.secondary },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  logoutButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: { color: colors.text.secondary, fontSize: fontSize.md },
  pressed: { opacity: 0.75 },
});
