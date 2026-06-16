import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export type ChallengeProgress = {
  completedDays: number;
  lastCertifiedDate: string | null;
  weeklyCalendar: Record<string, boolean>;
  allCertifiedDates: string[];
};

export type ChallengeDetail = {
  challengeId: string;
  type: 'FAITH' | 'BIBLE';
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  dDay: number;
  verificationMethod: 'ATTENDANCE' | 'MEDITATION' | 'PHOTO' | 'BIBLE_READ';
  visibility: 'PUBLIC' | 'OIKOS' | 'LINK';
  participantCount: number;
  isJoined: boolean;
  isCreator: boolean;
  isPinned: boolean;
  notificationEnabled: boolean;
  myProgress: ChallengeProgress | null;
  bibleBooks?: string[];
};

export type ChallengeItem = {
  id: string;
  name: string;
  type: 'FAITH' | 'BIBLE';
  goal?: string | null;
  startDate: string;
  endDate: string;
  participantCount: number;
  isPinned: boolean;
  isCompleted: boolean;
  isOwner: boolean;
  bibleBooks?: string[];
};

type ChallengeListResponse = {
  content: BackendChallengeItem[];
  page: number;
  totalElements: number;
};

type BackendChallengeItem = {
  challengeId: string;
  id?: string;
  name: string;
  type: 'FAITH' | 'BIBLE';
  goal?: string | null;
  startDate: string;
  endDate: string;
  participantCount: number;
  isPinned?: boolean;
  pinned?: boolean;
  isCompleted?: boolean;
  completed?: boolean;
  isOwner?: boolean;
  isCreator?: boolean;
  creator?: boolean;
  bibleBooks?: string[];
};

type BackendChallengeDetail = Omit<ChallengeDetail, 'isJoined' | 'isCreator' | 'isPinned'> & {
  isJoined?: boolean;
  joined?: boolean;
  isCreator?: boolean;
  creator?: boolean;
  isPinned?: boolean;
  pinned?: boolean;
};

export type CreateBibleChallengePayload = {
  name: string;
  bibleBooks: string[];
  targetType: 'DAILY_CHAPTERS' | 'PERIOD' | 'DEADLINE';
  targetValue: number;
  startDate: string;
  endDate: string;
  visibility: 'PUBLIC' | 'OIKOS' | 'LINK';
  notificationEnabled: boolean;
  notificationTimes: string[];
};

export type CreateFaithChallengePayload = {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  visibility: 'PUBLIC' | 'OIKOS' | 'LINK';
  verificationMethod?: 'ATTENDANCE' | 'MEDITATION' | 'PHOTO';
  notificationEnabled: boolean;
  notificationTimes: string[];
};

function normalizeChallenge(item: BackendChallengeItem): ChallengeItem {
  return {
    id: item.id ?? item.challengeId,
    name: item.name,
    type: item.type,
    goal: item.goal,
    startDate: item.startDate,
    endDate: item.endDate,
    participantCount: item.participantCount,
    isPinned: item.isPinned ?? item.pinned ?? false,
    isCompleted: item.isCompleted ?? item.completed ?? false,
    isOwner: item.isOwner ?? item.isCreator ?? item.creator ?? false,
    bibleBooks: item.bibleBooks ?? [],
  };
}

function normalizeChallengeDetail(item: BackendChallengeDetail): ChallengeDetail {
  return {
    ...item,
    isJoined: item.isJoined ?? item.joined ?? false,
    isCreator: item.isCreator ?? item.creator ?? false,
    isPinned: item.isPinned ?? item.pinned ?? false,
  };
}

export function useChallenge() {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async (keyword?: string, activeOnly = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: '0', size: '20' });
      if (keyword) params.set('keyword', keyword);
      if (activeOnly) params.set('activeOnly', 'true');
      const result = await apiClient<ChallengeListResponse>(`/challenges?${params.toString()}`);
      setChallenges((result.content ?? []).map(normalizeChallenge));
    } catch (e: any) {
      setError(e?.message ?? '불러오기 실패');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const createBibleChallenge = useCallback(async (payload: CreateBibleChallengePayload): Promise<ChallengeItem> => {
    const created = await apiClient<BackendChallengeItem>('/challenges/bible', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeChallenge(created);
  }, []);

  const togglePin = useCallback(async (id: string) => {
    const prev = [...challenges];
    setChallenges(cur => cur.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
    try {
      await apiClient(`/challenges/${id}/pin`, { method: 'PATCH' });
    } catch (e) {
      setChallenges(prev);
      console.warn('[useChallenge] togglePin 실패', e);
    }
  }, [challenges]);

  return { challenges, isLoading, error, fetchChallenges, createBibleChallenge, togglePin };
}

export function useChallengeDetail(id: string | null) {
  const [detail, setDetail] = useState<ChallengeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient<BackendChallengeDetail>(`/challenges/${id}`);
      setDetail(normalizeChallengeDetail(result));
    } catch (e: any) {
      setError(e?.message ?? '챌린지 정보를 불러오지 못했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { detail, isLoading, error, refetch: fetch };
}

export type MyCertificationItem = {
  certId: string;
  date: string;
  meditationText: string | null;
  photoUrl: string | null;
  isPrivate: boolean;
  likeCount: number;
  isLikedByMe: boolean;
  commentCount: number;
};

export type OtherCertificationItem = {
  certId: string;
  writerId?: string;
  writerName: string;
  writerProfileImage: string | null;
  date: string;
  meditationText: string | null;
  photoUrl: string | null;
  likeCount: number;
  isLikedByMe: boolean;
  commentCount: number;
};

export type CommentItem = {
  commentId: string;
  userId: string;
  writerName: string;
  writerProfileImage: string | null;
  content: string;
  createdAt: string;
  isMine: boolean;
};

export type CertificationFeedResponse = {
  myCertification: MyCertificationItem | null;
  otherCertifications: OtherCertificationItem[];
};

export function useChallengeCertifications(challengeId: string | null) {
  const [feed, setFeed] = useState<CertificationFeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!challengeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient<CertificationFeedResponse>(`/challenges/${challengeId}/certifications`);
      setFeed(result);
    } catch (e: any) {
      setError(e?.message ?? '인증 피드를 불러오지 못했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { feed, isLoading, error, refetch: fetch };
}

export type RecommendedChallengeItem = {
  challengeId: string;
  type: 'FAITH' | 'BIBLE';
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  dDay: number;
  verificationMethod: string;
  visibility: string;
  participantCount: number;
  isJoined: boolean;
  creatorName: string;
};

export function useRecommendedChallenges() {
  const [items, setItems] = useState<RecommendedChallengeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiClient<RecommendedChallengeItem[]>('/challenges/recommended');
      setItems(result);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, isLoading };
}

export function useCertificationLike(certificationId: string, initialLiked: boolean, initialCount: number) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  const toggle = useCallback(async () => {
    if (isPending) return;
    setIsPending(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
    try {
      const result = await apiClient<{ isLiked: boolean; likeCount: number }>(
        `/challenges/certifications/${certificationId}/like`,
        { method: 'POST' },
      );
      setLiked(result.isLiked);
      setLikeCount(result.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setIsPending(false);
    }
  }, [certificationId, liked, likeCount, isPending]);

  return { liked, likeCount, toggle };
}

export function useCertificationComments(certificationId: string) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiClient<{ comments: CommentItem[]; totalCount: number }>(
        `/challenges/certifications/${certificationId}/comments`,
      );
      setComments(result.comments);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [certificationId]);

  const createComment = useCallback(async (content: string): Promise<CommentItem | null> => {
    try {
      const created = await apiClient<CommentItem>(
        `/challenges/certifications/${certificationId}/comments`,
        { method: 'POST', body: JSON.stringify({ content }) },
      );
      setComments(prev => [...prev, created]);
      return created;
    } catch {
      return null;
    }
  }, [certificationId]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      await apiClient(`/challenges/certifications/comments/${commentId}`, { method: 'DELETE' });
      setComments(prev => prev.filter(c => c.commentId !== commentId));
    } catch {
      // silent
    }
  }, []);

  return { comments, isLoading, fetch, createComment, deleteComment };
}

export async function joinChallenge(id: string): Promise<void> {
  await apiClient(`/challenges/${id}/join`, { method: 'POST' });
}

export async function leaveChallenge(id: string): Promise<void> {
  await apiClient(`/challenges/${id}/leave`, { method: 'POST' });
}
