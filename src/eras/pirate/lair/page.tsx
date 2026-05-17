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
    "Корабли сошлись бортами по вертикали! Наш корабль СВЕРХУ.",
    "Кликайте на зоны, чтобы отправлять людей. Корабли стали больше!"
  ]);
  
  const arenaRef = useRef<HTMLDivElement>(null);
  const [sailors, setSailors] = useState<Sailor[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Define zones for VERTICAL STACKING (Horizontal ships)
  // Arena size: 900x800
  const zones: Zone[] = [
    // Player Ship (Top) - Y around 200, X from 150 to 750
    { id: 'p_helm', name: 'Штурвал', x: 200, y: 200, team: 'player' },
    { id: 'p_masts', name: 'Мачты', x: 350, y: 200, team: 'player' },
    { id: 'p_cannons_f', name: 'Верхние Пушки', x: 500, y: 150, team: 'player' },
    { id: 'p_cannons_b', name: 'Нижние Пушки', x: 500, y: 250, team: 'player' },
    { id: 'p_deck', name: 'Палуба', x: 700, y: 200, team: 'player' },
    
    // Enemy Ship (Bottom) - Y around 600, X from 150 to 750
    { id: 'e_helm', name: 'Мостик', x: 200, y: 600, team: 'enemy' },
    { id: 'e_masts', name: 'Мачты', x: 350, y: 600, team: 'enemy' },
    { id: 'e_cannons_f', name: 'Верхние Пушки', x: 500, y: 550, team: 'enemy' },
    { id: 'e_cannons_b', name: 'Нижние Пушки', x: 500, y: 650, team: 'enemy' },
    { id: 'e_deck', name: 'Каюты', x: 700, y: 600, team: 'enemy' },
  ];

  // Initialize sailors
  useEffect(() => {
    const initialSailors: Sailor[] = [];
    let id = 0;

    // Player sailors
    zones.filter(z => z.team === 'player').forEach(zone => {
      for (let i = 0; i < 6; i++) {
        initialSailors.push({
          id: id++,
          x: zone.x + (Math.random() * 50 - 25),
          y: zone.y + (Math.random() * 50 - 25),
          targetX: zone.x,
          targetY: zone.y,
          color: 'bg-cyan-400 shadow-cyan-500/50',
          team: 'player'
        });
      }
    });

    // Enemy sailors
    zones.filter(z => z.team === 'enemy').forEach(zone => {
      for (let i = 0; i < 6; i++) {
        initialSailors.push({
          id: id++,
          x: zone.x + (Math.random() * 50 - 25),
          y: zone.y + (Math.random() * 50 - 25),
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
          
          const speed = 4; // Slightly faster
          return {
            ...sailor,
            x: sailor.x + (dx / dist) * speed,
            y: sailor.y + (dy / dist) * speed
          };
        })
      );
    }, 50);

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
      const sourceZone = zones.find(z => z.id === selectedZone);
      if (!sourceZone) return;

      addLog(`Приказ: Идти из ${sourceZone.name} в ${zone.name}!`);

      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          const dx = sailor.x - sourceZone.x;
          const dy = sailor.y - sourceZone.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 60 && sailor.team === 'player') {
            return { 
              ...sailor, 
              targetX: zone.x + (Math.random() * 50 - 25), 
              targetY: zone.y + (Math.random() * 50 - 25) 
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

      addLog(`Приказ: Всем стягиваться в точку (${Math.floor(clickX)}, ${Math.floor(clickY)})!`);

      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          if (sailor.team === 'player') {
            return { 
              ...sailor, 
              targetX: clickX + (Math.random() * 40 - 20), 
              targetY: clickY + (Math.random() * 40 - 20) 
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
               <h1 className="text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500">Вертикальное Сражение</h1>
            </div>
            <div className="text-xs text-amber-500/60">
               Наш корабль СВЕРХУ. Враг СНИЗУ. <br />
               Корабли увеличены для удобства!
            </div>
         </div>

         {/* Arena and Journal */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Arena (900x800 - Taller) */}
            <div 
               ref={arenaRef}
               onClick={handleArenaClick}
               className="lg:col-span-9 bg-gradient-to-b from-[#110a03] to-black rounded-[3rem] border-2 border-amber-500/20 relative h-[800px] overflow-hidden cursor-crosshair"
            >
               {/* Grid background */}
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
               
               {/* Vertical Bridges (Абордажные мостики) */}
               <div className="absolute top-[350px] left-[300px] w-[40px] h-[100px] bg-amber-900/40 border-l-2 border-r-2 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center">
                  <span className="text-[8px] font-black uppercase text-amber-500/60 rotate-90">Мостик 1</span>
               </div>
               <div className="absolute top-[350px] left-[600px] w-[40px] h-[100px] bg-amber-900/40 border-l-2 border-r-2 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center">
                  <span className="text-[8px] font-black uppercase text-amber-500/60 rotate-90">Мостик 2</span>
               </div>

               {/* PLAYER SHIP HULL (Horizontal, on top) */}
               <div className="absolute top-[100px] left-[100px] w-[700px] h-[200px] border-4 border-cyan-500/20 rounded-[50px] bg-cyan-900/5 pointer-events-none">
                  <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 text-cyan-400 font-black uppercase text-sm">Твой Флагман (Огромный)</div>
               </div>

               {/* ENEMY SHIP HULL (Horizontal, on bottom) */}
               <div className="absolute top-[500px] left-[100px] w-[700px] h-[200px] border-4 border-red-500/20 rounded-[50px] bg-red-900/5 pointer-events-none">
                  <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-red-400 font-black uppercase text-sm">Вражеский Галеон (Огромный)</div>
               </div>

               {/* Zones (Clickable Areas) */}
               {zones.map(zone => {
                  const isSelected = selectedZone === zone.id;
                  return (
                     <div 
                        key={zone.id}
                        onClick={(e) => {
                           e.stopPropagation();
                           handleZoneClick(zone.id);
                        }}
                        className={cn(
                          "absolute -translate-x-1/2 -translate-y-1/2 p-5 rounded-2xl border-2 transition-all cursor-pointer",
                          isSelected ? "border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "border-white/10 bg-black/60 hover:border-white/30",
                          zone.team === 'player' ? "hover:border-cyan-500/50" : "hover:border-red-500/50"
                        )}
                        style={{ left: zone.x, top: zone.y }}
                     >
                        {/* VERY LARGE TEXT */}
                        <p className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-lg">{zone.name}</p>
                        <p className="text-xs text-slate-400 uppercase font-black">{zone.team === 'player' ? 'Наш сектор' : 'Враг'}</p>
                     </div>
                  );
               })}

               {/* Sailors (Dots moving in real time) */}
               {sailors.map(sailor => (
                  <div
                     key={sailor.id}
                     className={cn("w-3.5 h-3.5 rounded-full absolute transition-all duration-500 ease-linear shadow-lg", sailor.color)}
                     style={{ 
                        left: `${sailor.x}px`, 
                        top: `${sailor.y}px`,
                        transform: 'translate(-50%, -50%)'
                     }}
                  />
               ))}

            </div>

            {/* Right: Journal */}
            <div className="lg:col-span-3 h-[800px] flex flex-col">
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
