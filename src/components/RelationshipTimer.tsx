'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Heart, RefreshCw, Zap, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const START_DATE = new Date('2026-03-17T00:00:00');

type TimerMode = 'classic' | 'beats' | 'breath' | 'kiss';

export const RelationshipTimer = () => {
  const [mode, setMode] = useState<TimerMode>('classic');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = now.getTime() - START_DATE.getTime();

      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, totalSeconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getAlternativeStats = () => {
    switch (mode) {
      case 'beats':
        return { value: (timeLeft.totalSeconds * 1.2).toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Ударов сердца' };
      case 'breath':
        return { value: (timeLeft.totalSeconds / 4).toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Общих вдохов' };
      case 'kiss':
        return { value: (timeLeft.totalSeconds * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Поцелуев (в теории)' };
      default:
        return null;
    }
  };

  const altStats = getAlternativeStats();

  return (
    <Card className="flex flex-col items-center justify-center gap-6 text-center h-full py-10 relative overflow-hidden group">
      <button 
        onClick={() => {
          const modes: TimerMode[] = ['classic', 'beats', 'breath', 'kiss'];
          const nextIndex = (modes.indexOf(mode) + 1) % modes.length;
          setMode(modes[nextIndex]);
        }}
        className="absolute top-4 right-4 p-2 rounded-xl bg-lumina-lavender/10 text-lumina-lavender hover:bg-lumina-lavender/20 transition-all opacity-0 group-hover:opacity-100 z-10"
      >
        <RefreshCw size={16} className={mode !== 'classic' ? 'animate-spin-slow' : ''} />
      </button>

      <motion.div
        animate={mode === 'beats' ? { scale: [1, 1.2, 1] } : { scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: mode === 'beats' ? 0.8 : 2 }}
        className="text-lumina-lavender"
      >
        {mode === 'classic' && <Heart fill="currentColor" size={56} />}
        {mode === 'beats' && <Zap fill="currentColor" size={56} className="text-pink-500" />}
        {mode === 'breath' && <Sun fill="currentColor" size={56} className="text-amber-400" />}
        {mode === 'kiss' && <Heart fill="currentColor" size={56} className="text-red-400" />}
      </motion.div>
      
      <div className="space-y-1">
        <h2 className="text-3xl font-serif font-bold text-foreground/80">Мы вместе уже</h2>
        <p className="text-[10px] text-foreground/30 uppercase tracking-widest font-bold">
          {mode === 'classic' ? 'Обычное время' : 'Оригинальный счет'}
        </p>
      </div>
      
      <div className="w-full px-4 h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {mode === 'classic' ? (
            <motion.div 
              key="classic"
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
                <div key={item.label} className="flex flex-col items-center group/item">
                  <div className="relative">
                    <span className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground/90 to-foreground/40 leading-none">
                      {item.value}
                    </span>
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-lumina-lavender/30 origin-left transition-transform"
                    />
                  </div>
                  <span className="text-[8px] uppercase font-black tracking-[0.2em] text-foreground/20 mt-2 group-hover/item:text-lumina-lavender/40 transition-colors">
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
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-lumina-lavender to-lumina-peach">
                {altStats?.value}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/40 mt-1">
                {altStats?.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
