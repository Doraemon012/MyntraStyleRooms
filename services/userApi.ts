import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Create axios instance for user API
const userApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
userApiClient.interceptors.request.use(
  (config) => {
    console.log(`👤 User API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ User API Request Error:', error);
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  location?: string;
}

export interface UserSearchResponse {
  users: User[];
}

export const userApi = {
  // Search users by name or email
  searchUsers: async (token: string, options?: {
    query?: string;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (options?.query) params.append('q', options.query);
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await userApiClient.get(`/users/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get user by ID
  getUser: async (token: string, userId: string) => {
    const response = await userApiClient.get(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async (token: string) => {
    const response = await userApiClient.get('/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update user profile
  updateProfile: async (token: string, profileData: {
    name?: string;
    location?: string;
    preferences?: any;
  }) => {
    const response = await userApiClient.put('/users/profile', profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default userApi;
