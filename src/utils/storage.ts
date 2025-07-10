import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const REMEMBER_ME_KEY = 'remember_me';

export const secureStorage = {
  // Store authentication token securely
  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
      throw new Error('Failed to store authentication token');
    }
  },

  // Retrieve authentication token
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  // Remove authentication token
  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Store user data
  async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  // Retrieve user data
  async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  // Remove user data
  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  },

  // Remember me functionality
  async setRememberMe(remember: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(REMEMBER_ME_KEY, remember.toString());
    } catch (error) {
      console.error('Error storing remember me preference:', error);
    }
  },

  async getRememberMe(): Promise<boolean> {
    try {
      const remember = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      return remember === 'true';
    } catch (error) {
      console.error('Error retrieving remember me preference:', error);
      return false;
    }
  },

  // Clear all stored data
  async clearAll(): Promise<void> {
    try {
      await this.removeToken();
      await this.removeUserData();
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};