import { Platform } from 'react-native';

export type PlatformType = 'ios' | 'android' | 'web';
export type APIPlatformType = 'ios' | 'android';

/**
 * Get the current platform type for the app
 * @returns 'ios', 'android', or 'web'
 */
export const getPlatform = (): PlatformType => {
  if (Platform.OS === 'ios') {
    return 'ios';
  } else if (Platform.OS === 'android') {
    return 'android';
  } else {
    return 'web';
  }
};

/**
 * Check if the app is running on a mobile platform (iOS or Android)
 */
export const isMobilePlatform = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Check if the app is running on iOS
 */
export const isIOS = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Check if the app is running on Android
 */
export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
};

/**
 * Check if the app is running on web
 */
export const isWeb = (): boolean => {
  return Platform.OS === 'web';
};

/**
 * Get the platform type for API calls
 * Returns 'ios' or 'android', defaults to 'android' for web
 */
export const getAPIPlatform = (): APIPlatformType => {
  if (Platform.OS === 'ios') {
    return 'ios';
  }
  // Default to 'android' for web and android
  return 'android';
};