// Custom hooks for play menu data fetching

import { useCallback, useEffect, useState } from 'react';
import { PlayMenuItem } from '../data/playMenuItems';

// Hook for fetching all play menu items
export const usePlayMenuItems = () => {
  const [items, setItems] = useState<PlayMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always use mock data per requirement
      const { mockPlayMenuItems } = await import('../data/playMenuItems');
      setItems(mockPlayMenuItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch play menu items');
      // Fallback to mock data on error
      try {
        const { mockPlayMenuItems } = await import('../data/playMenuItems');
        setItems(mockPlayMenuItems);
      } catch (mockError) {
        console.error('Failed to load mock play menu items:', mockError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayMenuItems();
  }, [fetchPlayMenuItems]);

  return { items, loading, error, refetch: fetchPlayMenuItems };
};

// Hook for fetching active play menu items only
export const useActivePlayMenuItems = () => {
  const [items, setItems] = useState<PlayMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePlayMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always use mock data per requirement
      const { getActivePlayMenuItems } = await import('../data/playMenuItems');
      const activeItems = getActivePlayMenuItems();
      setItems(activeItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active play menu items');
      // Fallback to mock data on error
      try {
        const { getActivePlayMenuItems } = await import('../data/playMenuItems');
        const activeItems = getActivePlayMenuItems();
        setItems(activeItems);
      } catch (mockError) {
        console.error('Failed to load mock active play menu items:', mockError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivePlayMenuItems();
  }, [fetchActivePlayMenuItems]);

  return { items, loading, error, refetch: fetchActivePlayMenuItems };
};
