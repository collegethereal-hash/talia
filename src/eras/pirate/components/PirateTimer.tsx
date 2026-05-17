'use client';

import { useState, useEffect } from 'react';
import { Anchor, Compass, Ship, Waves, Skull, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const DEFAULT_START_DATE = new Date('2026-03-17T00:00:00');

type PirateTimerMode = 'voyage' | 'tides' | 'knots' | 'gold';

export const PirateTimer = () => {
  const [mode, setMode] = useState<PirateTimerMode>('voyage');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  });
  const [startDate, setStartDate] = useState<Date>(DEFAULT_START_DATE);

  useEffect(() => {
    const fetchStartDate = async () => {
      const { data } = await supabase
        .from('global_state')
        .select('value')
        .eq('key', 'start_date')
        .single();

      if (data) setStartDate(new Date(data.value as string));
    };
    fetchStartDate();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = now.getTime() - startDate.getTime();

      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, totalSeconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  const getPirateStats = () => {
    switch (mode) {
      case 'tides':
        const tideLevel = (timeLeft.totalSeconds % 43200) / 43200; // 12h cycle
        return { value: tideLevel > 0.5 ? 'Прилив Любви' : 'Отлив Нежности', label: 'Состояние моря' };
      case 'knots':
        return { value: (timeLeft.totalSeconds * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Узлов пройдено' };
      case 'gold':
        return { value: (timeLeft.totalSeconds * 0.01).toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Золотых дублонов накоплено' };
      default:
        return null;
    }
  };

  const stats = getPirateStats();

  const cycleMode = () => {
    const modes: PirateTimerMode[] = ['voyage', 'tides', 'knots', 'gold'];
    const nextIndex = (modes.indexOf(mode) + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  return (
    <div 
      onClick={cycleMode}
      className="relative p-8 rounded-[3rem] border-2 border-amber-500/20 bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden group cursor-pointer hover:border-amber-500/40 transition-all"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
      <div className="absolute -top-10 -left-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
        <Compass size={150} className="text-amber-500" />
      </div>

      <div className="absolute top-6 right-6 p-3 rounded-2xl bg-amber-500/5 text-amber-500/40 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-all z-10 border border-amber-500/20">
        <RefreshCw size={18} className={mode !== 'voyage' ? 'animate-spin-slow' : ''} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <motion.div
          animate={{ 
            rotate: mode === 'voyage' ? [0, 5, -5, 0] : 0,
            scale: mode === 'gold' ? [1, 1.1, 1] : 1
          }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-amber-500"
        >
          {mode === 'voyage' && <Ship size={56} />}
          {mode === 'tides' && <Waves size={56} />}
          {mode === 'knots' && <Anchor size={56} />}
          {mode === 'gold' && <Skull size={56} />}
        </motion.div>

        <div className="space-y-1">
          <h2 className="text-3xl font-bold uppercase tracking-tighter text-amber-100 italic">Наше Плаванье</h2>
          <p className="text-[10px] text-amber-500/40 uppercase font-black tracking-[0.3em]">
            {mode === 'voyage' ? 'Судовой журнал' : 'Морские расчеты'}
          </p>
        </div>

        <div className="w-full h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {mode === 'voyage' ? (
              <motion.div 
                key="voyage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-4 gap-4 w-full"
              >
                {[
                  { label: 'Дней', value: timeLeft.days },
                  { label: 'Часов', value: timeLeft.hours },
                  { label: 'Минут', value: timeLeft.minutes },
                  { label: 'Секунд', value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center">
                    <span className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500 leading-none">
                      {item.value}
                    </span>
                    <span className="text-[8px] uppercase font-black tracking-[0.2em] text-amber-500/30 mt-2">
                      {item.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="alt"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center"
              >
                <span className="text-4xl font-black text-amber-100 drop-shadow-lg">
                  {stats?.value}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-500/40 mt-2">
                  {stats?.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
