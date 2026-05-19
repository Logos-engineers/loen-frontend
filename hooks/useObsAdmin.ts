import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import { useAuthStore } from '@/store/auth-store';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AdminObsContent = {
  id: number;
  title: string;
  biblePassage: string;
  publishedDate: string;
  weekLabel?: string;
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

  const res = await fetch(`${getAdminBaseUrl()}/upload`, {
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

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAdminObsContents() {
  const [contents, setContents] = useState<AdminObsContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<AdminObsContent[]>('/admin/obs/contents');
      setContents(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { contents, isLoading, error, refetch: fetch };
}

function getAdminBaseUrl(): string {
  // mirrors getBaseUrl() logic from apiClient but returns admin path
  const { Platform } = require('react-native');
  const Constants = require('expo-constants').default;
  const expoPublicApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (expoPublicApiUrl) return `${expoPublicApiUrl}/admin/obs`;
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) return `http://${debuggerHost.split(':')[0]}:8080/api/v1/admin/obs`;
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/v1/admin/obs'
    : 'http://localhost:8080/api/v1/admin/obs';
}
