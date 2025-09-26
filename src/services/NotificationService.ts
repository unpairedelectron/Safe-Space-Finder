import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler - include all required fields for current SDK
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  priority?: 'default' | 'high';
  categoryId?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      // Set up notification categories
      await this.setupNotificationCategories();
      
      // Request permissions and get push token
      await this.requestPermissions();
      
      // Set up notification listeners
      this.setupNotificationListeners();
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Must use physical device for Push Notifications');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return false;
      }

      // Get push token (wrapped in try to avoid crashing startup)
      try {
        const tokenResponse = await Notifications.getExpoPushTokenAsync();
        this.expoPushToken = tokenResponse.data;
        await AsyncStorage.setItem('expoPushToken', this.expoPushToken);
      } catch (err) {
        console.warn('Could not retrieve Expo push token yet:', err);
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (err) {
      console.warn('Permission flow failed:', err);
      return false;
    }
  }

  // Set up notification categories for interactive notifications
  private async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('review_reminder', [
      {
        identifier: 'review_now',
        buttonTitle: 'Review Now',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'remind_later',
        buttonTitle: 'Remind Later',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('new_business', [
      {
        identifier: 'view_business',
        buttonTitle: 'View Business',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  }

  // Set up notification listeners
  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification actions
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { actionIdentifier, notification } = response;
    const data = notification.request.content.data;

    switch (actionIdentifier) {
      case 'review_now':
        // Navigate to review screen
        console.log('Navigate to review:', data);
        break;
      case 'remind_later':
        // Schedule reminder for later
        this.scheduleReminderNotification(data);
        break;
      case 'view_business':
        // Navigate to business detail
        console.log('Navigate to business:', data);
        break;
      default:
        // Default tap action
        console.log('Default notification tap:', data);
        break;
    }
  }

  // Schedule a local notification
  async scheduleNotification(
    notificationData: NotificationData,
    trigger: any
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content:
        {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: notificationData.sound !== false ? 'default' : undefined,
          priority: notificationData.priority === 'high' 
            ? Notifications.AndroidNotificationPriority.HIGH 
            : Notifications.AndroidNotificationPriority.DEFAULT,
          categoryIdentifier: notificationData.categoryId,
        },
      trigger,
    });

    return notificationId;
  }

  // Send immediate local notification
  async sendLocalNotification(notificationData: NotificationData): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        sound: notificationData.sound !== false ? 'default' : undefined,
        priority: notificationData.priority === 'high' 
          ? Notifications.AndroidNotificationPriority.HIGH 
          : Notifications.AndroidNotificationPriority.DEFAULT,
        categoryIdentifier: notificationData.categoryId,
      },
      trigger: null, // Show immediately
    });
  }

  // Schedule review reminder
  async scheduleReviewReminder(businessId: string, businessName: string): Promise<void> {
    const trigger = {
      seconds: 24 * 60 * 60, // 24 hours
    };

    await this.scheduleNotification(
      {
        title: 'How was your experience?',
        body: `Leave a review for ${businessName} to help the community!`,
        data: { businessId, type: 'review_reminder' },
        categoryId: 'review_reminder',
        priority: 'default',
      },
      trigger
    );
  }

  // Schedule nearby business notification
  async scheduleNearbyBusinessNotification(business: any): Promise<void> {
    await this.sendLocalNotification({
      title: 'New Safe Space Nearby!',
      body: `${business.name} is now available in your area`,
      data: { businessId: business.id, type: 'new_business' },
      categoryId: 'new_business',
      priority: 'high',
    });
  }

  // Schedule reminder for later
  private async scheduleReminderNotification(data: any): Promise<void> {
    const trigger = {
      seconds: 4 * 60 * 60, // 4 hours later
    };

    await this.scheduleNotification(
      {
        title: 'Reminder: Share your experience',
        body: 'Help others by reviewing your recent visit',
        data,
        priority: 'default',
      },
      trigger
    );
  }

  // Cancel specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Get push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Update push token on server (placeholder)
  async updatePushTokenOnServer(): Promise<void> {
    if (!this.expoPushToken) return;

    try {
      // TODO: Send push token to your backend server
      console.log('Push token to send to server:', this.expoPushToken);
      
      // Example API call:
      // await api.post('/users/push-token', { token: this.expoPushToken });
    } catch (error) {
      console.error('Error updating push token:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
