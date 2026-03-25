# Loen API 문서 (프론트엔드용)

_최종 업데이트: 2026-03-20 | 서버 버전: MVP M2 완료_

---

## 목차

1. [공통 규칙](#1-공통-규칙)
2. [인증 (Auth)](#2-인증-auth)
3. [사용자 (User)](#3-사용자-user)
4. [OBS 자료](#4-obs-자료)
5. [성경 읽기 (Bible)](#5-성경-읽기-bible)
6. [챌린지 (Challenge)](#6-챌린지-challenge)
7. [신앙 노트 (Note)](#7-신앙-노트-note)
8. [오이코스 (Oikos)](#8-오이코스-oikos)
9. [공지사항 (Notice)](#9-공지사항-notice)
10. [에러 코드 목록](#10-에러-코드-목록)
11. [엔드포인트 요약](#11-엔드포인트-요약)

---

## 1. 공통 규칙

### Base URL
```
http://localhost:8080   (개발)
```

### 인증
- 모든 API (`/api/v1/auth/**` 제외)는 요청 헤더에 Access Token 필요
```
Authorization: Bearer {accessToken}
```
- Access Token 유효시간: **1시간**
- 만료 시 `POST /api/v1/auth/refresh`로 재발급

### 공통 응답 형식

**성공**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": { ... }
}
```

> 데이터가 없는 응답(생성/수정/삭제 성공 등)은 `"data": null`

**실패**
```json
{
  "status": 404,
  "message": "챌린지를 찾을 수 없습니다.",
  "data": null
}
```

### 페이지네이션 (목록 조회 공통)

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| page | int | 0 | 페이지 번호 (0-indexed) |
| size | int | 10 | 페이지 크기 |
| sort | string | `createdAt,desc` | 정렬 기준 |

---

## 2. 인증 (Auth)

### POST /api/v1/auth/login
Google OAuth2 idToken 검증 후 JWT 발급

**Request Body**
```json
{
  "idToken": "google_id_token_string"
}
```

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "isNewUser": true
  }
}
```

> `isNewUser: true`이면 프로필 설정 화면으로 이동

**에러**

| status | message |
|--------|---------|
| 401 | 유효하지 않은 Google ID 토큰입니다. |

---

### POST /api/v1/auth/refresh
Access Token 만료 시 재발급

**Request Body**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

**에러**

| status | message |
|--------|---------|
| 401 | 만료된 토큰입니다. |
| 401 | 리프레시 토큰이 일치하지 않습니다. |

---

### POST /api/v1/auth/logout
현재 Refresh Token 무효화

**Request Body**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

---

## 3. 사용자 (User)

### GET /api/v1/users/me
내 프로필 조회

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "uid": "google_uid",
    "email": "user@example.com",
    "name": "홍길동",
    "nickname": "길동",
    "birthday": "1999-05-17",
    "mbti": "INFP",
    "phone": "010-1234-5678",
    "profileImage": "https://...",
    "hobbies": ["독서", "등산"],
    "oikosId": "oikos_uuid"
  }
}
```

---

### PUT /api/v1/users/me
내 프로필 수정

**Request Body**
```json
{
  "nickname": "새닉네임",
  "birthday": "1999-05-17",
  "mbti": "ENFP",
  "phone": "010-9876-5432",
  "profileImage": "https://...",
  "hobbies": ["독서", "영화"]
}
```

**Response** — 수정된 프로필 반환 (GET /users/me와 동일 구조)

---

## 4. OBS 자료

### GET /api/v1/obs/contents
OBS 콘텐츠 목록 (아카이브)

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| keyword | string | 제목 검색 |
| scrapOnly | boolean | 스크랩한 것만 |
| from | string (yyyy-MM-dd) | 날짜 필터 시작 |
| to | string (yyyy-MM-dd) | 날짜 필터 종료 |
| sort | string | `publishedDate,desc` (기본) |

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "content": [
      {
        "id": 1,
        "title": "주만 바라보는 삶",
        "biblePassage": "히브리서 7:1-10",
        "publishedDate": "2025-07-06",
        "weekLabel": "7월 1째주",
        "isScraped": false,
        "reviewStatus": "DONE"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 52,
    "totalPages": 6
  }
}
```

> `reviewStatus`: `NOT_STARTED` | `IN_PROGRESS` | `DONE`

---

### GET /api/v1/obs/contents/current
이번 주 OBS 콘텐츠 조회

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "id": 10,
    "title": "제사로 지켜가는 신앙",
    "biblePassage": "민수기 29:1-16",
    "publishedDate": "2026-03-01",
    "sections": [
      {
        "type": "intro",
        "text": "광야 생활 40년만에...",
        "questions": ["질문1"]
      },
      {
        "type": "point",
        "number": 1,
        "title": "( ) 절기를 지키는 법칙입니다.",
        "reference": "민29:1",
        "answer": "나팔",
        "questions": ["이스라엘 역사에서 '나팔'은 언제 불게 됩니까?"]
      },
      {
        "type": "application",
        "text": "나는 오늘 하나님의 은혜를 잊지 않고 감사하며 신앙생활을 하고 있습니까?"
      }
    ],
    "isAnswerVisible": false,
    "myReview": {
      "reviewId": 5,
      "status": "IN_PROGRESS",
      "applicationAnswer": "매일 기도하고 감사 노트 작성하기",
      "emotions": ["GRATITUDE", "PEACE"],
      "isScraped": true
    }
  }
}
```

> `isAnswerVisible`: 주일 18:00 이후 서버에서 `true` 반환. `false`이면 `point.answer` 숨김, `( )` 그대로 표시
> `sections[].questions`: 나눔 질문 — **읽기 전용 표시만 함** (사용자 입력 없음)

---

### GET /api/v1/obs/contents/previous
지난 주 OBS 콘텐츠 조회 — 응답 구조 `current`와 동일

---

### GET /api/v1/obs/contents/{obsId}
특정 OBS 콘텐츠 상세 — 응답 구조 `current`와 동일

**에러**

| status | message |
|--------|---------|
| 404 | OBS 콘텐츠를 찾을 수 없습니다. |

---

### GET /api/v1/obs/contents/{obsId}/quizzes
OBS 퀴즈 목록 (지난 주 복습 플로우 전용)

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": [
    {
      "quizId": 1,
      "stepNumber": 1,
      "questionType": "OX",
      "questionText": "예수님은 멜기세덱의 반차를 따른 제사장이다.",
      "correctAnswer": "O"
    },
    {
      "quizId": 2,
      "stepNumber": 2,
      "questionType": "SHORT",
      "questionText": "예수님이 영원한 제사장이 될 수 있는 이유는?",
      "correctAnswer": "죽지 않는 생명의 능력"
    },
    {
      "quizId": 3,
      "stepNumber": 3,
      "questionType": "ESSAY",
      "questionText": "이번 말씀을 통해 나의 삶에 적용할 점은?",
      "correctAnswer": null
    }
  ]
}
```

> `questionType`: `OX` | `SHORT` | `ESSAY`

---

### POST /api/v1/obs/contents/{obsId}/reviews
복습 시작 (ReviewHistory 생성 또는 기존 IN_PROGRESS 반환)

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "reviewId": 5,
    "obsId": 10,
    "status": "IN_PROGRESS"
  }
}
```

**에러**

| status | message |
|--------|---------|
| 409 | 이미 진행 중인 리뷰가 있습니다. |

---

### PATCH /api/v1/obs/reviews/{reviewId}/application
적용하기 저장 (이번 주 OBS 보기 플로우 마지막 단계)

**Request Body**
```json
{
  "applicationAnswer": "매일 기도하고 일주일에 한 번 연락하기. VIP: 박채연."
}
```

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

---

### PATCH /api/v1/obs/reviews/{reviewId}/emotions
감정 태그 저장

**Request Body**
```json
{
  "emotions": ["GRATITUDE", "PEACE", "JOY"]
}
```

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

---

### PATCH /api/v1/obs/reviews/{reviewId}/complete
복습 완료 처리 (`status → DONE`)

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

---

### PATCH /api/v1/obs/reviews/{reviewId}/scrap
스크랩 토글

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "isScraped": true
  }
}
```

---

## 5. 성경 읽기 (Bible)

### GET /api/v1/bible/read-history/me
내 성경 통독 현황 조회

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "accruedReadCount": 103,
    "todayReadCount": 3,
    "totalChapterCount": 1189,
    "readCheckList": {
      "GEN": [1, 2, 3, 5],
      "JHN": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
    },
    "weeklyGoal": {
      "goalId": "uuid",
      "bibleBooks": ["GEN"],
      "targetType": "DAILY",
      "targetCount": 3,
      "weekStartDate": "2026-03-16",
      "weekEndDate": "2026-03-22",
      "currentProgress": 3
    }
  }
}
```

> `readCheckList`: 성경 영어 약자 → 읽은 장 번호 배열
> `weeklyGoal`: 이번 주 목표 미설정 시 `null`

---

### POST /api/v1/bible/read-history/me/check
성경 장(chapter) 읽음 처리

**Request Body**
```json
{
  "bibleEnglishShort": "GEN",
  "chapters": [4, 5, 6]
}
```

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "todayReadCount": 6,
    "accruedReadCount": 106
  }
}
```

---

### POST /api/v1/bible/read-history/me/uncheck
성경 장 읽음 취소

**Request Body**
```json
{
  "bibleEnglishShort": "GEN",
  "chapters": [5, 6]
}
```

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

---

### GET /api/v1/bible/weekly-goal
이번 주 성경 읽기 목표 조회

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "goalId": "uuid",
    "bibleBooks": ["GEN"],
    "targetType": "DAILY",
    "targetCount": 3,
    "weekStartDate": "2026-03-16",
    "weekEndDate": "2026-03-22",
    "currentProgress": 3,
    "progressPercent": 14,
    "notificationEnabled": true,
    "notificationDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    "notificationTime": "08:00"
  }
}
```

> 목표 미설정 시 `"data": null`

---

### POST /api/v1/bible/weekly-goal
이번 주 성경 읽기 목표 설정

**Request Body**
```json
{
  "bibleBooks": ["GEN"],
  "targetType": "DAILY",
  "targetCount": 3,
  "notificationEnabled": true,
  "notificationDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  "notificationTime": "08:00"
}
```

> `targetType`: `DAILY` (매일 N장) | `WEEKLY` (이번 주 총 N장)

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

**에러**

| status | message |
|--------|---------|
| 409 | 이번 주 목표가 이미 존재합니다. |

---

### PUT /api/v1/bible/weekly-goal/{goalId}
성경 읽기 목표 수정 — 요청 바디 구조 POST와 동일

---

### DELETE /api/v1/bible/weekly-goal/{goalId}
성경 읽기 목표 삭제

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

---

### GET /api/v1/bible/notes
말씀 노트 목록 조회

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| oikosOnly | boolean | 오이코스 공개 노트만 |
| writerUid | string | 특정 사용자 노트만 |

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "content": [
      {
        "id": "uuid",
        "writerName": "홍길동",
        "writerProfileImage": "https://...",
        "bibleName": "요한복음",
        "bibleEnglishShort": "JHN",
        "chapter": 3,
        "phaseStart": 16,
        "phaseEnd": 17,
        "title": "하나님이 세상을 이처럼 사랑하사",
        "description": "노트 내용...",
        "likeCount": 5,
        "isLiked": false,
        "isHidden": false,
        "isOpenToOikos": true,
        "createdAt": "2026-03-15T10:30:00"
      }
    ],
    "page": 0,
    "totalElements": 30
  }
}
```

---

### POST /api/v1/bible/notes
말씀 노트 작성

**Request Body**
```json
{
  "bibleName": "요한복음",
  "bibleEnglishShort": "JHN",
  "chapter": 3,
  "phaseStart": 16,
  "phaseEnd": 17,
  "title": "하나님이 세상을 이처럼 사랑하사",
  "description": "노트 내용...",
  "isHidden": false,
  "isOpenToOikos": true
}
```

**Response** — 작성된 노트 반환 (GET 목록 아이템과 동일 구조)

---

### GET /api/v1/bible/notes/{noteId}
말씀 노트 상세 조회 — 응답 구조 목록 아이템과 동일

**에러**

| status | message |
|--------|---------|
| 404 | 노트를 찾을 수 없습니다. |

---

### PUT /api/v1/bible/notes/{noteId}
말씀 노트 수정 (본인만) — 요청 바디 구조 POST와 동일

**에러**

| status | message |
|--------|---------|
| 403 | 본인의 노트만 수정할 수 있습니다. |

---

### DELETE /api/v1/bible/notes/{noteId}
말씀 노트 삭제 (본인만)

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

**에러**

| status | message |
|--------|---------|
| 403 | 본인의 노트만 삭제할 수 있습니다. |

---

### PATCH /api/v1/bible/notes/{noteId}/like
말씀 노트 좋아요 토글

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "likeCount": 6,
    "isLiked": true
  }
}
```

---

### PATCH /api/v1/bible/notes/{noteId}/visibility
말씀 노트 공개 범위 변경

**Request Body**
```json
{
  "isHidden": false,
  "isOpenToOikos": true
}
```

**Response** — 수정된 노트 반환

---

## 6. 챌린지 (Challenge)

### GET /api/v1/challenges
공개 챌린지 목록 조회 (`PUBLIC` + `OIKOS` 챌린지)

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| type | string | `FAITH` \| `BIBLE` |
| keyword | string | 챌린지 이름 검색 |
| activeOnly | boolean | 진행 중인 챌린지만 (기본 false) |

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "content": [
      {
        "challengeId": "uuid",
        "type": "FAITH",
        "name": "수/금 예배 챌린지 개근",
        "goal": "수요 예배, 금요 예배 참석",
        "startDate": "2026-03-01",
        "endDate": "2026-03-31",
        "dDay": 11,
        "verificationMethod": "ATTENDANCE",
        "visibility": "PUBLIC",
        "participantCount": 12,
        "isJoined": false,
        "creatorName": "홍길동"
      }
    ],
    "page": 0,
    "totalElements": 48
  }
}
```

> `dDay`: 오늘 기준 종료일까지 남은 일수 (음수이면 종료됨)
> `verificationMethod`: `ATTENDANCE` | `MEDITATION` | `PHOTO` | `BIBLE_READ`
> `visibility`: `PUBLIC` | `OIKOS` | `LINK`

---

### GET /api/v1/challenges/recommended
추천 챌린지 Top 3 (참여 인원 순)

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": [
    {
      "challengeId": "uuid",
      "type": "BIBLE",
      "name": "박채연의 성경 챌린지 1",
      "goal": "요한복음, 시편 100일 동안 읽기",
      "startDate": "2026-03-01",
      "endDate": "2026-06-08",
      "dDay": 80,
      "verificationMethod": "BIBLE_READ",
      "visibility": "PUBLIC",
      "participantCount": 24,
      "isJoined": false,
      "creatorName": "박채연"
    }
  ]
}
```

---

### GET /api/v1/challenges/mine
내 챌린지 목록 조회 (참여 + 생성)

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| type | string | `FAITH` \| `BIBLE` |
| status | string | `ACTIVE` \| `ENDED` |

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "content": [
      {
        "challengeId": "uuid",
        "type": "FAITH",
        "name": "수/금 예배 챌린지",
        "status": "ACTIVE",
        "startDate": "2026-03-01",
        "endDate": "2026-03-31",
        "isCreator": true,
        "isPinned": false,
        "notificationEnabled": true,
        "progress": {
          "totalDays": 31,
          "completedDays": 10,
          "progressPercent": 32
        }
      }
    ],
    "page": 0,
    "totalElements": 5
  }
}
```

---

### POST /api/v1/challenges/faith
신앙 챌린지 생성

> 생성자는 자동으로 참여자로 등록됩니다.

**Request Body**
```json
{
  "name": "수/금 예배 챌린지 개근",
  "goal": "수요 예배, 금요 예배 빠짐없이 참석하기",
  "startDate": "2026-03-20",
  "endDate": "2026-04-20",
  "verificationMethod": "ATTENDANCE",
  "visibility": "PUBLIC",
  "notificationEnabled": true,
  "notificationTimes": ["09:00", "21:00"]
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| name | ✅ | 챌린지 이름 |
| goal | | 목표 설명 |
| startDate | ✅ | 시작일 (yyyy-MM-dd) |
| endDate | ✅ | 종료일 (yyyy-MM-dd) |
| verificationMethod | | `ATTENDANCE` \| `MEDITATION` \| `PHOTO` (기본: `MEDITATION`) |
| visibility | ✅ | `PUBLIC` \| `OIKOS` \| `LINK` |
| notificationEnabled | | 알림 활성화 여부 |
| notificationTimes | | 알림 시간 목록 (HH:mm 형식) |

**Response** — 생성된 챌린지 상세 반환 (GET /{challengeId} 응답과 동일)

---

### POST /api/v1/challenges/bible
성경 챌린지 생성

> 생성자는 자동으로 참여자로 등록됩니다.

**Request Body**
```json
{
  "name": "박채연의 성경 챌린지 1",
  "bibleBooks": ["JHN", "PSA"],
  "targetType": "PERIOD",
  "targetValue": 100,
  "startDate": "2026-03-20",
  "endDate": "2026-06-27",
  "visibility": "PUBLIC",
  "notificationEnabled": true,
  "notificationTimes": ["07:00"]
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| name | ✅ | 챌린지 이름 |
| bibleBooks | | 읽기 대상 성경 약자 목록 (예: `["JHN", "PSA"]`) |
| targetType | | `PERIOD` (N일) \| `DAILY_CHAPTERS` (하루 N장) \| `DEADLINE` (날짜까지) |
| targetValue | | targetType에 따른 수치 |
| startDate | ✅ | 시작일 |
| endDate | ✅ | 종료일 |
| visibility | ✅ | `PUBLIC` \| `OIKOS` \| `LINK` |
| notificationEnabled | | 알림 활성화 여부 |
| notificationTimes | | 알림 시간 목록 |

> `verificationMethod`는 `BIBLE_READ` 고정 (요청 필드 없음)

**Response** — 생성된 챌린지 상세 반환

---

### GET /api/v1/challenges/{challengeId}
챌린지 상세 조회

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "challengeId": "uuid",
    "type": "FAITH",
    "name": "수/금 예배 챌린지",
    "goal": "수요 예배, 금요 예배 참석",
    "startDate": "2026-03-01",
    "endDate": "2026-03-31",
    "dDay": 11,
    "verificationMethod": "ATTENDANCE",
    "visibility": "PUBLIC",
    "participantCount": 12,
    "isJoined": true,
    "isCreator": false,
    "isPinned": false,
    "notificationEnabled": true,
    "myProgress": {
      "completedDays": 10,
      "lastCertifiedDate": "2026-03-19",
      "weeklyCalendar": {
        "2026-03-16": false,
        "2026-03-17": true,
        "2026-03-18": false,
        "2026-03-19": true,
        "2026-03-20": false,
        "2026-03-21": false,
        "2026-03-22": false
      },
      "allCertifiedDates": ["2026-03-01", "2026-03-03", "2026-03-17", "2026-03-19"]
    }
  }
}
```

> `myProgress`: 미참여 상태이면 `null`
> `weeklyCalendar`: **이번 주 일~토 고정** (Sun-Sat 기준, 날짜 → 인증 여부)
> `allCertifiedDates`: 챌린지 전체 인증 날짜 목록 (캘린더 뷰, 주 스와이프 뷰용)

**에러**

| status | message |
|--------|---------|
| 404 | 챌린지를 찾을 수 없습니다. |

---

### PUT /api/v1/challenges/{challengeId}
챌린지 수정

> **생성자**: `name`, `goal`, `endDate`, `visibility` + 알림 설정 수정 가능
> **일반 참여자**: `notificationEnabled`, `notificationTimes`만 적용됨

**Request Body**
```json
{
  "name": "수정된 챌린지 이름",
  "goal": "수정된 목표",
  "endDate": "2026-04-30",
  "visibility": "OIKOS",
  "notificationEnabled": true,
  "notificationTimes": ["08:30", "20:00"]
}
```

**Response** — 수정된 챌린지 상세 반환

**에러**

| status | message |
|--------|---------|
| 400 | 참여하지 않은 챌린지입니다. |
| 404 | 챌린지를 찾을 수 없습니다. |

---

### POST /api/v1/challenges/{challengeId}/join
챌린지 참여

**Request Body**
```json
{
  "startDate": "2026-03-20",
  "notificationEnabled": true,
  "notificationTimes": ["09:00"]
}
```

> `startDate` 미입력 시 오늘 날짜로 자동 설정

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

**에러**

| status | message |
|--------|---------|
| 409 | 이미 참여 중인 챌린지입니다. |
| 404 | 챌린지를 찾을 수 없습니다. |

---

### DELETE /api/v1/challenges/{challengeId}/leave
챌린지 탈퇴

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

**에러**

| status | message |
|--------|---------|
| 400 | 참여하지 않은 챌린지입니다. |

---

### POST /api/v1/challenges/{challengeId}/certify
챌린지 인증 (하루 1회 제한)

**Request** `Content-Type: multipart/form-data`

| 파트 이름 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| meditationText | string | 선택 | 묵상 텍스트 |
| isPrivate | string | 선택 | `"true"` / `"false"` (기본: `"false"`) |
| photo | file | 선택 | 인증 사진 (jpg, png 등) — 서버에서 R2에 업로드 후 URL 저장 |

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

**에러**

| status | message |
|--------|---------|
| 400 | 참여하지 않은 챌린지입니다. |
| 409 | 오늘 이미 인증하였습니다. |

---

### GET /api/v1/challenges/{challengeId}/certifications
챌린지 인증 피드

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| date | string (yyyy-MM-dd) | 특정 날짜 인증 조회 (기본: 오늘) |

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "myCertification": {
      "certId": "uuid",
      "date": "2026-03-20",
      "meditationText": "오늘 말씀에서 느낀 점...",
      "photoUrl": "https://pub-xxx.r2.dev/certifications/uuid.jpg",
      "isPrivate": false
    },
    "otherCertifications": [
      {
        "certId": "uuid",
        "writerName": "김영희",
        "writerProfileImage": "https://...",
        "date": "2026-03-20",
        "meditationText": "...",
        "photoUrl": null
      }
    ]
  }
}
```

> `myCertification`: 해당 날짜에 내 인증이 없으면 `null`
> `otherCertifications`: `isPrivate: true`인 타인의 인증은 포함되지 않음

---

### PATCH /api/v1/challenges/{challengeId}/pin
대시보드 상단 고정 토글

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "isPinned": true
  }
}
```

**에러**

| status | message |
|--------|---------|
| 400 | 참여하지 않은 챌린지입니다. |

---

### PATCH /api/v1/challenges/{challengeId}/notification
알림 설정 변경

**Request Body**
```json
{
  "notificationEnabled": true,
  "notificationTimes": ["09:00", "21:00"]
}
```

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": null
}
```

**에러**

| status | message |
|--------|---------|
| 400 | 참여하지 않은 챌린지입니다. |

---

## 7. 신앙 노트 (Note)

### GET /api/v1/notes/thanks
감사 노트 목록 조회

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| scope | string | `ALL` (기본) \| `OIKOS` \| `MINE` |
| oikosId | string | 특정 오이코스 필터 |

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "content": [
      {
        "id": "uuid",
        "writerName": "홍길동",
        "writerProfileImage": "https://...",
        "answers": ["비 온 뒤 맑은 공기에 감사합니다.", "건강을 주셔서 감사합니다.", "동역자들에게 감사합니다."],
        "likeCount": 3,
        "isLiked": false,
        "isFixed": false,
        "isHidden": false,
        "createdAt": "2026-03-15T09:00:00"
      }
    ],
    "page": 0,
    "totalElements": 25
  }
}
```

---

### POST /api/v1/notes/thanks
감사 노트 작성

**Request Body**
```json
{
  "answers": ["비 온 뒤 맑은 공기에 감사합니다.", "건강을 주셔서 감사합니다.", "동역자들에게 감사합니다."],
  "isFixed": false,
  "isHidden": false,
  "teamId": "oikos_id"
}
```

**Response** — 작성된 노트 반환

---

### GET /api/v1/notes/thanks/{noteId}
감사 노트 상세 조회 — 응답 구조 목록 아이템과 동일

---

### PUT /api/v1/notes/thanks/{noteId}
감사 노트 수정 (본인만) — 요청 바디 구조 POST와 동일

**에러**

| status | message |
|--------|---------|
| 403 | 본인의 노트만 수정할 수 있습니다. |

---

### DELETE /api/v1/notes/thanks/{noteId}
감사 노트 삭제 (본인만)

**에러**

| status | message |
|--------|---------|
| 403 | 본인의 노트만 삭제할 수 있습니다. |

---

### PATCH /api/v1/notes/thanks/{noteId}/like
감사 노트 좋아요 토글

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "likeCount": 4,
    "isLiked": true
  }
}
```

---

### PATCH /api/v1/notes/thanks/{noteId}/visibility
감사 노트 공개 범위 변경

**Request Body**
```json
{
  "isHidden": false,
  "isFixed": true
}
```

**Response** — 수정된 노트 반환

---

### GET /api/v1/notes/prayers
기도 노트 목록 조회

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| scope | string | `ALL` (기본) \| `OIKOS` \| `MINE` |

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "content": [
      {
        "id": "uuid",
        "writerName": "홍길동",
        "prayers": ["취업을 위해 기도합니다.", "건강을 위해 기도합니다."],
        "isHidden": false,
        "isOpenToOikos": true,
        "createdAt": "2026-03-15T09:00:00"
      }
    ],
    "page": 0,
    "totalElements": 15
  }
}
```

---

### POST /api/v1/notes/prayers
기도 노트 작성

**Request Body**
```json
{
  "prayers": ["취업을 위해 기도합니다.", "건강을 위해 기도합니다."],
  "isHidden": false,
  "isOpenToOikos": true,
  "teamId": "oikos_id"
}
```

**Response** — 작성된 노트 반환

---

### GET /api/v1/notes/prayers/{noteId}
기도 노트 상세 조회 — 응답 구조 목록 아이템과 동일

---

### PUT /api/v1/notes/prayers/{noteId}
기도 노트 수정 (본인만) — 요청 바디 구조 POST와 동일

---

### DELETE /api/v1/notes/prayers/{noteId}
기도 노트 삭제 (본인만)

---

### PATCH /api/v1/notes/prayers/{noteId}/visibility
기도 노트 공개 범위 변경

**Request Body**
```json
{
  "isHidden": false,
  "isOpenToOikos": true
}
```

**Response** — 수정된 노트 반환

---

## 8. 오이코스 (Oikos)

### GET /api/v1/oikos/mine
내가 속한 오이코스 조회

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "id": "oikos_uuid",
    "name": "1오이코스",
    "leaderId": "leader_uid",
    "leaderName": "홍길동",
    "sleaderId": "sleader_uid",
    "sleaderName": "김영희",
    "members": [
      {
        "uid": "user_uid",
        "name": "홍길동",
        "profileImage": "https://..."
      }
    ]
  }
}
```

**에러**

| status | message |
|--------|---------|
| 404 | 오이코스를 찾을 수 없습니다. |

> `oikosId`가 미설정된 유저도 404 반환

---

### GET /api/v1/oikos/{oikosId}
특정 오이코스 조회 — 응답 구조 `mine`과 동일

**에러**

| status | message |
|--------|---------|
| 404 | 오이코스를 찾을 수 없습니다. |

---

## 9. 공지사항 (Notice)

### GET /api/v1/notices
공지사항 목록 조회 (최신순)

**Query Parameters**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| page | int | 0 | 페이지 번호 |
| size | int | 20 | 페이지 크기 |

**Response**
```json
{
  "status": 200,
  "message": "SUCCESS",
  "data": {
    "content": [
      {
        "id": "notice_uuid",
        "title": "앱 업데이트 안내",
        "description": "새로운 기능이 추가되었습니다.",
        "createdAt": "2026-03-20T10:00:00"
      }
    ],
    "page": 0,
    "totalElements": 5
  }
}
```

---

### GET /api/v1/notices/{noticeId}
공지사항 상세 조회 — 응답 구조 목록 아이템과 동일

**에러**

| status | message |
|--------|---------|
| 404 | 공지사항을 찾을 수 없습니다. |

---

### POST /api/v1/admin/notices
공지사항 등록 (**Admin 전용**)

**Request Body**
```json
{
  "title": "앱 업데이트 안내",
  "description": "새로운 기능이 추가되었습니다."
}
```

**Response** — 생성된 공지사항 반환 (상세 조회와 동일 구조)

---

### PUT /api/v1/admin/notices/{noticeId}
공지사항 수정 (**Admin 전용**) — 요청 바디 구조 POST와 동일

**에러**

| status | message |
|--------|---------|
| 404 | 공지사항을 찾을 수 없습니다. |

---

### DELETE /api/v1/admin/notices/{noticeId}
공지사항 삭제 (**Admin 전용**)

**에러**

| status | message |
|--------|---------|
| 404 | 공지사항을 찾을 수 없습니다. |

---

## 10. 에러 코드 목록

| HTTP Status | message | 발생 상황 |
|-------------|---------|---------|
| 400 | 잘못된 요청입니다. | 잘못된 요청 파라미터 |
| 400 | 참여하지 않은 챌린지입니다. | 미참여 챌린지에 인증/탈퇴/수정 시도 |
| 401 | 인증이 필요합니다. | 토큰 없음 |
| 401 | 유효하지 않은 토큰입니다. | 잘못된 토큰 |
| 401 | 만료된 토큰입니다. | Access Token 만료 |
| 401 | 유효하지 않은 Google ID 토큰입니다. | 로그인 시 Google 토큰 검증 실패 |
| 401 | 리프레시 토큰이 일치하지 않습니다. | Refresh Token 불일치 |
| 403 | 접근 권한이 없습니다. | 권한 없는 리소스 접근 |
| 403 | 본인의 노트만 수정할 수 있습니다. | 타인 노트 수정 시도 |
| 403 | 본인의 노트만 삭제할 수 있습니다. | 타인 노트 삭제 시도 |
| 403 | 본인이 생성한 챌린지만 수정할 수 있습니다. | 생성자 전용 항목 수정 시도 |
| 404 | 유저를 찾을 수 없습니다. | 존재하지 않는 유저 |
| 404 | OBS 콘텐츠를 찾을 수 없습니다. | 존재하지 않는 OBS |
| 404 | 노트를 찾을 수 없습니다. | 존재하지 않는 노트 |
| 404 | 챌린지를 찾을 수 없습니다. | 존재하지 않는 챌린지 |
| 404 | 오이코스를 찾을 수 없습니다. | 존재하지 않는 오이코스 또는 oikosId 미설정 |
| 404 | 공지사항을 찾을 수 없습니다. | 존재하지 않는 공지사항 |
| 409 | 이미 참여 중인 챌린지입니다. | 중복 참여 시도 |
| 409 | 오늘 이미 인증하였습니다. | 하루 2회 인증 시도 |
| 409 | 이번 주 목표가 이미 존재합니다. | 주간 목표 중복 설정 |
| 409 | 이미 진행 중인 리뷰가 있습니다. | OBS 복습 중복 생성 |
| 500 | 서버 내부 오류가 발생했습니다. | 서버 에러 |

---

## 11. 엔드포인트 요약

| 도메인 | 엔드포인트 수 | 비고 |
|--------|-------------|------|
| Auth | 3 | login / refresh / logout |
| User | 2 | |
| OBS | 10 | Admin API 제외 |
| Bible | 14 | 읽기 기록 3 + 주간 목표 4 + 말씀 노트 7 |
| Challenge | 13 | |
| Note | 13 | 감사 노트 7 + 기도 노트 6 |
| Oikos | 2 | mine / {oikosId} |
| Notice | 5 | 목록·상세 조회 + Admin 등록·수정·삭제 |
| **합계** | **62** | |
