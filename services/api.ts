// API service for easy backend integration
// This file contains all the API calls that will be used to fetch data from MongoDB

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

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

// User API calls (for future use)
export const userAPI = {
  // Get user profile
  getProfile: () => apiCall<any>('/user/profile'),
  
  // Update user profile
  updateProfile: (data: any) => apiCall<any>('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
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

// Export all APIs
export default {
  product: productAPI,
  category: categoryAPI,
  banner: bannerAPI,
  playMenu: playMenuAPI,
  user: userAPI,
  cart: cartAPI,
  order: orderAPI,
  review: reviewAPI,
};
