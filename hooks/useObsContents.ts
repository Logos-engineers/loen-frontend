import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { BaseObsContent } from '@/types/obs';

export type ObsContent = BaseObsContent & {
  isScraped: boolean;
  reviewStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | null;
};

type ContentsPage = {
  content?: ObsContent[];
  contents?: ObsContent[];
  page?: number;
  currentPage?: number;
  totalElements: number;
  totalPages?: number;
};

export function useObsContents() {
  const [contents, setContents] = useState<ObsContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  // silent=true면 로딩 스피너/에러 상태를 건드리지 않고 백그라운드로만 갱신한다.
  // 홈 탭 재진입 시(useRefetchOnFocus) 기존 카드가 스피너로 깜빡이는 문제 방지 (#12).
  const fetchContents = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data = await apiClient<ContentsPage>('/obs/contents?sort=publishedDate,desc&size=50');
      setContents(data.contents ?? data.content ?? []);
      hasLoadedRef.current = true;
    } catch (e) {
      // 조용한 갱신 실패는 기존 데이터를 유지하고 에러를 노출하지 않는다.
      if (!silent) setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // 포커스 재조회는 한 번이라도 로드된 뒤엔 조용히(기존 데이터 유지) 갱신한다.
  const refetch = useCallback(() => {
    fetchContents({ silent: hasLoadedRef.current });
  }, [fetchContents]);

  return { contents, isLoading, error, refetch };
}
