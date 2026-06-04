import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { uploadBannerImage, useAdminBanners, type Banner } from '@/hooks/useBanners';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BannerAdminScreen() {
  const { banners, isLoading, error, createBanner, setActive, deleteBanner } = useAdminBanners();
  const [busy, setBusy] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [subtitleInput, setSubtitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [linkInput, setLinkInput] = useState('');

  const resetForm = () => {
    setPendingImage(null);
    setTitleInput('');
    setSubtitleInput('');
    setContentInput('');
    setLinkInput('');
  };

  const handlePickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한을 허용해 주세요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [29, 10], // 배너 비율(≈2.9:1)
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setBusy(true);
    try {
      const url = await uploadBannerImage(result.assets[0].uri);
      resetForm();
      setPendingImage(url);
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '이미지 업로드에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!pendingImage) return;
    setBusy(true);
    try {
      await createBanner({
        imageUrl: pendingImage,
        title: titleInput,
        subtitle: subtitleInput,
        content: contentInput,
        linkUrl: linkInput,
      });
      resetForm();
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '배너 등록에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = (banner: Banner) => {
    Alert.alert('배너 삭제', '이 배너를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBanner(banner.id);
          } catch (e: any) {
            Alert.alert('오류', e?.message ?? '삭제하지 못했습니다.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Banner }) => (
    <View style={[styles.row, !item.active && styles.rowInactive]}>
      <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
      <View style={styles.rowInfo}>
        <Text style={styles.rowLink} numberOfLines={1}>
          {item.title || '(제목 없음)'}
        </Text>
        <Text style={styles.rowState}>{item.active ? '노출 중' : '숨김'}</Text>
      </View>
      <Switch
        value={item.active}
        onValueChange={(v) => setActive(item.id, v)}
        trackColor={{ true: colors.primary, false: colors.border }}
      />
      <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={8} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color={colors.text.dim} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>배너 관리</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={banners}
          keyExtractor={(b) => b.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.empty}>등록된 배너가 없어요.</Text>}
        />
      )}

      <TouchableOpacity style={styles.addBtn} onPress={handlePickAndUpload} activeOpacity={0.8}>
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.addBtnText}>배너 추가</Text>
      </TouchableOpacity>

      {/* 업로드한 이미지 + 텍스트 입력 → 등록 */}
      <Modal visible={pendingImage !== null} transparent animationType="fade" onRequestClose={resetForm}>
        <View style={styles.dialogBackdrop}>
          <ScrollView
            contentContainerStyle={styles.dialogScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.dialog}>
              <Text style={styles.dialogTitle}>새 배너 등록</Text>
              {pendingImage ? (
                <Image source={{ uri: pendingImage }} style={styles.preview} contentFit="cover" />
              ) : null}
              <TextInput
                style={styles.field}
                placeholder="제목 (홈 배너에 표시)"
                placeholderTextColor={colors.text.dim}
                value={titleInput}
                onChangeText={setTitleInput}
                maxLength={40}
              />
              <TextInput
                style={styles.field}
                placeholder="부제목 (홈 배너에 표시)"
                placeholderTextColor={colors.text.dim}
                value={subtitleInput}
                onChangeText={setSubtitleInput}
                maxLength={60}
              />
              <TextInput
                style={[styles.field, styles.fieldMultiline]}
                placeholder="세부 내용 (배너 탭 시 상세에 표시)"
                placeholderTextColor={colors.text.dim}
                value={contentInput}
                onChangeText={setContentInput}
                multiline
              />
              <TextInput
                style={styles.field}
                placeholder="외부 링크 URL (선택)"
                placeholderTextColor={colors.text.dim}
                value={linkInput}
                onChangeText={setLinkInput}
                autoCapitalize="none"
                keyboardType="url"
              />
              <View style={styles.dialogActions}>
                <TouchableOpacity style={styles.dialogBtn} onPress={resetForm}>
                  <Text style={styles.dialogBtnText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dialogBtn, styles.dialogBtnPrimary]} onPress={handleRegister}>
                  <Text style={[styles.dialogBtnText, styles.dialogBtnTextPrimary]}>등록</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {busy ? (
        <View style={styles.busyOverlay} pointerEvents="auto">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
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
  errorText: { textAlign: 'center', color: colors.text.secondary, padding: spacing.xl },
  listContent: { padding: spacing.md, gap: spacing.sm },
  empty: { textAlign: 'center', color: colors.text.dim, marginTop: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  rowInactive: { opacity: 0.5 },
  thumb: { width: 72, height: 28, borderRadius: radius.sm, backgroundColor: colors.border },
  rowInfo: { flex: 1, gap: 2 },
  rowLink: { fontSize: fontSize.sm, color: colors.text.primary },
  rowState: { fontSize: fontSize.xs, color: colors.text.secondary },
  deleteBtn: { paddingLeft: 4 },
  separator: { height: spacing.sm },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    margin: spacing.md,
    height: 48,
    borderRadius: radius.md,
  },
  addBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dialogScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  dialog: { backgroundColor: colors.background.base, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  dialogTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: 2 },
  preview: { width: '100%', aspectRatio: 361 / 124, borderRadius: radius.md, marginBottom: 2 },
  field: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  fieldMultiline: { minHeight: 80, textAlignVertical: 'top' },
  dialogActions: { flexDirection: 'row', gap: spacing.sm },
  dialogBtn: { flex: 1, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.elevated },
  dialogBtnPrimary: { backgroundColor: colors.primary },
  dialogBtnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.secondary },
  dialogBtnTextPrimary: { color: colors.white },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
