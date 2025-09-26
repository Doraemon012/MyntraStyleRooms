// API service for easy backend integration
// This file contains all the API calls that will be used to fetch data from MongoDB

import { getApiBaseUrl } from '../utils/networkUtils';

const API_BASE_URL = getApiBaseUrl();
console.log('🌐 API Base URL configured:', API_BASE_URL);

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from storage for authenticated requests
  const token = await getStoredToken();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`🌐 Making API call to: ${url}`);
  console.log(`🔑 Token present: ${!!token}`);
  console.log(`📋 Request options:`, {
    method: defaultOptions.method || 'GET',
    headers: defaultOptions.headers,
    body: defaultOptions.body ? 'Present' : 'None'
  });

  try {
    console.log(`⏳ Sending request...`);
    const response = await fetch(url, defaultOptions);
    
    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Only log as error if it's not a 401 (unauthorized) which is expected for unauthenticated users
      if (response.status !== 401 || !errorData.message?.includes('Access token required')) {
        console.error('❌ API Error:', errorData);
      }
      
      throw new Error(errorData.message || `API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Success: ${endpoint}`);
    return data;
  } catch (error: any) {
    // Only log as error if it's not a 401 (unauthorized) which is expected for unauthenticated users
    if (!error.message?.includes('Access token required')) {
      console.error('❌ API call error:', error);
      console.error('🔗 URL attempted:', url);
    }
    throw error;
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';

// Token management functions
const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

const setStoredToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

const removeStoredToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Product API calls
export const productAPI = {
  // Get all products with optional filters
  getAll: (params?: {
    category?: string;
    subcategory?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => apiCall<any>(`/products?${new URLSearchParams(params as any).toString()}`),
  
  // Get product by ID
  getById: (id: string) => apiCall<any>(`/products/${id}`),
  
  // Get similar products
  getSimilar: (id: string, limit: number = 4) => 
    apiCall<any>(`/products/${id}/similar?limit=${limit}`),
  
  // Get recommended products
  getRecommended: (id: string, limit: number = 4) => 
    apiCall<any>(`/products/${id}/recommended?limit=${limit}`),
  
  // Search products
  search: (query: string, filters?: any) => 
    apiCall<any>(`/products/search?q=${encodeURIComponent(query)}&${new URLSearchParams(filters).toString()}`),
  
  // Get trending products
  getTrending: (limit: number = 8) => 
    apiCall<any>(`/products/trending?limit=${limit}`),
  
  // Get new products
  getNew: (limit: number = 8) => 
    apiCall<any>(`/products/new?limit=${limit}`),
  
  // Get products by category
  getByCategory: (category: string, limit?: number) => 
    apiCall<any>(`/products/category/${category}${limit ? `?limit=${limit}` : ''}`),
};

// Category API calls
export const categoryAPI = {
  // Get all categories
  getAll: () => apiCall<any>('/categories'),
  
  // Get active categories
  getActive: () => apiCall<any>('/categories/active'),
  
  // Get category by ID
  getById: (id: string) => apiCall<any>(`/categories/${id}`),
};

// Banner API calls
export const bannerAPI = {
  // Get all banners
  getAll: () => apiCall<any>('/banners'),
  
  // Get active banners
  getActive: () => apiCall<any>('/banners/active'),
  
  // Get banner by ID
  getById: (id: string) => apiCall<any>(`/banners/${id}`),
};

// Play menu API calls
export const playMenuAPI = {
  // Get all play menu items
  getAll: () => apiCall<any>('/play-menu'),
  
  // Get active play menu items
  getActive: () => apiCall<any>('/play-menu/active'),
  
  // Get play menu item by ID
  getById: (id: string) => apiCall<any>(`/play-menu/${id}`),
};

// User API calls
export const userAPI = {
  // Get user profile
  getProfile: () => apiCall<any>('/user/profile'),
  
  // Update user profile
  updateProfile: (data: any) => apiCall<any>('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Get all users (for adding to rooms) - uses search endpoint
  getAll: (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('q', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiCall<any>(`/users/search?${queryParams.toString()}`);
  },
  
  // Search users
  search: (query: string) => apiCall<any>(`/users/search?q=${encodeURIComponent(query)}`),
  
  // Get user's wishlist
  getWishlist: () => apiCall<any>('/user/wishlist'),
  
  // Add to wishlist
  addToWishlist: (productId: string) => apiCall<any>('/user/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  
  // Remove from wishlist
  removeFromWishlist: (productId: string) => apiCall<any>(`/user/wishlist/${productId}`, {
    method: 'DELETE',
  }),
};

// Cart API calls (for future use)
export const cartAPI = {
  // Get cart items
  getItems: () => apiCall<any>('/cart'),
  
  // Add item to cart
  addItem: (productId: string, quantity: number = 1, size?: string) => 
    apiCall<any>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, size }),
    }),
  
  // Update cart item quantity
  updateQuantity: (itemId: string, quantity: number) => 
    apiCall<any>(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  
  // Remove item from cart
  removeItem: (itemId: string) => apiCall<any>(`/cart/${itemId}`, {
    method: 'DELETE',
  }),
  
  // Clear cart
  clear: () => apiCall<any>('/cart', {
    method: 'DELETE',
  }),
};

// Order API calls (for future use)
export const orderAPI = {
  // Get user orders
  getOrders: () => apiCall<any>('/orders'),
  
  // Get order by ID
  getById: (id: string) => apiCall<any>(`/orders/${id}`),
  
  // Create order
  create: (orderData: any) => apiCall<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  // Cancel order
  cancel: (id: string) => apiCall<any>(`/orders/${id}/cancel`, {
    method: 'PUT',
  }),
};

// Review API calls (for future use)
export const reviewAPI = {
  // Get product reviews
  getByProduct: (productId: string) => apiCall<any>(`/reviews/product/${productId}`),
  
  // Create review
  create: (reviewData: any) => apiCall<any>('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  }),
  
  // Update review
  update: (id: string, reviewData: any) => apiCall<any>(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData),
  }),
  
  // Delete review
  delete: (id: string) => apiCall<any>(`/reviews/${id}`, {
    method: 'DELETE',
  }),
};

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    location?: string;
  }) => {
    const response = await apiCall<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.status === 'success' && response.data.token) {
      await setStoredToken(response.data.token);
    }
    
    return response;
  },
  
  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }) => {
    const response = await apiCall<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.status === 'success' && response.data.token) {
      await setStoredToken(response.data.token);
    }
    
    return response;
  },
  
  // Logout user
  logout: async () => {
    try {
      await apiCall<any>('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await removeStoredToken();
    }
  },
  
  // Get current user
  getCurrentUser: () => apiCall<any>('/auth/me'),
  
  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await apiCall<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.status === 'success' && response.data.token) {
      await setStoredToken(response.data.token);
    }
    
    return response;
  },
  
  // Forgot password
  forgotPassword: (email: string) => 
    apiCall<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  
  // Reset password
  resetPassword: (token: string, password: string) => 
    apiCall<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// Room API calls
export const roomAPI = {
  // Get all rooms for current user
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    return apiCall<any>(`/rooms?${queryParams.toString()}`);
  },
  
  // Get single room by ID
  getById: (roomId: string) => apiCall<any>(`/rooms/${roomId}`),
  
  // Create a new room
  create: (roomData: {
    name: string;
    emoji: string;
    description?: string;
    isPrivate?: boolean;
    members?: Array<{
      userId: string;
      role?: 'Editor' | 'Contributor' | 'Viewer';
    }>;
  }) => apiCall<any>('/rooms', {
    method: 'POST',
    body: JSON.stringify(roomData),
  }),
  
  // Update room
  update: (roomId: string, roomData: {
    name?: string;
    emoji?: string;
    description?: string;
    isPrivate?: boolean;
    settings?: any;
  }) => apiCall<any>(`/rooms/${roomId}`, {
    method: 'PUT',
    body: JSON.stringify(roomData),
  }),
  
  // Delete room
  delete: (roomId: string) => apiCall<any>(`/rooms/${roomId}`, {
    method: 'DELETE',
  }),
  
  // Add member to room
  addMember: (roomId: string, memberData: {
    userId: string;
    role?: 'Editor' | 'Contributor' | 'Viewer';
  }) => apiCall<any>(`/rooms/${roomId}/members`, {
    method: 'POST',
    body: JSON.stringify(memberData),
  }),
  
  // Update member role
  updateMemberRole: (roomId: string, memberId: string, role: 'Editor' | 'Contributor' | 'Viewer') => 
    apiCall<any>(`/rooms/${roomId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  
  // Remove member from room
  removeMember: (roomId: string, memberId: string) => 
    apiCall<any>(`/rooms/${roomId}/members/${memberId}`, {
      method: 'DELETE',
    }),
  
  // Join room (for public rooms)
  join: (roomId: string) => apiCall<any>(`/rooms/${roomId}/join`, {
    method: 'POST',
  }),
  
  // Leave room
  leave: (roomId: string) => apiCall<any>(`/rooms/${roomId}/leave`, {
    method: 'POST',
  }),
  
  // Toggle AI stylist on/off
  toggleAI: (roomId: string, aiEnabled: boolean) => 
    apiCall<any>(`/rooms/${roomId}/ai-toggle`, {
      method: 'PUT',
      body: JSON.stringify({ aiEnabled }),
    }),
  
  // Generate invitation link
  generateInvitation: (roomId: string, options?: {
    role?: 'Editor' | 'Contributor' | 'Viewer';
    expiresInHours?: number;
  }) => apiCall<any>(`/rooms/${roomId}/generate-invitation`, {
    method: 'POST',
    body: JSON.stringify(options || {}),
  }),
  
  // Join room via invitation
  joinViaInvitation: (roomId: string, token: string) => 
    apiCall<any>(`/rooms/${roomId}/join-invitation`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
};

// Invitation API calls
export const invitationAPI = {
  // Get all invitations for current user
  getAll: (params?: { status?: string; room?: string }) => 
    apiCall<{ status: string; data: { invitations: any[] } }>(`/invitations?${new URLSearchParams(params as any).toString()}`),
  
  // Get pending invitations for current user
  getPending: () => 
    apiCall<{ status: string; data: { invitations: any[] } }>('/invitations/pending'),
  
  // Send invitation
  send: (data: {
    roomId: string;
    inviteeId: string;
    role?: 'Editor' | 'Contributor' | 'Viewer';
    message?: string;
    expiresInDays?: number;
  }) => 
    apiCall<{ status: string; message: string; data: { invitation: any } }>('/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Accept invitation
  accept: (invitationId: string) => 
    apiCall<{ status: string; message: string; data: { invitation: any } }>(`/invitations/${invitationId}/accept`, {
      method: 'PUT',
    }),
  
  // Decline invitation
  decline: (invitationId: string) => 
    apiCall<{ status: string; message: string }>(`/invitations/${invitationId}/decline`, {
      method: 'PUT',
    }),
  
  // Cancel invitation (inviter only)
  cancel: (invitationId: string) => 
    apiCall<{ status: string; message: string }>(`/invitations/${invitationId}`, {
      method: 'DELETE',
    }),
};

// Export all APIs
export default {
  auth: authAPI,
  product: productAPI,
  category: categoryAPI,
  banner: bannerAPI,
  playMenu: playMenuAPI,
  user: userAPI,
  cart: cartAPI,
  order: orderAPI,
  review: reviewAPI,
  room: roomAPI,
  invitation: invitationAPI,
};
