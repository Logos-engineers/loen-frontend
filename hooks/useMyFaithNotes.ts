import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import type { FaithNoteItem } from '@/components/faith-note/faith-note-card';
import type { FaithNoteTab } from '@/components/faith-note/faith-note-tab-bar';
import {
  fromThanks,
  fromPrayer,
  fromWord,
  type NoteListResponse,
  type ThanksNote,
  type PrayerNote,
  type WordNote,
} from '@/hooks/useFaithNotes';

/**
 * 마이페이지 신앙노트 로그 — 자신이 작성한 노트만 최신순으로 조회.
 *  - 감사/기도: scope=MINE
 *  - 말씀: writerUid=내 uid
 * @param uid 로그인 사용자 uid (말씀노트 필터용). 없으면 말씀 조회 생략.
 * @param limit 노출 개수 (기본 5)
 */
export function useMyFaithNotes(activeTab: FaithNoteTab, uid: string | null | undefined, limit = 5) {
  const [notes, setNotes] = useState<FaithNoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async (tab: FaithNoteTab) => {
    setIsLoading(true);
    setError(null);
    try {
      if (tab === 'THANKS') {
        const raw = await apiClient<NoteListResponse<ThanksNote>>('/notes/thanks?scope=MINE');
        setNotes((raw.content ?? []).slice(0, limit).map(fromThanks));
      } else if (tab === 'PRAYER') {
        const raw = await apiClient<NoteListResponse<PrayerNote>>('/notes/prayers?scope=MINE');
        setNotes((raw.content ?? []).slice(0, limit).map(fromPrayer));
      } else {
        if (!uid) {
          setNotes([]);
          return;
        }
        const raw = await apiClient<NoteListResponse<WordNote>>(
          `/bible/notes?writerUid=${encodeURIComponent(uid)}`,
        );
        setNotes((raw.content ?? []).slice(0, limit).map(fromWord));
      }
    } catch (e: any) {
      setError(e?.message ?? '불러오기 실패');
    } finally {
      setIsLoading(false);
    }
  }, [uid, limit]);

  useEffect(() => {
    fetchNotes(activeTab);
  }, [activeTab, fetchNotes]);

  const refetch = useCallback(() => fetchNotes(activeTab), [activeTab, fetchNotes]);

  return { notes, isLoading, error, refetch };
}
