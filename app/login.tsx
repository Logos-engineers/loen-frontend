import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/utils/apiClient';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';

WebBrowser.maybeCompleteAuthSession();

const IS_DEV = __DEV__;

// Google.useAuthRequest는 플랫폼별 Client ID가 없으면 훅 단계에서 throw해서
// AuthSession.useAuthRequest + Google.discovery로 직접 구현 — Web Client ID 하나로 동작
// Expo Go는 exp:// 스킴을 반환해 Google이 거부 → auth.expo.io 프록시 URI 직접 지정
const redirectUri = __DEV__
  ? (process.env.EXPO_PUBLIC_REDIRECT_URI ?? 'https://auth.expo.io/@namhyunseo/Loen-project')
  : AuthSession.makeRedirectUri();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { setTokens } = useAuthStore();

  // Google이 implicit flow(id_token 직접 반환)를 보안 정책으로 차단
  // → Authorization Code + PKCE 방식으로 전환 후 id_token 교환
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    Google.discovery,
  );

  useEffect(() => {
    if (!request) return;
    if (response?.type === 'error') {
      Alert.alert('오류', response.error?.message ?? 'Google 로그인 중 오류가 발생했습니다.');
      return;
    }
    if (response?.type !== 'success') return;

    const { code } = response.params;
    AuthSession.exchangeCodeAsync(
      {
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
        code,
        redirectUri,
        extraParams: { code_verifier: request.codeVerifier! },
      },
      Google.discovery,
    ).then(tokenResponse => {
      const idToken = tokenResponse.idToken;
      if (idToken) {
        handleBackendLogin(idToken);
      } else {
        Alert.alert('오류', 'id_token을 받지 못했습니다.');
      }
    }).catch((e: any) => {
      Alert.alert('오류', '토큰 교환 실패: ' + (e.message ?? ''));
    });
  }, [response]);

  const handleBackendLogin = async (idToken: string) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      Alert.alert('설정 필요', '.env에 EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID를 입력해주세요.');
      return;
    }
    promptAsync();
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
            disabled={loading || !request}
          >
            {loading
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Text style={styles.googleButtonText}>Google로 시작하기</Text>
            }
          </Pressable>

          {IS_DEV && (
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
