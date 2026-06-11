'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cat, Dog, Bird, Sparkles, X, Settings2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type PetType = 'cat' | 'dog' | 'owl' | 'dragon';

interface PetConfig {
  icon: any;
  color: string;
  name: string;
  bgColor: string;
}

const PETS: Record<PetType, PetConfig> = {
  cat: { icon: Cat, color: 'text-orange-500', name: 'Котик', bgColor: 'bg-orange-100' },
  dog: { icon: Dog, color: 'text-brown-500', name: 'Собачка', bgColor: 'bg-stone-200' },
  owl: { icon: Bird, color: 'text-indigo-500', name: 'Сова', bgColor: 'bg-indigo-100' },
  dragon: { icon: Sparkles, color: 'text-emerald-500', name: 'Дракончик', bgColor: 'bg-emerald-100' },
};

export const VirtualPet = () => {
  const [selectedPet, setSelectedPet] = useState<PetType>('cat');
  const [isOpen, setIsOpen] = useState(false);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [message, setMessage] = useState('');

  const messages = [
    "Мур-мяу! Скучаю по тебе!",
    "Гав! Ты сегодня отлично выглядишь!",
    "У-ху! Пора добавить новую заметку в журнал?",
    "Ррр! Твое сердце сияет ярче золота!",
    "Хочешь погладить меня?",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMessageVisible) {
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setMessage(randomMsg);
        setIsMessageVisible(true);
        setTimeout(() => setIsMessageVisible(false), 5000);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isMessageVisible]);

  const CurrentPetIcon = PETS[selectedPet].icon;

  return (
    <div className="fixed bottom-24 right-8 z-[100] flex flex-col items-end gap-4">
      {/* Pet Message Bubble */}
      <AnimatePresence>
        {isMessageVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10, x: 20 }}
            className="glass px-4 py-2 rounded-2xl text-sm font-medium text-foreground/80 shadow-lg border-white/40 max-w-[200px] mb-2 mr-2"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet Selection Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass p-4 rounded-3xl shadow-2xl border-white/20 grid grid-cols-2 gap-3 mb-2"
          >
            {(Object.keys(PETS) as PetType[]).map((type) => {
              const pet = PETS[type];
              const Icon = pet.icon;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedPet(type);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all",
                    selectedPet === type ? "bg-white/60 shadow-inner" : "hover:bg-white/40"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", pet.bgColor)}>
                    <Icon className={pet.color} size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{pet.name}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pet Button */}
      <div className="relative group">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-20 h-20 rounded-3xl glass flex items-center justify-center shadow-xl border-white/40 transition-all overflow-hidden",
            PETS[selectedPet].bgColor
          )}
        >
          <CurrentPetIcon className={cn("transition-all", PETS[selectedPet].color)} size={40} />
          
          {/* Settings icon appearing on hover */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Settings2 size={12} className="text-foreground/30" />
          </div>
        </motion.button>
        
        {/* Decorative hearts on click */}
        <motion.div 
          className="absolute -top-4 -left-4 pointer-events-none"
          initial={false}
          animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.5 }}
          key={selectedPet}
        >
          <Heart fill="#ff8080" className="text-red-400" size={16} />
        </motion.div>
      </div>
    </div>
  );
};
