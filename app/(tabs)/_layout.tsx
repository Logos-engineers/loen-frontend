import { HapticTab } from '@/components/haptic-tab';
import { colors } from '@/constants/tokens';
import { Tabs } from 'expo-router';
import React from 'react';
import { SvgXml } from 'react-native-svg';

// ─── Bottom Navigator SVG 상수 ────────────────────────────────────────────────
const BOOKBIBLE_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.5713 4.57129C25.3615 4.57129 26 5.20982 26 6V26C25.9999 26.7901 25.3614 27.4287 24.5713 27.4287H10.2861C7.92006 27.4287 6 25.5086 6 23.1426V8.85742C6 6.49135 7.92006 4.57129 10.2861 4.57129H24.5713ZM16.083 10.9521C15.7362 10.9524 15.4522 11.2362 15.4521 11.583V13.4756H13.5596C13.2127 13.4756 12.9289 13.7596 12.9287 14.1064V15.3691C12.9289 15.7159 13.2127 16 13.5596 16H15.4521V20.416C15.4521 20.7629 15.7362 21.0467 16.083 21.0469H17.3457C17.6925 21.0467 17.9766 20.7629 17.9766 20.416V16H19.8691C20.216 16 20.4998 15.7159 20.5 15.3691V14.1064C20.4998 13.7596 20.216 13.4756 19.8691 13.4756H17.9766V11.583C17.9765 11.2362 17.6925 10.9524 17.3457 10.9521H16.083Z" fill="FILL_COLOR" fill-opacity="FILL_OPACITY"/>
</svg>`;

const CHURCHLIFE_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.11111 9.88889C7.11111 8.59227 7.62619 7.34877 8.54303 6.43192C9.45988 5.51508 10.7034 5 12 5C13.2966 5 14.5401 5.51508 15.457 6.43192C16.3738 7.34877 16.8889 8.59227 16.8889 9.88889C16.8889 11.1855 16.3738 12.429 15.457 13.3459C14.5401 14.2627 13.2966 14.7778 12 14.7778C10.7034 14.7778 9.45988 14.2627 8.54303 13.3459C7.62619 12.429 7.11111 11.1855 7.11111 9.88889ZM7.11111 17.2222C5.49034 17.2222 3.93596 17.8661 2.7899 19.0121C1.64385 20.1582 1 21.7126 1 23.3333C1 24.3058 1.38631 25.2384 2.07394 25.9261C2.76158 26.6137 3.69421 27 4.66667 27H19.3333C20.3058 27 21.2384 26.6137 21.9261 25.9261C22.6137 25.2384 23 24.3058 23 23.3333C23 21.7126 22.3562 20.1582 21.2101 19.0121C20.064 17.8661 18.5097 17.2222 16.8889 17.2222H7.11111Z" fill="FILL_COLOR" fill-opacity="FILL_OPACITY"/>
<path d="M22.8887 17.2227C24.5093 17.2227 26.0639 17.8658 27.21 19.0117C28.3559 20.1577 28.9999 21.7124 29 23.333C29 24.3055 28.6134 25.2381 27.9258 25.9258C27.2381 26.6134 26.3055 27 25.333 27H22.9717C22.9764 26.9953 22.9816 26.991 22.9863 26.9863C23.9553 26.0174 24.5 24.7033 24.5 23.333C24.4999 21.3145 23.6978 19.3785 22.2705 17.9512C22.0056 17.6863 21.723 17.4433 21.4258 17.2227H22.8887Z" fill="FILL_COLOR" fill-opacity="FILL_OPACITY"/>
<path d="M18 5C19.2966 5 20.5402 5.51486 21.457 6.43164C22.3738 7.34843 22.8886 8.59214 22.8887 9.88867C22.8887 11.1852 22.3738 12.4289 21.457 13.3457C20.5402 14.2625 19.2966 14.7773 18 14.7773C17.4529 14.7773 16.9158 14.6846 16.4082 14.5098C16.4445 14.4752 16.482 14.4418 16.5176 14.4062C17.7157 13.2081 18.3887 11.5831 18.3887 9.88867C18.3886 8.19431 17.7157 6.56919 16.5176 5.37109C16.4819 5.3354 16.4447 5.30136 16.4082 5.2666C16.9157 5.09182 17.4531 5 18 5Z" fill="FILL_COLOR" fill-opacity="FILL_OPACITY"/>
</svg>`;

const PLAN_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 6C8 5.44772 8.44772 5 9 5H23C23.5523 5 24 5.44772 24 6V26.5C24 26.8787 23.786 27.2246 23.4472 27.4036C23.1083 27.5825 22.7048 27.5628 22.3846 27.3521L16 23.418L9.61538 27.3521C9.29519 27.5628 8.89172 27.5825 8.55279 27.4036C8.21386 27.2246 8 26.8787 8 26.5V6Z" fill="FILL_COLOR" fill-opacity="FILL_OPACITY"/></svg>`;

const SEEMORE_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 16C5.5 10.2009 10.2009 5.5 16 5.5C21.7991 5.5 26.5 10.2009 26.5 16C26.5 21.7991 21.7991 26.5 16 26.5C10.2009 26.5 5.5 21.7991 5.5 16ZM12.8605 16C12.8605 15.5823 12.6946 15.1817 12.3992 14.8863C12.1038 14.5909 11.7032 14.425 11.2855 14.425H11.275C10.8573 14.425 10.4567 14.5909 10.1613 14.8863C9.86594 15.1817 9.7 15.5823 9.7 16V16.0105C9.7 16.4282 9.86594 16.8288 10.1613 17.1242C10.4567 17.4196 10.8573 17.5855 11.275 17.5855H11.2855C11.7032 17.5855 12.1038 17.4196 12.3992 17.1242C12.6946 16.8288 12.8605 16.4282 12.8605 16.0105V16ZM17.5855 16C17.5855 15.5823 17.4196 15.1817 17.1242 14.8863C16.8288 14.5909 16.4282 14.425 16.0105 14.425H16C15.5823 14.425 15.1817 14.5909 14.8863 14.8863C14.5909 15.1817 14.425 15.5823 14.425 16V16.0105C14.425 16.4282 14.5909 16.8288 14.8863 17.1242C15.1817 17.4196 15.5823 17.5855 16 17.5855H16.0105C16.4282 17.5855 16.8288 17.4196 17.1242 17.1242C17.4196 16.8288 17.5855 16.4282 17.5855 16.0105V16ZM20.7355 14.425C21.1532 14.425 21.5538 14.5909 21.8492 14.8863C22.1446 15.1817 22.3105 15.5823 22.3105 16V16.0105C22.3105 16.4282 22.1446 16.8288 21.8492 17.1242C21.5538 17.4196 21.1532 17.5855 20.7355 17.5855H20.725C20.3073 17.5855 19.9067 17.4196 19.6113 17.1242C19.3159 16.8288 19.15 16.4282 19.15 16.0105V16C19.15 15.5823 19.3159 15.1817 19.6113 14.8863C19.9067 14.5909 20.3073 14.425 20.725 14.425H20.7355Z" fill="FILL_COLOR" fill-opacity="FILL_OPACITY"/>
</svg>`;

// SVG fill 색상을 active/inactive에 맞게 교체하는 헬퍼
function getTabIcon(svgTemplate: string, color: string) {
  // color가 rgba(13,28,45,0.8)이면 active, 0.3이면 inactive
  const isActive = !color.includes('0.3');
  return svgTemplate
    .replace(/FILL_COLOR/g, '#0D1C2D')
    .replace(/FILL_OPACITY/g, isActive ? '0.8' : '0.3');
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.tab.active,
        tabBarInactiveTintColor: colors.tab.inactive,
        tabBarStyle: {
          backgroundColor: colors.background.elevated,  // #FFFFFF
          borderTopColor: colors.border,
          borderTopWidth: 1,
          // 기본 그림자(Android elevation / iOS shadow) 제거 — 디자인엔 회색 그림자 없이 흰색 페이드만 존재
          elevation: 0,
          shadowOpacity: 0,
          shadowColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '신앙생활',
          tabBarIcon: ({ color }) => (
            <SvgXml xml={getTabIcon(BOOKBIBLE_SVG, color)} width={24} height={24} />
          ),
        }}
      />
      {/* 라우트는 유지하되 탭 바에서는 숨김 (홈 "전체 통독표 보기"에서 push로 진입) */}
      <Tabs.Screen
        name="plan"
        options={{
          href: null,
          title: '성경통독표',
          tabBarIcon: ({ color }) => (
            <SvgXml xml={getTabIcon(PLAN_SVG, color)} width={24} height={24} />
          ),
        }}
      />
      {/* 사용하지 않는 explore 화면 — 탭 바에서 숨김 */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      {/* 교회생활 탭 — 우선 하단 네비게이션에서 제거 (라우트는 유지) */}
      <Tabs.Screen
        name="church"
        options={{
          href: null,
          title: '교회생활',
          tabBarIcon: ({ color }) => (
            <SvgXml xml={getTabIcon(CHURCHLIFE_SVG, color)} width={24} height={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '더보기',
          tabBarIcon: ({ color }) => (
            <SvgXml xml={getTabIcon(SEEMORE_SVG, color)} width={24} height={24} />
          ),
        }}
      />
    </Tabs>
  );
}
