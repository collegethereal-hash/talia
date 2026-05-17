'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function LairPage() {
  const [battleLog, setBattleLog] = useState<string[]>([
    "Вы вошли в Логово. Команда готова к бою.",
    "На горизонте замечен Британский Торговый Флот!"
  ]);
  
  const [playerShip, setPlayerShip] = useState({
    health: 100,
    crew: 80,
    training: 70, // %
    cannons: 40,
    ammo: 100
  });

  const [enemyShip, setEnemyShip] = useState({
    name: "Золотая Лань",
    type: "Галеон",
    health: 120,
    crew: 100,
    cannons: 50,
    parts: {
      hull: 100,
      sails: 100,
      deck: 100
    }
  });

  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isFighting, setIsFighting] = useState(false);

  const addLog = (msg: string) => {
    setBattleLog(prev => [...prev, msg]);
  };

  const handleAttack = (type: string) => {
    setIsFighting(true);
    setTimeout(() => {
      let msg = "";
      let dmg = 0;
      
      const trainingFactor = playerShip.training / 100;
      const crewFactor = playerShip.crew / 100;

      switch (type) {
        case 'cannons':
          dmg = Math.floor((playerShip.cannons * 0.8) + (20 * trainingFactor));
          msg = `🔥 Залп из всех пушек! Нанесено ${dmg} урона по корпусу врага.`;
          setEnemyShip(prev => ({...prev, health: Math.max(0, prev.health - dmg), parts: {...prev.parts, hull: Math.max(0, prev.parts.hull - dmg)}}));
          break;
        case 'sabotage':
          dmg = 15;
          msg = `💣 Диверсионная группа пробралась на борт! Вражеские паруса повреждены на ${dmg}%.`;
          setEnemyShip(prev => ({...prev, parts: {...prev.parts, sails: Math.max(0, prev.parts.sails - dmg)}}));
          break;
        case 'boarding':
          const playerLosses = Math.floor(Math.random() * 10);
          const enemyLosses = Math.floor(15 * crewFactor * trainingFactor);
          msg = `⚔️ АБОРДАЖ! Наша команда бросилась на палубу. Мы потеряли ${playerLosses} матросов, враг потерял ${enemyLosses}.`;
          setPlayerShip(prev => ({...prev, crew: Math.max(0, prev.crew - playerLosses)}));
          setEnemyShip(prev => ({...prev, crew: Math.max(0, prev.crew - enemyLosses), parts: {...prev.parts, deck: Math.max(0, prev.parts.deck - 20)}}));
          break;
      }
      
      addLog(msg);
      setIsFighting(false);
      
      // Enemy counter attack
      if (enemyShip.health > 0) {
        setTimeout(() => {
          const enemyDmg = Math.floor(Math.random() * 15);
          setPlayerShip(prev => ({...prev, health: Math.max(0, prev.health - enemyDmg)}));
          addLog(`💢 Враг отвечает огнем! Получено ${enemyDmg} урона.`);
        }, 1000);
      }
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-amber-100 font-serif overflow-x-hidden p-6 md:p-12">
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
         
         {/* Header */}
         <div className="flex justify-between items-center border-b border-amber-500/10 pb-6">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/60">Военная Комната</p>
               <h1 className="text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600">Логово Капитана</h1>
            </div>
            <div className="flex gap-4">
               <div className="p-3 bg-black/40 rounded-xl border border-amber-900/20 text-xs">
                  <span className="text-slate-500">Золото:</span> <span className="text-amber-400 font-bold">10,000</span>
               </div>
               <div className="p-3 bg-black/40 rounded-xl border border-amber-900/20 text-xs">
                  <span className="text-slate-500">Экипаж:</span> <span className="text-sky-400 font-bold">{playerShip.crew}</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Battle Map / Visuals */}
            <div className="lg:col-span-8 space-y-6">
               
               {/* Enemy Ship Card */}
               <div className="bg-gradient-to-br from-[#1c0d02] to-[#0a0501] p-6 rounded-3xl border-2 border-red-900/30 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Skull size={100} className="text-red-500" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                     <div>
                        <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md">Враг</span>
                        <h2 className="text-3xl font-black text-amber-100 uppercase mt-1">{enemyShip.name}</h2>
                        <p className="text-xs text-slate-400">{enemyShip.type} Королевского Флота</p>
                     </div>
                     <div className="flex-1 max-w-xs space-y-2">
                        {/* Health */}
                        <div>
                           <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">Прочность Корпуса</span>
                              <span className="text-amber-400">{enemyShip.health} / 120</span>
                           </div>
                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500" style={{ width: `${(enemyShip.health/120)*100}%` }} />
                           </div>
                        </div>
                        {/* Parts */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                           <div className="text-center">
                              <p className="text-[8px] uppercase text-slate-500">Паруса</p>
                              <p className="text-xs font-bold text-amber-100">{enemyShip.parts.sails}%</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[8px] uppercase text-slate-500">Палуба</p>
                              <p className="text-xs font-bold text-amber-100">{enemyShip.parts.deck}%</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[8px] uppercase text-slate-500">Экипаж</p>
                              <p className="text-xs font-bold text-amber-100">{enemyShip.crew}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Battle Arena (Abstract) */}
               <div className="h-[300px] bg-[#020a17] rounded-3xl border border-sky-500/10 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
                  
                  {/* Player Ship Icon */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute left-1/4 flex flex-col items-center"
                  >
                     <div className="w-16 h-16 bg-amber-500/20 rounded-2xl border-2 border-amber-500 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        <Anchor size={32} />
                     </div>
                     <p className="text-xs font-bold mt-2 text-amber-100">Ваш Корабль</p>
                  </motion.div>

                  {/* VS */}
                  <div className="text-4xl font-black text-red-500/50 italic">VS</div>

                  {/* Enemy Ship Icon */}
                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
                    className="absolute right-1/4 flex flex-col items-center"
                  >
                     <div className="w-16 h-16 bg-red-500/20 rounded-2xl border-2 border-red-500 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                        <Skull size={32} />
                     </div>
                     <p className="text-xs font-bold mt-2 text-amber-100">{enemyShip.name}</p>
                  </motion.div>

                  {/* Effects (Fighting) */}
                  {isFighting && (
                    <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
                  )}
               </div>

               {/* Strategies / Actions */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ActionButton 
                    title="Залп Пушек" 
                    desc="Массированный огонь по корпусу" 
                    icon={<Bomb size={20} />} 
                    color="text-orange-500"
                    onClick={() => handleAttack('cannons')}
                    disabled={isFighting}
                  />
                  <ActionButton 
                    title="Диверсия" 
                    desc="Порвать паруса и сломать руль" 
                    icon={<Crosshair size={20} />} 
                    color="text-sky-500"
                    onClick={() => handleAttack('sabotage')}
                    disabled={isFighting}
                  />
                  <ActionButton 
                    title="Абордаж" 
                    desc="Рукопашный бой на палубе" 
                    icon={<Sword size={20} />} 
                    color="text-red-500"
                    onClick={() => handleAttack('boarding')}
                    disabled={isFighting}
                  />
               </div>

            </div>

            {/* Right: Battle Log & Stats */}
            <div className="lg:col-span-4 space-y-6">
               
               {/* Player Stats */}
               <div className="bg-black/40 p-6 rounded-3xl border border-amber-900/20 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Ваше Состояние</h4>
                  <div className="space-y-3">
                     <div>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-slate-400">Прочность</span>
                           <span className="text-amber-400">{playerShip.health}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-500" style={{ width: `${playerShip.health}%` }} />
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-slate-400">Подготовка команды</span>
                           <span className="text-emerald-400">{playerShip.training}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: `${playerShip.training}%` }} />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Battle Log */}
               <div className="bg-black/40 p-6 rounded-3xl border border-amber-900/20 h-[380px] flex flex-col">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-4">Журнал Боя</h4>
                  <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-300 font-mono">
                     {battleLog.map((log, i) => (
                        <div key={i} className="border-b border-slate-800/50 pb-2">
                           <span className="text-amber-500/50">[{i+1}]</span> {log}
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </div>

      </div>
    </div>
  );
}

function ActionButton({ title, desc, icon, color, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-4 bg-black/60 rounded-2xl border border-amber-900/20 text-left hover:border-amber-500 transition-colors group relative overflow-hidden",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
    >
       <div className={cn("p-3 bg-white/5 rounded-xl inline-block mb-3 group-hover:scale-110 transition-transform", color)}>
          {icon}
       </div>
       <h5 className="text-sm font-bold text-amber-100">{title}</h5>
       <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={14} className="text-amber-500" />
       </div>
    </button>
  );
}
