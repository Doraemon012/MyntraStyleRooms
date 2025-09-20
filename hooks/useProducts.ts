// Custom hooks for easy data fetching and state management
// These hooks will make it easy to integrate with the backend API

import { useCallback, useEffect, useState } from 'react';
import { Product } from '../data/products';

// Hook for fetching all products
export const useProducts = (filters?: {
  category?: string;
  subcategory?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await productAPI.getAll(filters);
      // setProducts(data.products);
      
      // Mock data implementation
      const { mockProducts, getProductsByCategory, searchProducts } = await import('../data/products');
      
      let filteredProducts = mockProducts;
      
      if (filters?.search) {
        filteredProducts = searchProducts(filters.search);
      } else if (filters?.category) {
        filteredProducts = getProductsByCategory(filters.category);
      }
      
      setProducts(filteredProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

// Hook for fetching a single product
export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await productAPI.getById(id);
      // setProduct(data);
      
      // Mock data implementation
      const { getProductById } = await import('../data/products');
      const productData = getProductById(id);
      
      if (!productData) {
        throw new Error('Product not found');
      }
      
      setProduct(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
};

// Hook for fetching similar products
export const useSimilarProducts = (productId: string, limit: number = 4) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await productAPI.getSimilar(productId, limit);
      // setProducts(data.products);
      
      // Mock data implementation
      const { getSimilarProducts } = await import('../data/products');
      const similarProducts = getSimilarProducts(productId, limit);
      setProducts(similarProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch similar products');
    } finally {
      setLoading(false);
    }
  }, [productId, limit]);

  useEffect(() => {
    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId, fetchSimilarProducts]);

  return { products, loading, error, refetch: fetchSimilarProducts };
};

// Hook for fetching recommended products
export const useRecommendedProducts = (productId: string, limit: number = 4) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await productAPI.getRecommended(productId, limit);
      // setProducts(data.products);
      
      // Mock data implementation
      const { getYouMayAlsoLike } = await import('../data/products');
      const recommendedProducts = getYouMayAlsoLike(productId, limit);
      setProducts(recommendedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommended products');
    } finally {
      setLoading(false);
    }
  }, [productId, limit]);

  useEffect(() => {
    if (productId) {
      fetchRecommendedProducts();
    }
  }, [productId, fetchRecommendedProducts]);

  return { products, loading, error, refetch: fetchRecommendedProducts };
};

// Hook for fetching trending products
export const useTrendingProducts = (limit: number = 8) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await productAPI.getTrending(limit);
      // setProducts(data.products);
      
      // Mock data implementation
      const { getTrendingProducts } = await import('../data/products');
      const trendingProducts = getTrendingProducts(limit);
      setProducts(trendingProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending products');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTrendingProducts();
  }, [fetchTrendingProducts]);

  return { products, loading, error, refetch: fetchTrendingProducts };
};

// Hook for searching products
export const useProductSearch = (query: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await productAPI.search(searchQuery);
      // setProducts(data.products);
      
      // Mock data implementation
      const { searchProducts: mockSearch } = await import('../data/products');
      const searchResults = mockSearch(searchQuery);
      setProducts(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(query);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [query, searchProducts]);

  return { products, loading, error, search: searchProducts };
};
