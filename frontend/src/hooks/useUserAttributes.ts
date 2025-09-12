import { useState, useEffect, useCallback } from 'react';
import { userAttributesService } from '../services/userAttributes';

export interface UseUserAttributesResult {
  attributes: Record<string, Array<any>> | null;
  loading: boolean;
  error: string | null;
  refetch: (userId?: string) => Promise<void>;
  clearError: () => void;
}

export function useUserAttributes(
  userId?: string,
): UseUserAttributesResult {
  const [attributes, setAttributes] = useState<Record<string, Array<any>> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttributes = useCallback(async (targetUserId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await userAttributesService.getUserAttributes(targetUserId);
      setAttributes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user attributes';
      setError(errorMessage);
      console.error('Error fetching user attributes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async (targetUserId?: string) => {
    await fetchAttributes(targetUserId || userId);
  }, [fetchAttributes, userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    fetchAttributes(userId);
  }, [fetchAttributes, userId]);

  return {
    attributes,
    loading,
    error,
    refetch,
    clearError,
  };
}
