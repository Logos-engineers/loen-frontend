/**
 * 디자인 토큰 — Figma 디자인 시스템 기준
 * Figma: trans/gray/a1~a5, trans/primary/a1~a5, background/fill/*
 *
 * 네이밍 원칙 (Figma 시스템 기준):
 *   요소(fg/border/fill/bg) × 의도(basic/inverse/accent) × 강도(strongest→subtlest)
 *
 * 히스토리:
 *   [2026-03-20 v1] 초기 토큰 구성
 *   [2026-03-20 v2] 성경 통독표 시멘틱 토큰 추가
 *   [2026-03-20 v3] 구조 정리:
 *     - readingPlan.segment 제거 (primary / text.secondary 직접 참조)
 *     - shadowColor용 shadow 토큰 분리
 *     - fontSize.stat → fontSize.display / fontSize.circle → fontSize.micro
 */

export const colors = {
  primary: '#6561FF',                    // trans/primary/a1 — 브랜드 메인 컬러
  primaryLight: 'rgba(101,97,255,0.20)', // trans/primary/a5 — secondary 버튼 배경

  white: '#FFFFFF',                      // static/white — 버튼 텍스트, 선택 상태 등

  background: {
    base: '#F2F4F7',                     // bg/basic/subtlest — 앱 전체 배경
    elevated: '#FFFFFF',                 // bg/basic/default — 카드 배경
  },

  text: {
    primary: 'rgba(13,28,45,0.8)',       // fg/basic/stronger
    secondary: 'rgba(13,28,45,0.5)',     // fg/basic/subtle
    dim: 'rgba(13,28,45,0.16)',          // fg/basic/subtlest — 내비게이션 아이콘 비활성
    accent: '#6561FF',                   // fg/accent/default — 링크, 강조 텍스트
  },

  border: 'rgba(13,28,45,0.08)',         // border/basic/subtlest — 구분선, 비활성 칩

  tab: {
    active: 'rgba(13,28,45,0.8)',
    inactive: 'rgba(13,28,45,0.3)',
  },

  badge: {
    background: '#FFFFFF',
    text: 'rgba(13,28,45,0.5)',
  },

  reaction: {
    red: '#FF5358',
    orange: '#FF8E28',
    yellow: '#F1C100',
  },

  correct: '#1687F4',
  incorrect: '#FF5358',

  // ─── 모달 / 오버레이 딤 처리 ────────────────────────────────────
  overlay: {
    default: 'rgba(13,28,45,0.55)',      // 다이얼로그 반투명 배경
    heavy: 'rgba(13,28,45,0.6)',         // 바텀 시트 등 더 강한 딤 — Figma dim/dim
    toast: 'rgba(13,28,45,0.8)',         // toast/snackbar 배경 — trans/neutral/a2
  },

  // ─── 성경 통독표 장(chapter) 전용 색상 ──────────────────────────
  // 주의: readingPlan.segment는 제거됨.
  //   활성 색상 → colors.primary 직접 사용
  //   비활성 텍스트 → colors.text.secondary 직접 사용
  readingPlan: {
    chapter: {
      read: '#6561FF',                   // 읽은 장 배경 — primary 진보라 (100%)
      unread: '#F2F4F7',                 // 안 읽은 장 배경 — Figma count #F2F4F7 (bg/basic/subtlest)
      unreadText: 'rgba(13,28,45,0.8)',  // 안 읽은 장 숫자 — Figma 12/600 fg/basic/stronger
    },
  },
} as const;

// ─── 그림자 전용 토큰 ─────────────────────────────────────────────
// shadowColor에 colors.text.primary 등 의미 불일치 값 사용 방지
export const shadow = {
  color: '#000000',                      // 그림자 기준색 (항상 순수 검정)
  card: {                               // 카드 그림자
    offset: { width: 0, height: 1 },
    opacity: 0.04,
    radius: 6,
    elevation: 1,
  },
  floating: {                           // 플로팅 UI 그림자
    offset: { width: 0, height: 4 },
    opacity: 0.1,
    radius: 12,
    elevation: 8,
  },
} as const;

export const spacing = {
  nano: 2,    // 2px  — chip 내부 gap 등 최소 간격
  xs: 4,
  sm: 8,
  smd: 10,    // 10px — Figma 기본 gap (sm↔smmd 사이)
  smmd: 12,   // 12px — 3×4 grid (sm↔md 사이)
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  xs: 8,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,   // 모달 다이얼로그 반경
  full: 999,
} as const;

export const fontSize = {
  micro: 10,    // 10px — 극소 숫자 (장 번호 원형 내부)
  xs: 11,       // 11px — 배너 날짜, 통계 라벨
  sm: 12,       // 12px — Caption_12_SB
  md: 14,       // 14px — Body2_14
  base: 16,     // 16px — Title3_16_SB
  display: 17,  // 17px — 통계 수치 강조 숫자
  heading: 18,  // 18px — Title2_18_SB (네비게이션/화면 헤더 제목)
  lg: 20,       // 20px — Title1_20_B
  title: 24,    // 24px — 상세 화면 페이지 메인 타이틀
  xl: 22,
  xxl: 28,
} as const;

export const fontWeight = {
  regular: '400',
  medium:  '500',
  semibold:'600',
  bold:    '700',
} as const;
