import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

// 단계: 0 닉네임 → 1 생일 → 2 오이코스 → 3 한줄소개(선택)
export default function ProfileSetupScreen() {
  const { completeProfileSetup } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState(0);
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

  // 새 필드가 나타나면 부드럽게 하단으로 스크롤
  const advanceTo = (next: number) => {
    setStep((s) => Math.max(s, next));
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  const handleNicknameNext = () => {
    if (!nickname.trim()) return;
    advanceTo(1);
  };

  const handlePickDate = (date: Date) => {
    setBirthday(date);
    advanceTo(2);
  };

  const handlePickOikos = (o: SelectableOikos) => {
    setSelectedOikos(o);
    setShowOikosModal(false);
    advanceTo(3);
  };

  const handleComplete = async () => {
    if (!nickname.trim() || !birthday || !selectedOikos) return;
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
      setSubmitted(true);
    } catch (e: any) {
      Alert.alert('오류', e.message || '프로필 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    completeProfileSetup();
    router.replace('/(tabs)');
  };

  // 가입 완료 — 환영 화면
  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.welcomeWrap}>
          <Text style={styles.welcomeEmoji}>🎉</Text>
          <Text style={styles.welcomeTitle}>환영합니다, {nickname.trim()}님!</Text>
          <Text style={styles.welcomeSub}>
            가입이 완료되었어요.{'\n'}이제 Loen과 함께 신앙의 걸음을 시작해요.
          </Text>
        </Animated.View>
        <View style={[styles.footer, styles.sidePad]}>
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

  // 하단 CTA: 닉네임 단계는 '다음', 마지막(한줄소개)까지 오면 '시작하기'. 중간 선택 단계는 선택 시 자동 진행.
  const showNextButton = step === 0;
  const showStartButton = step >= 3;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>반가워요 👋</Text>
            <Text style={styles.subtitle}>몇 가지만 알려주시면 바로 시작할 수 있어요.</Text>
          </View>

          <View style={styles.form}>
            {/* 1. 닉네임 (항상 노출) */}
            <View style={styles.field}>
              <Text style={styles.label}>닉네임</Text>
              <TextInput
                style={styles.input}
                placeholder="최대 10자 이내"
                placeholderTextColor={colors.text.dim}
                value={nickname}
                onChangeText={setNickname}
                maxLength={10}
                returnKeyType="next"
                onSubmitEditing={handleNicknameNext}
                autoFocus
              />
            </View>

            {/* 2. 생일 */}
            {step >= 1 && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.field}>
                <Text style={styles.label}>생일</Text>
                <Pressable style={styles.selectBox} onPress={() => setShowDatePicker(true)}>
                  <Text style={[styles.selectText, !birthday && styles.placeholder]}>
                    {birthday ? formatDate(birthday) : '생일을 선택하세요'}
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {/* 3. 오이코스 */}
            {step >= 2 && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.field}>
                <Text style={styles.label}>오이코스</Text>
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
              </Animated.View>
            )}

            {/* 4. 한줄소개 (선택) */}
            {step >= 3 && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.field}>
                <Text style={styles.label}>한 줄 소개 <Text style={styles.optional}>(선택)</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="나를 한 줄로 소개해보세요"
                  placeholderTextColor={colors.text.dim}
                  value={bio}
                  onChangeText={setBio}
                  maxLength={100}
                />
              </Animated.View>
            )}
          </View>
        </ScrollView>

        <View style={[styles.footer, styles.sidePad]}>
          {showStartButton ? (
            <Pressable
              style={({ pressed }) => [styles.button, (pressed || loading) && { opacity: 0.75 }]}
              onPress={handleComplete}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.buttonText}>시작하기</Text>}
            </Pressable>
          ) : showNextButton ? (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.75 },
                !nickname.trim() && styles.buttonDisabled,
              ]}
              onPress={handleNicknameNext}
              disabled={!nickname.trim()}
            >
              <Text style={styles.buttonText}>다음</Text>
            </Pressable>
          ) : (
            <Text style={styles.hint}>
              {step === 1 ? '생일을 선택해 주세요' : '오이코스를 선택해 주세요'}
            </Text>
          )}
        </View>

        {/* 생일 picker */}
        {showDatePicker && (
          <DateTimePicker
            value={birthday ?? new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(event, date) => {
              if (Platform.OS === 'android') setShowDatePicker(false);
              if (event.type === 'set' && date) handlePickDate(date);
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
                  <Pressable key={o.id} style={styles.modalItem} onPress={() => handlePickOikos(o)}>
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
  form: { flex: 1, gap: spacing.lg },
  field: { gap: spacing.sm },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.secondary, marginLeft: spacing.xs },
  optional: { color: colors.text.dim, fontWeight: fontWeight.regular },
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
  footer: { paddingTop: spacing.md, paddingBottom: spacing.sm, minHeight: 72, justifyContent: 'center' },
  sidePad: { paddingHorizontal: spacing.xl },
  hint: { textAlign: 'center', color: colors.text.secondary, fontSize: fontSize.sm },
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
  welcomeWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm },
  welcomeEmoji: { fontSize: 56, marginBottom: spacing.sm },
  welcomeTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'center' },
  welcomeSub: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, marginTop: spacing.xs },
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
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md },
  modalList: { flexGrow: 0 },
  modalItem: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalItemText: { fontSize: fontSize.base, color: colors.text.primary },
  modalItemSub: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
});
