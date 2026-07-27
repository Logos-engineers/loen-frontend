/**
 * app/admin/push-broadcast.tsx — 관리자 전체 푸시 보내기.
 * 제목·내용 작성 → 전체 사용자에게 푸시 공지 발송(POST /admin/notifications/broadcast).
 */
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { apiClient } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TITLE_MAX = 50;
const BODY_MAX = 200;

export default function PushBroadcastScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending;

  const handleSend = () => {
    if (!canSend) return;
    Alert.alert(
      '전체 발송',
      '모든 사용자에게 푸시 알림을 보낼까요?\n(공지 수신을 끈 사용자는 앱 알림함에만 표시됩니다)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '보내기',
          style: 'destructive',
          onPress: async () => {
            setSending(true);
            try {
              await apiClient('/admin/notifications/broadcast', {
                method: 'POST',
                body: JSON.stringify({ title: title.trim(), body: body.trim() }),
              });
              Alert.alert('발송 완료', '전체 사용자에게 푸시를 보냈어요.', [
                { text: '확인', onPress: () => router.back() },
              ]);
            } catch (e: any) {
              Alert.alert('발송 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
            } finally {
              setSending(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>푸시 보내기</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.notice}>
            전체 사용자에게 푸시 알림을 보냅니다. 신중히 작성해주세요.
          </Text>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>제목</Text>
              <Text style={styles.counter}>{title.length}/{TITLE_MAX}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="알림 제목"
              placeholderTextColor={colors.text.dim}
              value={title}
              onChangeText={setTitle}
              maxLength={TITLE_MAX}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>내용</Text>
              <Text style={styles.counter}>{body.length}/{BODY_MAX}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="알림 내용"
              placeholderTextColor={colors.text.dim}
              value={body}
              onChangeText={setBody}
              maxLength={BODY_MAX}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* 미리보기 */}
          <Text style={styles.previewLabel}>미리보기</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewIcon}>
              <Ionicons name="notifications" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle} numberOfLines={1}>{title.trim() || '알림 제목'}</Text>
              <Text style={styles.previewBody} numberOfLines={2}>{body.trim() || '알림 내용'}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>전체 발송</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  content: { padding: spacing.md, gap: spacing.lg },
  notice: { fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
  field: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.secondary },
  counter: { fontSize: fontSize.xs, color: colors.text.dim },
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
  textarea: { minHeight: 120 },
  previewLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.secondary },
  previewCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  previewIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  previewBody: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: colors.text.dim },
  sendButtonText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
