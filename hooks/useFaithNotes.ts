import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { FaithNoteItem } from '@/components/faith-note/faith-note-card';
import type { FaithNoteTab } from '@/components/faith-note/faith-note-tab-bar';

export type ThanksNote = {
  id: string;
  writerName: string;
  answers: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isMine: boolean;
  createdAt: string;
};

export type PrayerNote = {
  id: string;
  writerName: string;
  prayers: string[];
  commentCount: number;
  isMine: boolean;
  createdAt: string;
};

export type WordNote = {
  id: string;
  writerName: string;
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

function toAuthor(writerName: string) {
  return { handle: '', name: writerName, hasAvatar: false, initial: writerName[0] ?? '?' };
}

export function fromThanks(note: ThanksNote): FaithNoteItem {
  return {
    id: String(note.id),
    tab: 'THANKS',
    dayKey: getDayKey(note.createdAt),
    author: toAuthor(note.writerName),
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
    tab: 'PRAYER',
    dayKey: getDayKey(note.createdAt),
    author: toAuthor(note.writerName),
    timeAgo: getTimeAgo(note.createdAt),
    content: note.prayers,
    likeCount: 0,
    commentCount: note.commentCount ?? 0,
    isLiked: false,
    isMine: note.isMine ?? false,
  };
}

export function fromWord(note: WordNote): FaithNoteItem {
  const passageLabel = `${note.bibleName} ${note.chapter}장 ${note.phaseStart}-${note.phaseEnd}절`;
  return {
    id: String(note.id),
    tab: 'WORD',
    dayKey: getDayKey(note.createdAt),
    author: toAuthor(note.writerName),
    timeAgo: getTimeAgo(note.createdAt),
    content: [passageLabel, note.title, note.description].filter(Boolean),
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

export function useFaithNotes(activeTab: FaithNoteTab) {
  const [notes, setNotes] = useState<FaithNoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async (tab: FaithNoteTab) => {
    setIsLoading(true);
    setError(null);
    try {
      if (tab === 'THANKS') {
        const raw = await apiClient<NoteListResponse<ThanksNote>>(ENDPOINTS.THANKS);
        setNotes((raw.content ?? []).map(fromThanks));
      } else if (tab === 'PRAYER') {
        const raw = await apiClient<NoteListResponse<PrayerNote>>(ENDPOINTS.PRAYER);
        setNotes((raw.content ?? []).map(fromPrayer));
      } else {
        const raw = await apiClient<NoteListResponse<WordNote>>(ENDPOINTS.WORD);
        setNotes((raw.content ?? []).map(fromWord));
      }
    } catch (e: any) {
      setError(e?.message ?? '불러오기 실패');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes(activeTab);
  }, [activeTab, fetchNotes]);

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

  const deleteNote = useCallback(async (id: string, tab: FaithNoteTab) => {
    const path =
      tab === 'THANKS' ? `/notes/thanks/${id}`
      : tab === 'PRAYER' ? `/notes/prayers/${id}`
      : `/bible/notes/${id}`;
    await apiClient(path, { method: 'DELETE' });
    setNotes((cur) => cur.filter((n) => n.id !== id));
  }, []);

  const refetch = useCallback(() => fetchNotes(activeTab), [activeTab, fetchNotes]);

  return { notes, isLoading, error, toggleLike, deleteNote, refetch };
}
