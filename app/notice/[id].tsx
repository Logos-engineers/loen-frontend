import { overlay } from '@/components/ui/overlay';
import { colors, fontSize, fontWeight, spacing } from '@/constants/tokens';
import { useNoticeDetail } from '@/hooks/useNotice';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notice, isLoading, error, refetch } = useNoticeDetail(id ?? '');
  const isAdmin = useAuthStore((s) => s.role === 'ADMIN');

  // 수정 화면에서 돌아오면 최신 내용으로 갱신
  const didMount = React.useRef(false);
  useFocusEffect(
    React.useCallback(() => {
      if (didMount.current) refetch();
      else didMount.current = true;
    }, [refetch]),
  );

  const handleDelete = () => {
    Alert.alert('공지 삭제', '이 공지를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient(`/admin/notices/${id}`, { method: 'DELETE' });
            overlay.toast('공지를 삭제했어요.');
            router.back();
          } catch (e: any) {
            Alert.alert('오류', e?.message ?? '삭제하지 못했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>공지사항</Text>
        {isAdmin ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/notice/write', params: { id } })}
              hitSlop={8}
            >
              <Ionicons name="create-outline" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={colors.text.dim} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : notice ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.date}>{formatDate(notice.createdAt)}</Text>
          <Text style={styles.title}>{notice.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.body}>{notice.description}</Text>
        </ScrollView>
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
  backText: { fontSize: fontSize.xl, color: colors.text.primary, fontWeight: fontWeight.bold },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm },
  date: { fontSize: fontSize.sm, color: colors.text.secondary },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, lineHeight: 30 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  body: { fontSize: fontSize.base, color: colors.text.primary, lineHeight: 24 },
  errorText: { textAlign: 'center', color: colors.text.secondary, padding: spacing.xl },
});
