import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthContextType, AuthState, LoginCredentials, SignUpCredentials, User } from '../types/auth';
import { secureStorage } from '../utils/storage';

// Mock API functions - replace with actual API calls
const mockAPI = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation
    if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
      return {
        user: {
          id: '1',
          email: credentials.email,
          firstName: 'Test',
          lastName: 'User',
          createdAt: new Date().toISOString(),
        },
        token: 'mock_token_' + Date.now(),
      };
    }
    throw new Error('Invalid email or password');
  },

  async signUp(credentials: SignUpCredentials): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      user: {
        id: Date.now().toString(),
        email: credentials.email,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        createdAt: new Date().toISOString(),
      },
      token: 'mock_token_' + Date.now(),
    };
  },

  async resetPassword(email: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password reset email sent to:', email);
  },
};

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_ERROR':
      return { ...state, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);
  const [error, setError] = React.useState<string | null>(null);

  // Check for stored authentication on app start
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const token = await secureStorage.getToken();
        const userData = await secureStorage.getUserData();
        
        if (token && userData) {
          dispatch({ type: 'SET_USER', payload: { user: userData, token } });
        }
      } catch (err) {
        console.error('Error checking stored auth:', err);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      setError(null);
      
      const { user, token } = await mockAPI.login(credentials);
      
      // Store token and user data
      await secureStorage.setToken(token);
      await secureStorage.setUserData(user);
      
      if (credentials.rememberMe) {
        await secureStorage.setRememberMe(true);
      }
      
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const signUp = async (credentials: SignUpCredentials): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      setError(null);
      
      const { user, token } = await mockAPI.signUp(credentials);
      
      // Store token and user data
      await secureStorage.setToken(token);
      await secureStorage.setUserData(user);
      
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await secureStorage.clearAll();
      dispatch({ type: 'CLEAR_USER' });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      await mockAPI.resetPassword(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = (): void => {
    setError(null);
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    authState,
    login,
    signUp,
    logout,
    resetPassword,
    clearError,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};