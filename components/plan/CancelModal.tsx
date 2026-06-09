/**
 * components/plan/CancelModal.tsx
 * 목표 설정 취소 확인 모달.
 * 변경사항이 있을 때 뒤로가기 시 표시.
 * 디자인 시스템 Popup(components/ui/overlay) 기반.
 */

import Popup from '@/components/ui/overlay/Popup';
import React from 'react';

type Props = {
  visible: boolean;
  onKeepEditing: () => void;
  onLeave: () => void;
};

export default function CancelModal({ visible, onKeepEditing, onLeave }: Props) {
  return (
    <Popup
      visible={visible}
      onClose={onKeepEditing}
      description={'지금까지 입력한 내용이 저장되지 않습니다.\n그래도 나가시겠어요?'}
      buttons={[
        { label: '계속 작성하기', variant: 'secondary', onPress: onKeepEditing },
        { label: '나가기', variant: 'primary', onPress: onLeave },
      ]}
    />
  );
}
