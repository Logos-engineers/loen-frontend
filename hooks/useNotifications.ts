import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export type NotificationItem = {
  id: string;
  type: string;        // 'NOTE_COMMENT' 등
  title: string;
  body: string | null;
  targetId: string | null;
  targetType: string | null;   // 'THANKS' | 'PRAYER' | 'WORD' (딥링크 탭)
  isRead: boolean;
  createdAt: string;
};

type ListResponse = {
  content: NotificationItem[];
  page: number;
  totalElements: number;
};

/** 알림 센터용 — 목록 + 읽음 처리. */
export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<ListResponse>('/notifications');
      setItems(data.content ?? []);
    } catch (e: any) {
      setError(e?.message ?? '알림을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    setItems((cur) => cur.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (e) {
      console.warn('[useNotifications] markRead 실패', e);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((cur) => cur.map((n) => ({ ...n, isRead: true })));
    try {
      await apiClient('/notifications/read-all', { method: 'PATCH' });
    } catch (e) {
      console.warn('[useNotifications] markAllRead 실패', e);
    }
  }, []);

  return { items, isLoading, error, refetch: fetchNotifications, markRead, markAllRead };
}

/** 벨 뱃지용 — 안 읽은 알림 개수만. */
export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const refetch = useCallback(async () => {
    try {
      const data = await apiClient<{ count: number }>('/notifications/unread-count');
      setCount(data?.count ?? 0);
    } catch {
      // 조용히 무시 (벨 뱃지는 부가 정보)
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { count, refetch };
}
