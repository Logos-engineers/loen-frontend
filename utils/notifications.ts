import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Expo Go SDK 53+ 에서 Android 푸시 알림 기능이 제거됨에 따른 대응
// https://docs.expo.dev/versions/latest/sdk/notifications/
const isExpoGoAndroid = Platform.OS === 'android' && Constants.appOwnership === 'expo';

let NotificationsModule: any;

if (isExpoGoAndroid) {
  // Expo Go Android 환경에서는 Mock 객체 사용 (크래시 방지)
  NotificationsModule = {
    addNotificationResponseReceivedListener: () => {
      console.warn('[Notifications] Expo Go Android에서는 푸시 알림 리스너가 지원되지 않습니다. Development Build를 사용하세요.');
      return { remove: () => {} };
    },
    addNotificationReceivedListener: () => ({ remove: () => {} }),
    removeNotificationSubscription: () => {},
    setNotificationHandler: () => {},
    getPermissionsAsync: async () => ({ status: 'denied', granted: false }),
    requestPermissionsAsync: async () => ({ status: 'denied', granted: false }),
    getExpoPushTokenAsync: async () => ({ data: '' }),
    scheduleNotificationAsync: async () => '',
    cancelAllScheduledNotificationsAsync: async () => {},
    cancelScheduledNotificationAsync: async () => {},
    getAllScheduledNotificationsAsync: async () => [],
    getBadgeCountAsync: async () => 0,
    setBadgeCountAsync: async () => false,
    setNotificationChannelAsync: async () => null,
    deleteNotificationChannelAsync: async () => {},
    getNotificationChannelsAsync: async () => [],
    getNotificationChannelAsync: async () => null,
    // Enums
    AndroidImportance: {
      UNKNOWN: 0,
      UNSPECIFIED: -1000,
      NONE: 1,
      MIN: 2,
      LOW: 3,
      DEFAULT: 4,
      HIGH: 5,
      MAX: 6,
    },
    SchedulableTriggerInputTypes: {
      TIME_INTERVAL: 'timeInterval',
      DAILY: 'daily',
      WEEKLY: 'weekly',
      MONTHLY: 'monthly',
      YEARLY: 'yearly',
      DATE: 'date',
    },
  };
} else {
  // 그 외 환경(iOS, Android Dev Build 등)에서는 실제 모듈 사용
  try {
    // side effect가 있는 import 대신 require 사용
    NotificationsModule = require('expo-notifications');
  } catch (e) {
    console.warn('[Notifications] Failed to load expo-notifications, using fallback mock.', e);
    NotificationsModule = {
      addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
      setNotificationHandler: () => {},
      getPermissionsAsync: async () => ({ status: 'denied', granted: false }),
      requestPermissionsAsync: async () => ({ status: 'denied', granted: false }),
    };
  }
}

// Named exports
export const addNotificationResponseReceivedListener = NotificationsModule.addNotificationResponseReceivedListener;
export const addNotificationReceivedListener = NotificationsModule.addNotificationReceivedListener;
export const removeNotificationSubscription = NotificationsModule.removeNotificationSubscription;
export const setNotificationHandler = NotificationsModule.setNotificationHandler;
export const getPermissionsAsync = NotificationsModule.getPermissionsAsync;
export const requestPermissionsAsync = NotificationsModule.requestPermissionsAsync;
export const getExpoPushTokenAsync = NotificationsModule.getExpoPushTokenAsync;
export const scheduleNotificationAsync = NotificationsModule.scheduleNotificationAsync;
export const cancelAllScheduledNotificationsAsync = NotificationsModule.cancelAllScheduledNotificationsAsync;
export const cancelScheduledNotificationAsync = NotificationsModule.cancelScheduledNotificationAsync;
export const getAllScheduledNotificationsAsync = NotificationsModule.getAllScheduledNotificationsAsync;
export const getBadgeCountAsync = NotificationsModule.getBadgeCountAsync;
export const setBadgeCountAsync = NotificationsModule.setBadgeCountAsync;
export const setNotificationChannelAsync = NotificationsModule.setNotificationChannelAsync;
export const deleteNotificationChannelAsync = NotificationsModule.deleteNotificationChannelAsync;
export const getNotificationChannelsAsync = NotificationsModule.getNotificationChannelsAsync;
export const getNotificationChannelAsync = NotificationsModule.getNotificationChannelAsync;

// Enums
export const AndroidImportance = NotificationsModule.AndroidImportance;
export const SchedulableTriggerInputTypes = NotificationsModule.SchedulableTriggerInputTypes;

export default NotificationsModule;
