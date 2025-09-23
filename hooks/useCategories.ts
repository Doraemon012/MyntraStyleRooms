// Custom hooks for category data fetching

import { useCallback, useEffect, useState } from 'react';
import { Category } from '../data/categories';

// Hook for fetching all categories
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await categoryAPI.getAll();
      // setCategories(data.categories);
      
      // Mock data implementation
      const { mockCategories } = await import('../data/categories');
      setCategories(mockCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};

// Hook for fetching active categories only
export const useActiveCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await categoryAPI.getActive();
      // setCategories(data.categories);
      
      // Mock data implementation
      const { getActiveCategories } = await import('../data/categories');
      const activeCategories = getActiveCategories();
      setCategories(activeCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveCategories();
  }, [fetchActiveCategories]);

  return { categories, loading, error, refetch: fetchActiveCategories };
};
