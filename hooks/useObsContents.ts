import { useCallback, useEffect, useState } from 'react';
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

  const fetchContents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<ContentsPage>('/obs/contents?sort=publishedDate,desc&size=50');
      setContents(data.contents ?? data.content ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchContents();
    return () => { mounted = false; };
  }, [fetchContents]);

  return { contents, isLoading, error, refetch: fetchContents };
}
