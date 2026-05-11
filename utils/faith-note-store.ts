/**
 * faith-note-store.ts
 * 모듈 레벨 인메모리 스토어 — 실제 앱에서는 API / Zustand 등으로 교체
 */

import { FaithNoteItem } from '@/components/faith-note/faith-note-card';

// ─── 초기 목 데이터 ────────────────────────────────────────────────────────────

const INITIAL_NOTES: FaithNoteItem[] = [
  // 감사노트
  {
    id: 'thanks-1',
    tab: 'THANKS',
    dayKey: 'MON',
    author: { handle: 'potatolov_er', name: '남현서', hasAvatar: false, initial: '남' },
    timeAgo: '38분',
    content: ['오늘도 숨 쉴 수 있음에 감사', '맛있는 점심식사 감사', '일 할 수 있어서 감사^^'],
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
  },
  {
    id: 'thanks-2',
    tab: 'THANKS',
    dayKey: 'MON',
    author: { handle: 'holy_hye', name: '김성백', hasAvatar: false, initial: '김' },
    timeAgo: '2시간',
    content: [
      '걱정했던 일이 잘 마무리되어 감사',
      '오늘 만난 사람들 덕분에 웃을 수 있어서 감사',
      '마음이 흔들릴 때 붙잡아주는 말 한마디와 날 잡아주는 사람들이 있음에 감사',
      '햇살이 따뜻해서 감사',
    ],
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
  },
  {
    id: 'thanks-3',
    tab: 'THANKS',
    dayKey: 'MON',
    author: { handle: 'yonipark', name: '박채연', hasAvatar: false, initial: '박' },
    timeAgo: '2시간',
    content: ['커피 한 잔의 여유에 감사', '전오 일로 한 가구 케피이 당겨짐에'],
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
  },
  {
    id: 'thanks-4',
    tab: 'THANKS',
    dayKey: 'WED',
    author: { handle: 'tabo1234', name: '이윤재', hasAvatar: false, initial: '이' },
    timeAgo: '1분',
    content: [
      '오팬만에 저녁 외식함에 감사',
      '일찍 일어남에 감사',
      '추운 날 목도리 챙김에 감사',
      '오팬만에 러닝 감사',
    ],
    likeCount: 8,
    commentCount: 3,
    isLiked: true,
  },
  {
    id: 'thanks-5',
    tab: 'THANKS',
    dayKey: 'WED',
    author: { handle: 'bobobo', name: '김보현', hasAvatar: false, initial: '김' },
    timeAgo: '12시간',
    content: [
      '발표 무사히 마침에 감사',
      '친구랑 즐거운 수다 시간 감사',
      '공짜 커피 감사',
      '병원 다녀옴에 감사',
    ],
    likeCount: 2,
    commentCount: 6,
    isLiked: false,
  },
  {
    id: 'thanks-6',
    tab: 'THANKS',
    dayKey: 'WED',
    author: { handle: 'dev_back', name: '백은섭', hasAvatar: false, initial: '백' },
    timeAgo: '1일',
    content: ['머리가 아팠는데 괜찮아짐에 감사'],
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
  },

  // 기도노트
  {
    id: 'prayer-1',
    tab: 'PRAYER',
    dayKey: 'MON',
    author: { handle: 'tabo1234', name: '이윤재', hasAvatar: false, initial: '이' },
    timeAgo: '1분',
    content: [
      '2지 편경 무사히 보길',
      '좋은 면접 결과가 있길',
      '오늘 만난 친구가 한 번이라도 교회에 오길',
      '가족들을 인도할 수 있길',
    ],
    likeCount: 8,
    commentCount: 3,
    isLiked: true,
  },
  {
    id: 'prayer-2',
    tab: 'PRAYER',
    dayKey: 'WED',
    author: { handle: 'potatolov_er', name: '남현서', hasAvatar: false, initial: '남' },
    timeAgo: '38분',
    content: ['부트캠프 무사히 끝낼 수 있길', '로엔 프로젝트가 무사히 끝나길'],
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
  },

  // 말씀노트
  {
    id: 'word-1',
    tab: 'WORD',
    dayKey: 'MON',
    author: { handle: 'tabo1234', name: '이윤재', hasAvatar: false, initial: '이' },
    timeAgo: '1분',
    content: [
      '창세기 1:3 묵상',
      '',
      '"하나님이 이르시되 빛이 있으라 하시니 빛이 있었고"',
      '',
      '1. 말씀 관찰',
      '',
      "창세기의 시작은 '행동'이 아니라 '말씀'이다.",
    ],
    likeCount: 8,
    commentCount: 3,
    isLiked: true,
  },
  {
    id: 'word-2',
    tab: 'WORD',
    dayKey: 'WED',
    author: { handle: 'potatolov_er', name: '남현서', hasAvatar: false, initial: '남' },
    timeAgo: '38분',
    content: [
      '오늘도 하나님은 이미 나의 길 앞에 빛을 켜두셨다. 나는 걱정보다 믿음을 선택하며, 한 걸음씩 그 빛을 따라 걷는다.',
    ],
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
  },
];

// ─── 스토어 ────────────────────────────────────────────────────────────────────

let _notes: FaithNoteItem[] = [...INITIAL_NOTES];

export const faithNoteStore = {
  /** 현재 노트 목록 반환 */
  getNotes(): FaithNoteItem[] {
    return _notes;
  },

  /** 새 노트를 목록 앞에 추가 */
  addNote(note: FaithNoteItem): void {
    _notes = [note, ..._notes];
  },

  /** 좋아요 토글 */
  toggleLike(id: string): void {
    _notes = _notes.map((n) =>
      n.id === id
        ? {
            ...n,
            isLiked: !n.isLiked,
            likeCount: n.isLiked ? n.likeCount - 1 : n.likeCount + 1,
          }
        : n,
    );
  },
};

/** 오늘 요일 키 반환 (e.g., 'WED') */
export function getTodayKey(): string {
  const keys = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return keys[new Date().getDay()] ?? 'MON';
}

// ─── 말씀노트 성경 선택 임시 저장 (write-word ↔ select-bible) ─────────────────

export interface BiblePassage {
  book: string;
  chapter: number;
}

let _pendingPassages: BiblePassage[] = [];

export function getPendingPassages(): BiblePassage[] {
  return [..._pendingPassages];
}
export function setPendingPassages(passages: BiblePassage[]): void {
  _pendingPassages = passages;
}
export function clearPendingPassages(): void {
  _pendingPassages = [];
}
