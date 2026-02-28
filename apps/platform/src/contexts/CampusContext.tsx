'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Congregation = {
  Congregation_ID: number;
  Congregation_Name: string;
};

type CampusContextType = {
  selectedCampus: Congregation | null;
  setSelectedCampus: (campus: Congregation | null) => void;
  congregations: Congregation[];
  isLoading: boolean;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

/**
 * Sort congregations: Congregation_ID === 1 first, then alphabetical
 */
function sortCongregations(congregations: Congregation[]): Congregation[] {
  return [...congregations].sort((a, b) => {
    if (a.Congregation_ID === 1) return -1;
    if (b.Congregation_ID === 1) return 1;
    return a.Congregation_Name.localeCompare(b.Congregation_Name);
  });
}

export function CampusProvider({ children }: { children: ReactNode }) {
  const [selectedCampus, setSelectedCampus] = useState<Congregation | null>(null);
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCongregations() {
      try {
        const response = await fetch('/api/counter/congregations');
        if (!response.ok) throw new Error('Failed to fetch congregations');
        const data = await response.json();

        const sorted = sortCongregations(data.congregations || data);
        setCongregations(sorted);

        // Auto-select based on household congregation, or first in list
        if (sorted.length > 0 && !selectedCampus) {
          if (data.userDefaultCongregation) {
            const match = sorted.find((c) => c.Congregation_ID === data.userDefaultCongregation);
            setSelectedCampus(match || sorted[0]);
          } else {
            setSelectedCampus(sorted[0]);
          }
        }
      } catch (error) {
        console.error('Error loading congregations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCongregations();
  }, []);

  return (
    <CampusContext.Provider value={{ selectedCampus, setSelectedCampus, congregations, isLoading }}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
}
