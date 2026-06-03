import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export type AttendanceWeek = {
  weekStart: string;    // YYYY-MM-DD (월요일)
  weekEnd: string;      // YYYY-MM-DD (일요일)
  today: string;        // YYYY-MM-DD
  todayChecked: boolean;
  attendedDates: string[];
};

type CheckInResponse = {
  date: string;
  newlyChecked: boolean;
};

/** 앱 진입 시 오늘 출석을 기록한다 (하루 1회, 멱등). */
export async function checkInAttendance(): Promise<CheckInResponse | null> {
  try {
    return await apiClient<CheckInResponse>('/attendance/check-in', { method: 'POST' });
  } catch (e) {
    console.warn('[useAttendance] check-in 실패', e);
    return null;
  }
}

/** 이번 주(월~일) 출석 현황을 조회한다. */
export function useAttendanceWeek() {
  const [week, setWeek] = useState<AttendanceWeek | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWeek = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<AttendanceWeek>('/attendance/week');
      setWeek(data);
    } catch (e) {
      console.warn('[useAttendance] week 조회 실패', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

  return { week, isLoading, refetch: fetchWeek };
}
