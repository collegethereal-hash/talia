'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info, Sparkles,
  Zap, Wind, LifeBuoy, RefreshCw, Compass, Eye, ShieldAlert
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
  path: { x: number, y: number }[]; // Waypoints for bridge crossing
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
  const [battleLog, setBattleLog] = useState<string[]>([
    "Корабли выровнены горизонтально. Мостик по центру.",
    "Клик по арене отправляет ваших матросов в эту точку."
  ]);
  
  const arenaRef = useRef<HTMLDivElement>(null);
  const [sailors, setSailors] = useState<Sailor[]>([]);
  const [zones, setZones] = useState<Zone[]>([
    // Player Ship (Top) - Y around 150
    { id: 'p_helm', name: 'Рубка', x: 200, y: 150, team: 'player', crewTypes: { swordsmen: 5, gunners: 0, sappers: 0 } },
    { id: 'p_deck', name: 'Палуба', x: 450, y: 150, team: 'player', crewTypes: { swordsmen: 10, gunners: 5, sappers: 5 } },
    { id: 'p_bow', name: 'Нос', x: 700, y: 150, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 } },
    
    // Enemy Ship (Bottom) - Y around 450
    { id: 'e_helm', name: 'Каюта', x: 200, y: 450, team: 'enemy', crewTypes: { swordsmen: 5, gunners: 5, sappers: 0 } },
    { id: 'e_deck', name: 'Палуба', x: 450, y: 450, team: 'enemy', crewTypes: { swordsmen: 15, gunners: 0, sappers: 0 } },
    { id: 'e_stern', name: 'Корма', x: 700, y: 450, team: 'enemy', crewTypes: { swordsmen: 0, gunners: 10, sappers: 5 } },
  ]);
  
  const [battleStarted, setBattleStarted] = useState(false);

  const addLog = (msg: string) => {
    setBattleLog(prev => [...prev, msg]);
  };

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
          y: zone.y + (Math.random() * 40 - 20),
          targetX: zone.x,
          targetY: zone.y,
          color: zone.team === 'player' ? 'bg-cyan-400 shadow-cyan-500/50' : 'bg-red-500 shadow-red-500/50',
          team: zone.team,
          path: []
        });
      }
    });

    setSailors(initialSailors);
  }, []);

  // Real-time movement and killing loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSailors(prevSailors => {
        // 1. Move sailors
        const movedSailors = prevSailors.map(sailor => {
          let currentTargetX = sailor.targetX;
          let currentTargetY = sailor.targetY;
          let newPath = [...sailor.path];

          // If we have waypoints, go to the first one
          if (newPath.length > 0) {
            currentTargetX = newPath[0].x;
            currentTargetY = newPath[0].y;
          }

          const dx = currentTargetX - sailor.x;
          const dy = currentTargetY - sailor.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 5) {
            if (newPath.length > 0) {
              newPath.shift(); // Reached waypoint
              return { ...sailor, path: newPath };
            }
            return { ...sailor, x: sailor.targetX, y: sailor.targetY };
          }
          
          const speed = 1.5; // SLOWER MOVEMENT
          return {
            ...sailor,
            x: sailor.x + (dx / dist) * speed,
            y: sailor.y + (dy / dist) * speed,
            path: newPath
          };
        });

        // 2. Killing Logic (If player and enemy are close, they fight and can die)
        const survivors: Sailor[] = [];
        const deadIds = new Set<number>();

        for (let i = 0; i < movedSailors.length; i++) {
          const s1 = movedSailors[i];
          if (deadIds.has(s1.id)) continue;

          let killed = false;
          for (let j = i + 1; j < movedSailors.length; j++) {
            const s2 = movedSailors[j];
            if (deadIds.has(s2.id)) continue;

            if (s1.team !== s2.team) {
              const dx = s1.x - s2.x;
              const dy = s1.y - s2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 15) { // Collision distance
                // Fight! 50/50 chance who dies
                if (Math.random() > 0.5) {
                  deadIds.add(s1.id);
                  killed = true;
                  break;
                } else {
                  deadIds.add(s2.id);
                }
              }
            }
          }
          if (!killed) survivors.push(s1);
        }

        if (deadIds.size > 0 && Math.random() < 0.1) {
          addLog(`⚔️ В бою погибло ${deadIds.size} матросов!`);
        }

        return survivors;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Bridge Pathfinding Helper
  const setTargetWithPath = (sailor: Sailor, targetX: number, targetY: number): Sailor => {
    const isPlayer = sailor.team === 'player';
    const startY = sailor.y;
    const endY = targetY;

    // Bridge is around X: 450-550, Y: 250-350
    const bridgeX = 500;
    const bridgeTopY = 230;
    const bridgeBottomY = 370;

    // If crossing from Top (Player) to Bottom (Enemy)
    if (startY < 250 && endY > 350) {
      return {
        ...sailor,
        targetX,
        targetY,
        path: [
          { x: bridgeX, y: bridgeTopY },
          { x: bridgeX, y: bridgeBottomY }
        ]
      };
    }
    // If crossing from Bottom to Top
    if (startY > 350 && endY < 250) {
      return {
        ...sailor,
        targetX,
        targetY,
        path: [
          { x: bridgeX, y: bridgeBottomY },
          { x: bridgeX, y: bridgeTopY }
        ]
      };
    }

    // Direct movement if on the same ship
    return { ...sailor, targetX, targetY, path: [] };
  };

  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (arenaRef.current) {
      const rect = arenaRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      addLog(`Приказ: Всем свободным идти в точку (${Math.floor(clickX)}, ${Math.floor(clickY)})!`);

      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          if (sailor.team === 'player') {
            return setTargetWithPath(sailor, clickX + (Math.random() * 40 - 20), clickY + (Math.random() * 40 - 20));
          }
          return sailor;
        })
      );
    }
  };

  const startAttack = () => {
    setBattleStarted(true);
    addLog("⚔️ БИТВА НАЧАЛАСЬ! Враги идут на абордаж!");
    
    // Send enemy sailors to player ship through bridge
    setSailors(prevSailors => 
      prevSailors.map(sailor => {
        if (sailor.team === 'enemy') {
          return setTargetWithPath(sailor, 450 + (Math.random() * 100 - 50), 150 + (Math.random() * 50 - 25));
        }
        return sailor;
      })
    );
  };

  return (
    <div className="relative min-h-screen bg-[#020202] text-amber-100 font-sans overflow-x-hidden p-6 md:p-12">
      
      <div className="relative z-10 max-w-[1200px] mx-auto space-y-6">
         
         {/* Header */}
         <div className="flex justify-between items-center border-b border-amber-500/20 pb-4">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Симуляция</p>
               <h1 className="text-4xl font-serif font-black uppercase text-amber-100">Абордаж через Мост</h1>
            </div>
            <button 
               onClick={startAttack}
               className="px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-xs tracking-wider hover:scale-105 transition-all"
            >
               Начать Бой
            </button>
         </div>

         {/* Arena and Journal */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Arena (1000x600) */}
            <div 
               ref={arenaRef}
               onClick={handleArenaClick}
               className="lg:col-span-9 bg-gradient-to-b from-[#0a0602] to-black rounded-[2.5rem] border border-amber-500/20 relative h-[600px] overflow-hidden cursor-crosshair"
            >
               {/* Bridge (Мостик) */}
               <div className="absolute top-[230px] left-[450px] w-[100px] h-[140px] bg-amber-900/40 border-l border-r border-amber-500/30 flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-amber-500/40 tracking-widest rotate-90">Мостик</span>
               </div>

               {/* PLAYER SHIP (Top) - Rounded & Long Horizontally */}
               <div className="absolute top-[50px] left-[100px] w-[800px] h-[180px] border-2 border-cyan-500/20 rounded-[50px] bg-cyan-900/5 pointer-events-none">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-cyan-400 font-black uppercase text-[10px] tracking-widest">Наш Корабль (Закругленный)</div>
               </div>

               {/* ENEMY SHIP (Bottom) - Strange Shape (Sharp edges) */}
               <div className="absolute top-[370px] left-[100px] w-[800px] h-[180px] border-2 border-red-500/20 rounded-[10px_100px_10px_100px] bg-red-900/5 pointer-events-none">
                  <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-red-400 font-black uppercase text-[10px] tracking-widest">Вражеский Линкор (Странный)</div>
               </div>

               {/* Zones */}
               {zones.map(zone => {
                  const count = sailors.filter(s => s.team === zone.team && Math.sqrt(Math.pow(s.x - zone.x, 2) + Math.pow(s.y - zone.y, 2)) < 50).length;
                  
                  return (
                     <div 
                        key={zone.id}
                        className={cn(
                          "absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-lg border w-[100px] text-center bg-black/80",
                          zone.team === 'player' ? "border-cyan-500/30" : "border-red-500/30"
                        )}
                        style={{ left: zone.x, top: zone.y }}
                     >
                        <p className="text-[10px] font-bold text-white uppercase">{zone.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{count} чел.</p>
                     </div>
                  );
               })}

               {/* Sailors */}
               {sailors.map(sailor => (
                  <div
                     key={sailor.id}
                     className={cn("w-2 h-2 rounded-full absolute transition-all duration-500 ease-linear shadow-lg", sailor.color)}
                     style={{ 
                        left: `${sailor.x}px`, 
                        top: `${sailor.y}px`,
                        transform: 'translate(-50%, -50%)'
                     }}
                  />
               ))}

            </div>

            {/* Right Side: Journal */}
            <div className="lg:col-span-3 h-[600px] flex flex-col">
               <div className="bg-gradient-to-br from-[#110a03] to-black p-4 rounded-[2rem] border border-amber-500/20 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 border-b border-amber-500/10 pb-2 mb-2">
                     <Scroll size={14} className="text-amber-500" />
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Журнал</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 text-[10px] text-amber-100/70 font-sans">
                     {battleLog.map((log, i) => (
                        <div key={i} className="border-b border-amber-900/5 pb-1 flex gap-1">
                           <span className="text-amber-500">&gt;</span>
                           <p>{log}</p>
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
