import { apiCall } from './api';

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
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return apiCall<any>(endpoint);
  },

  // Get product by ID
  getProductById: (id: string) => apiCall<any>(`/products/${id}`),

  // Get trending products
  getTrendingProducts: (limit: number = 20) => 
    apiCall<any>(`/products/trending?limit=${limit}`),

  // Get products by category
  getProductsByCategory: (category: string, limit: number = 20) => 
    apiCall<any>(`/products/category/${category}?limit=${limit}`),

  // Get similar products
  getSimilarProducts: (productId: string, limit: number = 10) => 
    apiCall<any>(`/products/${productId}/similar?limit=${limit}`),

  // Search products
  searchProducts: (query: string, filters?: any) => 
    apiCall<any>(`/products?search=${encodeURIComponent(query)}`, {
      method: 'GET',
      ...filters
    }),

  // Get AI recommended products
  getAIRecommendedProducts: (limit: number = 20) => 
    apiCall<any>(`/products/ai-recommended?limit=${limit}`),

  // Get popular brands
  getPopularBrands: (limit: number = 20) => 
    apiCall<any>(`/products/brands?limit=${limit}`),

  // Get product categories
  getProductCategories: () => apiCall<any>('/products/categories'),

  // Add product to wishlist
  addToWishlist: (productId: string) => 
    apiCall<any>(`/products/${productId}/wishlist`, { method: 'POST' }),

  // Record product purchase
  recordPurchase: (productId: string) => 
    apiCall<any>(`/products/${productId}/purchase`, { method: 'POST' }),

  // Add product review
  addReview: (productId: string, review: {
    rating: number;
    comment?: string;
    images?: string[];
  }) => apiCall<any>(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(review)
  })
};

// Category API calls
export const categoryAPI = {
  // Get all categories
  getAllCategories: () => apiCall<any>('/categories'),

  // Get active categories
  getActiveCategories: () => apiCall<any>('/categories/active'),

  // Get category by ID
  getCategoryById: (id: string) => apiCall<any>(`/categories/${id}`)
};

// Banner API calls
export const bannerAPI = {
  // Get all banners
  getAllBanners: () => apiCall<any>('/banners'),

  // Get active banners
  getActiveBanners: () => apiCall<any>('/banners/active'),

  // Get banner by ID
  getBannerById: (id: string) => apiCall<any>(`/banners/${id}`)
};
