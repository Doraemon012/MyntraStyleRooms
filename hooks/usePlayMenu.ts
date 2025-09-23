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
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await playMenuAPI.getAll();
      // setItems(data.items);
      
      // Mock data implementation
      const { mockPlayMenuItems } = await import('../data/playMenuItems');
      setItems(mockPlayMenuItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch play menu items');
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
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await playMenuAPI.getActive();
      // setItems(data.items);
      
      // Mock data implementation
      const { getActivePlayMenuItems } = await import('../data/playMenuItems');
      const activeItems = getActivePlayMenuItems();
      setItems(activeItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active play menu items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivePlayMenuItems();
  }, [fetchActivePlayMenuItems]);

  return { items, loading, error, refetch: fetchActivePlayMenuItems };
};
