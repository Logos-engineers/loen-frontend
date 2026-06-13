import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export type BibleHistory = {
  accruedReadCount: number;
  todayReadCount: number;
  lastReadDate: string | null;
  readCheckList: { [bookCode: string]: number[] };
};

export type BibleGoal = {
  id: string;
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

  // 히스토리 + 이번 주 목표를 다시 불러온다. (화면 복귀 시 useRefetchOnFocus로 호출)
  const refetch = useCallback(async () => {
    try {
      const [histResult, goalResult] = await Promise.allSettled([
        apiClient<BibleHistory>('/bible/history'),
        apiClient<BibleGoal>('/bible/goal'),
      ]);
      if (histResult.status === 'fulfilled') {
        setHistory({ ...histResult.value, readCheckList: histResult.value.readCheckList ?? {} });
      }
      // 이번 주 목표가 없으면(BIBLE_004 → rejected) goal=null. 매주 월요일 리셋이 그대로 반영됨.
      setGoal(goalResult.status === 'fulfilled' ? goalResult.value : null);
    } catch (e: any) {
      setError(e?.message ?? '불러오기 실패');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const checkChapters = useCallback(async (bookCode: string, chapters: number[]) => {
    try {
      const updated = await apiClient<BibleHistory>('/bible/history/chapters', {
        method: 'POST',
        body: JSON.stringify({ bookCode, chapters }),
      });
      setHistory({ ...updated, readCheckList: updated.readCheckList ?? {} });
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
      setHistory({ ...updated, readCheckList: updated.readCheckList ?? {} });
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

  const updateGoal = useCallback(async (goalId: string, payload: Partial<GoalPayload>): Promise<BibleGoal> => {
    const updated = await apiClient<BibleGoal>(`/bible/goal/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setGoal(updated);
    return updated;
  }, []);

  return { history, goal, isLoading, error, refetch, checkChapters, uncheckChapters, createGoal, updateGoal };
}
