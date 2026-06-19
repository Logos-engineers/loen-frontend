import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/tokens';
import { useNotifications, type NotificationItem } from '@/hooks/useNotifications';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
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
    case 'NOTE_LIKE':
      return 'heart-outline';
    case 'OIKOS_INVITE':
    case 'OIKOS_LEADER':
      return 'people-outline';
    case 'NOTE_OIKOS_SHARE':
      return 'share-social-outline';
    case 'NOTICE':
      return 'megaphone-outline';
    case 'OBS_PUBLISHED':
      return 'book-outline';
    case 'BIBLE_REMINDER':
      return 'alarm-outline';
    case 'ATTENDANCE_REMINDER':
      return 'checkmark-done-outline';
    default:
      return 'notifications-outline';
  }
}

// 노트 관련 알림(댓글/좋아요/오이코스 공유)은 해당 노트 상세로 딥링크
const NOTE_TYPES = ['NOTE_COMMENT', 'NOTE_LIKE', 'NOTE_OIKOS_SHARE'];

// 알림 탭 시 이동 — 가능하면 해당 게시글(신앙노트 상세)로, 정보 부족하면 목록으로
function navigateTo(item: NotificationItem) {
  if (NOTE_TYPES.includes(item.type)) {
    if (item.targetId && item.targetType) {
      router.push({
        pathname: '/faith-note/[id]',
        params: { id: item.targetId, tab: item.targetType },
      });
    } else {
      router.push('/faith-note');
    }
  } else if (item.type === 'NOTICE') {
    if (item.targetId) {
      router.push({ pathname: '/notice/[id]', params: { id: item.targetId } });
    } else {
      router.push('/notice');
    }
  } else if (item.type === 'OBS_PUBLISHED') {
    router.push('/obs');
  } else if (item.type === 'BIBLE_REMINDER') {
    router.push('/plan');
  } else if (item.type === 'ATTENDANCE_REMINDER') {
    router.push('/mypage');
  }
  // OIKOS_INVITE / OIKOS_LEADER: 전용 화면이 아직 없어 읽음 처리만 (오이코스 화면 추가 시 연결)
}

export default function NotificationsScreen() {
  const { items, isLoading, markRead, markAllRead, refetch } = useNotifications();
  useRefetchOnFocus(refetch);

  const handlePress = (item: NotificationItem) => {
    if (!item.isRead) markRead(item.id);
    navigateTo(item);
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handlePress(item)}
    >
      <View style={[styles.iconCircle, item.isRead ? styles.iconCircleRead : styles.iconCircleUnread]}>
        <Ionicons
          name={iconFor(item.type)}
          size={20}
          color={item.isRead ? colors.text.secondary : colors.primary}
        />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, item.isRead && styles.titleRead]} numberOfLines={1}>{item.title}</Text>
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
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="notifications-off-outline" size={28} color={colors.text.dim} />
              </View>
              <Text style={styles.empty}>아직 받은 알림이 없어요.</Text>
            </View>
          }
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
  listContent: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xl },
  // 모든 알림을 흰 라운드 카드로 — 읽음/안읽음 구분은 배경 줄무늬가 아니라 아이콘색·제목 굵기·점으로.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: { backgroundColor: colors.primaryLight },
  iconCircleRead: { backgroundColor: colors.background.base },
  body: { flex: 1, gap: 3 },
  title: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text.primary },
  titleRead: { fontWeight: fontWeight.medium, color: colors.text.secondary },
  message: { fontSize: fontSize.md, fontWeight: fontWeight.regular, color: colors.text.secondary, lineHeight: 19 },
  time: { fontSize: fontSize.xs, color: colors.text.dim, marginTop: 2 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginLeft: spacing.xs,
  },
  separator: { height: spacing.smd },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xxl * 2, gap: spacing.md },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { textAlign: 'center', fontSize: fontSize.md, color: colors.text.dim },
});
