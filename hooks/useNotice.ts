import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export type Notice = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

type NoticePage = { content: Notice[]; page: number; totalElements: number };

export function useNoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const fetchPage = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<NoticePage>(`/notices?page=${pageNum}&size=20`);
      const items = data.content ?? [];
      setNotices((prev) => (pageNum === 0 ? items : [...prev, ...items]));
      setHasMore(items.length === 20);
      setPage(pageNum);
    } catch (e: any) {
      setError(e?.message ?? '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(0); }, [fetchPage]);

  const loadMore = useCallback(() => { if (hasMore) fetchPage(page + 1); }, [hasMore, page, fetchPage]);

  return { notices, isLoading, error, hasMore, loadMore, refetch: () => fetchPage(0) };
}

export function useNoticeDetail(id: string) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const data = await apiClient<Notice>(`/notices/${id}`);
      setNotice(data);
    } catch (e: any) {
      setError(e?.message ?? '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  return { notice, isLoading, error, refetch };
}
