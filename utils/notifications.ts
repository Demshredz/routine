import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Behavior for local notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('routine-reminders', {
      name: 'Routine Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
  }

  return token;
}

/**
 * Schedules a daily repeating local notification.
 * @param title The title of the notification (e.g. "Zeit für dein Supplement")
 * @param body The body of the notification
 * @param hour Hour to trigger (0-23)
 * @param minute Minute to trigger (0-59)
 * @returns The generated notification ID to save in the store for later cancellation
 */
export async function scheduleDailyRoutineNotification(title: string, body: string, hour: number, minute: number): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

/**
 * Cancels a previously scheduled notification.
 * @param notificationId The ID returned when scheduling
 */
export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
