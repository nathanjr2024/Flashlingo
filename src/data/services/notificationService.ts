/**
 * Notification Service - Daily Study Reminders
 * Schedules local notifications to remind the user to study daily.
 */
import * as Notifications from 'expo-notifications';

const NOTIFICATION_IDENTIFIER = 'daily-study-reminder';

export class NotificationService {
  /**
   * Request notification permissions from the user.
   */
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  }

  /**
   * Schedule a daily notification at 9:00 AM local time.
   */
  static async scheduleDailyReminder(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Cancel any existing reminder first
    await this.cancelDailyReminder();

    // Schedule new daily notification at 9:00 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hora de estudar! \u{1F9E0}',
        body: 'Mantenha sua sequência viva revisando suas palavras hoje.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
      identifier: NOTIFICATION_IDENTIFIER,
    });
  }

  /**
   * Cancel the daily study reminder.
   */
  static async cancelDailyReminder(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier === NOTIFICATION_IDENTIFIER) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  /**
   * Check if daily reminder is currently scheduled.
   */
  static async isReminderScheduled(): Promise<boolean> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.some(
      (n) => n.identifier === NOTIFICATION_IDENTIFIER
    );
  }

  /**
   * Set up notification handler for foreground notifications.
   */
  static setupNotificationHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
}