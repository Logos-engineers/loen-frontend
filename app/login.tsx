import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/ui/text-field';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/utils/apiClient';
import { emailLogin } from '@/utils/authApi';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setTokens } = useAuthStore();

  const persistTokens = async (data: { accessToken: string; refreshToken: string; isNewUser: boolean }) => {
    await setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isNewUser: data.isNewUser,
    });
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const data = await emailLogin(email.trim(), password);
      await persistTokens(data);
    } catch (e: any) {
      // 미인증 계정 → 인증 화면으로 유도
      if (e?.status === 401 && typeof e.message === 'string' && e.message.includes('인증')) {
        Alert.alert('이메일 인증 필요', '가입 시 받은 코드로 인증을 완료해주세요.', [
          { text: '인증하기', onPress: () => router.push({ pathname: '/verify-email', params: { email: email.trim() } }) },
          { text: '취소', style: 'cancel' },
        ]);
        return;
      }
      Alert.alert('로그인 실패', e.message ?? '서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

      const data = await apiClient<{ accessToken: string; refreshToken: string; isNewUser: boolean }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ idToken }) }
      );
      await persistTokens(data);
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
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoArea}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.appName}>Loen</Text>
            <Text style={styles.tagline}>말씀과 함께하는 신앙 여정</Text>
          </View>

          <View style={styles.formArea}>
            <TextField
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="이메일"
            />
            <TextField
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="비밀번호"
            />
            <Pressable
              style={({ pressed }) => [styles.primaryButton, (pressed || loading) && styles.pressed]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.primaryButtonText}>로그인</Text>}
            </Pressable>

            <View style={styles.linkRow}>
              <Pressable onPress={() => router.push('/signup')} hitSlop={8}>
                <Text style={styles.link}>회원가입</Text>
              </Pressable>
              <Text style={styles.linkDivider}>·</Text>
              <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8}>
                <Text style={styles.link}>비밀번호 찾기</Text>
              </Pressable>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [styles.googleButton, (pressed || loading) && styles.pressed]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Text style={styles.googleButtonText}>Google로 계속하기</Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  logoArea: { alignItems: 'center', gap: spacing.sm },
  logo: { width: 72, height: 72, borderRadius: radius.lg, marginBottom: spacing.sm },
  appName: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.primary, letterSpacing: -0.5 },
  tagline: { fontSize: fontSize.md, color: colors.text.secondary, marginTop: spacing.xs },
  formArea: { gap: spacing.sm },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: spacing.xs,
  },
  primaryButtonText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  link: { color: colors.text.secondary, fontSize: fontSize.sm },
  linkDivider: { color: colors.border, fontSize: fontSize.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.text.secondary, fontSize: fontSize.xs },
  googleButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.elevated,
  },
  googleButtonText: { color: colors.text.primary, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  devButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52,
    justifyContent: 'center',
  },
  devButtonText: { color: colors.text.secondary, fontSize: fontSize.sm },
  pressed: { opacity: 0.75 },
});
