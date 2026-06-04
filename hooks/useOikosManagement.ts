import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

// ── 백엔드 응답 타입 (OikosManagementDto) ──────────────────────────────
export type MemberItem = {
  uid: string;
  name: string;
  profileImage: string | null;
};

export type OikosNode = {
  id: string;
  name: string;
  leaderId: string | null;
  leaderName: string | null;
  sleaderId: string | null;
  sleaderName: string | null;
  members: MemberItem[];
};

export type GroupNode = {
  id: string;
  name: string;
  groupLeaderId: string | null;
  groupLeaderName: string | null;
  oikosList: OikosNode[];
};

export type ManagementView = {
  position: string; // MEMBER | S_LEADER | LEADER | GROUP_LEADER | EXECUTIVE | COACH
  canManageGroup: boolean; // 그룹장 → 오이코스 생성/리더 지정
  canManageMembers: boolean; // 리더 → 부원 추가/제외
  groups: GroupNode[];
};

export type UserSearchItem = {
  uid: string;
  name: string;
  profileImage: string | null;
  position: string | null;
};

/** 이름으로 사용자 검색 (리더/S리더/부원 지정용). */
export async function searchUsers(name: string): Promise<UserSearchItem[]> {
  const q = name.trim();
  if (!q) return [];
  return apiClient<UserSearchItem[]>(`/users/search?name=${encodeURIComponent(q)}`);
}

/** 오이코스 관리 뷰 — 직책별 트리 조회 + 변경 액션. */
export function useOikosManagement() {
  const [view, setView] = useState<ManagementView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchView = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<ManagementView>('/oikos/management');
      setView(data);
    } catch (e: any) {
      setError(e?.message ?? '오이코스 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchView();
  }, [fetchView]);

  // 그룹장: 오이코스 생성
  const createOikos = useCallback(
    async (name: string) => {
      await apiClient<OikosNode>('/oikos/management/oikos', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      await fetchView();
    },
    [fetchView],
  );

  // 그룹장: 리더/S리더 지정 (둘 중 하나만 보낼 수도 있음)
  const assignLeaders = useCallback(
    async (oikosId: string, payload: { leaderId?: string | null; sleaderId?: string | null }) => {
      await apiClient<OikosNode>(`/oikos/management/oikos/${oikosId}/leaders`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      await fetchView();
    },
    [fetchView],
  );

  // 그룹장: 오이코스 삭제
  const deleteOikos = useCallback(
    async (oikosId: string) => {
      await apiClient(`/oikos/management/oikos/${oikosId}`, { method: 'DELETE' });
      await fetchView();
    },
    [fetchView],
  );

  // 리더: 부원 추가
  const addMember = useCallback(
    async (oikosId: string, uid: string) => {
      await apiClient<OikosNode>(`/oikos/management/oikos/${oikosId}/members`, {
        method: 'POST',
        body: JSON.stringify({ uid }),
      });
      await fetchView();
    },
    [fetchView],
  );

  // 리더: 부원 제외
  const removeMember = useCallback(
    async (oikosId: string, memberUid: string) => {
      await apiClient<OikosNode>(`/oikos/management/oikos/${oikosId}/members/${memberUid}`, {
        method: 'DELETE',
      });
      await fetchView();
    },
    [fetchView],
  );

  return {
    view,
    isLoading,
    error,
    refetch: fetchView,
    createOikos,
    assignLeaders,
    deleteOikos,
    addMember,
    removeMember,
  };
}

/** 직책 한글 라벨. */
export function positionLabel(position: string | null | undefined): string {
  switch (position) {
    case 'GROUP_LEADER':
      return '그룹장';
    case 'LEADER':
      return '리더';
    case 'S_LEADER':
      return 'S리더';
    case 'EXECUTIVE':
      return '임원';
    case 'COACH':
      return '코치';
    default:
      return '부원';
  }
}
