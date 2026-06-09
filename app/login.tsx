import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/utils/apiClient';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';

const IS_DEV = __DEV__;
const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';

// Expo Go에서는 네이티브 모듈 미지원 — 런타임에 조건부 로드
let GoogleSignin: any = null;
let isErrorWithCode: any = null;
let statusCodes: any = null;
if (!IS_EXPO_GO) {
  const pkg = require('@react-native-google-signin/google-signin');
  GoogleSignin = pkg.GoogleSignin;
  isErrorWithCode = pkg.isErrorWithCode;
  statusCodes = pkg.statusCodes;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
}

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { setTokens } = useAuthStore();

  const handleGoogleLogin = async () => {
    if (IS_EXPO_GO) {
      Alert.alert('알림', 'Google 로그인은 Development Build에서만 지원됩니다.\n[DEV] 버튼을 사용하세요.');
      return;
    }
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      const idToken = response.data?.idToken;
      if (!idToken) {
        Alert.alert('오류', 'id_token을 받지 못했습니다.');
        return;
      }

      await handleBackendLogin(idToken);
    } catch (e: any) {
      if (isErrorWithCode(e)) {
        if (e.code === statusCodes.SIGN_IN_CANCELLED) return;
        if (e.code === statusCodes.IN_PROGRESS) return;
        if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert('오류', 'Google Play Services를 사용할 수 없습니다.');
          return;
        }
      }
      Alert.alert('오류', e.message ?? 'Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackendLogin = async (idToken: string) => {
    try {
      const data = await apiClient<{ accessToken: string; refreshToken: string; isNewUser: boolean }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ idToken }),
        }
      );
      await setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isNewUser: data.isNewUser,
      });
    } catch (e: any) {
      Alert.alert('로그인 실패', e.message ?? '서버 오류가 발생했습니다.');
    }
  };

  const handleDevLogin = async () => {
    if (!IS_DEV) return;
    setLoading(true);
    try {
      const data = await apiClient<{ accessToken: string; refreshToken?: string }>(
        '/dev/token',
        { method: 'POST', body: JSON.stringify({ userId: 1, role: 'USER' }) }
      );
      await setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? 'dev-refresh',
        isNewUser: false,
      });
    } catch {
      Alert.alert('오류', '개발 토큰 발급 실패. 백엔드가 실행 중인지 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoArea}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.appName}>Loen</Text>
          <Text style={styles.tagline}>말씀과 함께하는 신앙 여정</Text>
        </View>

        <View style={styles.buttonArea}>
          <Pressable
            style={({ pressed }) => [styles.googleButton, (pressed || loading) && styles.pressed]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Text style={styles.googleButtonText}>Google로 시작하기</Text>
            }
          </Pressable>

          {(IS_DEV || IS_EXPO_GO) && (
            <Pressable
              style={({ pressed }) => [styles.devButton, pressed && styles.pressed]}
              onPress={handleDevLogin}
              disabled={loading}
            >
              <Text style={styles.devButtonText}>[DEV] 개발 토큰으로 로그인</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl * 2,
  },
  logoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  buttonArea: {
    gap: spacing.sm,
  },
  googleButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  googleButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  devButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52,
    justifyContent: 'center',
  },
  devButtonText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  pressed: {
    opacity: 0.75,
  },
});
