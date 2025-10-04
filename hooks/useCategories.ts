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
      
      // Use actual API call
      const { catalogAPI } = await import('../services/catalogApi');
      const data = await catalogAPI.getAll();
      setCategories(data.data.categories);
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
      
      // Use actual API call
      const { catalogAPI } = await import('../services/catalogApi');
      const data = await catalogAPI.getActive();
      setCategories(data.data.categories);
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
