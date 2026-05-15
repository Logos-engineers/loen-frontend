import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export type ChallengeItem = {
  id: number;
  name: string;
  type: 'FAITH' | 'BIBLE';
  startDate: string;
  endDate: string;
  participantCount: number;
  isPinned: boolean;
  isCompleted: boolean;
  isOwner: boolean;
  bibleBooks?: string[];
};

type ChallengeListResponse = {
  content: ChallengeItem[];
  page: number;
  totalElements: number;
};

export type CreateBibleChallengePayload = {
  name: string;
  bibleBooks: string[];
  targetType: 'DAILY_CHAPTERS' | 'PERIOD' | 'DEADLINE';
  targetValue: number;
  startDate: string;
  endDate: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  notificationEnabled: boolean;
  notificationTimes: string[];
};

export function useChallenge() {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async (keyword?: string, activeOnly = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: '0', size: '20' });
      if (keyword) params.set('keyword', keyword);
      if (activeOnly) params.set('activeOnly', 'true');
      const result = await apiClient<ChallengeListResponse>(`/challenges?${params.toString()}`);
      setChallenges(result.content);
    } catch (e: any) {
      setError(e?.message ?? '불러오기 실패');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const createBibleChallenge = useCallback(async (payload: CreateBibleChallengePayload): Promise<ChallengeItem> => {
    const created = await apiClient<ChallengeItem>('/challenges/bible', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return created;
  }, []);

  const togglePin = useCallback(async (id: number) => {
    const prev = [...challenges];
    setChallenges(cur => cur.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
    try {
      await apiClient(`/challenges/${id}/pin`, { method: 'PATCH' });
    } catch (e) {
      setChallenges(prev);
      console.warn('[useChallenge] togglePin 실패', e);
    }
  }, [challenges]);

  return { challenges, isLoading, error, fetchChallenges, createBibleChallenge, togglePin };
}
