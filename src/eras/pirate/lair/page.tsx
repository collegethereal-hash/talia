'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info, Sparkles,
  Zap, Wind, LifeBuoy, RefreshCw, Compass
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Define Zone Interface
interface Zone {
  id: string;
  name: string;
  desc: string;
  maxCrew: number;
  effect: string;
  x: string; // CSS position
  y: string;
}

export default function LairPage() {
  const [battleLog, setBattleLog] = useState<string[]>([
    "Вы на капитанском мостике. Команда ждет приказов.",
  ]);
  
  // Crew distribution
  const [crew, setCrew] = useState<Record<string, number>>({
    helm: 5,
    cannons_left: 10,
    cannons_right: 10,
    masts: 15,
    deck: 40
  });

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [movingCrew, setMovingCrew] = useState(false);

  const zones: Zone[] = [
    { id: 'helm', name: 'Штурвал', desc: 'Управляет маневренностью', maxCrew: 5, effect: '+Уклонение', x: '50%', y: '15%' },
    { id: 'masts', name: 'Мачты', desc: 'Управляют скоростью', maxCrew: 15, effect: '+Скорость', x: '50%', y: '40%' },
    { id: 'cannons_left', name: 'Левые Пушки', desc: 'Огонь по левому борту', maxCrew: 15, effect: 'Атака Слева', x: '25%', y: '50%' },
    { id: 'cannons_right', name: 'Правые Пушки', desc: 'Огонь по правому борту', maxCrew: 15, effect: 'Атака Справа', x: '75%', y: '50%' },
    { id: 'deck', name: 'Палуба', desc: 'Резерв и абордаж', maxCrew: 50, effect: 'Готовность', x: '50%', y: '70%' },
  ];

  const addLog = (msg: string) => {
    setBattleLog(prev => [...prev, msg]);
  };

  const handleZoneClick = (zoneId: string) => {
    if (!selectedZone) {
      setSelectedZone(zoneId);
      addLog(`Выбрана зона: ${zones.find(z => z.id === zoneId)?.name}. Выберите куда отправить людей.`);
    } else if (selectedZone === zoneId) {
      setSelectedZone(null);
    } else {
      // Move crew from selectedZone to zoneId
      const sourceZone = selectedZone;
      const targetZone = zoneId;
      
      const sourceCount = crew[sourceZone];
      const targetMax = zones.find(z => z.id === targetZone)?.maxCrew || 0;
      const targetCurrent = crew[targetZone];
      
      if (sourceCount <= 0) {
        addLog(`❌ В зоне ${zones.find(z => z.id === sourceZone)?.name} нет людей!`);
        setSelectedZone(null);
        return;
      }
      
      const availableSpace = targetMax - targetCurrent;
      if (availableSpace <= 0) {
        addLog(`❌ Зона ${zones.find(z => z.id === targetZone)?.name} уже заполнена!`);
        setSelectedZone(null);
        return;
      }
      
      const amountToMove = Math.min(5, sourceCount, availableSpace); // Move in batches of 5
      
      setMovingCrew(true);
      setTimeout(() => {
        setCrew(prev => ({
          ...prev,
          [sourceZone]: prev[sourceZone] - amountToMove,
          [targetZone]: prev[targetZone] + amountToMove
        }));
        addLog(`🏃‍♂️ ${amountToMove} матросов перебежали из ${zones.find(z => z.id === sourceZone)?.name} в ${zones.find(z => z.id === targetZone)?.name}.`);
        setMovingCrew(false);
        setSelectedZone(null);
      }, 1000);
    }
  };

  // Generate random dots for crew representation
  const renderCrewDots = (zoneId: string, count: number) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
      // Random offset within a circle
      const r = Math.random() * 20;
      const theta = Math.random() * 2 * Math.PI;
      const dx = r * Math.cos(theta);
      const dy = r * Math.sin(theta);
      
      dots.push(
        <motion.div
          key={`${zoneId}-${i}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-1.5 h-1.5 bg-amber-400 rounded-full absolute shadow-[0_0_5px_rgba(245,158,11,0.8)]"
          style={{ transform: `translate(${dx}px, ${dy}px)` }}
        />
      );
    }
    return dots;
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-amber-100 font-serif overflow-x-hidden p-6 md:p-12">
      
      {/* Huge Glowing Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
         
         {/* Header */}
         <div className="flex justify-between items-center border-b-2 border-amber-500/20 pb-4">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Управление Кораблем</p>
               <h1 className="text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500">Капитанский Мостик</h1>
            </div>
            <div className="flex gap-4">
               <div className="p-3 bg-black/80 rounded-xl border border-amber-500/30 text-xs">
                  <span className="text-slate-500">Всего команды:</span> <span className="text-amber-400 font-bold">80</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Interactive Ship Map (Top Down) */}
            <div className="lg:col-span-8 bg-gradient-to-b from-[#110a03] to-black p-6 rounded-[3rem] border-2 border-amber-500/30 relative h-[650px] overflow-hidden">
               
               {/* Grid background */}
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
               
               {/* Holographic Ship Outline */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[300px] h-[500px] border-4 border-amber-500/20 rounded-[100px] relative">
                     {/* Bow (Нос) */}
                     <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[150px] border-r-[150px] border-t-[80px] border-l-transparent border-r-transparent border-t-amber-500/20" />
                     {/* Stern (Корма) */}
                     <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[200px] h-[40px] bg-amber-500/10 border-2 border-amber-500/20" />
                  </div>
               </div>

               {/* Interactive Zones */}
               {zones.map((zone) => {
                  const isSelected = selectedZone === zone.id;
                  const crewCount = crew[zone.id] || 0;
                  
                  return (
                     <motion.div
                        key={zone.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                        style={{ left: zone.x, top: zone.y }}
                        whileHover={{ scale: 1.05 }}
                     >
                        {/* Zone Trigger */}
                        <div 
                           onClick={() => handleZoneClick(zone.id)}
                           className={cn(
                             "w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative",
                             isSelected ? "border-amber-400 bg-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.5)]" : "border-amber-500/30 bg-black/60 hover:border-amber-500/60"
                           )}
                        >
                           {/* Crew Dots Container */}
                           <div className="absolute inset-0 flex items-center justify-center">
                              {renderCrewDots(zone.id, crewCount)}
                           </div>
                           
                           {/* Text Overlay */}
                           <div className="relative z-10 text-center bg-black/80 px-2 py-0.5 rounded-md">
                              <p className="text-[10px] font-black text-amber-100">{zone.name}</p>
                              <p className="text-xs font-black text-amber-400">{crewCount}/{zone.maxCrew}</p>
                           </div>
                        </div>
                        
                        {/* Zone Info (Shown on hover or select) */}
                        <div className={cn(
                          "mt-2 text-center transition-opacity max-w-[120px]",
                          isSelected ? "opacity-100" : "opacity-60"
                        )}>
                           <p className="text-[8px] font-black uppercase text-amber-500">{zone.effect}</p>
                           <p className="text-[9px] text-slate-400 leading-tight">{zone.desc}</p>
                        </div>
                     </motion.div>
                  );
               })}

               {/* Movement Line (Holographic) */}
               {selectedZone && (
                  <div className="absolute inset-0 pointer-events-none">
                     {/* Visual cue to select target */}
                     <div className="text-center mt-4">
                        <span className="text-xs font-black uppercase bg-amber-500 text-black px-4 py-1 rounded-full animate-pulse">
                           Выберите зону для отправки людей
                        </span>
                     </div>
                  </div>
               )}

               {/* Moving Crew Animation */}
               {movingCrew && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-sm">
                     <div className="text-center">
                        <RefreshCw size={40} className="text-amber-500 animate-spin mx-auto mb-2" />
                        <p className="text-sm font-bold text-amber-100">Перемещение команды...</p>
                     </div>
                  </div>
               )}

            </div>

            {/* Right: Controls & Log */}
            <div className="lg:col-span-4 space-y-6">
               
               {/* Ship Stats based on crew placement */}
               <div className="bg-gradient-to-br from-[#110a03] to-black p-6 rounded-3xl border-2 border-amber-500/30 space-y-4">
                  <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-500">Эффективность Корабля</h4>
                  
                  {/* Speed */}
                  <div>
                     <div className="flex justify-between text-xs font-black mb-1">
                        <span>СКОРОСТЬ (Мачты)</span>
                        <span className="text-amber-400">{Math.floor((crew.masts / 15) * 100)}%</span>
                     </div>
                     <div className="h-1.5 bg-black rounded-full overflow-hidden border border-amber-500/20">
                        <div className="h-full bg-amber-500" style={{ width: `${(crew.masts / 15) * 100}%` }} />
                     </div>
                  </div>

                  {/* Firepower */}
                  <div>
                     <div className="flex justify-between text-xs font-black mb-1">
                        <span>ОГНЕВАЯ МОЩЬ (Пушки)</span>
                        <span className="text-red-400">{Math.floor(((crew.cannons_left + crew.cannons_right) / 30) * 100)}%</span>
                     </div>
                     <div className="h-1.5 bg-black rounded-full overflow-hidden border border-red-500/20">
                        <div className="h-full bg-red-500" style={{ width: `${((crew.cannons_left + crew.cannons_right) / 30) * 100}%` }} />
                     </div>
                  </div>

                  {/* Evasion */}
                  <div>
                     <div className="flex justify-between text-xs font-black mb-1">
                        <span>МАНЕВРЕННОСТЬ (Штурвал)</span>
                        <span className="text-cyan-400">{Math.floor((crew.helm / 5) * 100)}%</span>
                     </div>
                     <div className="h-1.5 bg-black rounded-full overflow-hidden border border-cyan-500/20">
                        <div className="h-full bg-cyan-500" style={{ width: `${(crew.helm / 5) * 100}%` }} />
                     </div>
                  </div>
               </div>

               {/* Battle Log */}
               <div className="bg-gradient-to-br from-[#050505] to-black p-6 rounded-3xl border-2 border-amber-500/30 h-[380px] flex flex-col">
                  <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-500 mb-4">Журнал Командования</h4>
                  <div className="flex-1 overflow-y-auto space-y-3 text-xs text-amber-100/70 font-mono">
                     {battleLog.map((log, i) => (
                        <div key={i} className="border-b border-amber-900/20 pb-2">
                           <span className="text-amber-500/50">&gt;</span> {log}
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
