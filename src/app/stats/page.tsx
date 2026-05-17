'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
import PaliaStats from '@/eras/palia/stats/page';
import PirateStats from '@/eras/pirate/stats/page';

export default function StatsPage() {
  const { currentEra, isLoading } = useEra();

  if (isLoading) return null;

  return (
    <>
      {currentEra === 'palia' && <PaliaStats />}
      {currentEra === 'pirate' && <PirateStats />}
    </>
  );
}
