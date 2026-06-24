<div align="center">

# Loen — Mobile App

**신앙·성경 읽기 앱의 React Native 클라이언트**
말씀 묵상 · OBS 복습 · 성경 읽기 · 신앙노트 · 챌린지

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Expo Router](https://img.shields.io/badge/Expo_Router-file_based-000020?logo=expo&logoColor=white)

📱 App Store(TestFlight) · Google Play 비공개 테스트 베타 운영 중

</div>

---

## 개요

Loen 모바일 앱은 [Loen 백엔드](https://github.com/Logos-engineers/loen-backend)와 통신하는
**현재 유일한 출시 대상 클라이언트**입니다. Expo Router 기반 파일 라우팅과 TypeScript로 작성했고,
EAS Build로 빌드, EAS Update(OTA)로 무중단 배포합니다.

> 전체 시스템 구조는 조직 프로필 → **[Logos Engineers](https://github.com/Logos-engineers)** 참고

## 스크린샷

<!-- TODO: store-assets/ 의 실제 앱 스크린샷 3~4장 추가 (홈 · OBS 복습 · 성경 읽기 · 신앙노트) -->
> 스크린샷 추가 예정 — 홈 / OBS 복습 / 성경 읽기 / 신앙노트

## 주요 기능

| 영역 | 설명 |
|------|------|
| **홈** | 오늘의 말씀·성경 읽기 진행·신앙 활동 요약 |
| **OBS 복습** | 주일 말씀(PDF)에서 AI가 생성한 퀴즈로 복습 플로우 |
| **성경 읽기** | 읽기 목표 설정·진행률 추적 |
| **신앙노트** | 감사·기도·말씀·염려 저널링 (작성·댓글·신고/차단) |
| **챌린지** | 신앙/성경 챌린지 + 인증 |
| **오이코스** | 소그룹(가정) 커뮤니티 |
| **인증** | Google 소셜 로그인 + 이메일 회원가입 (JWT) |

## 기술 스택 & 설계

- **React Native 0.81 · Expo ~54 · TypeScript** — Expo Router 파일 기반 라우팅
- **EAS Build / Update** — JS 변경은 OTA로 즉시 반영, 네이티브 변경만 새 빌드
- **dev / prod 환경 분리** — `APP_ENV` 스위치로 `com.loen.app.dev` 별도 앱이 공존,
  OAuth 클라이언트·API URL·구글 설정이 환경별로 자동 분기
- **데이터 훅 패턴** — 도메인별 커스텀 훅으로 API 연동, 목록/홈 화면은 `useRefetchOnFocus`로
  포커스 시 갱신
- **백엔드 중계** — AI 서비스를 직접 호출하지 않고 백엔드를 통해서만 접근

## 프로젝트 구조

```
app/
  (tabs)/        # 하단 탭 네비게이션 (홈 · 교회 · 탐색 · 더보기)
  obs/           # 주일 말씀 복습 라우트
components/
  ui/            # 재사용 프리미티브 (card, button, section-header …)
  home/          # 홈 화면 섹션 컴포넌트
  shared/        # 화면 간 공유 컴포넌트
constants/
  theme.ts       # 색상 · 타이포그래피
  tokens.ts      # 디자인 토큰
hooks/           # 커스텀 React 훅 (데이터 연동 등)
```

경로 별칭 `@/*` 는 프로젝트 루트를 가리킵니다 (`tsconfig.json`).

## 로컬 실행

```bash
npm install
npx expo start      # QR 스캔 (Expo Go)
# 또는
npm run ios
npm run android
```

환경 변수는 `.env` (공통) / `.env.local` (로컬 오버라이드)로 관리합니다.
`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_*` 등이 필요합니다.

## 관련 저장소

- [loen-backend](https://github.com/Logos-engineers/loen-backend) — 메인 API 서버 (Spring Boot)
- [ai-server-loen](https://github.com/Logos-engineers/ai-server-loen) — PDF 분석·퀴즈 생성 (FastAPI · Gemini)
- [loen-qa-bot](https://github.com/Logos-engineers/loen-qa-bot) — QA 제보 자동 분류 봇

---

<div align="center">
<sub>← 전체 구조: <a href="https://github.com/Logos-engineers">Logos Engineers</a></sub>
</div>
