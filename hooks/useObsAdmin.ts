import { useCallback, useEffect, useState } from 'react';
import { apiClient, BASE_URL } from '@/utils/apiClient';
import { useAuthStore } from '@/store/auth-store';
import type { BaseObsContent } from '@/types/obs';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AdminObsContent = BaseObsContent & {
  isPublished: boolean;
};

export type ObsAdminQuiz = {
  stepNumber: number;
  questionType: 'OX' | 'SHORT' | 'ESSAY';
  questionText: string;
  correctAnswer: string | null;
  explanation?: string;
};

export type AnalyzeResult = {
  sections: Record<string, any>[];
  summary: string[];
  quizzes: ObsAdminQuiz[];
};

export type SaveContentPayload = {
  title: string;
  biblePassage: string;
  publishedDate: string;
  sections: Record<string, any>[];
  summary: string[];
  quizzes: ObsAdminQuiz[];
};

// ─── API Functions ──────────────────────────────────────────────────────────

export async function uploadObsPdf(file: { uri: string; name: string; mimeType: string }): Promise<string> {
  const token = useAuthStore.getState().accessToken;
  const formData = new FormData();
  formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as any);

  const res = await fetch(`${BASE_URL}/admin/obs/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? '업로드 실패');
  return json.data.r2Key as string;
}

export async function analyzeObs(r2Key: string): Promise<AnalyzeResult> {
  return apiClient<AnalyzeResult>('/admin/obs/analyze', {
    method: 'POST',
    body: JSON.stringify({ r2Key }),
  });
}

export async function saveObsContent(payload: SaveContentPayload): Promise<AdminObsContent> {
  return apiClient<AdminObsContent>('/admin/obs/contents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function publishObsContent(id: number): Promise<void> {
  await apiClient<null>(`/admin/obs/contents/${id}/publish`, {
    method: 'PATCH',
    body: JSON.stringify({ isPublished: true }),
  });
}

// 관리자 OBS 상세(수정 화면 prefill용) — sections/summary/quizzes 포함.
export type AdminObsDetail = {
  id: number;
  title: string;
  biblePassage: string;
  publishedDate: string;
  sections: Record<string, any>[];
  summary: string[];
  isPublished: boolean;
  quizzes: (ObsAdminQuiz & { id?: number })[];
};

export async function fetchAdminObsDetail(id: number): Promise<AdminObsDetail> {
  return apiClient<AdminObsDetail>(`/admin/obs/contents/${id}`);
}

/** 기존 OBS 본문 수정(PUT). 퀴즈는 별도(replaceObsQuizzes)로 교체한다. */
export async function updateObsContent(
  id: number,
  payload: Omit<SaveContentPayload, 'quizzes'>,
): Promise<void> {
  await apiClient(`/admin/obs/contents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/** 퀴즈 일괄 교체(POST). 백엔드는 QuizUpsertItem 배열을 그대로 받으며 stepNumber 필수. */
export async function replaceObsQuizzes(id: number, quizzes: ObsAdminQuiz[]): Promise<void> {
  const body = quizzes.map((q, i) => ({
    stepNumber: q.stepNumber ?? i + 1,
    questionType: q.questionType,
    questionText: q.questionText,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation ?? '',
  }));
  await apiClient(`/admin/obs/contents/${id}/quizzes`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAdminObsContents() {
  const [contents, setContents] = useState<AdminObsContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<{ contents: AdminObsContent[] } | AdminObsContent[]>('/admin/obs/contents');
      setContents(Array.isArray(data) ? data : (data as any)?.contents ?? []);
    } catch (e: any) {
      setError(e?.message ?? '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { contents, isLoading, error, refetch: fetch };
}

