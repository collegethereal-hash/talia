'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info, Sparkles,
  Zap, Wind, LifeBuoy, RefreshCw, Compass
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
}

interface Zone {
  id: string;
  name: string;
  x: number; // Pixel positions relative to arena
  y: number;
  team: 'player' | 'enemy';
}

export default function LairPage() {
  const [battleLog, setBattleLog] = useState<string[]>([
    "Капитан! Корабли сошлись бортами. Перекидывайте мостики!",
    "Кликайте на зоны кораблей, чтобы отправлять туда людей."
  ]);
  
  const arenaRef = useRef<HTMLDivElement>(null);
  const [sailors, setSailors] = useState<Sailor[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Define zones with absolute pixel coordinates within the 900x600 arena
  const zones: Zone[] = [
    // Player Ship (Left) - Center X around 250
    { id: 'p_helm', name: 'Штурвал', x: 250, y: 100, team: 'player' },
    { id: 'p_masts', name: 'Мачты', x: 250, y: 250, team: 'player' },
    { id: 'p_cannons_f', name: 'Носовые Пушки', x: 150, y: 350, team: 'player' },
    { id: 'p_cannons_b', name: 'Кормовые Пушки', x: 350, y: 350, team: 'player' },
    { id: 'p_deck', name: 'Палуба', x: 250, y: 500, team: 'player' },
    
    // Enemy Ship (Right) - Center X around 650
    { id: 'e_helm', name: 'Мостик', x: 650, y: 100, team: 'enemy' },
    { id: 'e_masts', name: 'Мачты', x: 650, y: 250, team: 'enemy' },
    { id: 'e_cannons_f', name: 'Носовые Пушки', x: 550, y: 350, team: 'enemy' },
    { id: 'e_cannons_b', name: 'Кормовые Пушки', x: 750, y: 350, team: 'enemy' },
    { id: 'e_deck', name: 'Каюты', x: 650, y: 500, team: 'enemy' },
  ];

  // Initialize sailors
  useEffect(() => {
    const initialSailors: Sailor[] = [];
    let id = 0;

    // Player sailors
    zones.filter(z => z.team === 'player').forEach(zone => {
      for (let i = 0; i < 5; i++) {
        initialSailors.push({
          id: id++,
          x: zone.x + (Math.random() * 40 - 20),
          y: zone.y + (Math.random() * 40 - 20),
          targetX: zone.x,
          targetY: zone.y,
          color: 'bg-cyan-400 shadow-cyan-500/50',
          team: 'player'
        });
      }
    });

    // Enemy sailors
    zones.filter(z => z.team === 'enemy').forEach(zone => {
      for (let i = 0; i < 5; i++) {
        initialSailors.push({
          id: id++,
          x: zone.x + (Math.random() * 40 - 20),
          y: zone.y + (Math.random() * 40 - 20),
          targetX: zone.x,
          targetY: zone.y,
          color: 'bg-red-500 shadow-red-500/50',
          team: 'enemy'
        });
      }
    });

    setSailors(initialSailors);
  }, []);

  // Real-time movement loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          const dx = sailor.targetX - sailor.x;
          const dy = sailor.targetY - sailor.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 5) {
            return { ...sailor, x: sailor.targetX, y: sailor.targetY };
          }
          
          // Move towards target
          const speed = 3;
          return {
            ...sailor,
            x: sailor.x + (dx / dist) * speed,
            y: sailor.y + (dy / dist) * speed
          };
        })
      );
    }, 50); // 20 FPS

    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
    setBattleLog(prev => [...prev, msg]);
  };

  const handleZoneClick = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    if (!selectedZone) {
      setSelectedZone(zoneId);
      addLog(`Выбрана зона: ${zone.name}. Кликните куда отправить людей.`);
    } else {
      // Move sailors from selectedZone to clicked zone
      const sourceZone = zones.find(z => z.id === selectedZone);
      if (!sourceZone) return;

      addLog(`Приказ: Переместить людей из ${sourceZone.name} в ${zone.name}!`);

      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          // If sailor is close to the source zone, give them the new target
          const dx = sailor.x - sourceZone.x;
          const dy = sailor.y - sourceZone.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 50 && sailor.team === 'player') { // Only move player sailors
            // If moving to enemy ship, check if we need to go through the bridge
            // Bridge is around Y=300, between X=350 and X=550
            return { 
              ...sailor, 
              targetX: zone.x + (Math.random() * 40 - 20), 
              targetY: zone.y + (Math.random() * 40 - 20) 
            };
          }
          return sailor;
        })
      );

      setSelectedZone(null);
    }
  };

  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedZone && arenaRef.current) {
      const rect = arenaRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      addLog(`Приказ: Всем свободным стягиваться в точку (${Math.floor(clickX)}, ${Math.floor(clickY)})!`);

      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          if (sailor.team === 'player') {
            return { 
              ...sailor, 
              targetX: clickX + (Math.random() * 30 - 15), 
              targetY: clickY + (Math.random() * 30 - 15) 
            };
          }
          return sailor;
        })
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-amber-100 font-serif overflow-x-hidden p-6 md:p-12">
      
      {/* Huge Glowing Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
         
         {/* Header */}
         <div className="flex justify-between items-center border-b-2 border-amber-500/30 pb-4">
            <div>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-amber-500">Симуляция Абордажа</p>
               <h1 className="text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500">Битва в Реальном Времени</h1>
            </div>
            <div className="text-xs text-amber-500/60">
               Кликните на зону для выбора, затем на другую для отправки. <br />
               Клик по пустой палубе стянет всех туда.
            </div>
         </div>

         {/* Arena and Journal */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Arena (900x600 fixed size for coordinate mapping) */}
            <div 
               ref={arenaRef}
               onClick={handleArenaClick}
               className="lg:col-span-9 bg-gradient-to-b from-[#110a03] to-black rounded-[3rem] border-2 border-amber-500/20 relative h-[600px] overflow-hidden cursor-crosshair"
            >
               {/* Grid background */}
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
               
               {/* Bridge (Мостик) */}
               <div className="absolute top-[280px] left-[350px] w-[200px] h-[40px] bg-amber-900/40 border-t-2 border-b-2 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-amber-500/60">Абордажный Мостик</span>
               </div>

               {/* PLAYER SHIP HULL */}
               <div className="absolute top-[50px] left-[100px] w-[300px] h-[500px] border-4 border-cyan-500/20 rounded-[80px] bg-cyan-900/5 pointer-events-none">
                  <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 text-cyan-400 font-black uppercase text-xs">Твой Флагман</div>
               </div>

               {/* ENEMY SHIP HULL */}
               <div className="absolute top-[50px] left-[500px] w-[300px] h-[500px] border-4 border-red-500/20 rounded-[80px] bg-red-900/5 pointer-events-none">
                  <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 text-red-400 font-black uppercase text-xs">Вражеский Галеон</div>
               </div>

               {/* Zones (Clickable Areas) */}
               {zones.map(zone => {
                  const isSelected = selectedZone === zone.id;
                  return (
                     <div 
                        key={zone.id}
                        onClick={(e) => {
                           e.stopPropagation(); // Prevent arena click
                           handleZoneClick(zone.id);
                        }}
                        className={cn(
                          "absolute -translate-x-1/2 -translate-y-1/2 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                          isSelected ? "border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "border-white/10 bg-black/60 hover:border-white/30",
                          zone.team === 'player' ? "hover:border-cyan-500/50" : "hover:border-red-500/50"
                        )}
                        style={{ left: zone.x, top: zone.y }}
                     >
                        {/* LARGER TEXT */}
                        <p className="text-xl font-black text-white uppercase tracking-tighter">{zone.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">{zone.team === 'player' ? 'Наш отсек' : 'Враг'}</p>
                     </div>
                  );
               })}

               {/* Sailors (Dots moving in real time) */}
               {sailors.map(sailor => (
                  <div
                     key={sailor.id}
                     className={cn("w-3 h-3 rounded-full absolute transition-all duration-500 ease-linear shadow-lg", sailor.color)}
                     style={{ 
                        left: `${sailor.x}px`, 
                        top: `${sailor.y}px`,
                        transform: 'translate(-50%, -50%)' // Center the dot
                     }}
                  />
               ))}

            </div>

            {/* Right: Journal */}
            <div className="lg:col-span-3 h-[600px] flex flex-col">
               <div className="bg-gradient-to-br from-[#1a0f00] to-[#0a0501] p-6 rounded-[2rem] border-2 border-amber-500/30 flex-1 flex flex-col shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                  <div className="flex items-center gap-2 border-b border-amber-500/20 pb-4 mb-4">
                     <Scroll size={20} className="text-amber-500" />
                     <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-500">Судовой Журнал</h4>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 text-xs text-amber-100/90 font-sans leading-relaxed">
                     {battleLog.map((log, i) => (
                        <div key={i} className="border-b border-amber-900/10 pb-2 flex gap-2">
                           <span className="text-amber-500 font-black">&gt;</span>
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
