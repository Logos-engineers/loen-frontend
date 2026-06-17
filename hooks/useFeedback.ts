/**
 * useMyFeedbacks — 작성자 본인 피드백 내역 조회 훅.
 * 마운트 시 1회 조회하므로, 소비처에서 useRefetchOnFocus(refetch)로 재진입 시 갱신한다.
 */
import { getMyFeedbacks, type MyFeedback } from '@/utils/feedback';
import { useCallback, useEffect, useState } from 'react';

export function useMyFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<MyFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setFeedbacks(await getMyFeedbacks());
    } catch (e: any) {
      setError(e?.message ?? '피드백 내역을 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { feedbacks, isLoading, error, refetch };
}
