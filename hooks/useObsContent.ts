import { apiClient } from '@/utils/apiClient';
import { normalizeObsSections, type ObsContentDetail } from '@/utils/obs-normalize';

export type ObsQuiz = {
  id: number;
  stepNumber: number;
  questionType: 'OX' | 'SHORT' | 'ESSAY';
  questionText: string;
  correctAnswer: string | null;
  explanation?: string;
};

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
