import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { userAttributesService } from '../services/userAttributes';

export interface UserAttributesData {
  count_product_views?: number;
  count_add_to_cart?: number;
  total_cart_value?: number;
  main_interest?: string;
  engagement_score?: number;
  average_cart_value?: number;
  [key: string]: any;
}

export interface PersonalizationContextType {
  attributes: UserAttributesData | null;
  loading: boolean;
  error: string | null;
  refreshAttributes: () => Promise<void>;
  isHighValueCustomer: boolean;
  customerTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'new';
  recommendedCategory: string | null;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export function usePersonalization(): PersonalizationContextType {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}

interface PersonalizationProviderProps {
  children: ReactNode;
}

export function PersonalizationProvider({ children }: PersonalizationProviderProps) {
  const { currentUser } = useUser();
  const [attributes, setAttributes] = useState<UserAttributesData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate customer tier based on total cart value
  const getCustomerTier = (totalCartValue?: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'new' => {
    if (!totalCartValue || totalCartValue === 0) return 'new';
    if (totalCartValue >= 5000) return 'platinum';
    if (totalCartValue >= 2000) return 'gold';
    if (totalCartValue >= 500) return 'silver';
    return 'bronze';
  };

  const customerTier = getCustomerTier(attributes?.total_cart_value);
  const isHighValueCustomer = attributes?.total_cart_value ? attributes.total_cart_value >= 1000 : false;
  const recommendedCategory = attributes?.main_interest || null;

  const refreshAttributes = async (showLoading = true) => {
    if (!currentUser) return;

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await userAttributesService.getUserAttributes(currentUser.id);
      // The response is already the attributes data based on the updated worker
      setAttributes(response as UserAttributesData);
      console.log('Attributes refreshed for personalization:', response);
    } catch (err) {
      console.error('Failed to refresh attributes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user attributes');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh attributes when user changes
  useEffect(() => {
    if (currentUser) {
      refreshAttributes();
    } else {
      setAttributes(null);
    }
  }, [currentUser]);

  // Auto-refresh attributes every 30 seconds
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      refreshAttributes(false);
    }, 2000); // 2 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  const value: PersonalizationContextType = {
    attributes,
    loading,
    error,
    refreshAttributes,
    isHighValueCustomer,
    customerTier,
    recommendedCategory,
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
}
