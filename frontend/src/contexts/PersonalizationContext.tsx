import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { userAttributesService } from '../services/userAttributes';

export interface UserAttributesData {
  count_product_views?: number;
  count_add_to_cart?: number;
  sum_transaction_value_ltv?: number;
  loyalty_segment?: 'Gold' | 'Silver' | 'Bronze' | null;
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
  customerTier: 'Bronze' | 'Silver' | 'Gold' | 'new';
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

  // Use loyalty_segment from attributes or fall back to LTV calculation
  const getCustomerTier = (): 'Bronze' | 'Silver' | 'Gold' | 'new' => {
    // Prefer the loyalty_segment attribute if available
    if (attributes?.loyalty_segment) {
      return attributes.loyalty_segment;
    }
    
    // Fallback to LTV-based calculation
    const ltv = attributes?.sum_transaction_value_ltv;
    if (!ltv || ltv === 0) return 'new';
    if (ltv >= 2000) return 'Gold';
    if (ltv >= 500) return 'Silver';
    return 'Bronze';
  };

  const customerTier = getCustomerTier();
  const isHighValueCustomer = customerTier !== 'new'; // Show membership offers for all loyalty program members
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
