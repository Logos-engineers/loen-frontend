import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
}

/** 인증 화면 공용 입력 필드 (라벨 + 에러 표시). */
export function TextField({ label, error, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.text.secondary}
        autoCapitalize="none"
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.secondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.elevated,
  },
  inputError: { borderColor: colors.reaction.red },
  error: { fontSize: fontSize.xs, color: colors.reaction.red },
});
