import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { getBlockedUsers, unblockUser, type BlockedUser } from '@/utils/moderation';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BlockedUsersScreen() {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(await getBlockedUsers());
    } catch (e: any) {
      setError(e?.message ?? '차단 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert('차단 해제', `${user.nickname ?? '이 사용자'}님을 차단 해제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '차단 해제',
        onPress: async () => {
          try {
            await unblockUser(user.userId);
            setUsers(prev => prev.filter(u => u.userId !== user.userId));
          } catch (e: any) {
            Alert.alert('오류', e?.message ?? '차단 해제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: BlockedUser }) => (
    <View style={styles.row}>
      <Text style={styles.nickname} numberOfLines={1}>
        {item.nickname ?? '알 수 없음'}
      </Text>
      <TouchableOpacity style={styles.unblockBtn} onPress={() => handleUnblock(item)} activeOpacity={0.7}>
        <Text style={styles.unblockText}>차단 해제</Text>
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
        <Text style={styles.headerTitle}>차단한 사용자</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <Text style={styles.message}>{error}</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={u => u.userId}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.message}>차단한 사용자가 없어요.</Text>}
        />
      )}
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
  message: { textAlign: 'center', color: colors.text.secondary, marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  listContent: { padding: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  nickname: { flex: 1, fontSize: fontSize.base, color: colors.text.primary, marginRight: spacing.md },
  unblockBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  unblockText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text.primary },
  separator: { height: spacing.sm },
});
