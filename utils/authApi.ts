import { apiClient } from './apiClient';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

interface MessageResponse {
  message: string;
}

/** 이메일 회원가입 — 인증 코드가 메일로 발송된다. */
export const signupEmail = (email: string, password: string) =>
  apiClient<MessageResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

/** 이메일 인증 — 코드 검증 성공 시 토큰을 받아 자동 로그인된다. */
export const verifyEmail = (email: string, code: string) =>
  apiClient<TokenResponse>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });

/** 이메일 로그인. */
export const emailLogin = (email: string, password: string) =>
  apiClient<TokenResponse>('/auth/email-login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

/** 인증 코드 재발송. */
export const resendVerification = (email: string) =>
  apiClient<MessageResponse>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

/** 비밀번호 재설정 요청 — 가입된 이메일이면 코드가 발송된다. */
export const requestPasswordReset = (email: string) =>
  apiClient<MessageResponse>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

/** 비밀번호 재설정 확정. */
export const resetPassword = (email: string, code: string, newPassword: string) =>
  apiClient<MessageResponse>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
  });
