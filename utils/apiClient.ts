import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/auth-store';

function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android 에뮬레이터: 10.0.2.2가 항상 호스트 머신 localhost를 가리킴
  // (hostUri는 Metro 서버 IP를 반환해 실제 백엔드 IP와 다를 수 있음)
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }
  // iOS 시뮬레이터: Metro hostUri 기반 또는 localhost
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    return `http://${debuggerHost.split(':')[0]}:8080/api/v1`;
  }
  return 'http://localhost:8080/api/v1';
}

const BASE_URL = getBaseUrl();

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !endpoint.startsWith('/auth/')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const store = useAuthStore.getState();
  let token = store.accessToken;

  try {
    let response = await fetchWithAuth(endpoint, options, token);

    // Silent Refresh: 401 에러 시 refreshToken으로 재발급 후 1회 재시도
    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      const refreshToken = await store.getRefreshToken();

      if (refreshToken) {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshText = await refreshResponse.text();
          const refreshResult: ApiResponse<{ accessToken: string; refreshToken: string }> = JSON.parse(refreshText);
          store.setAccessToken(refreshResult.data.accessToken);
          token = refreshResult.data.accessToken;

          // 갱신된 토큰으로 원본 요청 재시도
          response = await fetchWithAuth(endpoint, options, token);
        } else {
          // Refresh 실패 → 강제 로그아웃
          await store.clearTokens();
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
      } else {
        await store.clearTokens();
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    }

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
