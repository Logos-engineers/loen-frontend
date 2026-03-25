import React from 'react';
import { SvgXml } from 'react-native-svg';

export const targetSvgXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="24" height="24" rx="7.2" fill="url(#pattern0_7752_77099)"/>
<defs>
<pattern id="pattern0_7752_77099" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_7752_77099" transform="scale(0.00625)"/>
</pattern>
<image id="image0_7752_77099" width="160" height="160" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
`;

export const bigTargetSvgXml = `
<svg width="209" height="209" viewBox="0 0 209 209" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_f_7015_77702)">
<circle cx="104.486" cy="104.485" r="71.685" fill="#6561FF" fill-opacity="0.8"/>
</g>
<path d="M104.43 140.399C84.6213 140.399 68.5653 124.343 68.5653 104.534C68.5653 84.7251 84.6213 68.6691 104.43 68.6691C109.637 68.6691 114.573 69.8031 119.037 71.8011C123.096 68.4306 128.492 64.1556 134.184 59.7276C125.661 54.0576 115.437 50.7366 104.43 50.7366C74.7168 50.7366 50.6328 74.8251 50.6328 104.534C50.6328 134.243 74.7213 158.332 104.43 158.332C134.139 158.332 158.232 134.243 158.232 104.534C158.232 93.1131 154.65 82.5426 148.58 73.8351C144.255 79.5456 140.07 84.9636 136.754 89.0631C139.004 93.7521 140.3 98.9856 140.3 104.534C140.3 124.343 124.239 140.399 104.43 140.399Z" fill="white"/>
<path d="M104.425 107.568C103.57 107.568 102.71 107.244 102.053 106.596C100.73 105.287 100.717 103.149 102.026 101.822L112.178 91.5436C111.62 90.4861 111.067 89.1991 110.675 87.7816C108.722 87.0526 106.63 86.5981 104.425 86.5981C94.5202 86.5981 86.4922 94.6261 86.4922 104.531C86.4922 114.435 94.5202 122.463 104.425 122.463C114.329 122.463 122.357 114.435 122.357 104.531C122.357 102.15 121.871 99.8866 121.03 97.8121C119.5 97.4386 118.114 96.8626 116.98 96.2866L106.828 106.565C106.171 107.235 105.293 107.568 104.425 107.568Z" fill="white"/>
<path d="M184.423 27.9972L190.597 21.7467C191.906 20.4237 191.893 18.2817 190.57 16.9722C189.238 15.6627 187.1 15.6717 185.795 17.0037L179.621 23.2542C180.319 25.4547 180.647 27.0162 180.647 27.0162C180.647 27.0162 182.209 27.3267 184.418 27.9972H184.423Z" fill="#6561FF" fill-opacity="0.6"/>
<path d="M102.021 101.824C100.711 103.147 100.725 105.289 102.048 106.598C102.705 107.246 103.564 107.57 104.419 107.57C105.288 107.57 106.161 107.237 106.818 106.567L116.97 96.2888C115.174 95.3753 114.018 94.4798 114.018 94.4798C114.018 94.4798 113.109 93.3323 112.173 91.5503L102.021 101.824Z" fill="#6561FF" fill-opacity="0.2"/>
<path d="M160.179 58.3001C160.044 58.4801 159.909 58.7051 159.774 58.8851C156.309 63.5201 152.439 68.7401 148.569 73.8251C144.249 79.5401 140.064 84.9401 136.734 89.0801C134.574 91.7351 132.774 93.8951 131.604 95.0651C128.274 98.4401 124.314 98.6201 121.029 97.8101C119.499 97.4501 118.104 96.8651 116.979 96.2801C115.179 95.3801 114.009 94.4801 114.009 94.4801C114.009 94.4801 113.109 93.3101 112.164 91.5551C111.624 90.4751 111.084 89.2151 110.679 87.7751C109.734 84.4451 109.779 80.3951 113.199 76.9301C114.369 75.7601 116.439 73.9601 119.049 71.8001C123.099 68.4251 128.499 64.1501 134.169 59.7401C139.209 55.8251 144.384 51.8651 148.974 48.3551C149.199 48.1751 149.424 48.0401 149.649 47.8601C150.864 52.5401 152.394 55.6451 152.394 55.6451C152.394 55.6451 155.499 57.1301 160.179 58.3001Z" fill="white"/>
<path d="M152.41 55.6412L180.688 27.0122C180.688 27.0122 180.359 25.4552 179.662 23.2502C177.268 15.7172 170.486 0.583725 157.247 13.9847C146.191 25.1762 147.415 39.2702 149.656 47.8607C150.884 52.5587 152.41 55.6412 152.41 55.6412Z" fill="white"/>
<path d="M158.24 104.53C158.24 134.244 134.151 158.328 104.438 158.328C74.7241 158.328 50.6401 134.239 50.6401 104.53C50.6401 74.821 74.7286 50.7325 104.438 50.7325C115.445 50.7325 125.669 54.0535 134.192 59.7235C139.209 55.8265 144.389 51.8575 148.979 48.3655C136.739 38.6455 121.281 32.8 104.438 32.8C64.8196 32.8 32.7031 64.9165 32.7031 104.535C32.7031 144.153 64.8196 176.269 104.438 176.269C144.056 176.269 176.172 144.153 176.172 104.535C176.172 87.1915 170.016 71.2885 159.774 58.8865C156.341 63.5215 152.43 68.7551 148.583 73.831C154.653 82.543 158.24 93.1091 158.24 104.53Z" fill="#6561FF" fill-opacity="0.6"/>
<path d="M104.428 122.466C94.523 122.466 86.495 114.438 86.495 104.533C86.495 94.6287 94.523 86.6007 104.428 86.6007C106.637 86.6007 108.725 87.0552 110.678 87.7842C109.756 84.4407 109.787 80.3907 113.216 76.9212C114.363 75.7557 116.452 73.9467 119.035 71.8002C114.571 69.8022 109.634 68.6682 104.428 68.6682C84.6185 68.6682 68.5625 84.7242 68.5625 104.533C68.5625 124.342 84.6185 140.398 104.428 140.398C124.236 140.398 140.292 124.342 140.292 104.533C140.292 98.9847 138.996 93.7512 136.746 89.0622C134.582 91.7352 132.76 93.8907 131.594 95.0697C128.26 98.4447 124.331 98.6157 121.033 97.8102C121.874 99.8892 122.36 102.148 122.36 104.529C122.36 114.433 114.332 122.461 104.428 122.461V122.466Z" fill="#6561FF" fill-opacity="0.2"/>
<path d="M152.415 55.6415C152.415 55.6415 155.511 57.131 160.227 58.301C168.844 60.4384 182.947 61.487 194.004 50.291C207.243 36.89 192.024 30.293 184.459 27.9935C182.25 27.323 180.688 27.0125 180.688 27.0125L152.415 55.6415Z" fill="white" fill-opacity="0.23"/>
<path d="M181.51 28.2234C182.161 28.3811 183.085 28.6213 184.168 28.95C186.026 29.5147 188.338 30.3388 190.554 31.4558C192.779 32.5777 194.847 33.965 196.273 35.6296C197.682 37.2732 198.443 39.1547 198.169 41.3533C197.89 43.59 196.519 46.3226 193.292 49.5886C182.607 60.4079 168.958 59.4366 160.468 57.3308C158.156 56.7572 156.24 56.1045 154.907 55.5974C154.631 55.4922 154.38 55.3921 154.155 55.3015L181.011 28.1082C181.152 28.1403 181.319 28.1772 181.51 28.2234Z" stroke="white" stroke-opacity="0.1" stroke-width="2"/>
<defs>
<filter id="filter0_f_7015_77702" x="0.000782013" y="4.95911e-05" width="208.971" height="208.97" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="16.4" result="effect1_foregroundBlur_7015_77702"/>
</filter>
</defs>
</svg>
`;

export const downbuttonSvgXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0002 12.879L16.2432 8.63604C16.6332 8.24504 17.2662 8.24504 17.6572 8.63604C18.0482 9.02704 18.0482 9.66004 17.6572 10.05L12.7072 15.0001C12.3162 15.3911 11.6832 15.3911 11.2932 15.0001L6.34316 10.05C5.95216 9.66004 5.95216 9.02704 6.34316 8.63604C6.73416 8.24504 7.36716 8.24504 7.75716 8.63604L12.0002 12.879Z" fill="#808080"/>
</svg>
`;

export const lightPlusButtonSvgXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="12" fill="#EAE9FF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M11 6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6Z" fill="#9390FF"/>
</svg>
`;

export const plusButtonSvgXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="12" fill="#6561FF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M11 6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6Z" fill="white"/>
</svg>
`;

export const lightMinusButtonSvgXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="12" fill="#EAE9FF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6 13C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H6Z" fill="#9390FF"/>
</svg>
`;

export const minusButtonSvgXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="12" fill="#6561FF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6 13C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H6Z" fill="white"/>
</svg>
`;

export const checkCircleSvgXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="11" fill="white" stroke="#BFBFBF" stroke-width="2"/>
<path d="M16 9L10.5 14.5L8 12" stroke="#BFBFBF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

export const checkCirclePurpleSvgXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="12" fill="#6561FF"/>
<path d="M16 9L10.5 14.5L8 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

export const backSvgXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.9393 3.93934C12.5251 3.35355 13.4746 3.35355 14.0604 3.93934C14.6462 4.52513 14.6462 5.47465 14.0604 6.06043L8.12098 11.9999L14.0604 17.9393C14.6462 18.5251 14.6462 19.4746 14.0604 20.0604C13.4746 20.6462 12.5251 20.6462 11.9393 20.0604L4.93934 13.0604C4.35355 12.4746 4.35355 11.5251 4.93934 10.9393L11.9393 3.93934Z" fill="#0D1C2D" fill-opacity="0.8"/>
</svg>
`;



export function TargetIcon({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return <SvgXml xml={targetSvgXml} width={width} height={height} />;
}

export function BigTargetIcon({ width = 209, height = 209 }: { width?: number; height?: number }) {
  return <SvgXml xml={bigTargetSvgXml} width={width} height={height} />;
}

export function DownButtonIcon({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return <SvgXml xml={downbuttonSvgXml} width={width} height={height} />;
}

export function LightPlusButtonIcon({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return <SvgXml xml={lightPlusButtonSvgXml} width={width} height={height} />;
}

export function PlusButtonIcon({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return <SvgXml xml={plusButtonSvgXml} width={width} height={height} />;
}

export function LightMinusButtonIcon({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return <SvgXml xml={lightMinusButtonSvgXml} width={width} height={height} />;
}

export function MinusButtonIcon({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return <SvgXml xml={minusButtonSvgXml} width={width} height={height} />;
}

export function CheckCircleIcon({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return <SvgXml xml={checkCircleSvgXml} width={width} height={height} />;
}

export function CheckCirclePurpleIcon({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return <SvgXml xml={checkCirclePurpleSvgXml} width={width} height={height} />;
}

export function BackIcon({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return <SvgXml xml={backSvgXml} width={width} height={height} />;
}
