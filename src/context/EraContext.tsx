'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EraType } from '@/types/era';
import { supabase } from '@/lib/supabase';

interface EraContextType {
  currentEra: EraType;
  setEra: (era: EraType) => Promise<void>;
  isLoading: boolean;
}

const EraContext = createContext<EraContextType | undefined>(undefined);

export function EraProvider({ children }: { children: React.ReactNode }) {
  const [currentEra, setCurrentEra] = useState<EraType>('palia');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEra = async () => {
      try {
        const { data, error } = await supabase
          .from('global_state')
          .select('value')
          .eq('key', 'current_era')
          .single();

        if (data && data.value) {
          setCurrentEra(data.value as EraType);
        } else {
          // If not in DB, check localStorage
          const localEra = localStorage.getItem('lumina_era') as EraType;
          if (localEra) setCurrentEra(localEra);
        }
      } catch (e) {
        console.error('Error fetching era:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEra();
  }, []);

  const setEra = async (era: EraType) => {
    setCurrentEra(era);
    localStorage.setItem('lumina_era', era);
    
    // Update in Supabase
    const { error } = await supabase.from('global_state').upsert({
      key: 'current_era',
      value: era
    });

    if (error) {
      console.error('Error syncing era to Supabase:', error);
    }
  };

  useEffect(() => {
    // Apply era class to body for global CSS variables
    document.body.classList.remove('era-palia', 'era-pirate');
    document.body.classList.add(`era-${currentEra}`);
  }, [currentEra]);

  return (
    <EraContext.Provider value={{ currentEra, setEra, isLoading }}>
      {children}
    </EraContext.Provider>
  );
}

export function useEra() {
  const context = useContext(EraContext);
  if (context === undefined) {
    throw new Error('useEra must be used within an EraProvider');
  }
  return context;
}
