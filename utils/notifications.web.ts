type PermissionResponse = {
  status: 'granted' | 'denied' | 'undetermined';
  granted: boolean;
  canAskAgain: boolean;
  expires: 'never';
};

const grantedPermission: PermissionResponse = {
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
};

export const AndroidImportance = {
  HIGH: 'high',
};

export const SchedulableTriggerInputTypes = {
  WEEKLY: 'weekly',
};

export function setNotificationHandler() {
  return undefined;
}

export async function setNotificationChannelAsync() {
  return null;
}

export async function getPermissionsAsync() {
  return grantedPermission;
}

export async function requestPermissionsAsync() {
  return grantedPermission;
}

export async function scheduleNotificationAsync() {
  return `web-notification-${Date.now()}`;
}

export async function cancelScheduledNotificationAsync() {
  return undefined;
}

export async function cancelAllScheduledNotificationsAsync() {
  return undefined;
}

export function addNotificationResponseReceivedListener() {
  return {
    remove() {
      return undefined;
    },
  };
}
