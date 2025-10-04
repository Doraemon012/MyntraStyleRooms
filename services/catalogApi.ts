// Catalog API service for fetching all catalog data from backend
import { getApiBaseUrl } from '../utils/networkUtils';

const API_BASE_URL = getApiBaseUrl();

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

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('❌ API call error:', error);
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

// Product API calls
export const catalogAPI = {
  // Get all products with optional filters
  getProducts: (params?: {
    search?: string;
    category?: string;
    subcategory?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    maxRating?: number;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.subcategory) queryParams.append('subcategory', params.subcategory);
    if (params?.brand) queryParams.append('brand', params.brand);
    if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.minRating !== undefined) queryParams.append('minRating', params.minRating.toString());
    if (params?.maxRating !== undefined) queryParams.append('maxRating', params.maxRating.toString());
    if (params?.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiCall<any>(`/products?${queryParams.toString()}`);
  },

  // Get product by ID
  getProductById: (id: string) => apiCall<any>(`/products/${id}`),

  // Get similar products
  getSimilarProducts: (id: string, limit: number = 4) => 
    apiCall<any>(`/products/${id}/similar?limit=${limit}`),
  
  // Get recommended products
  getRecommendedProducts: (id: string, limit: number = 4) => 
    apiCall<any>(`/products/${id}/recommended?limit=${limit}`),

  // Search products
  searchProducts: (query: string, filters?: any) => 
    apiCall<any>(`/products/search?q=${encodeURIComponent(query)}&${new URLSearchParams(filters).toString()}`),
  
  // Get trending products
  getTrendingProducts: (limit: number = 8) => 
    apiCall<any>(`/products/trending?limit=${limit}`),
  
  // Get new products
  getNewProducts: (limit: number = 8) => 
    apiCall<any>(`/products/new?limit=${limit}`),
  
  // Get products by category
  getProductsByCategory: (category: string, limit?: number) => 
    apiCall<any>(`/products/category/${category}${limit ? `?limit=${limit}` : ''}`),

  // Get AI recommended products
  getAIRecommendedProducts: (limit: number = 8) => 
    apiCall<any>(`/products/ai-recommended?limit=${limit}`),

  // Get product categories
  getCategories: () => apiCall<any>('/products/categories'),
  
  // Get popular brands
  getBrands: (limit: number = 20) => 
    apiCall<any>(`/products/brands?limit=${limit}`),

  // Add product to wishlist
  addToWishlist: (productId: string) => 
    apiCall<any>(`/products/${productId}/wishlist`, {
      method: 'POST',
    }),

  // Record product purchase
  recordPurchase: (productId: string) => 
    apiCall<any>(`/products/${productId}/purchase`, {
      method: 'POST',
    }),

  // Add product review
  addReview: (productId: string, reviewData: {
    rating: number;
    comment?: string;
    images?: string[];
  }) => 
    apiCall<any>(`/products/${productId}/reviews`, {
    method: 'POST',
      body: JSON.stringify(reviewData),
    }),
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

// Wardrobe API calls (room-linked)
export const wardrobeAPI = {
  // Get all wardrobes for current user (optionally filtered by room)
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    occasionType?: string;
    roomId?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.occasionType) queryParams.append('occasionType', params.occasionType);
    if (params?.roomId) queryParams.append('roomId', params.roomId);
    
    return apiCall<any>(`/wardrobes?${queryParams.toString()}`);
  },
  
  // Get single wardrobe by ID
  getById: (wardrobeId: string) => apiCall<any>(`/wardrobes/${wardrobeId}`),
  
  // Create a new wardrobe
  create: (wardrobeData: {
    name: string;
    emoji: string;
    description?: string;
    occasionType?: string;
    budgetRange?: { min: number; max: number };
    isPrivate?: boolean;
    roomId: string;
    members?: Array<{
      userId: string;
      role?: 'Editor' | 'Contributor' | 'Viewer';
    }>;
  }) => apiCall<any>('/wardrobes', {
    method: 'POST',
    body: JSON.stringify(wardrobeData),
  }),
  
  // Update wardrobe
  update: (wardrobeId: string, wardrobeData: {
    name?: string;
    emoji?: string;
    description?: string;
    occasionType?: string;
    budgetRange?: { min: number; max: number };
    isPrivate?: boolean;
    settings?: any;
    roomId?: string;
  }) => apiCall<any>(`/wardrobes/${wardrobeId}`, {
    method: 'PUT',
    body: JSON.stringify(wardrobeData),
  }),
  
  // Delete wardrobe
  delete: (wardrobeId: string) => apiCall<any>(`/wardrobes/${wardrobeId}`, {
    method: 'DELETE',
  }),
  
  // Get wardrobe items
  getItems: (wardrobeId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    isPurchased?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isPurchased !== undefined) queryParams.append('isPurchased', params.isPurchased.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    return apiCall<any>(`/wardrobes/${wardrobeId}/items?${queryParams.toString()}`);
  },
  
  // Add item to wardrobe
  addItem: (wardrobeId: string, itemData: {
    productId: string;
    notes?: string;
    customTags?: string[];
    priority?: 'low' | 'medium' | 'high';
  }) => apiCall<any>(`/wardrobes/${wardrobeId}/items`, {
    method: 'POST',
    body: JSON.stringify(itemData),
  }),
  
  // Remove item from wardrobe
  removeItem: (wardrobeId: string, itemId: string) => 
    apiCall<any>(`/wardrobes/${wardrobeId}/items/${itemId}`, {
      method: 'DELETE',
    }),
  
  // Add reaction to wardrobe item
  addReaction: (wardrobeId: string, itemId: string, reactionType: 'like' | 'love' | 'dislike') => 
    apiCall<any>(`/wardrobes/${wardrobeId}/items/${itemId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type: reactionType }),
    }),
  
  // Mark item as purchased
  markAsPurchased: (wardrobeId: string, itemId: string) => 
    apiCall<any>(`/wardrobes/${wardrobeId}/items/${itemId}/purchase`, {
      method: 'POST',
    }),
  
  // Add member to wardrobe
  addMember: (wardrobeId: string, memberData: {
    userId: string;
    role?: 'Editor' | 'Contributor' | 'Viewer';
  }) => apiCall<any>(`/wardrobes/${wardrobeId}/members`, {
    method: 'POST',
    body: JSON.stringify(memberData),
  }),
  
  // Get wardrobe statistics
  getStats: () => apiCall<any>('/wardrobes/stats'),
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
  
  // Get wardrobes for a room
  getWardrobes: (roomId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    occasionType?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.occasionType) queryParams.append('occasionType', params.occasionType);
    
    return apiCall<any>(`/wardrobes?roomId=${roomId}&${queryParams.toString()}`);
  },
};

// Export all APIs
export default {
  catalog: catalogAPI,
  category: categoryAPI,
  banner: bannerAPI,
  wardrobe: wardrobeAPI,
  room: roomAPI,
};