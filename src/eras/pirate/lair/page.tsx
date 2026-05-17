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
    "Вы сошлись бортами с тяжелым боевым галеоном!",
    "Вражеская команда суетится на палубе. Готовьтесь к бою."
  ]);
  
  const arenaRef = useRef<HTMLDivElement>(null);
  const [sailors, setSailors] = useState<Sailor[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Define zones for DIFFERENT ships
  // Arena size: 1000x800
  const zones: Zone[] = [
    // Player Ship (Left) - Center X=300, Width=260
    { id: 'p_helm', name: 'Каюта Капитана', x: 300, y: 120, team: 'player' },
    { id: 'p_masts', name: 'Грот-Мачта', x: 300, y: 250, team: 'player' },
    { id: 'p_cannons_l', name: 'Батарея Слева', x: 220, y: 400, team: 'player' },
    { id: 'p_cannons_r', name: 'Батарея Справа', x: 380, y: 400, team: 'player' },
    { id: 'p_deck', name: 'Палуба', x: 300, y: 550, team: 'player' },
    { id: 'p_hold', name: 'Трюм', x: 300, y: 680, team: 'player' },
    
    // Enemy Ship (Right) - Center X=725, Width=320 (Larger and wider!)
    { id: 'e_cabin', name: 'Адмиральский Мостик', x: 725, y: 100, team: 'enemy' },
    { id: 'e_battery', name: 'Тяжелая Батарея', x: 725, y: 220, team: 'enemy' },
    { id: 'e_deck_f', name: 'Носовая Палуба', x: 650, y: 380, team: 'enemy' },
    { id: 'e_deck_b', name: 'Кормовая Палуба', x: 800, y: 380, team: 'enemy' },
    { id: 'e_barracks', name: 'Казармы', x: 725, y: 520, team: 'enemy' },
    { id: 'e_hold', name: 'Пороховой Погреб', x: 725, y: 680, team: 'enemy' },
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
          x: zone.x + (Math.random() * 40 - 20),
          y: zone.y + (Math.random() * 40 - 20),
          targetX: zone.x,
          targetY: zone.y,
          color: 'bg-cyan-400 shadow-cyan-500/50',
          team: 'player'
        });
      }
    });

    // Enemy sailors (More of them!)
    zones.filter(z => z.team === 'enemy').forEach(zone => {
      for (let i = 0; i < 8; i++) {
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
          
          const speed = 3;
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

  // Enemy AI Movement
  useEffect(() => {
    const enemyMoveInterval = setInterval(() => {
      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          if (sailor.team === 'enemy' && Math.random() < 0.15) { // 15% chance to move
            const enemyZonesList = zones.filter(z => z.team === 'enemy');
            const randomZone = enemyZonesList[Math.floor(Math.random() * enemyZonesList.length)];
            return { 
              ...sailor, 
              targetX: randomZone.x + (Math.random() * 50 - 25), 
              targetY: randomZone.y + (Math.random() * 50 - 25) 
            };
          }
          return sailor;
        })
      );
    }, 3000); // Every 3 seconds

    return () => clearInterval(enemyMoveInterval);
  }, []);

  const addLog = (msg: string) => {
    setBattleLog(prev => [...prev, msg]);
  };

  const handleZoneClick = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    if (!selectedZone) {
      setSelectedZone(zoneId);
      addLog(`Выбран сектор: ${zone.name}.`);
    } else {
      const sourceZone = zones.find(z => z.id === selectedZone);
      if (!sourceZone) return;

      if (sourceZone.id === zone.id) {
        setSelectedZone(null);
        return;
      }

      // Count sailors in source zone
      const sailorsInSource = sailors.filter(s => 
        s.team === 'player' && 
        Math.sqrt(Math.pow(s.x - sourceZone.x, 2) + Math.pow(s.y - sourceZone.y, 2)) < 60
      );

      if (sailorsInSource.length === 0) {
        addLog(`❌ В секторе ${sourceZone.name} нет людей!`);
        setSelectedZone(null);
        return;
      }

      // Move HALF
      const amountToMove = Math.ceil(sailorsInSource.length / 2);
      let movedCount = 0;

      addLog(`Приказ: ${amountToMove} матросов идут из ${sourceZone.name} в ${zone.name}.`);

      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          const dx = sailor.x - sourceZone.x;
          const dy = sailor.y - sourceZone.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 60 && sailor.team === 'player' && movedCount < amountToMove) {
            movedCount++;
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

  return (
    <div className="relative min-h-screen bg-[#030303] text-amber-100 font-serif overflow-x-hidden p-6 md:p-12">
      
      {/* Huge Glowing Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
         
         {/* Header */}
         <div className="flex justify-between items-center border-b border-amber-500/20 pb-4">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Симуляция Абордажа</p>
               <h1 className="text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500">Маневры и Захват</h1>
            </div>
            <div className="text-xs text-amber-500/40 text-right">
               Корабли увеличены. Враги теперь тоже двигаются! <br />
               Разная форма и строение кораблей.
            </div>
         </div>

         {/* Arena and Journal */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Arena (1000x800) */}
            <div 
               ref={arenaRef}
               className="lg:col-span-9 bg-gradient-to-b from-[#0a0602] to-black rounded-[2rem] border border-amber-500/20 relative h-[800px] overflow-hidden"
            >
               {/* Grid background */}
               <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
               
               {/* Bridge (Мостик) */}
               <div className="absolute top-[380px] left-[430px] w-[140px] h-[40px] bg-amber-900/40 border-t border-b border-amber-500/30 flex items-center justify-center">
                  <span className="text-[9px] font-black uppercase text-amber-500/40">Абордажный Мостик</span>
               </div>

               {/* PLAYER SHIP HULL (Classic Rounded Galleon) */}
               <div className="absolute top-[80px] left-[150px] w-[300px] h-[640px] border-2 border-cyan-500/20 rounded-[80px] bg-cyan-900/5 pointer-events-none">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-cyan-400 font-black uppercase text-[10px] tracking-wider">Наш Галеон</div>
                  {/* Internal grid for structure */}
                  <div className="absolute inset-0 border-t-2 border-dashed border-cyan-500/10 top-1/3" />
                  <div className="absolute inset-0 border-t-2 border-dashed border-cyan-500/10 top-2/3" />
               </div>

               {/* ENEMY SHIP HULL (Larger, Wider Warship with Sharp Bow) */}
               <div className="absolute top-[50px] left-[550px] w-[350px] h-[700px] border-2 border-red-500/20 rounded-[120px_120px_40px_40px] bg-red-900/5 pointer-events-none">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-red-400 font-black uppercase text-[10px] tracking-wider">Вражеский Линкор</div>
                  {/* Different internal structure */}
                  <div className="absolute inset-0 border-t-2 border-dashed border-red-500/10 top-1/4" />
                  <div className="absolute inset-0 border-t-2 border-dashed border-red-500/10 top-1/2" />
                  <div className="absolute inset-0 border-t-2 border-dashed border-red-500/10 top-3/4" />
               </div>

               {/* Zones (Clickable Areas) */}
               {zones.map(zone => {
                  const isSelected = selectedZone === zone.id;
                  const count = sailors.filter(s => s.team === zone.team && Math.sqrt(Math.pow(s.x - zone.x, 2) + Math.pow(s.y - zone.y, 2)) < 50).length;
                  
                  return (
                     <div 
                        key={zone.id}
                        onClick={(e) => {
                           e.stopPropagation();
                           handleZoneClick(zone.id);
                        }}
                        className={cn(
                          "absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl border transition-all cursor-pointer w-[130px] text-center",
                          isSelected ? "border-amber-400 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "border-white/5 bg-black/80 hover:border-white/20",
                          zone.team === 'player' ? "hover:border-cyan-500/30" : "hover:border-red-500/30"
                        )}
                        style={{ left: zone.x, top: zone.y }}
                     >
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{zone.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{count} чел.</p>
                     </div>
                  );
               })}

               {/* Sailors (Dots moving in real time) */}
               {sailors.map(sailor => (
                  <div
                     key={sailor.id}
                     className={cn("w-2.5 h-2.5 rounded-full absolute transition-all duration-500 ease-linear shadow-lg", sailor.color)}
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
               <div className="bg-gradient-to-br from-[#110a03] to-black p-6 rounded-[2rem] border border-amber-500/20 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 border-b border-amber-500/10 pb-3 mb-3">
                     <Scroll size={16} className="text-amber-500" />
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Журнал Капитана</h4>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 text-[11px] text-amber-100/70 font-sans leading-relaxed">
                     {battleLog.map((log, i) => (
                        <div key={i} className="border-b border-amber-900/5 pb-1.5 flex gap-1.5">
                           <span className="text-amber-500/50">&gt;</span>
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
