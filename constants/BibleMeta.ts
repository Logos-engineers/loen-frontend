/**
 * BibleMeta.ts
 * 66권 성경 경량 메타데이터 상수 배열.
 * 통독표 메인 화면 렌더링 전용 — 무거운 본문(verses) 전혀 비포함.
 * testament: 'old' = 구약, 'new' = 신약
 */

export type BibleBook = {
  code: string;        // 파일명 코드 (예: 'GEN', 'MAT')
  korName: string;     // 한글 이름 (예: '창세기')
  engName: string;     // 영문 이름 (예: 'Genesis')
  testament: 'old' | 'new';
  chapterCount: number;
};

export const BIBLE_BOOKS: BibleBook[] = [
  // ─── 구약 (39권) ───────────────────────────────────────────
  { code: 'GEN', korName: '창세기',     engName: 'Genesis',          testament: 'old', chapterCount: 50 },
  { code: 'EXO', korName: '출애굽기',   engName: 'Exodus',           testament: 'old', chapterCount: 40 },
  { code: 'LEV', korName: '레위기',     engName: 'Leviticus',        testament: 'old', chapterCount: 27 },
  { code: 'NUM', korName: '민수기',     engName: 'Numbers',          testament: 'old', chapterCount: 36 },
  { code: 'DEU', korName: '신명기',     engName: 'Deuteronomy',      testament: 'old', chapterCount: 34 },
  { code: 'JOS', korName: '여호수아',   engName: 'Joshua',           testament: 'old', chapterCount: 24 },
  { code: 'JDG', korName: '사사기',     engName: 'Judges',           testament: 'old', chapterCount: 21 },
  { code: 'RUT', korName: '룻기',       engName: 'Ruth',             testament: 'old', chapterCount: 4 },
  { code: '1SA', korName: '사무엘상',   engName: '1 Samuel',         testament: 'old', chapterCount: 31 },
  { code: '2SA', korName: '사무엘하',   engName: '2 Samuel',         testament: 'old', chapterCount: 24 },
  { code: '1KI', korName: '열왕기상',   engName: '1 Kings',          testament: 'old', chapterCount: 22 },
  { code: '2KI', korName: '열왕기하',   engName: '2 Kings',          testament: 'old', chapterCount: 25 },
  { code: '1CH', korName: '역대상',     engName: '1 Chronicles',     testament: 'old', chapterCount: 29 },
  { code: '2CH', korName: '역대하',     engName: '2 Chronicles',     testament: 'old', chapterCount: 36 },
  { code: 'EZR', korName: '에스라',     engName: 'Ezra',             testament: 'old', chapterCount: 10 },
  { code: 'NEH', korName: '느헤미야',   engName: 'Nehemiah',         testament: 'old', chapterCount: 13 },
  { code: 'EST', korName: '에스더',     engName: 'Esther',           testament: 'old', chapterCount: 10 },
  { code: 'JOB', korName: '욥기',       engName: 'Job',              testament: 'old', chapterCount: 42 },
  { code: 'PSA', korName: '시편',       engName: 'Psalms',           testament: 'old', chapterCount: 150 },
  { code: 'PRO', korName: '잠언',       engName: 'Proverbs',         testament: 'old', chapterCount: 31 },
  { code: 'ECC', korName: '전도서',     engName: 'Ecclesiastes',     testament: 'old', chapterCount: 12 },
  { code: 'SNG', korName: '아가',       engName: 'Song of Songs',    testament: 'old', chapterCount: 8 },
  { code: 'ISA', korName: '이사야',     engName: 'Isaiah',           testament: 'old', chapterCount: 66 },
  { code: 'JER', korName: '예레미야',   engName: 'Jeremiah',         testament: 'old', chapterCount: 52 },
  { code: 'LAM', korName: '예레미야애가', engName: 'Lamentations',   testament: 'old', chapterCount: 5 },
  { code: 'EZK', korName: '에스겔',     engName: 'Ezekiel',          testament: 'old', chapterCount: 48 },
  { code: 'DAN', korName: '다니엘',     engName: 'Daniel',           testament: 'old', chapterCount: 12 },
  { code: 'HOS', korName: '호세아',     engName: 'Hosea',            testament: 'old', chapterCount: 14 },
  { code: 'JOL', korName: '요엘',       engName: 'Joel',             testament: 'old', chapterCount: 3 },
  { code: 'AMO', korName: '아모스',     engName: 'Amos',             testament: 'old', chapterCount: 9 },
  { code: 'OBA', korName: '오바댜',     engName: 'Obadiah',          testament: 'old', chapterCount: 1 },
  { code: 'JON', korName: '요나',       engName: 'Jonah',            testament: 'old', chapterCount: 4 },
  { code: 'MIC', korName: '미가',       engName: 'Micah',            testament: 'old', chapterCount: 7 },
  { code: 'NAM', korName: '나훔',       engName: 'Nahum',            testament: 'old', chapterCount: 3 },
  { code: 'HAB', korName: '하박국',     engName: 'Habakkuk',         testament: 'old', chapterCount: 3 },
  { code: 'ZEP', korName: '스바냐',     engName: 'Zephaniah',        testament: 'old', chapterCount: 3 },
  { code: 'HAG', korName: '학개',       engName: 'Haggai',           testament: 'old', chapterCount: 2 },
  { code: 'ZEC', korName: '스가랴',     engName: 'Zechariah',        testament: 'old', chapterCount: 14 },
  { code: 'MAL', korName: '말라기',     engName: 'Malachi',          testament: 'old', chapterCount: 4 },

  // ─── 신약 (27권) ───────────────────────────────────────────
  { code: 'MAT', korName: '마태복음',   engName: 'Matthew',          testament: 'new', chapterCount: 28 },
  { code: 'MRK', korName: '마가복음',   engName: 'Mark',             testament: 'new', chapterCount: 16 },
  { code: 'LUK', korName: '누가복음',   engName: 'Luke',             testament: 'new', chapterCount: 24 },
  { code: 'JHN', korName: '요한복음',   engName: 'John',             testament: 'new', chapterCount: 21 },
  { code: 'ACT', korName: '사도행전',   engName: 'Acts',             testament: 'new', chapterCount: 28 },
  { code: 'ROM', korName: '로마서',     engName: 'Romans',           testament: 'new', chapterCount: 16 },
  { code: '1CO', korName: '고린도전서', engName: '1 Corinthians',    testament: 'new', chapterCount: 16 },
  { code: '2CO', korName: '고린도후서', engName: '2 Corinthians',    testament: 'new', chapterCount: 13 },
  { code: 'GAL', korName: '갈라디아서', engName: 'Galatians',        testament: 'new', chapterCount: 6 },
  { code: 'EPH', korName: '에베소서',   engName: 'Ephesians',        testament: 'new', chapterCount: 6 },
  { code: 'PHP', korName: '빌립보서',   engName: 'Philippians',      testament: 'new', chapterCount: 4 },
  { code: 'COL', korName: '골로새서',   engName: 'Colossians',       testament: 'new', chapterCount: 4 },
  { code: '1TH', korName: '데살로니가전서', engName: '1 Thessalonians', testament: 'new', chapterCount: 5 },
  { code: '2TH', korName: '데살로니가후서', engName: '2 Thessalonians', testament: 'new', chapterCount: 3 },
  { code: '1TI', korName: '디모데전서', engName: '1 Timothy',        testament: 'new', chapterCount: 6 },
  { code: '2TI', korName: '디모데후서', engName: '2 Timothy',        testament: 'new', chapterCount: 4 },
  { code: 'TIT', korName: '디도서',     engName: 'Titus',            testament: 'new', chapterCount: 3 },
  { code: 'PHM', korName: '빌레몬서',   engName: 'Philemon',         testament: 'new', chapterCount: 1 },
  { code: 'HEB', korName: '히브리서',   engName: 'Hebrews',          testament: 'new', chapterCount: 13 },
  { code: 'JAS', korName: '야고보서',   engName: 'James',            testament: 'new', chapterCount: 5 },
  { code: '1PE', korName: '베드로전서', engName: '1 Peter',          testament: 'new', chapterCount: 5 },
  { code: '2PE', korName: '베드로후서', engName: '2 Peter',          testament: 'new', chapterCount: 3 },
  { code: '1JN', korName: '요한일서',   engName: '1 John',           testament: 'new', chapterCount: 5 },
  { code: '2JN', korName: '요한이서',   engName: '2 John',           testament: 'new', chapterCount: 1 },
  { code: '3JN', korName: '요한삼서',   engName: '3 John',           testament: 'new', chapterCount: 1 },
  { code: 'JUD', korName: '유다서',     engName: 'Jude',             testament: 'new', chapterCount: 1 },
  { code: 'REV', korName: '요한계시록', engName: 'Revelation',       testament: 'new', chapterCount: 22 },
];

/** 총 1189장 */
export const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapterCount, 0);

/** 주간 목표 (MVP 고정값) */
export const WEEKLY_GOAL_CHAPTERS = 7;
