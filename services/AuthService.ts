import AsyncStorage from '@react-native-async-storage/async-storage';
import WordPressAPI from './WordPressAPI';
import { getAPIPlatform } from '../utils/platform';

const USER_KEY = 'user';
const FCM_TOKEN_KEY = 'fcm_token';
const COOKIES_KEY = 'cookies';
const CREDENTIALS_KEY = 'credentials';

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
}

class AuthService {
  async login(username: string, password: string): Promise<User> {
    const platform = getAPIPlatform();
    console.log('[AuthService] Logging in user:', username);
    
    const response = await WordPressAPI.login({
      username,
      password,
      platform,
    });

    if (response.success && response.user) {
      await this.setUser(response.user);
      if (response.cookies) {
        await this.setCookies(response.cookies);
      }
      console.log('[AuthService] ✅ Login successful, user:', response.user.username);
      return response.user;
    } else {
      console.error('[AuthService] ❌ Login failed:', response.message);
      throw new Error(response.message || 'Login failed');
    }
  }

  async logout(userId: number, fcmToken?: string): Promise<void> {
    if (fcmToken) {
      try {
        await WordPressAPI.unregisterToken({
          userId,
          token: fcmToken,
          platform: getAPIPlatform(),
        });
      } catch (error) {
        console.error('Error unregistering token:', error);
      }
    }
    await this.clearUser();
  }

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async getUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  }

  async setFCMToken(token: string): Promise<void> {
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
  }

  async getFCMToken(): Promise<string | null> {
    return await AsyncStorage.getItem(FCM_TOKEN_KEY);
  }

  async setCookies(cookies: string[]): Promise<void> {
    await AsyncStorage.setItem(COOKIES_KEY, JSON.stringify(cookies));
  }

  async getCookies(): Promise<string[] | null> {
    const cookiesStr = await AsyncStorage.getItem(COOKIES_KEY);
    return cookiesStr ? JSON.parse(cookiesStr) : null;
  }

  async setCredentials(username: string, password: string): Promise<void> {
    await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ username, password }));
  }

  async getCredentials(): Promise<{ username: string; password: string } | null> {
    const credsStr = await AsyncStorage.getItem(CREDENTIALS_KEY);
    return credsStr ? JSON.parse(credsStr) : null;
  }

  async registerFCMToken(userId: number, token: string): Promise<void> {
    console.log('[AuthService] Registering FCM token for user:', userId);
    console.log('[AuthService] Token:', token.substring(0, 20) + '...');
    console.log('[AuthService] Platform:', getAPIPlatform());
    
    try {
      const response = await WordPressAPI.registerToken({
        userId,
        token,
        platform: getAPIPlatform(),
      });
      console.log('[AuthService] WordPress response:', response);
      await this.setFCMToken(token);
      console.log('[AuthService] ✅ FCM token saved locally and in WordPress');
    } catch (error) {
      console.error('[AuthService] ❌ FCM token registration failed:', error);
      throw error;
    }
  }
}

export default new AuthService();