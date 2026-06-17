/**
 * app/feedback/write.tsx — 피드백 작성(버그/개선/기타 + 스크린샷 최대 5장).
 * 제출 시 앱/기기 정보를 본문 끝에 자동 첨부해 버그 재현을 돕는다(기존 bug-report 관례).
 */
import { overlay } from '@/components/ui/overlay';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { usePopup } from '@/components/shared/usePopup';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import {
  FEEDBACK_CATEGORY_LABEL,
  MAX_FEEDBACK_IMAGES,
  submitFeedback,
  type FeedbackCategory,
} from '@/utils/feedback';
import { launchImageLibrarySafe } from '@/utils/imagePicker';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
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

const CATEGORIES: FeedbackCategory[] = ['BUG', 'IMPROVEMENT', 'ETC'];

export default function FeedbackWriteScreen() {
  const [category, setCategory] = useState<FeedbackCategory>('BUG');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { info, node: popupNode } = usePopup();

  const appVersion = Constants.expoConfig?.version ?? '알 수 없음';
  const deviceMeta = `앱 버전 ${appVersion} · ${Platform.OS} ${Platform.Version}`;

  const pickImages = async () => {
    if (imageUris.length >= MAX_FEEDBACK_IMAGES) {
      overlay.toast(`스크린샷은 최대 ${MAX_FEEDBACK_IMAGES}장까지 첨부할 수 있어요`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      overlay.toast('사진 접근 권한이 필요해요');
      return;
    }
    const result = await launchImageLibrarySafe({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_FEEDBACK_IMAGES - imageUris.length,
      quality: 0.7,
    });
    if (result.canceled) return;
    const picked = result.assets.map((a) => a.uri);
    setImageUris((prev) => [...prev, ...picked].slice(0, MAX_FEEDBACK_IMAGES));
  };

  const removeImage = (uri: string) => {
    setImageUris((prev) => prev.filter((u) => u !== uri));
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      overlay.toast('제목을 입력해주세요');
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    const body = content.trim()
      ? `${content.trim()}\n\n──────────\n${deviceMeta}`
      : deviceMeta;

    try {
      await submitFeedback({ category, title: trimmedTitle, content: body, imageUris });
      // '확인'을 눌렀을 때만 목록으로 돌아간다(타이머로 자동 이탈하지 않음).
      info('피드백 접수 완료', '소중한 의견 감사합니다. 처리 상태는 피드백 목록에서 확인할 수 있어요.', () =>
        router.back(),
      );
    } catch (e: any) {
      info('전송 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>피드백 보내기</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>유형</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, category === c && styles.chipActive]}
                onPress={() => setCategory(c)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                  {FEEDBACK_CATEGORY_LABEL[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.field}>
            <TextField
              label="제목"
              placeholder="무엇에 대한 피드백인가요?"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              autoCapitalize="sentences"
            />
          </View>

          <Text style={styles.fieldLabel}>내용</Text>
          <TextInput
            style={styles.textArea}
            placeholder={
              category === 'BUG'
                ? '어떤 상황에서 발생했나요? 재현 순서를 적어주시면 큰 도움이 돼요.'
                : '자세한 내용을 적어주세요.'
            }
            placeholderTextColor={colors.text.secondary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>스크린샷 ({imageUris.length}/{MAX_FEEDBACK_IMAGES})</Text>
          <View style={styles.imageRow}>
            {imageUris.map((uri) => (
              <View key={uri} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(uri)} hitSlop={6}>
                  <Ionicons name="close" size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
            {imageUris.length < MAX_FEEDBACK_IMAGES ? (
              <TouchableOpacity style={styles.addImage} onPress={pickImages} activeOpacity={0.7}>
                <Ionicons name="camera-outline" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.metaNote}>{deviceMeta} 정보가 함께 전송돼요.</Text>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="보내기"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!title.trim()}
            style={styles.submitBtn}
          />
        </View>
      </KeyboardAvoidingView>

      {popupNode}
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
  scroll: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.secondary, marginTop: spacing.sm },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.secondary },
  chipTextActive: { color: colors.white },
  field: { marginTop: spacing.xs },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 140,
    fontSize: fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.elevated,
    lineHeight: fontSize.base * 1.5,
  },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumbWrap: { position: 'relative' },
  thumb: { width: 72, height: 72, borderRadius: radius.md },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(13,28,45,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImage: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.elevated,
  },
  metaNote: { fontSize: fontSize.xs, color: colors.text.dim, marginTop: spacing.sm },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  submitBtn: { width: '100%', paddingVertical: 14 },
});
