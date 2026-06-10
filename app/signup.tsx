import { TextField } from '@/components/ui/text-field';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { signupEmail } from '@/utils/authApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!EMAIL_RE.test(email)) {
      Alert.alert('알림', '올바른 이메일을 입력해주세요.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('알림', '비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await signupEmail(email.trim(), password);
      router.push({ pathname: '/verify-email', params: { email: email.trim() } });
    } catch (e: any) {
      Alert.alert('가입 실패', e.message ?? '잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>이메일로 가입</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <TextField
          label="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="you@example.com"
          autoFocus
        />
        <TextField
          label="비밀번호 (8자 이상)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="비밀번호"
        />
        <TextField
          label="비밀번호 확인"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="비밀번호 다시 입력"
        />

        <Pressable
          style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.buttonText}>가입하고 인증코드 받기</Text>}
        </Pressable>

        <Pressable onPress={() => router.replace('/login')} hitSlop={8}>
          <Text style={styles.link}>이미 계정이 있으신가요? 로그인</Text>
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
