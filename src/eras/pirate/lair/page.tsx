'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info, Sparkles,
  Zap, Wind, LifeBuoy, RefreshCw, Compass, Eye, ShieldAlert,
  Heart, FastForward, Pause, Play
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface Sailor {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  team: 'player' | 'enemy';
  state: 'idle' | 'moving' | 'fighting' | 'retreating' | 'ambushing';
  path: { x: number, y: number }[];
  hp: number;
}

interface Zone {
  id: string;
  name: string;
  x: number; // Pixel positions relative to arena
  y: number;
  team: 'player' | 'enemy';
  crewTypes: {
    swordsmen: number;
    gunners: number;
    sappers: number;
  };
}

export default function LairPage() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [sailors, setSailors] = useState<Sailor[]>([]);
  const [zones, setZones] = useState<Zone[]>([
    // Player Ship (Left) - Center X=325
    { id: 'p_helm', name: 'Капитанский Мостик', x: 325, y: 150, team: 'player', crewTypes: { swordsmen: 2, gunners: 3, sappers: 0 } },
    { id: 'p_masts', name: 'Грот-Мачта', x: 325, y: 300, team: 'player', crewTypes: { swordsmen: 5, gunners: 5, sappers: 2 } },
    { id: 'p_cannons_l', name: 'Батарея Слева', x: 225, y: 450, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 } },
    { id: 'p_cannons_r', name: 'Батарея Справа', x: 425, y: 450, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 } },
    { id: 'p_deck', name: 'Центральная Палуба', x: 325, y: 600, team: 'player', crewTypes: { swordsmen: 15, gunners: 5, sappers: 5 } },
    { id: 'p_hold', name: 'Трюм (Арсенал)', x: 325, y: 750, team: 'player', crewTypes: { swordsmen: 5, gunners: 2, sappers: 10 } },
    
    // Enemy Ship (Right) - Center X=850, Width=360
    { id: 'e_cabin', name: 'Адмиральская Каюта', x: 850, y: 120, team: 'enemy', crewTypes: { swordsmen: 5, gunners: 5, sappers: 0 } },
    { id: 'e_battery', name: 'Тяжелая Батарея', x: 850, y: 280, team: 'enemy', crewTypes: { swordsmen: 0, gunners: 15, sappers: 0 } },
    { id: 'e_deck_f', name: 'Носовая Палуба', x: 750, y: 450, team: 'enemy', crewTypes: { swordsmen: 10, gunners: 5, sappers: 2 } },
    { id: 'e_deck_b', name: 'Кормовая Палуба', x: 950, y: 450, team: 'enemy', crewTypes: { swordsmen: 10, gunners: 5, sappers: 2 } },
    { id: 'e_barracks', name: 'Казармы', x: 850, y: 620, team: 'enemy', crewTypes: { swordsmen: 20, gunners: 0, sappers: 0 } },
    { id: 'e_hold', name: 'Пороховой Погреб', x: 850, y: 780, team: 'enemy', crewTypes: { swordsmen: 2, gunners: 2, sappers: 10 } },
  ]);

  const [battleStarted, setBattleStarted] = useState(false);
  const [activeModalZone, setActiveModalZone] = useState<string | null>(null);
  const [stats, setStats] = useState({ playerCasualties: 0, enemyCasualties: 0 });

  // Initialize sailors
  useEffect(() => {
    const initialSailors: Sailor[] = [];
    let id = 0;

    zones.forEach(zone => {
      const totalCrew = zone.crewTypes.swordsmen + zone.crewTypes.gunners + zone.crewTypes.sappers;
      for (let i = 0; i < totalCrew; i++) {
        initialSailors.push({
          id: id++,
          x: zone.x + (Math.random() * 60 - 30),
          y: zone.y + (Math.random() * 60 - 30),
          targetX: zone.x,
          targetY: zone.y,
          color: zone.team === 'player' ? 'bg-cyan-400 shadow-cyan-500/50' : 'bg-red-500 shadow-red-500/50',
          team: zone.team,
          state: 'idle',
          path: [],
          hp: 100
        });
      }
    });

    setSailors(initialSailors);
  }, []);

  // Bridge Pathfinding Helper
  const getBridgePath = (startX: number, endX: number, targetX: number, targetY: number) => {
    const leftBridgeX = 500;
    const rightBridgeX = 650;
    const bridgeY = 500;

    // Crossing from Left to Right
    if (startX < leftBridgeX && endX > rightBridgeX) {
      return [
        { x: leftBridgeX, y: bridgeY },
        { x: rightBridgeX, y: bridgeY },
        { x: targetX, y: targetY }
      ];
    }
    // Crossing from Right to Left
    if (startX > rightBridgeX && endX < leftBridgeX) {
      return [
        { x: rightBridgeX, y: bridgeY },
        { x: leftBridgeX, y: bridgeY },
        { x: targetX, y: targetY }
      ];
    }
    return [{ x: targetX, y: targetY }];
  };

  // Real-time movement and AI logic loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSailors(prevSailors => {
        // 1. Move sailors
        const movedSailors: Sailor[] = prevSailors.map(sailor => {
          let currentTargetX = sailor.targetX;
          let currentTargetY = sailor.targetY;
          let newPath = [...sailor.path];

          if (newPath.length > 0) {
            currentTargetX = newPath[0].x;
            currentTargetY = newPath[0].y;
          }

          const dx = currentTargetX - sailor.x;
          const dy = currentTargetY - sailor.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 5) {
            if (newPath.length > 0) {
              newPath.shift();
              return { ...sailor, path: newPath };
            }
            return { ...sailor, x: sailor.targetX, y: sailor.targetY, state: 'idle' as const };
          }
          
          const speed = sailor.state === 'retreating' ? 3 : 1.5; // Slower default speed
          return {
            ...sailor,
            x: sailor.x + (dx / dist) * speed,
            y: sailor.y + (dy / dist) * speed,
            path: newPath
          };
        });

        // 2. Fighting & Retreating Logic
        const updatedSailors = [...movedSailors];
        let pCas = 0;
        let eCas = 0;

        for (let i = 0; i < updatedSailors.length; i++) {
          const s1 = updatedSailors[i];
          for (let j = i + 1; j < updatedSailors.length; j++) {
            const s2 = updatedSailors[j];

            if (s1.team !== s2.team) {
              const dx = s1.x - s2.x;
              const dy = s1.y - s2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 20) {
                // Fighting!
                s1.state = 'fighting';
                s2.state = 'fighting';
                s1.hp -= 2;
                s2.hp -= 2;

                // Retreat logic if HP is low
                if (s1.hp < 30) {
                  s1.state = 'retreating';
                  const homeZone = zones.find(z => z.team === s1.team);
                  if (homeZone) {
                    s1.targetX = homeZone.x;
                    s1.targetY = homeZone.y;
                    s1.path = [];
                  }
                }
                if (s2.hp < 30) {
                  s2.state = 'retreating';
                  const homeZone = zones.find(z => z.team === s2.team);
                  if (homeZone) {
                    s2.targetX = homeZone.x;
                    s2.targetY = homeZone.y;
                    s2.path = [];
                  }
                }
              }
            }
          }
        }

        // Filter out dead
        const survivors = updatedSailors.filter(s => {
          if (s.hp <= 0) {
            if (s.team === 'player') pCas++;
            else eCas++;
            return false;
          }
          return true;
        });

        if (pCas > 0 || eCas > 0) {
          setStats(prev => ({
            playerCasualties: prev.playerCasualties + pCas,
            enemyCasualties: prev.enemyCasualties + eCas
          }));
        }

        return survivors;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Auto AI Director (Simulates strategy)
  useEffect(() => {
    if (!battleStarted) return;

    const aiInterval = setInterval(() => {
      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          if (sailor.state !== 'idle') return sailor; // Only direct idle sailors

          const coin = Math.random();
          
          // Attack! (Cross bridge)
          if (coin < 0.1) {
            const targetTeam = sailor.team === 'player' ? 'enemy' : 'player';
            const targetZones = zones.filter(z => z.team === targetTeam);
            const randomZone = targetZones[Math.floor(Math.random() * targetZones.length)];
            
            const path = getBridgePath(sailor.x, randomZone.x, randomZone.x, randomZone.y);
            return {
              ...sailor,
              state: 'moving',
              targetX: randomZone.x,
              targetY: randomZone.y,
              path: path
            };
          }
          
          // Move inside own ship (repositioning)
          if (coin < 0.3) {
            const ownZones = zones.filter(z => z.team === sailor.team);
            const randomZone = ownZones[Math.floor(Math.random() * ownZones.length)];
            return {
              ...sailor,
              state: 'moving',
              targetX: randomZone.x + (Math.random() * 40 - 20),
              targetY: randomZone.y + (Math.random() * 40 - 20),
              path: []
            };
          }

          // Ambush (Hide in place)
          if (coin < 0.5 && sailor.team === 'player') {
            return { ...sailor, state: 'ambushing' };
          }

          return sailor;
        })
      );
    }, 4000); // Every 4 seconds make strategic decisions

    return () => clearInterval(aiInterval);
  }, [battleStarted]);

  return (
    <div className="relative min-h-screen bg-[#030303] text-amber-100 font-sans overflow-x-hidden p-6 md:p-12">
      
      {/* Huge Glowing Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[700px] h-[700px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">
         
         {/* Header / Scoreboard */}
         <div className="bg-gradient-to-r from-[#110a03] via-black to-[#110a03] border border-amber-500/20 rounded-2xl p-6 flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Наш Экипаж</p>
                  <p className="text-3xl font-serif font-black text-white">{sailors.filter(s => s.team === 'player').length}</p>
               </div>
               <div className="text-xs text-slate-500 font-mono">vs</div>
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Враги</p>
                  <p className="text-3xl font-serif font-black text-white">{sailors.filter(s => s.team === 'enemy').length}</p>
               </div>
            </div>

            <div className="flex flex-col items-center">
               <h1 className="text-2xl font-serif font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500">Автономная Битва</h1>
               <p className="text-[10px] uppercase tracking-widest text-amber-500/60 mt-1">Режим Наблюдателя</p>
            </div>

            <div className="flex items-center gap-4">
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Потери</p>
                  <p className="text-xs font-mono text-amber-100/70">Наши: {stats.playerCasualties} | Враг: {stats.enemyCasualties}</p>
               </div>
               <button 
                  onClick={() => setBattleStarted(!battleStarted)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all hover:scale-105 shadow-lg flex items-center gap-2",
                    battleStarted ? "bg-red-600 text-white" : "bg-gradient-to-r from-amber-500 to-orange-600 text-black"
                  )}
               >
                  {battleStarted ? <Pause size={14} /> : <Play size={14} />}
                  {battleStarted ? "Пауза" : "Запуск"}
               </button>
            </div>
         </div>

         {/* Arena (Centered, full width) */}
         <div className="relative flex justify-center">
            <div 
               ref={arenaRef}
               className="bg-gradient-to-b from-[#0a0602] to-black rounded-[2.5rem] border border-amber-500/20 relative h-[1000px] w-[1200px] overflow-hidden shadow-2xl"
            >
               {/* Grid background */}
               <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
               
               {/* Bridge (Мостик) */}
               <div className="absolute top-[480px] left-[500px] w-[150px] h-[40px] bg-amber-900/60 border-t border-b border-amber-500/30 flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-amber-500/40 tracking-widest">Абордажный Мост</span>
               </div>

               {/* PLAYER SHIP HULL */}
               <div className="absolute top-[50px] left-[150px] w-[350px] h-[850px] border-2 border-cyan-500/20 rounded-[80px] bg-cyan-900/5 pointer-events-none">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-cyan-400 font-black uppercase text-[10px] tracking-widest">Флагман</div>
               </div>

               {/* ENEMY SHIP HULL */}
               <div className="absolute top-[25px] left-[650px] w-[400px] h-[900px] border-2 border-red-500/20 rounded-[100px_100px_40px_40px] bg-red-900/5 pointer-events-none">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-red-400 font-black uppercase text-[10px] tracking-widest">Линкор Врага</div>
               </div>

               {/* Zones (Clickable Areas) */}
               {zones.map(zone => {
                  const count = sailors.filter(s => s.team === zone.team && Math.sqrt(Math.pow(s.x - zone.x, 2) + Math.pow(s.y - zone.y, 2)) < 50).length;
                  
                  return (
                     <div 
                        key={zone.id}
                        onClick={() => setActiveModalZone(zone.id)}
                        className={cn(
                          "absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl border transition-all cursor-pointer w-[140px] text-center backdrop-blur-sm",
                          "border-white/5 bg-black/80 hover:border-white/20",
                          zone.team === 'player' ? "hover:border-cyan-500/30" : "hover:border-red-500/30"
                        )}
                        style={{ left: zone.x, top: zone.y }}
                     >
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{zone.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{count} чел.</p>
                     </div>
                  );
               })}

               {/* Sailors (Dots) */}
               {sailors.map(sailor => (
                  <div
                     key={sailor.id}
                     className={cn(
                       "w-2.5 h-2.5 rounded-full absolute transition-all duration-500 ease-linear shadow-lg", 
                       sailor.color,
                       sailor.state === 'fighting' && "animate-pulse scale-125",
                       sailor.state === 'ambushing' && "opacity-30" // Hide when ambushing
                     )}
                     style={{ 
                        left: `${sailor.x}px`, 
                        top: `${sailor.y}px`,
                        transform: 'translate(-50%, -50%)'
                     }}
                  />
               ))}

            </div>
         </div>

         {/* Beautiful Modal for Zone Details */}
         <AnimatePresence>
            {activeModalZone && (
               <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-gradient-to-br from-[#1a0f00] to-[#0a0501] border-2 border-amber-500/30 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative"
                  >
                     <button 
                        onClick={() => setActiveModalZone(null)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                     >
                        <X size={20} />
                     </button>

                     {(() => {
                        const zone = zones.find(z => z.id === activeModalZone);
                        if (!zone) return null;
                        const zoneSailors = sailors.filter(s => s.team === zone.team && Math.sqrt(Math.pow(s.x - zone.x, 2) + Math.pow(s.y - zone.y, 2)) < 50);
                        
                        return (
                           <div className="space-y-6">
                              <div className="border-b border-amber-500/20 pb-4">
                                 <h4 className="text-3xl font-serif font-black text-white uppercase tracking-tighter">{zone.name}</h4>
                                 <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest mt-1">
                                    {zone.team === 'player' ? 'Наш Сектор' : 'Вражеский Сектор'}
                                 </p>
                              </div>

                              {/* Info */}
                              <div className="space-y-4">
                                 <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                                    <span className="text-sm text-slate-400">Всего бойцов в секторе</span>
                                    <span className="text-xl font-black text-amber-500 font-mono">{zoneSailors.length}</span>
                                 </div>

                                 <div className="grid grid-cols-1 gap-3">
                                    <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Роли (по штату)</h5>
                                    <div className="bg-black/60 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                                       <span className="text-xs text-amber-100">Фехтовальщики</span>
                                       <span className="text-sm font-bold text-cyan-400">{zone.crewTypes.swordsmen}</span>
                                    </div>
                                    <div className="bg-black/60 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                                       <span className="text-xs text-amber-100">Канониры</span>
                                       <span className="text-sm font-bold text-cyan-400">{zone.crewTypes.gunners}</span>
                                    </div>
                                    <div className="bg-black/60 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                                       <span className="text-xs text-amber-100">Саперы</span>
                                       <span className="text-sm font-bold text-cyan-400">{zone.crewTypes.sappers}</span>
                                    </div>
                                 </div>

                                 {/* Dynamic Status */}
                                 <div className="bg-black/20 p-4 rounded-xl border border-dashed border-amber-500/20">
                                    <p className="text-[10px] font-black uppercase text-amber-500/60 tracking-wider mb-2">Текущая задача</p>
                                    <p className="text-xs text-amber-100/90 font-sans leading-relaxed">
                                       Бойцы в этом секторе действуют автономно. Они занимают позиции, готовят ловушки и при необходимости отступают или идут на прорыв через мост.
                                    </p>
                                 </div>
                              </div>

                              <button 
                                 onClick={() => setActiveModalZone(null)}
                                 className="w-full p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all hover:scale-[1.02]"
                              >
                                 Понятно, Капитан
                              </button>
                           </div>
                        );
                     })()}
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

      </div>
    </div>
  );
}
