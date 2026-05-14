import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/utils/apiClient';

export default function ProfileSetupScreen() {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const { completeProfileSetup } = useAuthStore();

  const handleComplete = async () => {
    if (!nickname.trim()) {
      Alert.alert('입력 필요', '닉네임을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 백엔드에 프로필 업데이트 요청
      await apiClient('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          nickname: nickname.trim(),
        }),
      });

      // 스토어 상태 업데이트 (isNewUser -> false)
      completeProfileSetup();
      
      // 메인 화면으로 이동
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('오류', e.message || '프로필 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>프로필 설정</Text>
            <Text style={styles.subtitle}>Loen에서 사용할 닉네임을 설정해 주세요.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder="최대 10자 이내"
              placeholderTextColor={colors.text.dim}
              value={nickname}
              onChangeText={setNickname}
              maxLength={10}
              autoFocus
            />
          </View>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.button, 
                (pressed || loading) && { opacity: 0.75 },
                !nickname.trim() && styles.buttonDisabled
              ]}
              onPress={handleComplete}
              disabled={loading || !nickname.trim()}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Loen 시작하기</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxl,
    gap: spacing.xs,
  },
  title: { 
    fontSize: fontSize.xxl, 
    fontWeight: fontWeight.bold, 
    color: colors.text.primary 
  },
  subtitle: { 
    fontSize: fontSize.md, 
    color: colors.text.secondary,
    lineHeight: 22,
  },
  form: {
    flex: 1,
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    marginTop: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.text.dim,
  },
  buttonText: { 
    color: colors.white, 
    fontSize: fontSize.base, 
    fontWeight: fontWeight.semibold 
  },
});
