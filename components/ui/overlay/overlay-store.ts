/**
 * components/ui/overlay/overlay-store.ts
 * 명령형 오버레이(toast / snackbar / floating) 전역 상태.
 * 화면 어디서든 useOverlayStore.getState().toast('...') 처럼 호출 → OverlayHost가 렌더.
 */

import { create } from 'zustand';

export type OverlayPosition = 'top' | 'bottom';

export type ToastItem = {
  id: number;
  kind: 'toast' | 'snackbar' | 'floating';
  message: string;
  position: OverlayPosition;
  /** snackbar 우측 액션 (라벨 + 콜백) */
  action?: { label?: string; onPress: () => void };
  duration: number;
};

type ShowOptions = {
  position?: OverlayPosition;
  duration?: number;
};

type SnackbarOptions = ShowOptions & {
  action?: { label?: string; onPress: () => void };
};

interface OverlayState {
  current: ToastItem | null;
  toast: (message: string, opts?: ShowOptions) => void;
  snackbar: (message: string, opts?: SnackbarOptions) => void;
  floating: (message: string, opts?: ShowOptions) => void;
  dismiss: () => void;
}

let seq = 0;

export const useOverlayStore = create<OverlayState>((set) => {
  const show = (item: Omit<ToastItem, 'id'>) => {
    set({ current: { ...item, id: ++seq } });
  };
  return {
    current: null,
    toast: (message, opts) =>
      show({
        kind: 'toast',
        message,
        position: opts?.position ?? 'bottom',
        duration: opts?.duration ?? 2500,
      }),
    snackbar: (message, opts) =>
      show({
        kind: 'snackbar',
        message,
        position: opts?.position ?? 'bottom',
        action: opts?.action,
        duration: opts?.duration ?? 3000,
      }),
    floating: (message, opts) =>
      show({
        kind: 'floating',
        message,
        position: opts?.position ?? 'bottom',
        duration: opts?.duration ?? 2000,
      }),
    dismiss: () => set({ current: null }),
  };
});

/** 컴포넌트 밖(이벤트 핸들러/유틸)에서도 호출할 수 있는 헬퍼 */
export const overlay = {
  toast: (message: string, opts?: ShowOptions) => useOverlayStore.getState().toast(message, opts),
  snackbar: (message: string, opts?: SnackbarOptions) => useOverlayStore.getState().snackbar(message, opts),
  floating: (message: string, opts?: ShowOptions) => useOverlayStore.getState().floating(message, opts),
};
