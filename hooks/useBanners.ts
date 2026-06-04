import { useCallback, useEffect, useState } from 'react';
import { apiClient, BASE_URL } from '@/utils/apiClient';
import { useAuthStore } from '@/store/auth-store';

export type Banner = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  linkUrl: string | null;
  active: boolean;
  sortOrder: number;
};

export type CreateBannerInput = {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  content?: string;
  linkUrl?: string;
};

type BannerListResponse = { banners: Banner[] };

/** 배너 이미지를 R2에 업로드하고 공개 URL을 반환 (admin, multipart). */
export async function uploadBannerImage(uri: string): Promise<string> {
  const token = useAuthStore.getState().accessToken;
  const formData = new FormData();
  formData.append('file', { uri, name: 'banner.jpg', type: 'image/jpeg' } as any);

  const res = await fetch(`${BASE_URL}/admin/banners/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? '이미지 업로드 실패');
  return json.data.url as string;
}

/** 홈 공개 배너 (활성). */
export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBanners = useCallback(async () => {
    try {
      const data = await apiClient<BannerListResponse>('/banners');
      setBanners(data.banners ?? []);
    } catch {
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return { banners, isLoading, refetch: fetchBanners };
}

/** 배너 단건 상세 (공지 형식). */
export function useBanner(id: string) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiClient<Banner>(`/banners/${id}`);
        if (alive) setBanner(data);
      } catch (e: any) {
        if (alive) setError(e?.message ?? '배너를 불러오지 못했습니다.');
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  return { banner, isLoading, error };
}

/** 관리자 배너 관리 (전체 목록 + 생성/활성토글/삭제). */
export function useAdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<BannerListResponse>('/admin/banners');
      setBanners(data.banners ?? []);
    } catch (e: any) {
      setError(e?.message ?? '배너를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createBanner = useCallback(
    async (input: CreateBannerInput) => {
      await apiClient('/admin/banners', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: input.imageUrl,
          title: input.title?.trim() || null,
          subtitle: input.subtitle?.trim() || null,
          content: input.content?.trim() || null,
          linkUrl: input.linkUrl?.trim() || null,
        }),
      });
      await fetchAll();
    },
    [fetchAll],
  );

  const setActive = useCallback(
    async (id: string, active: boolean) => {
      setBanners((cur) => cur.map((b) => (b.id === id ? { ...b, active } : b)));
      try {
        await apiClient(`/admin/banners/${id}/active`, {
          method: 'PATCH',
          body: JSON.stringify({ active }),
        });
      } catch {
        await fetchAll();
      }
    },
    [fetchAll],
  );

  const deleteBanner = useCallback(
    async (id: string) => {
      await apiClient(`/admin/banners/${id}`, { method: 'DELETE' });
      setBanners((cur) => cur.filter((b) => b.id !== id));
    },
    [],
  );

  return { banners, isLoading, error, refetch: fetchAll, createBanner, setActive, deleteBanner };
}
