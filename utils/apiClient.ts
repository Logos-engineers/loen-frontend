import { useAuthStore } from '@/store/auth-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    return `http://${debuggerHost.split(':')[0]}:8080/api/v1`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://localhost:8080/api/v1';
}

export const BASE_URL = getBaseUrl();

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/** 요청 과다(429) 에러인지 판별. 화면에서 쿨다운/안내 처리에 사용. */
export function isRateLimitError(error: any): boolean {
  return error?.status === 429;
}

function buildHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function doFetch<T>(url: string, config: RequestInit): Promise<T> {
  const response = await fetch(url, config);
  const text = await response.text();
  const result: ApiResponse<T> = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const err = new Error(result?.message || `API Request Failed: ${response.status}`);
    (err as any).status = response.status;
    throw err;
  }
  return result?.data as T;
}

// 진행 중인 토큰 갱신 하나를 공유한다(single-flight).
// 여러 요청이 동시에 401을 받아 각자 /auth/refresh 를 호출하면, 백엔드의 리프레시 토큰
// 회전(rotation) 때문에 1등만 성공하고 나머지는 무효화된 토큰으로 거부(AUTH_007)당해
// clearTokens() → 무작위 로그아웃이 발생한다. 갱신을 한 번만 수행하고 결과를 공유해 이를 막는다.
let refreshPromise: Promise<string> | null = null;

/**
 * 액세스 토큰 갱신을 single-flight로 수행한다.
 * 이미 갱신이 진행 중이면 그 Promise를 그대로 반환해 /auth/refresh 는 1회만 호출된다.
 * @returns 새 액세스 토큰
 */
function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function doRefresh(): Promise<string> {
  const store = useAuthStore.getState();
  const refreshToken = await store.getRefreshToken();
  if (!refreshToken) {
    throw new Error('no refresh token');
  }

  const refreshResult = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const refreshText = await refreshResult.text();
  const refreshData: ApiResponse<{ accessToken: string; refreshToken: string }> | null = refreshText
    ? JSON.parse(refreshText)
    : null;

  if (!refreshResult.ok || !refreshData?.data) {
    throw new Error('refresh failed');
  }

  const { accessToken: newAccess, refreshToken: newRefresh } = refreshData.data;
  await store.setTokens({ accessToken: newAccess, refreshToken: newRefresh });
  return newAccess;
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const isAuthEndpoint = endpoint.startsWith('/auth/');

  const store = useAuthStore.getState();
  const token = isAuthEndpoint ? null : store.accessToken;

  const config: RequestInit = {
    ...options,
    headers: { ...buildHeaders(token), ...options.headers },
  };

  try {
    return await doFetch<T>(url, config);
  } catch (error: any) {
    // 401 + 인증 필요 구간 → silent refresh 시도 (single-flight로 동시 갱신 충돌 방지)
    if (error?.status === 401 && !isAuthEndpoint) {
      try {
        const newAccess = await refreshAccessToken();

        // 원본 요청 재시도 — 동시에 401을 받은 요청들은 공유된 새 토큰으로 각자 재시도한다.
        const retryConfig: RequestInit = {
          ...options,
          headers: { ...buildHeaders(newAccess), ...options.headers },
        };
        return await doFetch<T>(url, retryConfig);
      } catch {
        await store.clearTokens();
        throw error;
      }
    }

    console.warn(`[apiClient] Error fetching ${endpoint}:`, error);
    throw error;
  }
}
