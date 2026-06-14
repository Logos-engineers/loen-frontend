/**
 * app/mypage/bug-report.tsx — 버그 신고
 * 백엔드 문의 API가 없어, 입력 내용을 기기/앱 정보와 함께 메일(mailto)로 전송한다.
 */

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { overlay } from '@/components/ui/overlay';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 문의 수신 이메일 — 운영 이메일로 교체해서 사용
const SUPPORT_EMAIL = 'contact@loenstudio.dev';

export default function BugReportScreen() {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '알 수 없음';
  const deviceMeta = `앱 버전 ${appVersion} · ${Platform.OS} ${Platform.Version}`;

  const handleSend = async () => {
    const desc = text.trim();
    if (!desc) {
      overlay.toast('어떤 문제였는지 입력해주세요');
      return;
    }
    if (sending) return;
    setSending(true);

    const body = `${desc}\n\n\n──────────\n${deviceMeta}`;
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('[로엔] 버그 신고')}&body=${encodeURIComponent(body)}`;

    try {
      const ok = await Linking.canOpenURL(url);
      if (!ok) {
        overlay.toast(`메일 앱을 열 수 없어요. ${SUPPORT_EMAIL} 로 보내주세요`);
        return;
      }
      await Linking.openURL(url);
    } catch {
      overlay.toast(`메일 앱을 열 수 없어요. ${SUPPORT_EMAIL} 로 보내주세요`);
    } finally {
      setSending(false);
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>버그 신고</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.lead}>불편을 드려 죄송해요.</Text>
          <Text
            style={styles.sub}
            lineBreakStrategyIOS="hangul-word"
            textBreakStrategy="balanced"
          >
            무슨 문제가 있었는지 적어주시면 빠르게 확인할게요.
          </Text>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={'예) 통독표에서 다음 장으로 넘어갈 때 앱이 멈춰요.\n언제·어디서·어떻게 생겼는지 적어주세요.'}
            placeholderTextColor={colors.text.secondary}
            multiline
            textAlignVertical="top"
            lineBreakStrategyIOS="hangul-word"
            textBreakStrategy="balanced"
          />

          <View style={styles.metaRow}>
            <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
            <Text
              style={styles.metaText}
              lineBreakStrategyIOS="hangul-word"
              textBreakStrategy="balanced"
            >{`진단을 위해 ${deviceMeta} 정보가 함께 전송돼요.`}</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sendBtn, !hasText && styles.sendBtnDisabled]}
            activeOpacity={hasText ? 0.85 : 1}
            onPress={handleSend}
            disabled={!hasText || sending}
          >
            <Ionicons name="mail-outline" size={18} color={colors.white} />
            <Text style={styles.sendText}>{sending ? '여는 중…' : '메일로 보내기'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  flex: { flex: 1 },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.heading, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerSpacer: { width: 24 },

  body: { padding: spacing.md, gap: spacing.sm },
  lead: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  sub: { fontSize: fontSize.md, color: colors.text.secondary, lineHeight: 22, marginBottom: spacing.sm },
  input: {
    minHeight: 200,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: fontSize.base,
    lineHeight: 24,
    color: colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  metaText: { flex: 1, fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 18 },

  footer: { padding: spacing.md },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
