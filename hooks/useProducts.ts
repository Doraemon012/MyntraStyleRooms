// Custom hooks for easy data fetching and state management
// These hooks will make it easy to integrate with the backend API

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '../data/products';
import { transformAPIProduct } from '../types/api';

// Re-export Product type for convenience
export { Product };

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
  const stableFilters = useMemo(() => filters ? { ...filters } : undefined, [
    filters?.category,
    filters?.subcategory,
    filters?.search,
    filters?.page,
    filters?.limit,
    filters?.sortBy,
    filters?.sortOrder,
  ]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use actual API call
      const { catalogAPI } = await import('../services/catalogApi');
      const data = await catalogAPI.getProducts(stableFilters);
      const transformedProducts = data.data.products.map(transformAPIProduct);
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      
      // Fallback to mock data if API fails
      try {
        const { mockProducts, getProductsByCategory, searchProducts } = await import('../data/products');
        
        let filteredProducts = mockProducts;
        
        if (stableFilters?.search) {
          filteredProducts = searchProducts(stableFilters.search);
        } else if (stableFilters?.category) {
          filteredProducts = getProductsByCategory(stableFilters.category);
        }
        
        setProducts(filteredProducts);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [stableFilters]);

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
      
      // Use actual API call
      const { catalogAPI } = await import('../services/catalogApi');
      const data = await catalogAPI.getProductById(id);
      const transformedProduct = transformAPIProduct(data.data.product);
      setProduct(transformedProduct);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      
      // Fallback to mock data if API fails
      try {
        const { getProductById } = await import('../data/products');
        const productData = getProductById(id);
        
        if (!productData) {
          throw new Error('Product not found');
        }
        
        setProduct(productData);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
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
      
      // Use actual API call
      const { catalogAPI } = await import('../services/catalogApi');
      const data = await catalogAPI.getSimilarProducts(productId, limit);
      const transformedProducts = data.data.products.map(transformAPIProduct);
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching similar products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch similar products');
      
      // Fallback to mock data if API fails
      try {
        const { getSimilarProducts } = await import('../data/products');
        const similarProducts = getSimilarProducts(productId, limit);
        setProducts(similarProducts);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
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
      
      // Use actual API call
      const { catalogAPI } = await import('../services/catalogApi');
      const data = await catalogAPI.getRecommendedProducts(productId, limit);
      const transformedProducts = data.data.products.map(transformAPIProduct);
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching recommended products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommended products');
      
      // Fallback to mock data if API fails
      try {
        const { getYouMayAlsoLike } = await import('../data/products');
        const recommendedProducts = getYouMayAlsoLike(productId, limit);
        setProducts(recommendedProducts);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
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
      
      // Use actual API call
      const { catalogAPI } = await import('../services/catalogApi');
      const data = await catalogAPI.getTrendingProducts(limit);
      const transformedProducts = data.data.products.map(transformAPIProduct);
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching trending products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending products');
      
      // Fallback to mock data if API fails
      try {
        const { getTrendingProducts } = await import('../data/products');
        const trendingProducts = getTrendingProducts(limit);
        setProducts(trendingProducts);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
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
  const lastQueryRef = useRef<string>('');

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    // Avoid duplicate search if query hasn't changed
    if (lastQueryRef.current === searchQuery) {
      return;
    }
    lastQueryRef.current = searchQuery;

    try {
      setLoading(true);
      setError(null);
      
      // Use actual API call
      const { catalogAPI } = await import('../services/catalogApi');
      const data = await catalogAPI.searchProducts(searchQuery);
      const transformedProducts = data.data.products.map(transformAPIProduct);
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error searching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to search products');
      
      // Fallback to mock data if API fails
      try {
        const { searchProducts: mockSearch } = await import('../data/products');
        const searchResults = mockSearch(searchQuery);
        setProducts(searchResults);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setProducts([]);
      lastQueryRef.current = '';
      return;
    }

    const timeoutId = setTimeout(() => {
      searchProducts(trimmed);
    }, 400); // Slightly stronger debounce

    return () => clearTimeout(timeoutId);
  }, [query, searchProducts]);

  return { products, loading, error, search: searchProducts };
};
