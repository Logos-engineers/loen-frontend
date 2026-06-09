import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { uploadProfileImage, useProfile } from '@/hooks/useProfile';
import { overlay } from '@/components/ui/overlay';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BIO_MAX = 100;
const NICKNAME_MAX = 10;

export default function ProfileEditScreen() {
  const { profile, isLoading, updateProfile } = useProfile();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 최초 로드 시 폼 초기값 채우기
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setNickname(profile.nickname ?? '');
      setBio(profile.bio ?? '');
      setImageUri(profile.profileImage ?? null);
    }
  }, [profile]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한을 허용해 주세요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const url = await uploadProfileImage(result.assets[0].uri);
      setImageUri(url);
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('입력 필요', '이름을 입력해 주세요.');
      return;
    }
    if (!nickname.trim()) {
      Alert.alert('입력 필요', '닉네임을 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        nickname: nickname.trim(),
        bio: bio.trim(),
        ...(imageUri ? { profileImage: imageUri } : {}),
      });
      overlay.toast('프로필이 저장되었어요.');
      router.back();
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const displayInitial = (nickname.trim() || profile?.name?.trim() || '?')[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} hitSlop={8}>
          {saving ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.saveText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading && !profile ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* 프로필 사진 */}
            <View style={styles.avatarSection}>
              <Pressable onPress={handlePickImage} style={styles.avatarWrapper}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarText}>{displayInitial}</Text>
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  {uploading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Ionicons name="camera" size={16} color={colors.white} />
                  )}
                </View>
              </Pressable>
            </View>

            {/* 이름(본명) */}
            <View style={styles.field}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                placeholder="실명을 입력해주세요"
                placeholderTextColor={colors.text.dim}
                value={name}
                onChangeText={setName}
                maxLength={20}
              />
            </View>

            {/* 닉네임 */}
            <View style={styles.field}>
              <Text style={styles.label}>닉네임</Text>
              <TextInput
                style={styles.input}
                placeholder="최대 10자 이내"
                placeholderTextColor={colors.text.dim}
                value={nickname}
                onChangeText={setNickname}
                maxLength={NICKNAME_MAX}
              />
            </View>

            {/* 한 줄 소개 */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>한 줄 소개</Text>
                <Text style={styles.counter}>{bio.length}/{BIO_MAX}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="나를 한 줄로 소개해 보세요."
                placeholderTextColor={colors.text.dim}
                value={bio}
                onChangeText={setBio}
                maxLength={BIO_MAX}
                multiline
              />
            </View>
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
  saveText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.primary },
  loader: { marginTop: spacing.xxl },
  scroll: { padding: spacing.md, gap: spacing.lg },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.md },
  avatarWrapper: { width: 96, height: 96 },
  avatar: { width: 96, height: 96, borderRadius: radius.full },
  avatarFallback: {
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.text.secondary },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.base,
  },
  field: { gap: spacing.sm },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  counter: { fontSize: fontSize.sm, color: colors.text.dim },
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
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
});
