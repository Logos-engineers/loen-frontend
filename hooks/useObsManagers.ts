import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export type ObsManagerRole = 'USER' | 'ADMIN' | 'OBS_ADMIN';

export type ObsManager = {
  userId: string;
  email: string;
  name: string | null;
  nickname: string | null;
  profileImage?: string | null;
  role: ObsManagerRole;
};

/** 이메일/이름/닉네임 부분일치로 후보 사용자 검색 (관리자 전용). */
export async function searchObsManagerCandidates(keyword: string): Promise<ObsManager[]> {
  const q = keyword.trim();
  if (!q) return [];
  return apiClient<ObsManager[]>(`/admin/obs-managers/search?keyword=${encodeURIComponent(q)}`);
}

/** OBS 관리자 부여 (USER → OBS_ADMIN). */
export async function grantObsManager(userId: string): Promise<void> {
  await apiClient('/admin/obs-managers', { method: 'POST', body: JSON.stringify({ userId }) });
}

/** OBS 관리자 해제 (OBS_ADMIN → USER). */
export async function revokeObsManager(userId: string): Promise<void> {
  await apiClient(`/admin/obs-managers/${userId}`, { method: 'DELETE' });
}

/** 현재 OBS 관리자 목록 조회 훅. */
export function useObsManagers() {
  const [managers, setManagers] = useState<ObsManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const data = await apiClient<ObsManager[]>('/admin/obs-managers');
      setManagers(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? '불러오기에 실패했어요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { managers, isLoading, error, refetch };
}
