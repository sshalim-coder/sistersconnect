import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, SignUpData } from '../types/auth';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Simulated API responses - replace with actual backend calls
export class AuthService {
  static async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Basic validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    if (credentials.password.length < 6) {
      throw new Error('Invalid credentials');
    }

    // Simulate successful login
    const user: User = {
      id: '1',
      email: credentials.email,
      name: credentials.email.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    const token = 'fake_jwt_token_' + Date.now();

    // Store token and user data
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

    return { user, token };
  }

  static async signUp(
    data: SignUpData
  ): Promise<{ user: User; token: string }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validation
    if (!data.email || !data.password || !data.name) {
      throw new Error('All fields are required');
    }

    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Please enter a valid email address');
    }

    // Simulate successful signup
    const user: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
    };

    const token = 'fake_jwt_token_' + Date.now();

    // Store token and user data
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

    return { user, token };
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);

      if (!token || !userData) {
        return null;
      }

      return JSON.parse(userData);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!email) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Simulate successful password reset request
    console.log('Password reset email sent to:', email);
  }
}
