import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import { normalizeObsSections, type ObsContentDetail } from '@/utils/obs-normalize';

export type ObsContent = {
  id: number;
  title: string;
  biblePassage: string;
  publishedDate: string;
  weekLabel: string;
  isScraped: boolean;
  reviewStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | null;
};

export type ObsQuiz = {
  id: number;
  stepNumber: number;
  questionType: 'OX' | 'SHORT' | 'ESSAY';
  questionText: string;
  correctAnswer: string | null;
  explanation?: string;
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
    } catch (e: any) {
      setError(e?.message ?? '오류가 발생했습니다.');
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

export async function fetchObsQuizzes(obsId: number): Promise<ObsQuiz[]> {
  return apiClient<ObsQuiz[]>(`/obs/contents/${obsId}/quizzes`);
}

export async function fetchObsContent(obsId: number): Promise<ObsContentDetail> {
  const data = await apiClient<Omit<ObsContentDetail, 'sections'> & { sections?: unknown }>(`/obs/contents/${obsId}`);
  return {
    ...data,
    sections: normalizeObsSections(data.sections),
  };
}

export async function startObsReview(obsId: number): Promise<number> {
  const data = await apiClient<{ id?: number; reviewId?: number; obsContentId?: number; obsId?: number; status: string }>(
    `/obs/contents/${obsId}/reviews`,
    { method: 'POST' },
  );
  return data.reviewId ?? data.id ?? 0;
}

export async function completeObsReview(reviewId: number): Promise<void> {
  await apiClient<null>(`/obs/reviews/${reviewId}/complete`, { method: 'PATCH' });
}

export async function saveObsSummaryAnswers(reviewId: number, answers: Record<string, string>): Promise<void> {
  await apiClient<null>(`/obs/reviews/${reviewId}/summary-answers`, {
    method: 'PATCH',
    body: JSON.stringify({ answers }),
  });
}

export async function saveObsEmotions(reviewId: number, emotions: string[]): Promise<void> {
  await apiClient<null>(`/obs/reviews/${reviewId}/emotions`, {
    method: 'PATCH',
    body: JSON.stringify({ emotions }),
  });
}

export async function saveObsApplication(reviewId: number, applicationAnswer: string): Promise<void> {
  await apiClient<null>(`/obs/reviews/${reviewId}/application`, {
    method: 'PATCH',
    body: JSON.stringify({ applicationAnswer }),
  });
}

export function formatKoreanDate(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3) return dateStr;
  const [y, m, d] = parts;
  return `${y}년 ${m}월 ${d}일`;
}
