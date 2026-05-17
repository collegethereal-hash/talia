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
  isAmbush: boolean;
  isTrap: boolean;
}

export default function LairPage() {
  const [battleLog, setBattleLog] = useState<string[]>([
    "Вы сошлись бортами. Корабли огромны. Приказы отдаются по секциям.",
    "Кликните на сектор своего корабля для открытия тактического меню."
  ]);
  
  const arenaRef = useRef<HTMLDivElement>(null);
  const [sailors, setSailors] = useState<Sailor[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [activePanelZone, setActivePanelZone] = useState<string | null>(null);

  // Define zones with complex state
  // Arena size: 1200x1000
  const [zones, setZones] = useState<Zone[]>([
    // Player Ship (Left) - Center X=350, Width=320, Height=800 (Huge!)
    { id: 'p_helm', name: 'Капитанский Мостик', x: 350, y: 150, team: 'player', crewTypes: { swordsmen: 2, gunners: 3, sappers: 0 }, isAmbush: false, isTrap: false },
    { id: 'p_masts', name: 'Грот-Мачта', x: 350, y: 300, team: 'player', crewTypes: { swordsmen: 5, gunners: 5, sappers: 2 }, isAmbush: false, isTrap: false },
    { id: 'p_cannons_l', name: 'Батарея Слева', x: 250, y: 450, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 }, isAmbush: false, isTrap: false },
    { id: 'p_cannons_r', name: 'Батарея Справа', x: 450, y: 450, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 }, isAmbush: false, isTrap: false },
    { id: 'p_deck', name: 'Центральная Палуба', x: 350, y: 600, team: 'player', crewTypes: { swordsmen: 15, gunners: 5, sappers: 5 }, isAmbush: false, isTrap: false },
    { id: 'p_hold', name: 'Трюм (Арсенал)', x: 350, y: 750, team: 'player', crewTypes: { swordsmen: 5, gunners: 2, sappers: 10 }, isAmbush: false, isTrap: false },
    
    // Enemy Ship (Right) - Center X=850, Width=360, Height=850 (Even Huger!)
    { id: 'e_cabin', name: 'Адмиральская Каюта', x: 850, y: 120, team: 'enemy', crewTypes: { swordsmen: 5, gunners: 5, sappers: 0 }, isAmbush: false, isTrap: false },
    { id: 'e_battery', name: 'Тяжелая Батарея', x: 850, y: 280, team: 'enemy', crewTypes: { swordsmen: 0, gunners: 15, sappers: 0 }, isAmbush: false, isTrap: false },
    { id: 'e_deck_f', name: 'Носовая Палуба', x: 750, y: 450, team: 'enemy', crewTypes: { swordsmen: 10, gunners: 5, sappers: 2 }, isAmbush: false, isTrap: false },
    { id: 'e_deck_b', name: 'Кормовая Палуба', x: 950, y: 450, team: 'enemy', crewTypes: { swordsmen: 10, gunners: 5, sappers: 2 }, isAmbush: false, isTrap: false },
    { id: 'e_barracks', name: 'Казармы', x: 850, y: 620, team: 'enemy', crewTypes: { swordsmen: 20, gunners: 0, sappers: 0 }, isAmbush: false, isTrap: false },
    { id: 'e_hold', name: 'Пороховой Погреб', x: 850, y: 780, team: 'enemy', crewTypes: { swordsmen: 2, gunners: 2, sappers: 10 }, isAmbush: false, isTrap: false },
  ]);

  // Initialize sailors based on zone crewTypes
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
          team: zone.team
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
          
          const speed = 4;
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

    if (zone.team === 'player') {
      setActivePanelZone(zoneId);
      addLog(`Открыт тактический обзор сектора: ${zone.name}.`);
    } else {
      addLog(`Это вражеский сектор: ${zone.name}. Вы можете атаковать его.`);
    }
  };

  const toggleAmbush = (zoneId: string) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, isAmbush: !z.isAmbush } : z));
    const zone = zones.find(z => z.id === zoneId);
    addLog(`Засада в секторе ${zone?.name} ${!zone?.isAmbush ? 'УСТАНОВЛЕНА' : 'СНЯТА'}.`);
  };

  const toggleTrap = (zoneId: string) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, isTrap: !z.isTrap } : z));
    const zone = zones.find(z => z.id === zoneId);
    addLog(`Ловушка в секторе ${zone?.name} ${!zone?.isTrap ? 'УСТАНОВЛЕНА' : 'СНЯТА'}.`);
  };

  return (
    <div className="relative min-h-screen bg-[#020202] text-amber-100 font-serif overflow-x-hidden p-6 md:p-12">
      
      {/* Huge Glowing Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-6">
         
         {/* Header */}
         <div className="flex justify-between items-center border-b border-amber-500/20 pb-4">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Глобальная Тактика</p>
               <h1 className="text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500">Симуляция Сражения</h1>
            </div>
            <div className="text-xs text-amber-500/40 text-right">
               Корабли стали ГИГАНТСКИМИ. <br />
               Нажимайте на сектора для детального управления.
            </div>
         </div>

         {/* Main Layout: Arena + Side Panel */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Arena (1200x1000 - Super Large) */}
            <div 
               ref={arenaRef}
               className="lg:col-span-9 bg-gradient-to-b from-[#0a0602] to-black rounded-[2.5rem] border border-amber-500/20 relative h-[1000px] overflow-hidden"
            >
               {/* Grid background */}
               <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
               
               {/* Bridge (Мостик) */}
               <div className="absolute top-[480px] left-[510px] w-[180px] h-[40px] bg-amber-900/40 border-t border-b border-amber-500/30 flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-amber-500/40">Абордажный Переход</span>
               </div>

               {/* PLAYER SHIP HULL (Huge Vertical) */}
               <div className="absolute top-[50px] left-[150px] w-[350px] h-[850px] border-2 border-cyan-500/20 rounded-[80px] bg-cyan-900/5 pointer-events-none">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-cyan-400 font-black uppercase text-xs tracking-wider">Наш Линейный Галеон</div>
                  {/* Internal grid lines */}
                  <div className="absolute inset-0 border-t border-dashed border-cyan-500/10 top-1/4" />
                  <div className="absolute inset-0 border-t border-dashed border-cyan-500/10 top-1/2" />
                  <div className="absolute inset-0 border-t border-dashed border-cyan-500/10 top-3/4" />
               </div>

               {/* ENEMY SHIP HULL (Even Huger!) */}
               <div className="absolute top-[25px] left-[650px] w-[400px] h-[900px] border-2 border-red-500/20 rounded-[100px_100px_40px_40px] bg-red-900/5 pointer-events-none">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-red-400 font-black uppercase text-xs tracking-wider">Проклятый Линкор Врага</div>
                  {/* Different structure */}
                  <div className="absolute inset-0 border-t border-dashed border-red-500/10 top-1/5" />
                  <div className="absolute inset-0 border-t border-dashed border-red-500/10 top-2/5" />
                  <div className="absolute inset-0 border-t border-dashed border-red-500/10 top-3/5" />
                  <div className="absolute inset-0 border-t border-dashed border-red-500/10 top-4/5" />
               </div>

               {/* Zones (Clickable Areas) */}
               {zones.map(zone => {
                  const isSelected = activePanelZone === zone.id;
                  const totalCrew = zone.crewTypes.swordsmen + zone.crewTypes.gunners + zone.crewTypes.sappers;
                  
                  return (
                     <div 
                        key={zone.id}
                        onClick={(e) => {
                           e.stopPropagation();
                           handleZoneClick(zone.id);
                        }}
                        className={cn(
                          "absolute -translate-x-1/2 -translate-y-1/2 p-4 rounded-xl border transition-all cursor-pointer w-[140px] text-center",
                          isSelected ? "border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "border-white/5 bg-black/80 hover:border-white/20",
                          zone.team === 'player' ? "hover:border-cyan-500/30" : "hover:border-red-500/30",
                          zone.isAmbush && "border-yellow-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
                          zone.isTrap && "border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                        )}
                        style={{ left: zone.x, top: zone.y }}
                     >
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{zone.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{totalCrew} чел.</p>
                        
                        {/* Status Icons */}
                        <div className="flex justify-center gap-1 mt-1">
                           {zone.isAmbush && <Eye size={10} className="text-yellow-500" />}
                           {zone.isTrap && <ShieldAlert size={10} className="text-purple-500" />}
                        </div>
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

            {/* Right Side: Detailed Control Panel */}
            <div className="lg:col-span-3 h-[1000px] flex flex-col gap-6">
               
               {/* Detailed Zone Panel */}
               <div className="bg-gradient-to-br from-[#110a03] to-black p-6 rounded-[2rem] border border-amber-500/20 flex-1 flex flex-col shadow-2xl">
                  {activePanelZone ? (
                     (() => {
                        const zone = zones.find(z => z.id === activePanelZone);
                        if (!zone) return null;
                        return (
                           <div className="space-y-6 flex-1 flex flex-col">
                              <div className="border-b border-amber-500/10 pb-4">
                                 <h4 className="text-xl font-black text-white uppercase tracking-tighter">{zone.name}</h4>
                                 <p className="text-xs text-amber-500/60 font-sans mt-1">Тактическое управление сектором</p>
                              </div>

                              {/* Crew Breakdown */}
                              <div className="space-y-3">
                                 <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Состав Отряда</h5>
                                 <div className="grid grid-cols-1 gap-2">
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
                              </div>

                              {/* Commands (The serious logic) */}
                              <div className="space-y-3 flex-1">
                                 <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Приказы и Тактика</h5>
                                 
                                 {/* Ambush Checkbox-like button */}
                                 <button 
                                    onClick={() => toggleAmbush(zone.id)}
                                    className={cn(
                                      "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                                      zone.isAmbush ? "border-yellow-500 bg-yellow-500/10" : "border-white/10 bg-black/40 hover:border-white/20"
                                    )}
                                 >
                                    <div>
                                       <p className="text-sm font-bold text-white">Устроить засаду</p>
                                       <p className="text-[10px] text-slate-400 mt-1">Скрытый урон при входе врага</p>
                                    </div>
                                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center", zone.isAmbush ? "bg-yellow-500 border-yellow-500" : "border-white/30")}>
                                       {zone.isAmbush && <X size={12} className="text-black font-black" />}
                                    </div>
                                 </button>

                                 {/* Trap Checkbox-like button */}
                                 <button 
                                    onClick={() => toggleTrap(zone.id)}
                                    className={cn(
                                      "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                                      zone.isTrap ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-black/40 hover:border-white/20"
                                    )}
                                 >
                                    <div>
                                       <p className="text-sm font-bold text-white">Поставить ловушку</p>
                                       <p className="text-[10px] text-slate-400 mt-1">Замедляет врагов в секторе</p>
                                    </div>
                                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center", zone.isTrap ? "bg-purple-500 border-purple-500" : "border-white/30")}>
                                       {zone.isTrap && <X size={12} className="text-black font-black" />}
                                    </div>
                                 </button>

                                 {/* Attack Action */}
                                 <button className="w-full p-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500 text-left transition-all flex items-center justify-between group">
                                    <div>
                                       <p className="text-sm font-bold text-white">Атаковать Врага</p>
                                       <p className="text-[10px] text-red-400 mt-1">Послать людей на вражеский корабль</p>
                                    </div>
                                    <ChevronRight size={16} className="text-red-500 group-hover:translate-x-1 transition-transform" />
                                 </button>
                              </div>

                              <button 
                                 onClick={() => setActivePanelZone(null)}
                                 className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-slate-400 transition-all"
                              >
                                 Закрыть Обзор
                              </button>
                           </div>
                        );
                     })()
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600">
                        <Compass size={40} className="mb-4 opacity-20" />
                        <p className="text-sm">Выберите сектор своего корабля,<br />чтобы отдать приказы</p>
                     </div>
                  )}
               </div>

               {/* Mini Journal at the bottom */}
               <div className="bg-gradient-to-br from-[#0a0501] to-black p-4 rounded-[2rem] border border-amber-500/20 h-[300px] flex flex-col">
                  <div className="flex items-center gap-2 border-b border-amber-500/10 pb-2 mb-2">
                     <Scroll size={14} className="text-amber-500" />
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Журнал</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 text-[10px] text-amber-100/70 font-sans leading-relaxed">
                     {battleLog.map((log, i) => (
                        <div key={i} className="border-b border-amber-900/5 pb-1 flex gap-1">
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
