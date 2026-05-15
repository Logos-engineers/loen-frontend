import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export type BibleHistory = {
  accruedReadCount: number;
  todayReadCount: number;
  lastReadDate: string | null;
  readCheckList: { [bookCode: string]: number[] };
};

export type BibleGoal = {
  id: number;
  bookCode: string;
  bookName: string;
  daysPerWeek: number;
  chaptersPerDay: number;
  weeklyTarget: number;
  weekStartDate: string;
  weekEndDate: string;
  notificationEnabled: boolean;
  notificationDays: string[];
  notificationTime: string;
};

type GoalPayload = {
  bookCode: string;
  daysPerWeek: number;
  chaptersPerDay: number;
  notificationEnabled?: boolean;
  notificationDays?: string[];
  notificationTime?: string;
};

export function useBibleHistory() {
  const [history, setHistory] = useState<BibleHistory | null>(null);
  const [goal, setGoal] = useState<BibleGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [histResult, goalResult] = await Promise.allSettled([
          apiClient<BibleHistory>('/bible/history'),
          apiClient<BibleGoal>('/bible/goal'),
        ]);
        if (!mounted) return;
        if (histResult.status === 'fulfilled') setHistory(histResult.value);
        if (goalResult.status === 'fulfilled') setGoal(goalResult.value);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? '불러오기 실패');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const checkChapters = useCallback(async (bookCode: string, chapters: number[]) => {
    try {
      const updated = await apiClient<BibleHistory>('/bible/history/chapters', {
        method: 'POST',
        body: JSON.stringify({ bookCode, chapters }),
      });
      setHistory(updated);
    } catch (e) {
      console.warn('[useBibleHistory] checkChapters 실패', e);
    }
  }, []);

  const uncheckChapters = useCallback(async (bookCode: string, chapters: number[]) => {
    try {
      const updated = await apiClient<BibleHistory>('/bible/history/chapters/uncheck', {
        method: 'POST',
        body: JSON.stringify({ bookCode, chapters }),
      });
      setHistory(updated);
    } catch (e) {
      console.warn('[useBibleHistory] uncheckChapters 실패', e);
    }
  }, []);

  const createGoal = useCallback(async (payload: GoalPayload): Promise<BibleGoal> => {
    const created = await apiClient<BibleGoal>('/bible/goal', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setGoal(created);
    return created;
  }, []);

  const updateGoal = useCallback(async (goalId: number, payload: Partial<GoalPayload>): Promise<BibleGoal> => {
    const updated = await apiClient<BibleGoal>(`/bible/goal/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setGoal(updated);
    return updated;
  }, []);

  return { history, goal, isLoading, error, checkChapters, uncheckChapters, createGoal, updateGoal };
}
