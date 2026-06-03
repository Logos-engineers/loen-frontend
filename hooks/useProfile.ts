import { useCallback, useEffect, useState } from 'react';
import { apiClient, BASE_URL } from '@/utils/apiClient';
import { useAuthStore } from '@/store/auth-store';

export type Profile = {
  uid: string;
  email: string;
  name: string;
  nickname: string | null;
  birthday: string | null;
  mbti: string | null;
  phoneNumber: string | null;
  profileImage: string | null;
  bio: string | null;
  hobbies: string[] | null;
  oikosId: string | null;
};

export type UpdateProfilePayload = {
  nickname?: string;
  bio?: string;
  profileImage?: string;
};

/** 프로필 이미지를 R2에 업로드하고 공개 URL을 반환한다. (multipart — apiClient 대신 raw fetch) */
export async function uploadProfileImage(uri: string): Promise<string> {
  const token = useAuthStore.getState().accessToken;
  const formData = new FormData();
  formData.append('file', { uri, name: 'profile.jpg', type: 'image/jpeg' } as any);

  const res = await fetch(`${BASE_URL}/users/me/profile-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? '이미지 업로드 실패');
  return json.data.url as string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<Profile>('/users/me');
      setProfile(data);
    } catch (e: any) {
      setError(e?.message ?? '프로필을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await apiClient<Profile>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setProfile(updated);
    return updated;
  }, []);

  return { profile, isLoading, error, refetch: fetchProfile, updateProfile };
}
