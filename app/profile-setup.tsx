import DateWheelPicker from '@/components/challenge/DateWheelPicker';
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

// 생일 선택 범위: 1940년부터 오늘까지. 기본값은 2000-01-01.
const BIRTHDAY_MIN = new Date(1940, 0, 1);
const BIRTHDAY_DEFAULT = new Date(2000, 0, 1);

// 단계: 0 닉네임 → 1 본명(선택) → 2 생일(선택) → 3 오이코스(선택) → 4 한줄소개(선택)
// 닉네임만 필수. 본명·생일은 App Store 심사(Guideline 4 / 5.1.1) 대응으로 건너뛰기 허용.
export default function ProfileSetupScreen() {
  const { completeProfileSetup } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [bio, setBio] = useState('');
  const [selectedOikos, setSelectedOikos] = useState<SelectableOikos | null>(null);

  const [oikosList, setOikosList] = useState<SelectableOikos[]>([]);
  const [oikosLoading, setOikosLoading] = useState(true);
  const [oikosError, setOikosError] = useState(false);
  const [showOikosModal, setShowOikosModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(BIRTHDAY_DEFAULT); // 휠 스크롤 중 임시값
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadOikos = () => {
    setOikosLoading(true);
    setOikosError(false);
    apiClient<SelectableOikos[]>('/oikos/list')
      .then(setOikosList)
      .catch(() => setOikosError(true))
      .finally(() => setOikosLoading(false));
  };
  useEffect(loadOikos, []);

  const advanceTo = (next: number) => {
    setStep((s) => Math.max(s, next));
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  const handleNicknameNext = () => {
    if (!nickname.trim()) return;
    advanceTo(1);
  };
  const handleNameNext = () => {
    // 본명은 선택 — 비워도 다음 단계로 진행
    advanceTo(2);
  };
  const handlePickDate = (date: Date) => {
    setBirthday(date);
    advanceTo(3);
  };
  const openDatePicker = () => {
    setPickerDate(birthday ?? BIRTHDAY_DEFAULT);
    setShowDatePicker(true);
  };
  const confirmDate = () => {
    setShowDatePicker(false);
    handlePickDate(pickerDate);
  };
  const handlePickOikos = (o: SelectableOikos) => {
    setSelectedOikos(o);
    setShowOikosModal(false);
    advanceTo(4);
  };

  const handleComplete = async () => {
    // 닉네임만 필수. 본명·생일·오이코스는 선택 — 미입력이어도 가입 완료 가능.
    if (!nickname.trim()) return;
    setLoading(true);
    try {
      await apiClient('/users/me/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim() || undefined,
          nickname: nickname.trim(),
          birthday: birthday ? formatDate(birthday) : undefined,
          oikosId: selectedOikos?.id || undefined,
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
              <Text style={styles.helper}>앱에서 보여질 이름이에요.</Text>
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

            {/* 2. 본명 */}
            {step >= 1 && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.field}>
                <Text style={styles.label}>이름 <Text style={styles.optional}>(선택)</Text></Text>
                <Text style={styles.helper}>실제 이름이에요. (오이코스 식별용 · 나중에 입력 가능)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="실명을 입력해주세요"
                  placeholderTextColor={colors.text.dim}
                  value={name}
                  onChangeText={setName}
                  maxLength={20}
                  returnKeyType="next"
                  onSubmitEditing={handleNameNext}
                />
              </Animated.View>
            )}

            {/* 3. 생일 */}
            {step >= 2 && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.field}>
                <Text style={styles.label}>생일 <Text style={styles.optional}>(선택)</Text></Text>
                <Pressable style={styles.selectBox} onPress={openDatePicker}>
                  <Text style={[styles.selectText, !birthday && styles.placeholder]}>
                    {birthday ? formatDate(birthday) : '생일을 선택하세요'}
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {/* 4. 오이코스 */}
            {step >= 3 && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.field}>
                <Text style={styles.label}>오이코스 <Text style={styles.optional}>(선택)</Text></Text>
                <Text style={styles.helper}>아직 모르면 건너뛰고 나중에 선택해도 돼요.</Text>
                {oikosError ? (
                  <Pressable style={[styles.selectBox, styles.retryBox]} onPress={loadOikos}>
                    <Text style={styles.retryText}>목록을 불러오지 못했어요. 다시 시도</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.selectBox}
                    onPress={() => (oikosList.length ? setShowOikosModal(true) : null)}
                    disabled={oikosLoading || oikosList.length === 0}
                  >
                    <Text style={[styles.selectText, !selectedOikos && styles.placeholder]}>
                      {oikosLoading
                        ? '불러오는 중...'
                        : oikosList.length === 0
                          ? '등록된 오이코스가 없어요'
                          : selectedOikos
                            ? oikosLabel(selectedOikos)
                            : '오이코스를 선택하세요'}
                    </Text>
                  </Pressable>
                )}
              </Animated.View>
            )}

            {/* 5. 한줄소개 (선택) */}
            {step >= 4 && (
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
          {step >= 4 ? (
            <Pressable
              style={({ pressed }) => [styles.button, (pressed || loading) && { opacity: 0.75 }]}
              onPress={handleComplete}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.buttonText}>시작하기</Text>}
            </Pressable>
          ) : step === 0 ? (
            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.75 }, !nickname.trim() && styles.buttonDisabled]}
              onPress={handleNicknameNext}
              disabled={!nickname.trim()}
            >
              <Text style={styles.buttonText}>다음</Text>
            </Pressable>
          ) : step === 1 ? (
            // 본명은 선택 — 비웠으면 '건너뛰기', 입력했으면 '다음'
            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.75 }]}
              onPress={handleNameNext}
            >
              <Text style={styles.buttonText}>{name.trim() ? '다음' : '건너뛰기'}</Text>
            </Pressable>
          ) : step === 2 ? (
            // 생일은 선택 — 안 골랐으면 '건너뛰기', 골랐으면 '다음'
            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.75 }]}
              onPress={() => advanceTo(3)}
            >
              <Text style={styles.buttonText}>{birthday ? '다음' : '건너뛰기'}</Text>
            </Pressable>
          ) : (
            // step 3: 오이코스는 선택 — 골랐으면 '다음', 안 골랐으면 '건너뛰기'
            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.75 }]}
              onPress={() => advanceTo(4)}
            >
              <Text style={styles.buttonText}>{selectedOikos ? '다음' : '건너뛰기'}</Text>
            </Pressable>
          )}
        </View>

        {/* 생일 picker — 우리 휠 캘린더 (바텀시트) */}
        <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
          {/* 백드롭(탭하면 닫힘)을 시트 '뒤' 별도 레이어로 분리한다.
              시트를 Pressable로 감싸면 iOS에서 휠 피커 ScrollView의 스크롤 제스처를 가로채 스크롤이 막힘. */}
          <View style={styles.modalBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDatePicker(false)} />
            <View style={[styles.modalSheet, styles.dateSheet]}>
              <Text style={styles.modalTitle}>생일 선택</Text>
              <View style={styles.wheelWrap}>
                <DateWheelPicker
                  value={pickerDate}
                  onChange={setPickerDate}
                  minimumDate={BIRTHDAY_MIN}
                  maximumDate={new Date()}
                />
              </View>
              <Pressable
                style={({ pressed }) => [styles.button, pressed && { opacity: 0.75 }]}
                onPress={confirmDate}
              >
                <Text style={styles.buttonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

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
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.xl, gap: spacing.xs },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary },
  subtitle: { fontSize: fontSize.md, color: colors.text.secondary, lineHeight: 22 },
  form: { flex: 1, gap: spacing.lg },
  field: { gap: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.secondary, marginLeft: spacing.xs },
  helper: { fontSize: fontSize.xs, color: colors.text.dim, marginLeft: spacing.xs, marginBottom: spacing.xs },
  optional: { color: colors.text.dim, fontWeight: fontWeight.regular },
  input: {
    backgroundColor: colors.background.elevated, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: fontSize.base, color: colors.text.primary, borderWidth: 1, borderColor: colors.border,
  },
  selectBox: {
    backgroundColor: colors.background.elevated, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, minHeight: 50,
    justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  retryBox: { borderColor: colors.reaction.red },
  retryText: { fontSize: fontSize.base, color: colors.reaction.red },
  selectText: { fontSize: fontSize.base, color: colors.text.primary },
  placeholder: { color: colors.text.dim },
  footer: { paddingTop: spacing.md, paddingBottom: spacing.sm, minHeight: 72, justifyContent: 'center' },
  sidePad: { paddingHorizontal: spacing.xl },
  hint: { textAlign: 'center', color: colors.text.secondary, fontSize: fontSize.sm },
  button: {
    backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md,
    alignItems: 'center', minHeight: 56, justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: colors.text.dim },
  buttonText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  welcomeWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm },
  welcomeEmoji: { fontSize: 56, marginBottom: spacing.sm },
  welcomeTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'center' },
  welcomeSub: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, marginTop: spacing.xs },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.background.base, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl, maxHeight: '70%',
  },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md },
  dateSheet: { backgroundColor: colors.white },
  wheelWrap: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.md },
  modalList: { flexGrow: 0 },
  modalItem: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalItemText: { fontSize: fontSize.base, color: colors.text.primary },
  modalItemSub: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
});
