'use client';

import { useState } from 'react';
import { useEra } from '@/context/EraContext';
import { motion } from 'framer-motion';
import { Settings, RefreshCw, Ship, Trees, ShieldAlert, Sparkles, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const { currentEra, setEra } = useEra();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEraSwitch = async (era: 'palia' | 'pirate') => {
    setIsUpdating(true);
    await setEra(era);
    setTimeout(() => setIsUpdating(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 pb-40 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex items-center justify-between border-b border-slate-800 pb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Settings size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Управление Lumina</h1>
              <p className="text-slate-500 text-sm">Центр управления реальностью</p>
            </div>
          </div>
          {isUpdating && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-indigo-400"
            >
              <RefreshCw size={24} />
            </motion.div>
          )}
        </header>

        <section className="space-y-8">
          <div className="flex items-center gap-3 text-xl font-bold">
            <Sparkles className="text-amber-400" />
            <h2>Выбор Эпохи (Theme Switcher)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Palia Option */}
            <EraOption 
              id="palia"
              name="Palia Era"
              desc="Уют, котеджкор, цветы и пастельные тона."
              icon={<Trees size={40} />}
              isActive={currentEra === 'palia'}
              onClick={() => handleEraSwitch('palia')}
              color="border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
              activeColor="border-emerald-500 bg-emerald-500/20"
            />

            {/* Pirate Option */}
            <EraOption 
              id="pirate"
              name="Pirate Era"
              desc="Ром, сокровища, бушующее море и золото."
              icon={<Ship size={40} />}
              isActive={currentEra === 'pirate'}
              onClick={() => handleEraSwitch('pirate')}
              color="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
              activeColor="border-amber-500 bg-amber-500/20"
            />
          </div>
        </section>

        <section className="p-8 rounded-[2.5rem] bg-red-500/5 border-4 border-dashed border-red-500/20 space-y-6">
          <div className="flex items-center gap-3 text-red-400">
            <ShieldAlert size={24} />
            <h3 className="text-xl font-bold uppercase tracking-widest">Зона особого внимания</h3>
          </div>
          <p className="text-slate-400 text-sm italic">
            "Переключение эпохи меняет интерфейс и логику для всех пользователей в реальном времени. Используй с осторожностью, капитан!"
          </p>
          <div className="flex gap-4">
             <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
               Сбросить все данные
             </button>
             <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
               Выгрузить бэкап
             </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function EraOption({ id, name, desc, icon, isActive, onClick, color, activeColor }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative p-8 rounded-[3rem] border-4 cursor-pointer transition-all flex flex-col items-center text-center space-y-6 overflow-hidden group",
        isActive ? activeColor : color
      )}
    >
      {isActive && (
        <div className="absolute top-4 right-4">
          <div className="bg-white text-slate-950 p-1 rounded-full">
            <Save size={16} />
          </div>
        </div>
      )}
      
      <div className={cn(
        "w-24 h-24 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 shadow-2xl",
        isActive ? "bg-white text-slate-950" : "bg-slate-800 text-slate-400"
      )}>
        {icon}
      </div>

      <div className="space-y-2">
        <h4 className="text-2xl font-black uppercase tracking-tight">{name}</h4>
        <p className="text-slate-500 text-sm italic px-4">"{desc}"</p>
      </div>

      <div className={cn(
        "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest",
        isActive ? "bg-white text-slate-950" : "bg-slate-700 text-slate-400"
      )}>
        {isActive ? 'Текущая реальность' : 'Активировать'}
      </div>
    </motion.div>
  );
}
