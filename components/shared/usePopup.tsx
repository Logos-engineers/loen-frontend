/**
 * usePopup — 앱 디자인 Popup(중앙 다이얼로그)을 선언형으로 띄우는 헬퍼.
 * OS 기본 Alert 대신 로엔 디자인 팝업으로 확인/안내를 표시한다.
 *
 * 사용:
 *   const { confirm, info, node } = usePopup();
 *   info('신고 접수', '신고가 접수되었습니다.');
 *   confirm({ title, description, confirmLabel: '차단', destructive: true, onConfirm });
 *   ...JSX 어딘가에 {node}
 */
import Popup, { type PopupButton } from '@/components/ui/overlay/Popup';
import React, { useCallback, useState } from 'react';

type PopupState = {
  title?: string;
  description?: string;
  buttons: PopupButton[];
};

export function usePopup() {
  const [state, setState] = useState<PopupState | null>(null);
  const close = useCallback(() => setState(null), []);

  /** 단일 '확인' 안내 팝업 */
  const info = useCallback((title: string, description?: string) => {
    setState({ title, description, buttons: [{ label: '확인', onPress: () => setState(null) }] });
  }, []);

  /** 취소/실행 2버튼 확인 팝업 */
  const confirm = useCallback(
    (opts: { title: string; description?: string; confirmLabel: string; onConfirm: () => void }) => {
      setState({
        title: opts.title,
        description: opts.description,
        buttons: [
          { label: '취소', variant: 'secondary', onPress: () => setState(null) },
          {
            label: opts.confirmLabel,
            onPress: () => {
              setState(null);
              opts.onConfirm();
            },
          },
        ],
      });
    },
    [],
  );

  const node = (
    <Popup
      visible={!!state}
      onClose={close}
      title={state?.title}
      description={state?.description}
      buttons={state?.buttons}
    />
  );

  return { info, confirm, node };
}
