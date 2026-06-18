import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { FaithNoteItem } from '@/components/faith-note/faith-note-card';
import type { FaithNoteTab } from '@/components/faith-note/faith-note-tab-bar';

export type ThanksNote = {
  id: string;
  writerId?: string;
  writerName: string;
  writerNickname: string | null;
  writerProfileImage?: string | null;
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
  writerProfileImage?: string | null;
  prayers: string[];
  commentCount: number;
  isMine: boolean;
  createdAt: string;
  reactions: ReactionItem[];
};

export type WordPassage = {
  bibleName: string;
  bibleEnglishShort?: string;
  chapter: number;
  phaseStart: number;
  phaseEnd: number;
};

export type WordNote = {
  id: string;
  writerId?: string;
  writerName: string;
  writerNickname: string | null;
  writerProfileImage?: string | null;
  bibleName: string;
  chapter: number;
  phaseStart: number;
  phaseEnd: number;
  // 여러 구절. 구버전 데이터는 없을 수 있어 단일 필드로 폴백.
  passages?: WordPassage[];
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

function toAuthor(writerName: string, writerNickname?: string | null, writerProfileImage?: string | null) {
  const nick = writerNickname?.trim() ?? '';
  const display = nick || writerName;
  const imageUri = writerProfileImage?.trim() || null;
  return { handle: '', name: writerName, nickname: nick, hasAvatar: !!imageUri, initial: display[0] ?? '?', imageUri };
}

export function fromThanks(note: ThanksNote): FaithNoteItem {
  return {
    id: String(note.id),
    writerId: note.writerId,
    tab: 'THANKS',
    dayKey: getDayKey(note.createdAt),
    createdAt: note.createdAt,
    author: toAuthor(note.writerName, note.writerNickname, note.writerProfileImage),
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
    author: toAuthor(note.writerName, note.writerNickname, note.writerProfileImage),
    timeAgo: getTimeAgo(note.createdAt),
    content: note.prayers,
    likeCount: 0,
    commentCount: note.commentCount ?? 0,
    isLiked: false,
    isMine: note.isMine ?? false,
    reactions: normalizePrayerReactions(note.reactions),
  };
}

// 구절 하나의 참조 라벨 = "책 N:a-b" (단일 절이면 "책 N:a"). 예: 창세기 1:6-7
function passageRefLabel(p: WordPassage): string {
  const verseLabel = p.phaseEnd > p.phaseStart ? `${p.phaseStart}-${p.phaseEnd}` : `${p.phaseStart}`;
  return `${p.bibleName} ${p.chapter}:${verseLabel}`;
}

// 노트의 구절 목록 — passages가 있으면 그대로, 없으면 단일 필드를 1개짜리로 폴백(구버전 호환).
export function wordPassages(note: WordNote | WordPassage & { passages?: WordPassage[] }): WordPassage[] {
  if (note.passages && note.passages.length > 0) return note.passages;
  return [{
    bibleName: note.bibleName,
    chapter: note.chapter,
    phaseStart: note.phaseStart,
    phaseEnd: note.phaseEnd,
  }];
}

export function fromWord(note: WordNote): FaithNoteItem {
  // 구절 표시 = 책 N장 a-b절. 여러 구절이면 ", "로 이어 모두 노출. 피드는 참조만, 본문은 상세에서.
  const passageRef = wordPassages(note).map(passageRefLabel).join(', ');
  return {
    id: String(note.id),
    writerId: note.writerId,
    tab: 'WORD',
    dayKey: getDayKey(note.createdAt),
    createdAt: note.createdAt,
    author: toAuthor(note.writerName, note.writerNickname, note.writerProfileImage),
    timeAgo: getTimeAgo(note.createdAt),
    content: [passageRef, note.description].filter(Boolean),
    likeCount: note.likeCount,
    commentCount: note.commentCount ?? 0,
    isLiked: note.isLiked,
    isMine: note.isMine ?? false,
  };
}

// 공개 범위. PUBLIC = 전체공개만(홈 '같이 기도해요' 등 공개 피드), ALL = 내가 볼 수 있는 전체(탭 목록).
export type FaithNoteScope = 'ALL' | 'PUBLIC' | 'MINE' | 'OIKOS';

const ENDPOINT_BASE: Record<FaithNoteTab, string> = {
  THANKS: '/notes/thanks',
  PRAYER: '/notes/prayers',
  WORD: '/bible/notes',
};

const PAGE_SIZE = 10;

export function useFaithNotes(activeTab: FaithNoteTab, scope: FaithNoteScope = 'ALL') {
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
      const url = `${ENDPOINT_BASE[tab]}?scope=${scope}&page=${pageNum}&size=${PAGE_SIZE}`;
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
  }, [scope]);

  // 탭 변경/마운트 → 0페이지부터 새로 로드
  useEffect(() => {
    pageRef.current = 0;
    loadedCountRef.current = 0;
    hasMoreRef.current = true;
    load(activeTab, 0, false);
  }, [activeTab, scope, load]);

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
  }, [activeTab, scope, load]);

  return { notes, isLoading, isLoadingMore, error, loadMore, toggleLike, toggleReaction, deleteNote, refetch };
}
