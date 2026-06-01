import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants?.appOwnership === 'expo';

function getNotifications() {
  if (isExpoGo) {
    return null;
  }

  return require('expo-notifications');
}

export function setupNotificationHandler() {
  const Notifications = getNotifications();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission() {
  const Notifications = getNotifications();
  if (!Notifications) {
    console.log('Push notifications are skipped in Expo Go. Use a development build for remote notifications.');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission denied');
    return false;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

export async function scheduleLocalNotification(title, body, seconds = 2) {
  const Notifications = getNotifications();
  if (!Notifications) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title || 'Turf Score',
      body: body || 'You have a new notification!',
      sound: true,
    },
    trigger: {
      seconds: seconds,
    },
  });
}
