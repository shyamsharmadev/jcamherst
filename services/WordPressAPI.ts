import { API_BASE_URL, API_KEY } from '../constants/config';

interface LoginParams {
  username: string;
  password: string;
  platform: 'ios' | 'android';
}

interface RegisterTokenParams {
  userId: number;
  token: string;
  platform: 'ios' | 'android';
}

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  message: string;
  cookies?: string[];
}

interface TokenResponse {
  ok: boolean;
  count: number;
}

class WordPressAPI {
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (API_KEY) {
      headers['X-JCA-Api-Key'] = API_KEY;
    }
    return headers;
  }

  async login(params: LoginParams): Promise<LoginResponse> {
    console.log('WordPressAPI.login called with:', params);
    console.log('API URL:', `${API_BASE_URL}/login`);
    console.log('Headers:', this.getHeaders());
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Capture cookies from response headers
      const cookies = response.headers.get('set-cookie')?.split(',') || [];
      console.log('Cookies captured:', cookies);

      return { ...data, cookies };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async registerToken(params: RegisterTokenParams): Promise<TokenResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/register-token`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token registration failed');
      }

      return data;
    } catch (error) {
      console.error('Register token error:', error);
      throw error;
    }
  }

  async unregisterToken(params: RegisterTokenParams): Promise<TokenResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/unregister-token`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token unregistration failed');
      }

      return data;
    } catch (error) {
      console.error('Unregister token error:', error);
      throw error;
    }
  }

  async sendTestNotification(): Promise<TestNotificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/send-test-notification`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Test notification failed');
      }

      return data;
    } catch (error) {
      console.error('Send test notification error:', error);
      throw error;
    }
  }
}

export default new WordPressAPI();