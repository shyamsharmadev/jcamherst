import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AuthService from './AuthService';
import { Platform } from 'react-native';
import { isMobilePlatform } from '../utils/platform';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class FCMService {
  private isExpoGo(): boolean {
    return Constants.appOwnership === 'expo';
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Check if on actual device
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return false;
      }

      // Check if on mobile platform
      if (!isMobilePlatform()) {
        console.log('Push notifications not supported on web');
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permission for push notifications not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting push notification permissions:', error);
      return false;
    }
  }

  async getDeviceToken(): Promise<string | null> {
    try {
      // Check if on web or not a physical device
      if (!isMobilePlatform() || !Device.isDevice) {
        console.log('Push notifications only available on physical mobile devices');
        return null;
      }

      // Check if running in Expo Go
      if (this.isExpoGo()) {
        console.log('Push notifications require a standalone build. Expo Go uses Expo push tokens.');
        try {
          // Try to get Expo push token
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
          });
          console.log('Expo push token obtained');
          return token.data;
        } catch (expoError) {
          console.log('Failed to get Expo push token (may need project ID configured):', expoError);
          return null;
        }
      }

      // For standalone builds, get the native device token
      const token = await Notifications.getDevicePushTokenAsync();
      console.log('Native device token obtained');
      return token.data;
    } catch (error) {
      console.error('Error getting device token:', error);
      return null;
    }
  }

  async registerForPushNotifications(userId: number): Promise<boolean> {
    try {
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Push notification permission not granted');
        return false;
      }

      // Get device token
      const token = await this.getDeviceToken();
      if (!token) {
        console.log('Failed to get device token');
        return false;
      }

      // Register token with backend
      await AuthService.registerFCMToken(userId, token);
      console.log('Push notification token registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return false;
    }
  }

  setupNotificationListener(): void {
    // Handle notification received while app is foregrounded
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Handle navigation or actions here
    });
  }

  async sendTestNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test push notification',
        data: { data: 'goes here' },
      },
      trigger: null, // Send immediately
    });
  }
}

export default new FCMService();