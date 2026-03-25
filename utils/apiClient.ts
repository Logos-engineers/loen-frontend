/**
 * utils/apiClient.ts
 * 공통 API 통신 모듈 (loen-project)
 * 
 * 기능:
 * - Base URL 및 자동 헤더(Auth) 주입
 * - 공통 응답 포맷 ({ status, message, data }) 언래핑 및 에러 처리
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * BASE_URL 우선순위 로직:
 * 1. EXPO_PUBLIC_API_URL: 배포, 실기기 빌드 등 명시적 환경 번수가 주어질 때 최우선 사용 (Source of Truth)
 * 2. Constants.expoConfig?.hostUri: 개발 중에만 유효한 값으로, 로컬 Expo Go(LAN) 환경에서 IP를 자동 추론하기 위한 Fallback
 * 3. 10.0.2.2 / localhost: 시뮬레이터/에뮬레이터용 최후의 수단
 */
function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Expo 네트워크 환경 (LAN) 개발용 Fallback
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    return `http://${debuggerHost.split(':')[0]}:8080/api/v1`;
  }
  
  // 기기 내장 로컬 Fallback
  return Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://localhost:8080/api/v1';
}

const BASE_URL = getBaseUrl();

// 공통 응답 포맷 타입
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// 토큰 주입 파이프라인 (추후 Auth 연결 시 수정할 지점)
async function getAuthHeaders(endpoint: string): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 1. Auth 관련 API는 토큰 주입 생략
  if (endpoint.startsWith('/auth/')) {
    return headers;
  }

  // 2. TODO: 실제 Access Token 주입 로직
  // 예: const token = await SecureStore.getItemAsync('ACCESS_TOKEN'); 
  // 또는 전역 상태(Zustand 등)에서 token 꺼내오기
  const token = ''; 

  // 3. 토큰이 존재할 시 Authorization: Bearer 세팅
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // console.warn(`[apiClient] 인증 토큰 없이 API(${endpoint}) 호출 시도됨`);
  }

  return headers;
}

/**
 * 전역 API Fetch Wrapper
 * @param endpoint '/bible/weekly-goal' 형태의 엔드포인트
 * @param options fetch RequestInit 옵션
 * @returns 응답 객체의 `data` 내부 필드
 */
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const commonHeaders = await getAuthHeaders(endpoint);
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...commonHeaders,
      ...options.headers,
    },
  };

  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, config);
    
    // 빈 본문(Empty Body) 예외 처리
    const text = await response.text();
    const result: ApiResponse<T> = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(result?.message || `API Request Failed: ${response.status}`);
    }

    return result?.data as T;
  } catch (error) {
    console.warn(`[apiClient] Error fetching ${endpoint}:`, error);
    throw error;
  }
}
