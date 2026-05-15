import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export type ChallengeItem = {
  id: string;
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
  content: BackendChallengeItem[];
  page: number;
  totalElements: number;
};

type BackendChallengeItem = {
  challengeId: string;
  id?: string;
  name: string;
  type: 'FAITH' | 'BIBLE';
  startDate: string;
  endDate: string;
  participantCount: number;
  isPinned?: boolean;
  isCompleted?: boolean;
  isOwner?: boolean;
  isCreator?: boolean;
  bibleBooks?: string[];
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

function normalizeChallenge(item: BackendChallengeItem): ChallengeItem {
  return {
    id: item.id ?? item.challengeId,
    name: item.name,
    type: item.type,
    startDate: item.startDate,
    endDate: item.endDate,
    participantCount: item.participantCount,
    isPinned: item.isPinned ?? false,
    isCompleted: item.isCompleted ?? false,
    isOwner: item.isOwner ?? item.isCreator ?? false,
    bibleBooks: item.bibleBooks ?? [],
  };
}

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
      setChallenges((result.content ?? []).map(normalizeChallenge));
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
    const created = await apiClient<BackendChallengeItem>('/challenges/bible', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeChallenge(created);
  }, []);

  const togglePin = useCallback(async (id: string) => {
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
