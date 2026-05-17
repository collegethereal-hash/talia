'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Cloud, Sun, MapPin, Clock, Plane, Navigation, Globe, Zap, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CityData {
  name: string;
  timezone: string;
  lat: number;
  lon: number;
  emoji: string;
}

const CITIES: CityData[] = [
  { name: 'Ашхабад', timezone: 'Asia/Ashgabat', lat: 37.9333, lon: 58.3833, emoji: '🕌' },
  { name: 'Москва', timezone: 'Europe/Moscow', lat: 55.7558, lon: 37.6173, emoji: '🏰' },
];

export const WeatherWidget = () => {
  const [times, setTimes] = useState<string[]>(['', '']);
  const [distance, setDistance] = useState<number>(0);
  const [mode, setMode] = useState<'time' | 'distance'>('time');

  useEffect(() => {
    const updateTimes = () => {
      const newTimes = CITIES.map(city => 
        new Intl.DateTimeFormat('ru-RU', {
          timeStyle: 'short',
          timeZone: city.timezone
        }).format(new Date())
      );
      setTimes(newTimes);
    };

    updateTimes();
    const timer = setInterval(updateTimes, 60000);

    // Calculate distance
    const R = 6371; // km
    const dLat = (CITIES[1].lat - CITIES[0].lat) * (Math.PI / 180);
    const dLon = (CITIES[1].lon - CITIES[0].lon) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(CITIES[0].lat * (Math.PI / 180)) * Math.cos(CITIES[1].lat * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    setDistance(Math.round(R * c));

    return () => clearInterval(timer);
  }, []);

  const toggleMode = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    const modes: ('time' | 'distance')[] = ['time', 'distance'];
    const nextIndex = (modes.indexOf(mode) + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  return (
    <div 
      onClick={toggleMode}
      className="relative overflow-hidden cursor-pointer bg-[#fdfaf3] border-4 border-[#e6d5bc] shadow-2xl rounded-[2rem] p-8 group transition-all active:scale-95 h-full min-h-[220px] flex flex-col justify-center items-center z-50"
    >
      <AnimatePresence mode="wait">
        {mode === 'time' && (
          <motion.div 
            key="time"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 gap-8 w-full h-full items-center"
          >
            {CITIES.map((city, idx) => (
              <div key={city.name} className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{city.emoji}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#8b7355] font-black">{city.name}</span>
                </div>
                <div className="bg-[#f5e6d3] px-4 py-2 rounded-2xl border-2 border-[#e6d5bc] shadow-inner">
                  <span className="text-4xl font-serif font-bold text-[#5c4a33]">{times[idx]}</span>
                </div>
                <div className="flex items-center gap-1 text-[#8b7355]/60 font-bold text-[10px] uppercase">
                  <Sun size={12} className="text-amber-500" />
                  <span>+24°C</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {mode === 'distance' && (
          <motion.div 
            key="distance"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center gap-6 w-full h-full"
          >
            <div className="relative w-full px-12 py-4">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-dashed bg-[#e6d5bc] -translate-y-1/2" />
              <div className="flex justify-between relative z-10">
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-[#e6d5bc] shadow-lg text-xl"
                >
                  🕌
                </motion.div>
                <motion.div
                  animate={{ x: [0, 200, 0] }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  className="absolute left-16 top-1/2 -translate-y-1/2 text-[#5c4a33]"
                >
                  <Plane size={24} className="rotate-45" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-[#e6d5bc] shadow-lg text-xl"
                >
                  🏰
                </motion.div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b7355] font-black mb-1">Расстояние между нами</p>
              <h3 className="text-4xl font-serif font-bold text-[#5c4a33]">{distance} км</h3>
              <p className="text-xs italic text-[#8b7355] mt-2">"Любовь не знает границ"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      {/* Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
        <span className="text-[8px] font-black uppercase tracking-widest text-[#8b7355]">Нажми, чтобы изменить вид</span>
      </div>
    </div>
  );
};

