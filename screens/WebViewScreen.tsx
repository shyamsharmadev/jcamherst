import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { WORDPRESS_SITE_URL } from '../constants/config';
import AuthService from '../services/AuthService';
import { isWeb } from '../utils/platform';

interface Props {
  navigation?: any;
  route?: string;
  title?: string;
}

const WebViewScreen: React.FC<Props> = ({ navigation, route = '/', title = 'JC Amherst' }) => {
  console.log('WebViewScreen component rendered for:', title);
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookies] = useState<string[] | null>(null);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [currentUrl, setCurrentUrl] = useState(`${WORDPRESS_SITE_URL}${route}`);

  useEffect(() => {
    console.log('WebViewScreen useEffect');
    const loadData = async () => {
      const storedCookies = await AuthService.getCookies();
      const storedCredentials = await AuthService.getCredentials();
      console.log('Loaded cookies:', storedCookies);
      console.log('Loaded credentials:', storedCredentials ? 'YES' : 'NO');
      setCookies(storedCookies);
      setCredentials(storedCredentials);
    };
    loadData();
  }, []);

  const injectAutoLogin = () => {
    if (!credentials) {
      console.log('[React] No credentials for auto-login');
      return `console.log('[WebView] No credentials for auto-login'); true;`;
    }

    console.log('[React] Preparing auto-login injection');
    const { username, password } = credentials;

    return `
      (function() {
        try {
          console.log('[WebView] Checking for login form...');
          
          // Check if we're on the login page
          if (window.location.href.indexOf('wp-login.php') === -1) {
            console.log('[WebView] Not on login page, skipping auto-login');
            return true;
          }
          
          // Prevent multiple auto-login attempts
          if (window.autoLoginAttempted) {
            console.log('[WebView] Auto-login already attempted');
            return true;
          }
          
          window.autoLoginAttempted = true;
          
          // Wait for DOM to be ready
          function attemptAutoLogin() {
            const loginForm = document.getElementById('loginform');
            const userField = document.getElementById('user_login');
            const passField = document.getElementById('user_pass');
            const rememberCheckbox = document.getElementById('rememberme');
            
            if (!loginForm || !userField || !passField) {
              console.log('[WebView] Login form not ready yet, retrying...');
              setTimeout(attemptAutoLogin, 100);
              return;
            }
            
            console.log('[WebView] Login form found, filling credentials...');
            
            // Fill in credentials
            userField.value = '${username.replace(/'/g, "\\'")}';
            passField.value = '${password.replace(/'/g, "\\'")}';
            
            // Check remember me
            if (rememberCheckbox) {
              rememberCheckbox.checked = true;
              console.log('[WebView] Remember me checked');
            }
            
            console.log('[WebView] Submitting login form...');
            
            // Submit the form
            setTimeout(function() {
              loginForm.submit();
            }, 500);
          }
          
          // Start attempting auto-login
          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            attemptAutoLogin();
          } else {
            document.addEventListener('DOMContentLoaded', attemptAutoLogin);
          }
          
        } catch (error) {
          console.error('[WebView] Auto-login error:', error);
        }
        return true;
      })();
    `;
  };

  const handleNavigationStateChange = (navState: any) => {
    // Handle navigation changes if needed
    console.log('Navigation:', navState.url);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const user = await AuthService.getUser();
            const fcmToken = await AuthService.getFCMToken();
            if (user) {
              await AuthService.logout(user.id, fcmToken || undefined);
            }
            if (navigation) {
              navigation.replace('Login');
            }
          },
        },
      ]
    );
  };

  if (isWeb()) {
    // For web platform, show message since WebView is not supported
    return (
      <View style={styles.container}>
        <Text style={styles.webMessage}>
          Login successful! For web version, please visit:
        </Text>
        <Text style={styles.siteUrl}>{WORDPRESS_SITE_URL}</Text>
        <Text style={styles.webMessage}>
          You are logged in and can access the site directly.
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onLoadStart={() => {
          console.log('WebView load start');
          setLoading(true);
        }}
        onLoadEnd={() => {
          console.log('WebView load end');
          setLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
        onNavigationStateChange={(navState) => {
          console.log(`[WebView ${title}] Navigation:`, navState.url);
          setCurrentUrl(navState.url);
          
          // Detect login page and inject auto-login
          if (navState.url.includes('wp-login.php') && credentials) {
            console.log(`[WebView ${title}] Login page detected, injecting auto-login...`);
            // Inject the auto-login script when on login page
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(injectAutoLogin());
            }
          }
          
          handleNavigationStateChange(navState);
        }}
        onMessage={(event) => {
          console.log('[WebView] Message:', event.nativeEvent.data);
        }}
        injectedJavaScriptForMainFrameOnly={true}
        injectedJavaScriptBeforeContentLoaded={`
          console.log('[WebView] JavaScript ready');
          true;
        `}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  webMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  siteUrl: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#007bff',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WebViewScreen;