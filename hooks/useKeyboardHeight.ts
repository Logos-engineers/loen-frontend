/**
 * useKeyboardHeight — 키보드 높이(px)를 추적해 돌려준다.
 * KeyboardAvoidingView는 (1) iOS behavior="padding"에서 키보드를 내려도 잔여 padding이 남고
 * (2) Android edge-to-edge(Expo SDK 54 기본)에서 adjustResize가 자동 리사이즈를 안 해
 * CTA가 키보드 뒤에 가려지는 문제가 있어, 키보드 높이를 직접 받아 footer를 올리는 데 쓴다.
 *
 * iOS는 keyboardWillShow/Hide(애니메이션과 동기), Android는 keyboardDidShow/Hide를 구독.
 */
import { useEffect, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform } from 'react-native';

export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: { endCoordinates?: { height: number } }) => {
      // iOS는 키보드 애니메이션에 맞춰 부드럽게 레이아웃 전환
      if (Platform.OS === 'ios') LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setHeight(e.endCoordinates?.height ?? 0);
    };
    const onHide = () => {
      if (Platform.OS === 'ios') LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setHeight(0);
    };

    const showSub = Keyboard.addListener(showEvt, onShow);
    const hideSub = Keyboard.addListener(hideEvt, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
