import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

/**
 * 화면이 다시 포커스될 때 refetch를 호출한다.
 *
 * 데이터 훅들은 마운트 시 1회만 조회하는데, 탭/스택 화면은 한 번 뜨면 계속 살아있어
 * (unmount 되지 않아) 등록·수정 후 돌아와도 최신 데이터가 반영되지 않는다.
 * 이 훅을 소비처에 붙이면 화면 재진입 시 자동으로 다시 불러온다.
 *
 * 최초 포커스(= 마운트 직후, 훅이 이미 한 번 조회함)는 건너뛰어 중복 조회를 막는다.
 */
export function useRefetchOnFocus(refetch: () => void) {
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
}
