import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export type OikosMember = {
  uid: string;
  name: string;
  profileImage?: string;
};

export type Oikos = {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  sleaderId?: string;
  sleaderName?: string;
  members: OikosMember[];
};

export function useOikos() {
  const [oikos, setOikos] = useState<Oikos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOikos = useCallback(async () => {
    setError(null);
    try {
      const data = await apiClient<Oikos>('/oikos/mine');
      setOikos(data);
    } catch (e: any) {
      // 404 = 오이코스 없음 (정상 상태)
      if (e?.message?.includes('404') || e?.message?.includes('찾을 수 없습니다')) {
        setOikos(null);
      } else {
        setError(e?.message ?? '오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOikos(); }, [fetchOikos]);

  return { oikos, isLoading, error, refetch: fetchOikos };
}
