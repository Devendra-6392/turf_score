import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getNotifications() {
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

export async function registerForPushNotificationsAsync() {
  const Notifications = getNotifications();
  if (!Notifications) {
    console.log('Push notifications are skipped in Expo Go. Use a development build for remote notifications.');
    return null;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission denied');
    alert('Notification permission denied! Please enable it in your phone settings.');
    return null;
  }

  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const expoPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log("Expo Push Token:", expoPushToken);
    
    let fcmToken = null;
    try {
      fcmToken = (await Notifications.getDevicePushTokenAsync()).data;
      console.log("Native Device Push Token:", fcmToken);
    } catch (e) {
      console.log("Could not fetch native device token (normal in Expo Go/Simulators)");
    }

    return { expoPushToken, fcmToken };
  } catch (error) {
    console.error("Error getting push tokens:", error);
    alert(`Error getting push tokens: ${error.message}`);
    return null;
  }
}

export async function scheduleLocalNotification(title, body, seconds = 2) {
  const Notifications = getNotifications();
  if (!Notifications) return;

  const token = await registerForPushNotificationsAsync();
  if (!token) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title || 'Skipers',
      body: body || 'You have a new notification!',
      sound: true,
    },
    trigger: {
      seconds: seconds,
    },
  });
}

export async function requestNotificationPermission() {
  const Notifications = getNotifications();
  if (!Notifications) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}
