/**
 * 디자인 토큰 — Figma 디자인 시스템 정확값
 * trans/gray/a1~a5, trans/primary/a1~a5, background/fill/*
 */

export const colors = {
  primary: '#6561FF',                    // trans/primary/a1
  primaryLight: 'rgba(101,97,255,0.20)', // trans/primary/a5 — secondary 버튼 배경

  background: {
    base: '#F2F4F7',                     // background/fill/elevated — 앱 전체 배경
    elevated: '#FFFFFF',                 // background/fill/common — 카드 배경
  },

  text: {
    primary: 'rgba(13,28,45,0.8)',       // trans/gray/a2
    secondary: 'rgba(13,28,45,0.5)',     // trans/gray/a3
    dim: 'rgba(13,28,45,0.16)',          // trans/gray/a4 (내비게이션 아이콘 등)
    accent: '#6561FF',                   // trans/primary/a1 — 링크, 강조 텍스트
  },

  border: 'rgba(13,28,45,0.08)',         // trans/gray/a5 (구분선, 비활성 칩)

  tab: {
    active: 'rgba(13,28,45,0.8)',
    inactive: 'rgba(13,28,45,0.3)',
  },

  badge: {
    background: '#FFFFFF',               // 배너 1/N 뱃지 흰색
    text: 'rgba(13,28,45,0.5)',
  },

  // 반응 태그 색
  reaction: {
    red: '#FF5358',     // trans/red/a1   — 하트
    orange: '#FF8E28',  // trans/orange/a1 — 불꽃
    yellow: '#F1C100',  // trans/yellow/a1 — 이모지
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
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
  full: 999,
} as const;

export const fontSize = {
  xs: 11,   // 11px — 배너 날짜 등
  sm: 12,   // 12px — Caption_12
  md: 14,   // 14px — Body2_14
  base: 16, // 16px — Title3_16 (섹션 헤더, 버튼)
  lg: 20,   // 20px — Title1_20_B (OBS 카드 제목)
  xl: 22,
  xxl: 28,
} as const;

export const fontWeight = {
  regular: '400',
  medium:  '500',
  semibold:'600',
  bold:    '700',
} as const;
