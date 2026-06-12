import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { Notice, useNoticeList } from '@/hooks/useNotice';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
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

function NoticeRow({ item }: { item: Notice }) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: '/notice/[id]', params: { id: item.id } })}
    >
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.rowDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NoticeListScreen() {
  const { notices, isLoading, error, hasMore, loadMore, refetch } = useNoticeList();
  useRefetchOnFocus(refetch);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>공지사항</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading && notices.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NoticeRow item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={hasMore ? <ActivityIndicator color={colors.primary} style={{ padding: spacing.md }} /> : null}
          ListEmptyComponent={<Text style={styles.emptyText}>공지사항이 없습니다</Text>}
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
    backgroundColor: colors.background.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: { fontSize: fontSize.xl, color: colors.text.primary, fontWeight: fontWeight.bold },
  headerTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  listContent: { paddingBottom: 32 },
  row: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowContent: { gap: 4 },
  rowTitle: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary, lineHeight: 22 },
  rowDate: { fontSize: fontSize.sm, color: colors.text.secondary },
  separator: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  errorText: { textAlign: 'center', color: colors.text.secondary, padding: spacing.xl },
  emptyText: { textAlign: 'center', color: colors.text.secondary, padding: spacing.xl },
});
