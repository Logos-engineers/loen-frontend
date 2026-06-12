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
    // 401 + 인증 필요 구간 → silent refresh 시도
    if (error?.status === 401 && !isAuthEndpoint) {
      const refreshToken = await store.getRefreshToken();
      if (!refreshToken) {
        await store.clearTokens();
        throw error;
      }

      try {
        const refreshResult = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshText = await refreshResult.text();
        const refreshData: ApiResponse<{ accessToken: string; refreshToken: string }> = refreshText
          ? JSON.parse(refreshText)
          : null;

        if (!refreshResult.ok) throw new Error('refresh failed');

        const { accessToken: newAccess, refreshToken: newRefresh } = refreshData.data;
        await store.setTokens({ accessToken: newAccess, refreshToken: newRefresh });

        // 원본 요청 재시도
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
