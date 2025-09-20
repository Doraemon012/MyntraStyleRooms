// Custom hooks for banner data fetching

import { useCallback, useEffect, useState } from 'react';
import { Banner } from '../data/banners';

// Hook for fetching all banners
export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await bannerAPI.getAll();
      // setBanners(data.banners);
      
      // Mock data implementation
      const { mockBanners } = await import('../data/banners');
      setBanners(mockBanners);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return { banners, loading, error, refetch: fetchBanners };
};

// Hook for fetching active banners only
export const useActiveBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const data = await bannerAPI.getActive();
      // setBanners(data.banners);
      
      // Mock data implementation
      const { getActiveBanners } = await import('../data/banners');
      const activeBanners = getActiveBanners();
      setBanners(activeBanners);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active banners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveBanners();
  }, [fetchActiveBanners]);

  return { banners, loading, error, refetch: fetchActiveBanners };
};
