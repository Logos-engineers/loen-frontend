import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useNotifications, type NotificationItem } from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
}

// 알림 타입별 아이콘 + 탭 시 이동 경로
function iconFor(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'NOTE_COMMENT':
      return 'chatbubble-ellipses-outline';
    default:
      return 'notifications-outline';
  }
}

function routeFor(item: NotificationItem): string | null {
  switch (item.type) {
    case 'NOTE_COMMENT':
      return '/faith-note';
    default:
      return null;
  }
}

export default function NotificationsScreen() {
  const { items, isLoading, markRead, markAllRead } = useNotifications();

  const handlePress = (item: NotificationItem) => {
    if (!item.isRead) markRead(item.id);
    const path = routeFor(item);
    if (path) router.push(path as any);
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.row, !item.isRead && styles.rowUnread]}
      activeOpacity={0.7}
      onPress={() => handlePress(item)}
    >
      <View style={[styles.iconCircle, !item.isRead && styles.iconCircleUnread]}>
        <Ionicons
          name={iconFor(item.type)}
          size={18}
          color={!item.isRead ? colors.primary : colors.text.secondary}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {item.body ? <Text style={styles.message} numberOfLines={2}>{item.body}</Text> : null}
        <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
      </View>
      {!item.isRead ? <View style={styles.unreadDot} /> : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <TouchableOpacity onPress={markAllRead} hitSlop={8} disabled={items.length === 0}>
          <Text style={[styles.readAll, items.length === 0 && styles.readAllDisabled]}>모두 읽음</Text>
        </TouchableOpacity>
      </View>

      {isLoading && items.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>알림이 없어요.</Text>}
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
  headerTitle: { fontSize: fontSize.heading, fontWeight: fontWeight.bold, color: colors.text.primary },
  readAll: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  readAllDisabled: { color: colors.text.dim },
  loader: { marginTop: spacing.xxl },
  listContent: { paddingVertical: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.base,
  },
  rowUnread: { backgroundColor: colors.background.elevated },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: { backgroundColor: colors.primaryLight },
  body: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.primary },
  message: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.secondary, lineHeight: 18 },
  time: { fontSize: fontSize.xs, color: colors.text.dim, marginTop: 2 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 68 },
  empty: { textAlign: 'center', marginTop: spacing.xxl, fontSize: fontSize.md, color: colors.text.dim },
});
