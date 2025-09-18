import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/authApi';

export interface User {
  _id: string;
  email: string;
  name: string;
  profileImage?: string;
  location?: string;
  preferences: {
    stylePreferences: string[];
    budgetRange: {
      min: number;
      max: number;
    };
    favoriteBrands: string[];
    sizePreferences: {
      top?: string;
      bottom?: string;
      shoes?: string;
    };
  };
  stats: {
    roomsCreated: number;
    wardrobesOwned: number;
    itemsPurchased: number;
    styleScore: number;
  };
  badges: string[];
  isEmailVerified: boolean;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, location?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔐 AuthContext: Initializing authentication...');
      setIsLoading(true);
      
      // Try to get tokens from secure storage
      const storedToken = await SecureStore.getItemAsync('auth_token');
      const storedRefreshToken = await SecureStore.getItemAsync('refresh_token');
      const storedUser = await AsyncStorage.getItem('user_data');

      console.log('🔐 AuthContext: Stored data check', { 
        hasToken: !!storedToken, 
        hasRefreshToken: !!storedRefreshToken, 
        hasUser: !!storedUser 
      });

      if (storedToken && storedRefreshToken && storedUser) {
        console.log('🔐 AuthContext: Found stored credentials, setting auth state...');
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));

        // Verify token is still valid by fetching user data
        try {
          const userData = await authApi.getCurrentUser(storedToken);
          setUser(userData);
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        } catch (error) {
          // Token is invalid, try to refresh
          try {
            await refreshAuthToken(storedRefreshToken);
          } catch (refreshError) {
            // Refresh failed, clear auth state
            await clearAuthState();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await clearAuthState();
    } finally {
      console.log('🔐 AuthContext: Auth initialization complete', { 
        isAuthenticated: !!(user && token), 
        hasUser: !!user, 
        hasToken: !!token 
      });
      setIsLoading(false);
    }
  };

  const clearAuthState = async () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await AsyncStorage.removeItem('user_data');
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password);
      
      const { user: userData, token: authToken, refreshToken: newRefreshToken } = response.data;

      // Store tokens securely
      await SecureStore.setItemAsync('auth_token', authToken);
      await SecureStore.setItemAsync('refresh_token', newRefreshToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));

      setUser(userData);
      setToken(authToken);
      setRefreshToken(newRefreshToken);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more specific error messages
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, location?: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(name, email, password, location);
      
      const { user: userData, token: authToken, refreshToken: newRefreshToken } = response.data;

      // Store tokens securely
      await SecureStore.setItemAsync('auth_token', authToken);
      await SecureStore.setItemAsync('refresh_token', newRefreshToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));

      setUser(userData);
      setToken(authToken);
      setRefreshToken(newRefreshToken);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Provide more specific error messages
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Registration failed. Please check your information.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token && refreshToken) {
        await authApi.logout(token, refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuthState();
    }
  };

  const refreshAuthToken = async (tokenToRefresh?: string) => {
    try {
      const token = tokenToRefresh || refreshToken;
      if (!token) {
        console.log('🔐 AuthContext: No refresh token available for refresh');
        throw new Error('No refresh token available');
      }

      console.log('🔐 AuthContext: Attempting to refresh token...');
      const response = await authApi.refreshToken(token);
      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      // Update stored tokens
      await SecureStore.setItemAsync('auth_token', newToken);
      await SecureStore.setItemAsync('refresh_token', newRefreshToken);

      setToken(newToken);
      setRefreshToken(newRefreshToken);
    } catch (error) {
      console.log('🔐 AuthContext: Token refresh failed:', error instanceof Error ? error.message : 'Unknown error');
      await clearAuthState();
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!token) {
        throw new Error('No authentication token');
      }

      const updatedUser = await authApi.updateProfile(token, userData);
      setUser(updatedUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authApi.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await authApi.resetPassword(token, password);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshAuthToken,
        updateUser,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
