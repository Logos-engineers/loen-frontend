/**
 * 디자인 토큰
 * Figma 디자인 시스템의 색상, 간격, 반경 값을 정의합니다.
 */

export const colors = {
  primary: '#6B66D9',         // 보라색 버튼 (OBS 시작하기, 챌린지 참여하기)
  primaryLight: '#EAE9F9',    // 보라색 연하게 (이어읽기 버튼 배경)

  background: {
    base: '#F2F2F7',          // 앱 전체 배경 (연한 회색)
    elevated: '#FFFFFF',      // 카드 배경 (흰색)
  },

  text: {
    primary: '#111111',       // 주요 본문 텍스트
    secondary: '#888888',     // 보조 텍스트 (날짜, 소제목)
    accent: '#6B66D9',        // 강조 텍스트 (링크, 전체 통독표 보기)
    dim: '#AAAAAA',           // 흐린 텍스트
  },

  border: '#E5E5EA',          // 카드 테두리

  tab: {
    active: '#111111',        // 탭 활성 아이콘
    inactive: '#C7C7CC',      // 탭 비활성 아이콘
  },

  badge: {
    background: 'rgba(0,0,0,0.45)', // 배너 1/10 뱃지 배경
    text: '#FFFFFF',
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
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const fontWeight = {
  regular: '400',
  medium:  '500',
  semibold:'600',
  bold:    '700',
} as const;
