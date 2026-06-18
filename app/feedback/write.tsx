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
  updateFeedback,
  type FeedbackCategory,
} from '@/utils/feedback';
import { launchImageLibrarySafe } from '@/utils/imagePicker';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
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

const META_SEPARATOR = '──────────';

/** 저장된 content에서 자동 첨부된 기기정보 블록을 떼어내고 사용자 본문만 남긴다. */
function stripDeviceMeta(stored?: string): string {
  if (!stored) return '';
  const idx = stored.indexOf(META_SEPARATOR);
  if (idx === -1) return ''; // 본문 없이 기기정보만 저장됐던 경우
  return stored.slice(0, idx).trimEnd();
}

export default function FeedbackWriteScreen() {
  const params = useLocalSearchParams<{ id?: string; category?: string; title?: string; content?: string }>();
  const isEdit = !!params.id;
  const navigation = useNavigation();

  const [category, setCategory] = useState<FeedbackCategory>(
    (params.category as FeedbackCategory) ?? 'BUG',
  );
  const [title, setTitle] = useState(params.title ?? '');
  const [content, setContent] = useState(isEdit ? stripDeviceMeta(params.content) : '');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { info, confirm, node: popupNode } = usePopup();

  // 수정 모드: 초기값 대비 변경 여부 판정용. 작성 모드: 입력 자체가 있으면 dirty.
  const initialRef = useRef({
    category: (params.category as FeedbackCategory) ?? 'BUG',
    title: params.title ?? '',
    content: isEdit ? stripDeviceMeta(params.content) : '',
  });
  const allowLeaveRef = useRef(false);

  const appVersion = Constants.expoConfig?.version ?? '알 수 없음';
  const deviceMeta = `앱 버전 ${appVersion} · ${Platform.OS} ${Platform.Version}`;

  const isDirty = isEdit
    ? category !== initialRef.current.category ||
      title !== initialRef.current.title ||
      content !== initialRef.current.content
    : !!(title.trim() || content.trim() || imageUris.length);

  // 작성 중 이탈(헤더 뒤로/제스처/하드웨어 백) 시 내용 보존 확인.
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e: any) => {
      if (allowLeaveRef.current || !isDirty) return;
      e.preventDefault();
      confirm({
        title: '작성 중인 내용이 있어요',
        description: '나가면 작성한 내용이 사라져요.',
        confirmLabel: '나가기',
        onConfirm: () => {
          allowLeaveRef.current = true;
          navigation.dispatch(e.data.action);
        },
      });
    });
    return unsub;
  }, [navigation, confirm, isDirty]);

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
      ? `${content.trim()}\n\n${META_SEPARATOR}\n${deviceMeta}`
      : deviceMeta;

    try {
      if (isEdit) {
        await updateFeedback(params.id!, { category, title: trimmedTitle, content: body });
        info('수정 완료', '피드백이 수정됐어요.', () => {
          allowLeaveRef.current = true;
          router.back();
        });
      } else {
        await submitFeedback({ category, title: trimmedTitle, content: body, imageUris });
        // '확인'을 눌렀을 때만 목록으로 돌아간다(타이머로 자동 이탈하지 않음).
        info('피드백 접수 완료', '소중한 의견 감사합니다. 처리 상태는 피드백 목록에서 확인할 수 있어요.', () => {
          allowLeaveRef.current = true;
          router.back();
        });
      }
    } catch (e: any) {
      info(isEdit ? '수정 실패' : '전송 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? '피드백 수정' : '피드백 보내기'}</Text>
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

          {isEdit ? (
            <Text style={styles.metaNote}>첨부한 스크린샷은 수정 화면에서 변경할 수 없어요.</Text>
          ) : (
            <>
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
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={isEdit ? '수정 완료' : '보내기'}
            onPress={handleSubmit}
            loading={submitting}
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
