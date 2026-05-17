'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
import { Navbar as PaliaNavbar } from '@/eras/palia/components/Navbar';
import { PirateNavbar } from '@/eras/pirate/components/PirateNavbar';

export function EraContent({ children }: { children: React.ReactNode }) {
  const { currentEra } = useEra();

  return (
    <>
      <main className="min-h-screen pb-24">
        {children}
      </main>
      
      {currentEra === 'palia' && <PaliaNavbar />}
      {currentEra === 'pirate' && <PirateNavbar />}
    </>
  );
}
