import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/legal';
import { colors, fontSize, radius, spacing } from '@/constants/tokens';

/** 이용약관/개인정보처리방침 인라인 링크 (부모 Text 안에 중첩 배치). */
function LegalLink({ label, url }: { label: string; url: string }) {
  return (
    <Text style={styles.link} onPress={() => Linking.openURL(url)}>
      {label}
    </Text>
  );
}

/**
 * 로그인 화면용 — 계속 진행 시 약관 동의로 간주하는 안내 문구.
 * 소셜/이메일 모든 로그인 버튼이 이 화면을 거치므로 여기에서 한 번에 노출한다.
 * (App Store Guideline 1.2 — 로그인 전 이용약관 노출 요건)
 */
export function TermsNotice() {
  return (
    <Text style={styles.notice}>
      계속 진행하면 <LegalLink label="이용약관" url={TERMS_URL} />과{' '}
      <LegalLink label="개인정보처리방침" url={PRIVACY_POLICY_URL} />에 동의하는 것으로 간주됩니다.
    </Text>
  );
}

/**
 * 이메일 가입 화면용 — 명시적 동의 체크박스(필수).
 * 미체크 시 가입 버튼을 비활성화해 등록 전 동의를 강제한다.
 */
export function TermsAgreementCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.checkRow} onPress={onToggle} hitSlop={6}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Ionicons name="checkmark" size={14} color={colors.white} />}
      </View>
      <Text style={styles.checkText}>
        <LegalLink label="이용약관" url={TERMS_URL} /> 및{' '}
        <LegalLink label="개인정보처리방침" url={PRIVACY_POLICY_URL} />에 동의합니다. (필수)
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.text.accent, textDecorationLine: 'underline' },
  notice: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: colors.text.dim,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkText: { flex: 1, fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
});
