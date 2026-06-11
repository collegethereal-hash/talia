'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
import PaliaAbout from '@/eras/palia/about/page';

export default function AboutPage() {
  const { currentEra, isLoading } = useEra();

  if (isLoading) return null;

  return (
    <>
      {currentEra === 'palia' && <PaliaAbout />}
      {currentEra === 'pirate' && (
        <div className="min-h-screen flex items-center justify-center bg-blue-900 text-white p-8 text-center">
          <h1 className="text-3xl font-serif">Легенда о капитанах... 🦜</h1>
        </div>
      )}
    </>
  );
}
