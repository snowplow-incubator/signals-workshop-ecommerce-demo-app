import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { narrativesService, NarrativeData } from '../services/narratives';

export interface PersonalizationContextType {
  narrative: NarrativeData | null;
  narrativeLoading: boolean;
  narrativeError: string | null;
  refreshNarrative: () => Promise<void>;
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
  const [narrative, setNarrative] = useState<NarrativeData | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState<boolean>(false);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);

  const refreshNarrative = async (showLoading = true) => {
    if (showLoading) {
      setNarrativeLoading(true);
    }
    setNarrativeError(null);

    try {
      const data = await narrativesService.getNarrative();
      setNarrative(data);
    } catch (err) {
      console.error('Failed to refresh narrative:', err);
      setNarrativeError(err instanceof Error ? err.message : 'Failed to load narrative');
    } finally {
      setNarrativeLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    refreshNarrative();
  }, []);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNarrative(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const value: PersonalizationContextType = {
    narrative,
    narrativeLoading,
    narrativeError,
    refreshNarrative,
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
}
