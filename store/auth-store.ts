import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { decodeJwtPayload, isJwtExpired } from '@/utils/jwtDecode';
import { refreshAccessToken } from '@/utils/apiClient';

const KEYS = {
  ACCESS_TOKEN: 'loen_access_token',
  REFRESH_TOKEN: 'loen_refresh_token',
} as const;

export type UserRole = 'USER' | 'ADMIN';

interface AuthState {
  accessToken: string | null;
  role: UserRole | null;
  isLoggedIn: boolean;
  isNewUser: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  setTokens: (params: { accessToken: string; refreshToken: string; isNewUser?: boolean }) => Promise<void>;
  setAccessToken: (token: string) => void;
  clearTokens: () => Promise<void>;
  getRefreshToken: () => Promise<string | null>;
  completeProfileSetup: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  role: null,
  isLoggedIn: false,
  isNewUser: false,
  isInitialized: false,

  initialize: async () => {
    const accessToken = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    const refreshToken = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);

    // 1) access가 아직 유효하면 그대로 로그인.
    if (accessToken && !isJwtExpired(accessToken)) {
      const role = decodeJwtPayload(accessToken)?.role as UserRole ?? null;
      set({ accessToken, role, isLoggedIn: true, isInitialized: true });
      return;
    }

    // 2) access 만료(또는 없음)인데 refresh가 있으면 스플래시 동안 '선제 갱신'.
    //    이래야 로그인 화면이 잠깐 떴다 사라지는 깜빡임 없이 바로 홈으로 들어간다.
    //    (refreshAccessToken은 SecureStore의 refresh로 /auth/refresh 호출 후 setTokens까지 수행)
    if (refreshToken) {
      try {
        await refreshAccessToken();
        set({ isInitialized: true });
        return;
      } catch {
        // refresh 만료/무효 → 저장소 정리 후 로그아웃 상태로.
        await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
      }
    }

    // 3) 로그아웃 상태로 확정.
    set({ accessToken: null, role: null, isLoggedIn: false, isNewUser: false, isInitialized: true });
  },

  setTokens: async ({ accessToken, refreshToken, isNewUser = false }) => {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
    const role = decodeJwtPayload(accessToken)?.role as UserRole ?? null;
    set({ accessToken, role, isLoggedIn: true, isNewUser });
  },

  setAccessToken: (token: string) => {
    SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
    const role = decodeJwtPayload(token)?.role as UserRole ?? null;
    set({ accessToken: token, role });
  },

  clearTokens: async () => {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    set({ accessToken: null, role: null, isLoggedIn: false, isNewUser: false });
  },

  getRefreshToken: () => SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),

  completeProfileSetup: () => {
    set({ isNewUser: false });
  },
}));
