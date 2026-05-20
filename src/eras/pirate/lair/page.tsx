'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info, Sparkles,
  Zap, Wind, LifeBuoy, RefreshCw, Compass
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface Zone {
  id: string;
  name: string;
  desc: string;
  maxCrew: number;
  x: string;
  y: string;
}

export default function LairPage() {
  const [battleLog, setBattleLog] = useState<string[]>([
    "Капитан! Вражеский галеон подошел на расстояние выстрела!",
    "Прикажите начать абордаж или открыть огонь!"
  ]);
  
  // Crew distribution for Player
  const [playerCrew, setPlayerCrew] = useState<Record<string, number>>({
    helm: 5,
    cannons: 15,
    deck: 30
  });

  // Crew distribution for Enemy
  const [enemyCrew, setEnemyCrew] = useState<Record<string, number>>({
    helm: 5,
    cannons: 15,
    deck: 40
  });

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [boardingDots, setBoardingDots] = useState<{id: number, x: number, y: number}[]>([]);

  const playerZones: Zone[] = [
    { id: 'helm', name: 'Штурвал', desc: 'Маневр', maxCrew: 5, x: '50%', y: '15%' },
    { id: 'cannons', name: 'Пушки', desc: 'Огонь', maxCrew: 20, x: '50%', y: '45%' },
    { id: 'deck', name: 'Палуба', desc: 'Резерв', maxCrew: 50, x: '50%', y: '75%' },
  ];

  const enemyZones: Zone[] = [
    { id: 'helm', name: 'Мостик', desc: 'Управление', maxCrew: 5, x: '50%', y: '15%' },
    { id: 'cannons', name: 'Батарея', desc: 'Огонь', maxCrew: 20, x: '50%', y: '45%' },
    { id: 'deck', name: 'Каюты', desc: 'Защита', maxCrew: 50, x: '50%', y: '75%' },
  ];

  const addLog = (msg: string) => {
    setBattleLog(prev => [...prev, msg]);
  };

  const startBoarding = () => {
    if (playerCrew.deck < 5) {
      addLog("❌ Слишком мало людей на палубе для абордажа!");
      return;
    }

    setIsAttacking(true);
    addLog("⚔️ АБОРДАЖ! Твои люди прыгают на вражеский корабль!");

    // Create dots moving from Player Deck to Enemy Deck
    const newDots = Array.from({ length: 10 }).map((_, i) => ({
      id: Date.now() + i,
      x: 300, // Starting X (Player Deck area)
      y: 400  // Starting Y
    }));
    setBoardingDots(newDots);

    // Animate dots moving to the right (Enemy ship)
    setTimeout(() => {
      setBoardingDots(prev => prev.map(dot => ({ ...dot, x: dot.x + 300 })));
      
      // Simulate fight and deaths
      setTimeout(() => {
        setEnemyCrew(prev => ({ ...prev, deck: Math.max(0, prev.deck - 15) }));
        setPlayerCrew(prev => ({ ...prev, deck: Math.max(0, prev.deck - 5) }));
        setBoardingDots([]);
        setIsAttacking(false);
        addLog("💥 Бой на палубе! Враг потерял 15 человек, мы потеряли 5.");
      }, 1000);
    }, 100);
  };

  const renderCrewDots = (count: number, color: string) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 25;
      const theta = Math.random() * 2 * Math.PI;
      const dx = r * Math.cos(theta);
      const dy = r * Math.sin(theta);
      
      dots.push(
        <div
          key={i}
          className={cn("w-2 h-2 rounded-full absolute shadow-lg", color)}
          style={{ transform: `translate(${dx}px, ${dy}px)` }}
        />
      );
    }
    return dots;
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-amber-100 font-serif overflow-x-hidden p-6 md:p-12">
      
      {/* Huge Glowing Orbs for brightness */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
         
         {/* Header */}
         <div className="flex justify-between items-center border-b-2 border-amber-500/30 pb-4">
            <div>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-amber-500">Симуляция Сражения</p>
               <h1 className="text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-red-600 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">Абордаж</h1>
            </div>
            <button 
               onClick={startBoarding}
               disabled={isAttacking}
               className={cn(
                 "px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl font-black uppercase text-sm tracking-wider transition-all hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center gap-2",
                 isAttacking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
               )}
            >
               <Sword size={18} />
               Начать Абордаж
            </button>
         </div>

         {/* Two Ships Container */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Ships Arena */}
            <div className="lg:col-span-9 bg-gradient-to-b from-[#110a03] to-black p-8 rounded-[3rem] border-2 border-amber-500/20 relative h-[650px] overflow-hidden flex justify-around items-center">
               
               {/* Grid background */}
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
               
               {/* PLAYER SHIP (Left) */}
               <div className="relative w-[250px] h-[450px] border-4 border-cyan-500/30 rounded-[80px] bg-cyan-900/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-cyan-500 text-black px-4 py-1 text-xs font-black uppercase rounded-full">Твой Корабль</div>
                  
                  {/* Bow */}
                  <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[125px] border-r-[125px] border-t-[60px] border-l-transparent border-r-transparent border-t-cyan-500/20" />
                  
                  {/* Zones */}
                  {playerZones.map(zone => (
                     <div key={zone.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: zone.x, top: zone.y }}>
                        <div className="w-16 h-16 bg-black/80 border-2 border-cyan-500/50 rounded-full flex items-center justify-center relative">
                           {renderCrewDots(playerCrew[zone.id], "bg-cyan-400 shadow-cyan-500/50")}
                        </div>
                        {/* LARGER TEXT */}
                        <p className="text-lg font-black text-white mt-2 drop-shadow-lg">{zone.name}</p>
                        <p className="text-xs font-bold text-cyan-400">{playerCrew[zone.id]}👥</p>
                     </div>
                  ))}
               </div>

               {/* VS Gap with moving dots */}
               <div className="absolute inset-0 pointer-events-none z-20">
                  {boardingDots.map(dot => (
                     <motion.div
                        key={dot.id}
                        initial={{ x: dot.x, y: dot.y }}
                        animate={{ x: dot.x + 300, y: dot.y }}
                        transition={{ duration: 1 }}
                        className="w-3 h-3 bg-amber-400 rounded-full absolute shadow-[0_0_10px_rgba(245,158,11,1)]"
                     />
                  ))}
               </div>

               {/* Beautiful Wooden Suspension Bridge */}
               <div className="absolute left-[calc(25%+125px)] right-[calc(25%+125px)] top-[380px] h-12 z-0 pointer-events-none select-none flex items-center justify-center">
                  {/* Underlay shadow for depth */}
                  <div className="absolute inset-x-0 h-6 bg-black/40 blur-md translate-y-3 rounded-full" />

                  {/* Main Rope Rails */}
                  <div className="absolute inset-x-0 -top-1 h-[2px] bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 shadow-sm border-t border-amber-950/50" />
                  <div className="absolute inset-x-0 -bottom-1 h-[2px] bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 shadow-sm border-b border-amber-950/50" />

                  {/* Dynamic Planks Container */}
                  <div className="absolute inset-0 flex justify-around items-center px-1 overflow-hidden">
                     {Array.from({ length: 18 }).map((_, i) => (
                        <div
                           key={i}
                           className="h-full w-[10px] bg-gradient-to-b from-[#4a2f1b] via-[#634229] to-[#2b190c] border border-[#1e1007] rounded-[1px] shadow-lg flex flex-col justify-between py-[3px] relative shrink-0"
                           style={{
                              transform: `rotate(${(i % 3 - 1) * 1.5}deg) translateY(${i % 2 === 0 ? 1 : 0}px)`,
                           }}
                        >
                           {/* Top nail */}
                           <div className="w-[3px] h-[3px] rounded-full bg-zinc-500/80 mx-auto shadow-inner" />
                           {/* Bottom nail */}
                           <div className="w-[3px] h-[3px] rounded-full bg-zinc-500/80 mx-auto shadow-inner" />
                        </div>
                     ))}
                  </div>

                  {/* Left Lantern (Player Ship entrance) */}
                  <div className="absolute -left-3 top-[-10px] w-5 h-8 flex flex-col items-center">
                     {/* Lantern post */}
                     <div className="w-1 h-3 bg-amber-900 border-x border-amber-950" />
                     {/* Lantern glass and glow */}
                     <div className="w-4 h-5 bg-[#1a110a] border border-amber-500/50 rounded-md relative flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                        <motion.div 
                           animate={{ 
                              scale: [0.9, 1.1, 0.9],
                              opacity: [0.7, 1, 0.7]
                           }}
                           transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "easeInOut"
                           }}
                           className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-300 to-red-500 blur-[2px]"
                        />
                     </div>
                  </div>

                  {/* Right Lantern (Enemy Ship entrance) */}
                  <div className="absolute -right-3 top-[-10px] w-5 h-8 flex flex-col items-center">
                     {/* Lantern post */}
                     <div className="w-1 h-3 bg-amber-900 border-x border-amber-950" />
                     {/* Lantern glass and glow */}
                     <div className="w-4 h-5 bg-[#1a110a] border border-amber-500/50 rounded-md relative flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                        <motion.div 
                           animate={{ 
                              scale: [1, 0.8, 1],
                              opacity: [1, 0.6, 1]
                           }}
                           transition={{
                              repeat: Infinity,
                              duration: 1.8,
                              ease: "easeInOut"
                           }}
                           className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-300 to-red-500 blur-[2px]"
                        />
                     </div>
                  </div>
               </div>

               {/* ENEMY SHIP (Right) */}
               <div className="relative w-[250px] h-[450px] border-4 border-red-500/30 rounded-[80px] bg-red-900/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-1 text-xs font-black uppercase rounded-full">Галеон Врага</div>
                  
                  {/* Bow */}
                  <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[125px] border-r-[125px] border-t-[60px] border-l-transparent border-r-transparent border-t-red-500/20" />
                  
                  {/* Zones */}
                  {enemyZones.map(zone => (
                     <div key={zone.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: zone.x, top: zone.y }}>
                        <div className="w-16 h-16 bg-black/80 border-2 border-red-500/50 rounded-full flex items-center justify-center relative">
                           {renderCrewDots(enemyCrew[zone.id], "bg-red-500 shadow-red-500/50")}
                        </div>
                        {/* LARGER TEXT */}
                        <p className="text-lg font-black text-white mt-2 drop-shadow-lg">{zone.name}</p>
                        <p className="text-xs font-bold text-red-400">{enemyCrew[zone.id]}👥</p>
                     </div>
                  ))}
               </div>

            </div>

            {/* Right: NEW JOURNAL (Beautiful and not "стремно") */}
            <div className="lg:col-span-3 h-[650px] flex flex-col">
               <div className="bg-gradient-to-br from-[#1a0f00] to-[#0a0501] p-6 rounded-[2rem] border-2 border-amber-500/30 flex-1 flex flex-col shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                  <div className="flex items-center gap-2 border-b border-amber-500/20 pb-4 mb-4">
                     <Scroll size={20} className="text-amber-500" />
                     <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-500">Судовой Журнал</h4>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 text-sm text-amber-100/90 font-sans leading-relaxed">
                     {battleLog.map((log, i) => (
                        <div key={i} className="border-b border-amber-900/10 pb-2 flex gap-2">
                           <span className="text-amber-500 font-black">&gt;</span>
                           <p>{log}</p>
                        </div>
                     ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-amber-500/20 text-[10px] font-black uppercase text-amber-500/40 text-center">
                     Записи ведутся в реальном времени
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
