// Custom hooks for banner data fetching

import { useCallback, useEffect, useState } from 'react';
import { Banner } from '../data/banners';

// Simple in-memory cache to avoid refetching banners repeatedly
let cachedAllBanners: Banner[] | null = null;
let cachedActiveBanners: Banner[] | null = null;

// Hook for fetching all banners
export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { getActiveBanners, mockBanners } = await import('../data/banners');
      const fallback = mockBanners?.length ? mockBanners : getActiveBanners();
      cachedAllBanners = fallback;
      setBanners(fallback);
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
  const [banners, setBanners] = useState<Banner[]>(cachedActiveBanners || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Serve from cache if present
      if (cachedActiveBanners) {
        setBanners(cachedActiveBanners);
        setLoading(false);
        return;
      }
      const { getActiveBanners } = await import('../data/banners');
      const fallback = getActiveBanners();
      cachedActiveBanners = fallback;
      setBanners(fallback);
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
