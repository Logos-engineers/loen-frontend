/**
 * components/ui/overlay
 * Figma 디자인시스템 dim screen 컴포넌트 세트.
 *
 * 선언형: BottomSheet, Popup, Handle (visible/onClose 제어)
 * 명령형: overlay.toast() / overlay.snackbar() / overlay.floating() + <OverlayHost/>
 */

export { default as BottomSheet } from './BottomSheet';
export { default as Floating } from './Floating';
export { default as Handle } from './Handle';
export { default as OverlayHost } from './OverlayHost';
export { default as Popup, type PopupButton } from './Popup';
export { default as Snackbar } from './Snackbar';
export { default as Toast } from './Toast';
export { overlay, useOverlayStore } from './overlay-store';
export type { OverlayPosition, ToastItem } from './overlay-store';
