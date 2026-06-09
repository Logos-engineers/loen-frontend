import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/utils/apiClient';

type SelectableOikos = {
  id: string;
  name: string;
  leaderName: string | null;
  groupId: string | null;
  groupName: string | null;
};

function oikosLabel(o: SelectableOikos): string {
  return o.leaderName ? `${o.name} (리더:${o.leaderName})` : o.name;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ProfileSetupScreen() {
  const { completeProfileSetup } = useAuthStore();

  const [nickname, setNickname] = useState('');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [bio, setBio] = useState('');
  const [selectedOikos, setSelectedOikos] = useState<SelectableOikos | null>(null);

  const [oikosList, setOikosList] = useState<SelectableOikos[]>([]);
  const [oikosLoading, setOikosLoading] = useState(true);
  const [showOikosModal, setShowOikosModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    apiClient<SelectableOikos[]>('/oikos/list')
      .then(setOikosList)
      .catch(() => Alert.alert('오류', '오이코스 목록을 불러오지 못했습니다.'))
      .finally(() => setOikosLoading(false));
  }, []);

  const canSubmit = useMemo(
    () => !!nickname.trim() && !!birthday && !!selectedOikos && !loading,
    [nickname, birthday, selectedOikos, loading],
  );

  const handleComplete = async () => {
    if (!nickname.trim()) return Alert.alert('입력 필요', '닉네임을 입력해주세요.');
    if (!birthday) return Alert.alert('입력 필요', '생일을 선택해주세요.');
    if (!selectedOikos) return Alert.alert('입력 필요', '오이코스를 선택해주세요.');

    setLoading(true);
    try {
      await apiClient('/users/me/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          nickname: nickname.trim(),
          birthday: formatDate(birthday),
          oikosId: selectedOikos.id,
          bio: bio.trim() || undefined,
        }),
      });
      setSubmitted(true);   // 환영 화면으로 전환 (앱 진입은 '시작하기'에서)
    } catch (e: any) {
      Alert.alert('오류', e.message || '프로필 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    completeProfileSetup();   // isNewUser=false → 루트가 탭으로 이동
    router.replace('/(tabs)');
  };

  // 가입 완료 — 환영 화면
  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeWrap}>
          <Text style={styles.welcomeEmoji}>🎉</Text>
          <Text style={styles.welcomeTitle}>환영합니다, {nickname.trim()}님!</Text>
          <Text style={styles.welcomeSub}>
            가입이 완료되었어요.{'\n'}이제 Loen과 함께 신앙의 걸음을 시작해요.
          </Text>
        </View>
        <View style={[styles.footer, styles.welcomeFooter]}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.75 }]}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>시작하기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>프로필 설정</Text>
            <Text style={styles.subtitle}>Loen 시작 전, 기본 정보를 입력해 주세요.</Text>
          </View>

          <View style={styles.form}>
            {/* 닉네임 (필수) */}
            <Text style={styles.label}>닉네임 <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="최대 10자 이내"
              placeholderTextColor={colors.text.dim}
              value={nickname}
              onChangeText={setNickname}
              maxLength={10}
            />

            {/* 생일 (필수) */}
            <Text style={styles.label}>생일 <Text style={styles.req}>*</Text></Text>
            <Pressable style={styles.selectBox} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.selectText, !birthday && styles.placeholder]}>
                {birthday ? formatDate(birthday) : '생일을 선택하세요'}
              </Text>
            </Pressable>

            {/* 오이코스 (필수) */}
            <Text style={styles.label}>오이코스 <Text style={styles.req}>*</Text></Text>
            <Pressable
              style={styles.selectBox}
              onPress={() => (oikosList.length ? setShowOikosModal(true) : null)}
              disabled={oikosLoading}
            >
              <Text style={[styles.selectText, !selectedOikos && styles.placeholder]}>
                {oikosLoading
                  ? '불러오는 중...'
                  : selectedOikos
                    ? oikosLabel(selectedOikos)
                    : '오이코스를 선택하세요'}
              </Text>
            </Pressable>

            {/* 한줄소개 (선택) */}
            <Text style={styles.label}>한 줄 소개</Text>
            <TextInput
              style={styles.input}
              placeholder="선택 — 최대 100자"
              placeholderTextColor={colors.text.dim}
              value={bio}
              onChangeText={setBio}
              maxLength={100}
            />
          </View>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                (pressed || loading) && { opacity: 0.75 },
                !canSubmit && styles.buttonDisabled,
              ]}
              onPress={handleComplete}
              disabled={!canSubmit}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.buttonText}>Loen 시작하기</Text>}
            </Pressable>
          </View>
        </ScrollView>

        {/* 생일 picker */}
        {showDatePicker && (
          <DateTimePicker
            value={birthday ?? new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(event, date) => {
              if (Platform.OS === 'android') setShowDatePicker(false);
              if (event.type === 'set' && date) setBirthday(date);
            }}
          />
        )}

        {/* 오이코스 선택 모달 */}
        <Modal visible={showOikosModal} transparent animationType="slide" onRequestClose={() => setShowOikosModal(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowOikosModal(false)}>
            <Pressable style={styles.modalSheet}>
              <Text style={styles.modalTitle}>오이코스 선택</Text>
              <ScrollView style={styles.modalList}>
                {oikosList.map((o) => (
                  <Pressable
                    key={o.id}
                    style={styles.modalItem}
                    onPress={() => { setSelectedOikos(o); setShowOikosModal(false); }}
                  >
                    <Text style={styles.modalItemText}>{oikosLabel(o)}</Text>
                    {o.groupName ? <Text style={styles.modalItemSub}>{o.groupName}</Text> : null}
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
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
  header: { marginBottom: spacing.xl, gap: spacing.xs },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary },
  subtitle: { fontSize: fontSize.md, color: colors.text.secondary, lineHeight: 22 },
  form: { flex: 1, gap: spacing.sm },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    marginTop: spacing.sm,
  },
  req: { color: colors.primary },
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
  selectBox: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectText: { fontSize: fontSize.base, color: colors.text.primary },
  placeholder: { color: colors.text.dim },
  footer: { marginTop: spacing.xl },
  welcomeWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  welcomeEmoji: { fontSize: 56, marginBottom: spacing.sm },
  welcomeTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  welcomeFooter: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: colors.text.dim },
  buttonText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.background.base,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  modalList: { flexGrow: 0 },
  modalItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: { fontSize: fontSize.base, color: colors.text.primary },
  modalItemSub: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
});
