import { TextField } from '@/components/ui/text-field';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useCooldown } from '@/hooks/useCooldown';
import { requestPasswordReset, resetPassword } from '@/utils/authApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const resendCooldown = useCooldown(60);

  const handleRequest = async () => {
    if (resendCooldown.active) return;
    if (!EMAIL_RE.test(email)) {
      Alert.alert('알림', '올바른 이메일을 입력해주세요.');
      return;
    }
    setLoading(true);
    resendCooldown.start();
    try {
      await requestPasswordReset(email.trim());
      setStep(2);
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // step 2에서 코드 재발송 — 쿨다운으로 429를 사전 차단.
  const handleResend = async () => {
    if (resendCooldown.active) return;
    resendCooldown.start();
    try {
      await requestPasswordReset(email.trim());
      Alert.alert('알림', '재설정 코드를 다시 보냈습니다.');
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '재발송에 실패했습니다.');
    }
  };

  const handleReset = async () => {
    if (code.trim().length < 6) {
      Alert.alert('알림', '6자리 코드를 입력해주세요.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('알림', '새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      Alert.alert('완료', '비밀번호가 변경되었습니다. 다시 로그인해주세요.', [
        { text: '확인', onPress: () => router.replace('/login') },
      ]);
    } catch (e: any) {
      Alert.alert('실패', e.message ?? '코드를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => (step === 2 ? setStep(1) : router.back())} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>비밀번호 재설정</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        {step === 1 ? (
          <>
            <Text style={styles.desc}>가입한 이메일로 재설정 코드를 보내드립니다.</Text>
            <TextField
              label="이메일"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@example.com"
              autoFocus
            />
            <Pressable
              style={({ pressed }) => [styles.button, (pressed || loading || resendCooldown.active) && styles.pressed]}
              onPress={handleRequest}
              disabled={loading || resendCooldown.active}
            >
              {loading
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.buttonText}>
                    {resendCooldown.active ? `재발송 (${resendCooldown.remaining}초 후 가능)` : '재설정 코드 받기'}
                  </Text>}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.desc}>
              <Text style={styles.email}>{email}</Text> 으로 보낸 코드와{'\n'}새 비밀번호를 입력해주세요.
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
            <TextField
              label="새 비밀번호 (8자 이상)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="새 비밀번호"
            />
            <Pressable
              style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.buttonText}>비밀번호 변경</Text>}
            </Pressable>
            <Pressable onPress={handleResend} hitSlop={8} disabled={resendCooldown.active}>
              <Text style={[styles.resendLink, resendCooldown.active && styles.linkDisabled]}>
                {resendCooldown.active
                  ? `코드 재발송 (${resendCooldown.remaining}초 후 가능)`
                  : '코드를 못 받으셨나요? 재발송'}
              </Text>
            </Pressable>
          </>
        )}
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
  resendLink: { color: colors.text.secondary, fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.sm },
  linkDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
});
