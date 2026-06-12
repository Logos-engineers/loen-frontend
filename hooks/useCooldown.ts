import { useEffect, useState } from 'react';

/**
 * 재발송 등 버튼 쿨다운 타이머.
 *
 * 백엔드 rate limit(메일 발송 60초당 1회)과 호흡을 맞춰, 사용자가 429를 받기 전에
 * 버튼을 잠그고 남은 시간을 보여준다. `start()` 호출 시 durationSec부터 1초씩 감소한다.
 */
export function useCooldown(durationSec = 60) {
  const [remaining, setRemaining] = useState(0);

  const start = () => setRemaining(durationSec);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  return { remaining, active: remaining > 0, start };
}
