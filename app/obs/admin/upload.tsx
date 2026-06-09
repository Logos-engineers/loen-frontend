import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { analyzeObs, uploadObsPdf } from '@/hooks/useObsAdmin';

type Step = 'select' | 'uploading' | 'analyzing';

export default function ObsAdminUploadScreen() {
  const [step, setStep] = useState<Step>('select');
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePickFile = async () => {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    setSelectedFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/pdf' });
  };

  const handleStart = async () => {
    if (!selectedFile) return;
    setError(null);

    try {
      setStep('uploading');
      const r2Key = await uploadObsPdf(selectedFile);

      setStep('analyzing');
      const analyzeResult = await analyzeObs(r2Key);

      router.replace({
        pathname: '/obs/admin/review',
        params: { result: JSON.stringify(analyzeResult) },
      });
    } catch (e: any) {
      setError(e?.message ?? '오류가 발생했습니다. 다시 시도해주세요.');
      setStep('select');
    }
  };

  const isProcessing = step === 'uploading' || step === 'analyzing';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isProcessing}>
            <Ionicons name="arrow-back" size={24} color={isProcessing ? colors.text.secondary : colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>OBS 자료 업로드</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.content}>
          {isProcessing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingTitle}>
                {step === 'uploading' ? 'PDF 업로드 중...' : 'AI 분석 중...'}
              </Text>
              <Text style={styles.loadingDesc}>
                {step === 'analyzing' ? '분석에 최대 1분 정도 소요될 수 있습니다.' : ''}
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.dropZone} onPress={handlePickFile} activeOpacity={0.7}>
                <Ionicons name="document-outline" size={48} color={selectedFile ? colors.primary : colors.text.secondary} />
                <Text style={[styles.dropZoneText, selectedFile && styles.dropZoneTextSelected]}>
                  {selectedFile ? selectedFile.name : 'PDF 파일을 선택해주세요'}
                </Text>
                {!selectedFile && (
                  <Text style={styles.dropZoneHint}>탭하여 파일 선택</Text>
                )}
              </TouchableOpacity>

              {selectedFile && (
                <TouchableOpacity style={styles.changeBtn} onPress={handlePickFile}>
                  <Text style={styles.changeBtnText}>파일 변경</Text>
                </TouchableOpacity>
              )}

              {error && <Text style={styles.errorText}>{error}</Text>}
            </>
          )}
        </View>

        {!isProcessing && (
          <View style={styles.bottom}>
            <TouchableOpacity
              style={[styles.startBtn, !selectedFile && styles.startBtnDisabled]}
              activeOpacity={0.85}
              disabled={!selectedFile}
              onPress={handleStart}
            >
              <Text style={styles.startBtnText}>분석 시작</Text>
            </TouchableOpacity>
          </View>
        )}
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
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  loadingBox: { alignItems: 'center', gap: spacing.md },
  loadingTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text.primary },
  loadingDesc: { fontSize: fontSize.sm, color: colors.text.secondary, textAlign: 'center' },
  dropZone: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.elevated,
  },
  dropZoneText: { fontSize: fontSize.base, color: colors.text.secondary, textAlign: 'center' },
  dropZoneTextSelected: { color: colors.text.primary, fontWeight: fontWeight.semibold },
  dropZoneHint: { fontSize: fontSize.sm, color: colors.text.secondary },
  changeBtn: { marginTop: spacing.md, alignSelf: 'center' },
  changeBtnText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },
  errorText: { marginTop: spacing.md, color: '#E53935', fontSize: fontSize.sm, textAlign: 'center' },
  bottom: { padding: spacing.md, paddingBottom: spacing.lg },
  startBtn: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnDisabled: { backgroundColor: colors.border },
  startBtnText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
});
