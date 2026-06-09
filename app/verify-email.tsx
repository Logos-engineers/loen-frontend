import { TextField } from '@/components/ui/text-field';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useAuthStore } from '@/store/auth-store';
import { resendVerification, verifyEmail } from '@/utils/authApi';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { setTokens } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email) {
      Alert.alert('오류', '이메일 정보가 없습니다. 다시 가입해주세요.');
      return;
    }
    if (code.trim().length < 6) {
      Alert.alert('알림', '6자리 인증 코드를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyEmail(email, code.trim());
      // 인증 성공 → 토큰 저장. _layout이 isLoggedIn 변화를 감지해 온보딩/홈으로 라우팅한다.
      await setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isNewUser: data.isNewUser,
      });
    } catch (e: any) {
      Alert.alert('인증 실패', e.message ?? '코드를 다시 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await resendVerification(email);
      Alert.alert('알림', '인증 코드를 다시 보냈습니다.');
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '재발송에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>이메일 인증</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <Text style={styles.desc}>
          <Text style={styles.email}>{email}</Text> 으로{'\n'}보낸 6자리 인증 코드를 입력해주세요.
        </Text>

        <TextField
          label="인증 코드"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          placeholder="000000"
          maxLength={6}
          autoFocus
        />

        <Pressable
          style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.buttonText}>인증 완료</Text>}
        </Pressable>

        <Pressable onPress={handleResend} hitSlop={8}>
          <Text style={styles.link}>코드를 못 받으셨나요? 재발송</Text>
        </Pressable>
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
  },
  headerTitle: { fontSize: fontSize.heading, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerSpacer: { width: 24 },
  body: { padding: spacing.lg, gap: spacing.md },
  desc: { fontSize: fontSize.md, color: colors.text.secondary, lineHeight: 22, marginBottom: spacing.sm },
  email: { fontWeight: fontWeight.bold, color: colors.text.primary },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: spacing.sm,
  },
  buttonText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  link: { color: colors.text.secondary, fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.sm },
  pressed: { opacity: 0.75 },
});
