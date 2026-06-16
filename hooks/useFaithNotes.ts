import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { FaithNoteItem } from '@/components/faith-note/faith-note-card';
import type { FaithNoteTab } from '@/components/faith-note/faith-note-tab-bar';

export type ThanksNote = {
  id: string;
  writerId?: string;
  writerName: string;
  writerNickname: string | null;
  answers: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isMine: boolean;
  createdAt: string;
};

export type ReactionItem = {
  emoji: string;   // 'HEART' | 'FIRE' | 'PRAY'
  count: number;
  reacted: boolean;
};

const PRAYER_REACTION_CODES = ['HEART', 'FIRE', 'PRAY'];

export function normalizePrayerReactions(reactions?: ReactionItem[]): ReactionItem[] {
  const byEmoji = new Map((reactions ?? []).map((reaction) => [reaction.emoji, reaction]));
  return PRAYER_REACTION_CODES.map((emoji) => byEmoji.get(emoji) ?? {
    emoji,
    count: 0,
    reacted: false,
  });
}

export type PrayerNote = {
  id: string;
  writerId?: string;
  writerName: string;
  writerNickname: string | null;
  prayers: string[];
  commentCount: number;
  isMine: boolean;
  createdAt: string;
  reactions: ReactionItem[];
};

export type WordNote = {
  id: string;
  writerId?: string;
  writerName: string;
  writerNickname: string | null;
  bibleName: string;
  chapter: number;
  phaseStart: number;
  phaseEnd: number;
  title: string;
  description: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isMine: boolean;
  createdAt: string;
};

export type NoteListResponse<T> = {
  content: T[];
  page: number;
  totalElements: number;
};

const DAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getDayKey(dateStr: string): string {
  return DAY_KEYS[new Date(dateStr).getDay()] ?? 'MON';
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간`;
  return `${Math.floor(hours / 24)}일`;
}

function toAuthor(writerName: string, writerNickname?: string | null) {
  const nick = writerNickname?.trim() ?? '';
  const display = nick || writerName;
  return { handle: '', name: writerName, nickname: nick, hasAvatar: false, initial: display[0] ?? '?' };
}

export function fromThanks(note: ThanksNote): FaithNoteItem {
  return {
    id: String(note.id),
    writerId: note.writerId,
    tab: 'THANKS',
    dayKey: getDayKey(note.createdAt),
    createdAt: note.createdAt,
    author: toAuthor(note.writerName, note.writerNickname),
    timeAgo: getTimeAgo(note.createdAt),
    content: note.answers,
    likeCount: note.likeCount,
    commentCount: note.commentCount ?? 0,
    isLiked: note.isLiked,
    isMine: note.isMine ?? false,
  };
}

export function fromPrayer(note: PrayerNote): FaithNoteItem {
  return {
    id: String(note.id),
    writerId: note.writerId,
    tab: 'PRAYER',
    dayKey: getDayKey(note.createdAt),
    createdAt: note.createdAt,
    author: toAuthor(note.writerName, note.writerNickname),
    timeAgo: getTimeAgo(note.createdAt),
    content: note.prayers,
    likeCount: 0,
    commentCount: note.commentCount ?? 0,
    isLiked: false,
    isMine: note.isMine ?? false,
    reactions: normalizePrayerReactions(note.reactions),
  };
}

export function fromWord(note: WordNote): FaithNoteItem {
  // 구절 표시 = 책 N장 a-b절 (단일 절이면 "a절"). 피드는 참조만, 본문은 상세에서.
  const verseLabel = note.phaseEnd > note.phaseStart ? `${note.phaseStart}-${note.phaseEnd}` : `${note.phaseStart}`;
  const passageRef = `${note.bibleName} ${note.chapter}장 ${verseLabel}절`;
  return {
    id: String(note.id),
    writerId: note.writerId,
    tab: 'WORD',
    dayKey: getDayKey(note.createdAt),
    createdAt: note.createdAt,
    author: toAuthor(note.writerName, note.writerNickname),
    timeAgo: getTimeAgo(note.createdAt),
    content: [passageRef, note.description].filter(Boolean),
    likeCount: note.likeCount,
    commentCount: note.commentCount ?? 0,
    isLiked: note.isLiked,
    isMine: note.isMine ?? false,
  };
}

const ENDPOINTS: Record<FaithNoteTab, string> = {
  THANKS: '/notes/thanks?scope=ALL',
  PRAYER: '/notes/prayers?scope=ALL',
  WORD: '/bible/notes?scope=ALL',
};

const PAGE_SIZE = 10;

export function useFaithNotes(activeTab: FaithNoteTab) {
  const [notes, setNotes] = useState<FaithNoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);       // 초기/refetch 로딩
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 추가 페이지 로딩
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(0);
  const loadedCountRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);   // 중복 호출 가드 (onEndReached 연타 방지)

  // 한 페이지 로드. append=false면 초기/새로고침(0페이지부터), true면 다음 페이지 누적.
  const load = useCallback(async (tab: FaithNoteTab, pageNum: number, append: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);
    setError(null);
    try {
      const url = `${ENDPOINTS[tab]}&page=${pageNum}&size=${PAGE_SIZE}`;
      let mapped: FaithNoteItem[] = [];
      let total = 0;
      if (tab === 'THANKS') {
        const raw = await apiClient<NoteListResponse<ThanksNote>>(url);
        mapped = (raw.content ?? []).map(fromThanks);
        total = raw.totalElements ?? 0;
      } else if (tab === 'PRAYER') {
        const raw = await apiClient<NoteListResponse<PrayerNote>>(url);
        mapped = (raw.content ?? []).map(fromPrayer);
        total = raw.totalElements ?? 0;
      } else {
        const raw = await apiClient<NoteListResponse<WordNote>>(url);
        mapped = (raw.content ?? []).map(fromWord);
        total = raw.totalElements ?? 0;
      }
      pageRef.current = pageNum;
      loadedCountRef.current = append ? loadedCountRef.current + mapped.length : mapped.length;
      hasMoreRef.current = loadedCountRef.current < total && mapped.length > 0;
      setNotes((cur) => (append ? [...cur, ...mapped] : mapped));
    } catch (e: any) {
      if (!append) setError(e?.message ?? '불러오기 실패');
      else console.warn('[useFaithNotes] loadMore 실패', e);
    } finally {
      if (append) setIsLoadingMore(false);
      else setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // 탭 변경/마운트 → 0페이지부터 새로 로드
  useEffect(() => {
    pageRef.current = 0;
    loadedCountRef.current = 0;
    hasMoreRef.current = true;
    load(activeTab, 0, false);
  }, [activeTab, load]);

  // 다음 페이지 로드 (FlatList onEndReached)
  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) return;
    load(activeTab, pageRef.current + 1, true);
  }, [activeTab, load]);

  const toggleLike = useCallback(async (id: string, tab: FaithNoteTab) => {
    const prev = [...notes];
    setNotes(cur => cur.map(n =>
      n.id === id
        ? { ...n, isLiked: !n.isLiked, likeCount: n.isLiked ? n.likeCount - 1 : n.likeCount + 1 }
        : n
    ));
    try {
      if (tab === 'THANKS') {
        await apiClient(`/notes/thanks/${id}/like`, { method: 'PATCH' });
      } else if (tab === 'WORD') {
        await apiClient(`/bible/notes/${id}/like`, { method: 'PATCH' });
      }
    } catch (e) {
      setNotes(prev);
      console.warn('[useFaithNotes] toggleLike 실패', e);
    }
  }, [notes]);

  // 기도노트 이모지 반응 토글 (낙관적 업데이트 후 PATCH)
  const toggleReaction = useCallback(async (id: string, emoji: string) => {
    const prev = [...notes];
    setNotes((cur) =>
      cur.map((n) =>
        n.id === id
          ? {
              ...n,
              reactions: normalizePrayerReactions(n.reactions).map((r) =>
                r.emoji === emoji
                  ? { ...r, reacted: !r.reacted, count: r.reacted ? r.count - 1 : r.count + 1 }
                  : r,
              ),
            }
          : n,
      ),
    );
    try {
      await apiClient(`/notes/prayers/${id}/reactions`, {
        method: 'PATCH',
        body: JSON.stringify({ emoji }),
      });
    } catch (e) {
      setNotes(prev);
      console.warn('[useFaithNotes] toggleReaction 실패', e);
    }
  }, [notes]);

  const deleteNote = useCallback(async (id: string, tab: FaithNoteTab) => {
    const path =
      tab === 'THANKS' ? `/notes/thanks/${id}`
      : tab === 'PRAYER' ? `/notes/prayers/${id}`
      : `/bible/notes/${id}`;
    await apiClient(path, { method: 'DELETE' });
    setNotes((cur) => cur.filter((n) => n.id !== id));
  }, []);

  const refetch = useCallback(() => {
    pageRef.current = 0;
    loadedCountRef.current = 0;
    hasMoreRef.current = true;
    load(activeTab, 0, false);
  }, [activeTab, load]);

  return { notes, isLoading, isLoadingMore, error, loadMore, toggleLike, toggleReaction, deleteNote, refetch };
}
