export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * 토큰이 만료됐는지(또는 곧 만료되는지) 판별. exp(초)를 못 읽으면 안전하게 만료로 간주.
 * skewSeconds 만큼 일찍 만료로 보아 경계에서 미리 갱신하게 한다.
 */
export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const exp = decodeJwtPayload(token)?.exp;
  if (typeof exp !== 'number') return true;
  return Date.now() / 1000 >= exp - skewSeconds;
}
