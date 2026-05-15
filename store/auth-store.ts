import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const KEYS = {
  ACCESS_TOKEN: 'loen_access_token',
  REFRESH_TOKEN: 'loen_refresh_token',
} as const;

interface AuthState {
  accessToken: string | null;
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
  isLoggedIn: false,
  isNewUser: false,
  isInitialized: false,

  initialize: async () => {
    const accessToken = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    set({
      accessToken,
      isLoggedIn: !!accessToken,
      isInitialized: true,
    });
  },

  setTokens: async ({ accessToken, refreshToken, isNewUser = false }) => {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
    set({ accessToken, isLoggedIn: true, isNewUser });
  },

  setAccessToken: (token: string) => {
    SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
    set({ accessToken: token });
  },

  clearTokens: async () => {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    set({ accessToken: null, isLoggedIn: false, isNewUser: false });
  },

  getRefreshToken: () => SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),

  completeProfileSetup: () => {
    set({ isNewUser: false });
  },
}));
