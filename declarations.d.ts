// SVG 파일을 React 컴포넌트로 import할 수 있도록 타입 선언
declare module '*.svg' {
  import React from 'react';
    import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
