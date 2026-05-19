import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import {
  AnalyzeResult,
  ObsAdminQuiz,
  publishObsContent,
  saveObsContent,
} from '@/hooks/useObsAdmin';

export default function ObsAdminReviewScreen() {
  const params = useLocalSearchParams<{
    result?: string;       // JSON-stringified AnalyzeResult (new upload flow)
    existingId?: string;   // existing content id (list flow)
    title?: string;
    verse?: string;
    publishedDate?: string;
    isPublished?: string;
  }>();

  const isExisting = !!params.existingId;
  const existingId = params.existingId ? Number(params.existingId) : null;

  // Parse AI result if coming from upload flow
  const parsed: AnalyzeResult | null = params.result ? JSON.parse(params.result) : null;

  const [title, setTitle] = useState(params.title ?? '');
  const [verse, setVerse] = useState(params.verse ?? '');
  const [quizzes, setQuizzes] = useState<ObsAdminQuiz[]>(parsed?.quizzes ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showIosPicker, setShowIosPicker] = useState(false);

  const parseInitialDate = (s?: string): Date => {
    if (!s) return new Date();
    const normalized = s.replace(/\./g, '-').replace(/\//g, '-');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? new Date() : d;
  };
  const [selectedDate, setSelectedDate] = useState<Date>(parseInitialDate(params.publishedDate));

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      const { DateTimePickerAndroid } = require('@react-native-community/datetimepicker');
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        onChange: (_: any, date?: Date) => { if (date) setSelectedDate(date); },
      });
    } else {
      setShowIosPicker(true);
    }
  };

  const updateQuiz = (index: number, field: keyof ObsAdminQuiz, value: string) => {
    setQuizzes((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const handleSave = async () => {
    if (!title.trim() || !verse.trim()) {
      Alert.alert('입력 오류', '제목과 말씀을 모두 입력해주세요.');
      return;
    }
    setIsSaving(true);
    try {
      await saveObsContent({
        title,
        biblePassage: verse,
        publishedDate: formatDate(selectedDate),
        sections: parsed?.sections ?? [],
        summary: parsed?.summary ?? [],
        quizzes,
      });
      Alert.alert('저장 완료', '저장되었습니다.', [
        { text: '확인', onPress: () => router.replace('/obs/admin') },
      ]);
    } catch (e: any) {
      Alert.alert('저장 실패', e?.message ?? '다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!existingId) return;
    Alert.alert('발행 확인', '이 OBS 자료를 발행하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '발행',
        onPress: async () => {
          setIsPublishing(true);
          try {
            await publishObsContent(existingId);
            Alert.alert('발행 완료', '발행되었습니다.', [
              { text: '확인', onPress: () => router.replace('/obs/admin') },
            ]);
          } catch (e: any) {
            Alert.alert('발행 실패', e?.message ?? '다시 시도해주세요.');
          } finally {
            setIsPublishing(false);
          }
        },
      },
    ]);
  };

  const handlePreview = () => {
    if (!title.trim() || !verse.trim()) {
      Alert.alert('입력 오류', '미리보기 전 제목과 말씀을 입력해주세요.');
      return;
    }
    if (!existingId) {
      Alert.alert('안내', '저장 후 미리보기를 이용해주세요.');
      return;
    }
    router.push({
      pathname: '/obs/intro',
      params: { contentId: String(existingId), title, verse, preview: 'true' },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isExisting ? 'OBS 상세' : '검수 및 편집'}</Text>
          <TouchableOpacity style={styles.previewBtn} onPress={handlePreview}>
            <Ionicons name="play-circle-outline" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* 기본 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>제목</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="OBS 제목"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>말씀 범위</Text>
              <TextInput
                style={styles.input}
                value={verse}
                onChangeText={setVerse}
                placeholder="예) 고린도후서 12:9"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>발행일</Text>
              <TouchableOpacity style={styles.dateInput} onPress={openDatePicker} activeOpacity={0.7}>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                <Text style={styles.dateIcon}>📅</Text>
              </TouchableOpacity>
            </View>

            {/* iOS date picker modal */}
            {Platform.OS === 'ios' && (
              <Modal transparent animationType="slide" visible={showIosPicker}>
                <View style={styles.iosPickerOverlay}>
                  <View style={styles.iosPickerContainer}>
                    <TouchableOpacity style={styles.iosPickerDone} onPress={() => setShowIosPicker(false)}>
                      <Text style={styles.iosPickerDoneText}>완료</Text>
                    </TouchableOpacity>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={(_, date) => { if (date) setSelectedDate(date); }}
                      locale="ko-KR"
                    />
                  </View>
                </View>
              </Modal>
            )}
          </View>

          {/* 퀴즈 편집 */}
          {quizzes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>퀴즈</Text>
              {quizzes.map((quiz, index) => (
                <View key={index} style={styles.quizCard}>
                  <Text style={styles.quizType}>{quiz.questionType} · 문제 {quiz.stepNumber}</Text>

                  <Text style={styles.label}>문제</Text>
                  <TextInput
                    style={[styles.input, styles.inputMulti]}
                    value={quiz.questionText}
                    onChangeText={(v) => updateQuiz(index, 'questionText', v)}
                    multiline
                    placeholderTextColor={colors.text.secondary}
                  />

                  {quiz.correctAnswer !== null && (
                    <>
                      <Text style={styles.label}>정답</Text>
                      <TextInput
                        style={styles.input}
                        value={quiz.correctAnswer ?? ''}
                        onChangeText={(v) => updateQuiz(index, 'correctAnswer', v)}
                        placeholderTextColor={colors.text.secondary}
                      />
                    </>
                  )}

                  {quiz.explanation !== undefined && (
                    <>
                      <Text style={styles.label}>해설</Text>
                      <TextInput
                        style={[styles.input, styles.inputMulti]}
                        value={quiz.explanation ?? ''}
                        onChangeText={(v) => updateQuiz(index, 'explanation', v)}
                        multiline
                        placeholderTextColor={colors.text.secondary}
                      />
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.bottom}>
          {isExisting && params.isPublished !== 'true' && (
            <TouchableOpacity
              style={[styles.publishBtn, isPublishing && styles.btnDisabled]}
              activeOpacity={0.85}
              onPress={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.btnText}>발행하기</Text>
              )}
            </TouchableOpacity>
          )}

          {!isExisting && (
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.btnDisabled]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.btnText}>저장</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.base },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 32 },
  headerTitle: { flex: 1, fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, textAlign: 'center' },
  previewBtn: { width: 32, alignItems: 'flex-end' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md, paddingBottom: 120 },
  section: {
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: 4 },
  fieldGroup: { gap: 6 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.secondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.base,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.background.base,
  },
  dateText: { fontSize: fontSize.base, color: colors.text.primary },
  dateIcon: { fontSize: 18 },
  iosPickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iosPickerContainer: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  iosPickerDone: { alignItems: 'flex-end', paddingHorizontal: 20, paddingVertical: 12 },
  iosPickerDoneText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.primary },
  quizCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 8,
  },
  quizType: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary, marginBottom: 4 },
  bottom: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
});
