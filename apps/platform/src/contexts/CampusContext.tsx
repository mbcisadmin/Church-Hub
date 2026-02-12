'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Congregation = {
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

export function CampusProvider({ children }: { children: ReactNode }) {
  const [selectedCampus, setSelectedCampus] = useState<Congregation | null>(null);
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load congregations on mount
  useEffect(() => {
    async function loadCongregations() {
      try {
        const response = await fetch('/api/counter/congregations');
        if (!response.ok) throw new Error('Failed to fetch congregations');
        const data = await response.json();

        const congregationsList = data.congregations || data;
        setCongregations(congregationsList);

        // Auto-select first congregation if available
        if (congregationsList.length > 0 && !selectedCampus) {
          // Try to use user's Web Congregation preference
          if (data.userWebCongregation) {
            const userCampus = congregationsList.find(
              (c: Congregation) => c.Congregation_ID === data.userWebCongregation
            );
            setSelectedCampus(userCampus || congregationsList[0]);
          } else {
            setSelectedCampus(congregationsList[0]);
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
