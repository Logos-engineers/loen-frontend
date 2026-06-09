import { overlay } from '@/components/ui/overlay';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Notice } from '@/hooks/useNotice';
import { apiClient } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TITLE_MAX = 255;

export default function NoticeWriteScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // 수정 모드: 기존 공지 불러와 프리필
  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    (async () => {
      try {
        const data = await apiClient<Notice>(`/notices/${id}`);
        if (mounted) {
          setTitle(data.title ?? '');
          setDescription(data.description ?? '');
        }
      } catch (e: any) {
        Alert.alert('오류', e?.message ?? '공지를 불러오지 못했습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('입력 필요', '제목을 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await apiClient(`/admin/notices/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
          }),
        });
        overlay.toast('공지를 수정했어요.');
      } else {
        await apiClient('/admin/notices', {
          method: 'POST',
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            sendNotification,
          }),
        });
        overlay.toast(sendNotification ? '공지를 등록하고 알림을 보냈어요.' : '공지를 등록했어요.');
      }
      router.back();
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? (isEdit ? '공지 수정에 실패했습니다.' : '공지 등록에 실패했습니다.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? '공지 수정' : '공지 등록'}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={saving || loading} hitSlop={8}>
          {saving ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.submitText}>{isEdit ? '저장' : '등록'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.field}>
              <Text style={styles.label}>제목</Text>
              <TextInput
                style={styles.input}
                placeholder="공지 제목"
                placeholderTextColor={colors.text.dim}
                value={title}
                onChangeText={setTitle}
                maxLength={TITLE_MAX}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>내용</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="공지 내용을 입력하세요."
                placeholderTextColor={colors.text.dim}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            {!isEdit ? (
              <View style={styles.toggleRow}>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleLabel}>전체 알림 발송</Text>
                  <Text style={styles.toggleHint}>등록 시 모든 사용자에게 알림/푸시를 보냅니다.</Text>
                </View>
                <Switch
                  value={sendNotification}
                  onValueChange={setSendNotification}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
  submitText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.primary },
  scroll: { padding: spacing.md, gap: spacing.lg },
  field: { gap: spacing.sm },
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
  inputMultiline: { minHeight: 160, textAlignVertical: 'top' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  toggleHint: { fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 16 },
});
