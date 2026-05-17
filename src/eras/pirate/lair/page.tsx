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
  state: 'idle' | 'moving' | 'fighting' | 'retreating' | 'ambushing' | 'shooting';
  path: { x: number, y: number }[];
  hp: number;
  type: 'swordsman' | 'gunner' | 'sapper';
}

interface Cannonball {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
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
  const [cannonballs, setCannonballs] = useState<Cannonball[]>([]);
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
  const [stats, setStats] = useState({ playerCasualties: 0, enemyCasualties: 0, playerShipHp: 100, enemyShipHp: 100 });

  // Initialize sailors
  useEffect(() => {
    const initialSailors: Sailor[] = [];
    let id = 0;

    zones.forEach(zone => {
      // Swordsmen
      for (let i = 0; i < zone.crewTypes.swordsmen; i++) {
        initialSailors.push({ id: id++, x: zone.x + (Math.random() * 60 - 30), y: zone.y + (Math.random() * 60 - 30), targetX: zone.x, targetY: zone.y, color: zone.team === 'player' ? 'bg-cyan-400' : 'bg-red-500', team: zone.team, state: 'idle', path: [], hp: 100, type: 'swordsman' });
      }
      // Gunners
      for (let i = 0; i < zone.crewTypes.gunners; i++) {
        initialSailors.push({ id: id++, x: zone.x + (Math.random() * 60 - 30), y: zone.y + (Math.random() * 60 - 30), targetX: zone.x, targetY: zone.y, color: zone.team === 'player' ? 'bg-amber-400' : 'bg-orange-500', team: zone.team, state: 'idle', path: [], hp: 100, type: 'gunner' });
      }
      // Sappers
      for (let i = 0; i < zone.crewTypes.sappers; i++) {
        initialSailors.push({ id: id++, x: zone.x + (Math.random() * 60 - 30), y: zone.y + (Math.random() * 60 - 30), targetX: zone.x, targetY: zone.y, color: zone.team === 'player' ? 'bg-purple-400' : 'bg-pink-500', team: zone.team, state: 'idle', path: [], hp: 100, type: 'sapper' });
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
          
          const speed = sailor.state === 'retreating' ? 2 : 1; // EVEN SLOWER
          return {
            ...sailor,
            x: sailor.x + (dx / dist) * speed,
            y: sailor.y + (dy / dist) * speed,
            path: newPath
          };
        });

        // 2. Fighting & Shooting Logic
        const updatedSailors = [...movedSailors];
        let pCas = 0;
        let eCas = 0;

        for (let i = 0; i < updatedSailors.length; i++) {
          const s1 = updatedSailors[i];
          for (let j = 0; j < updatedSailors.length; j++) {
            const s2 = updatedSailors[j];

            if (s1.team !== s2.team) {
              const dx = s1.x - s2.x;
              const dy = s1.y - s2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // Melee combat
              if (dist < 20 && s1.type === 'swordsman') {
                s1.state = 'fighting';
                s2.state = 'fighting';
                s1.hp -= 3;
                s2.hp -= 3;
              }

              // Ranged combat (Gunners)
              if (dist < 150 && dist > 50 && s1.type === 'gunner' && Math.random() < 0.05) {
                s1.state = 'shooting';
                s2.hp -= 10; // High damage but slow
              }
            }
          }

          // FIX: Retreat pathfinding through bridge!
          if (s1.hp < 30 && s1.state !== 'retreating') {
            s1.state = 'retreating';
            const homeZone = zones.find(z => z.team === s1.team);
            if (homeZone) {
              // Use getBridgePath for retreat!
              s1.path = getBridgePath(s1.x, homeZone.x, homeZone.x, homeZone.y);
              s1.targetX = homeZone.x;
              s1.targetY = homeZone.y;
            }
          }
        }

        // Filter out dead
        return updatedSailors.filter(s => {
          if (s.hp <= 0) {
            if (s.team === 'player') pCas++;
            else eCas++;
            return false;
          }
          return true;
        });
      });

      // Move Cannonballs
      setCannonballs(prev => 
        prev.map(ball => {
          const dx = ball.targetX - ball.x;
          const dy = ball.targetY - ball.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 10) return null; // Explode
          return { ...ball, x: ball.x + (dx / dist) * 15, y: ball.y + (dy / dist) * 15 };
        }).filter(Boolean) as Cannonball[]
      );

    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Auto AI Director & Cannon Fire
  useEffect(() => {
    if (!battleStarted) return;

    const aiInterval = setInterval(() => {
      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          if (sailor.state !== 'idle') return sailor;

          const coin = Math.random();
          
          // Attack! (Cross bridge)
          if (coin < 0.15) {
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
          
          // Move inside own ship
          if (coin < 0.4) {
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

          return sailor;
        })
      );

      // Cannon fire simulation
      if (Math.random() < 0.3) {
        const playerCannons = zones.filter(z => z.team === 'player' && z.id.includes('cannons'));
        const enemyCannons = zones.filter(z => z.team === 'enemy' && z.id.includes('battery'));
        
        if (playerCannons.length > 0 && enemyCannons.length > 0) {
          const pSource = playerCannons[Math.floor(Math.random() * playerCannons.length)];
          const eSource = enemyCannons[Math.floor(Math.random() * enemyCannons.length)];

          setCannonballs(prev => [
            ...prev,
            { id: Math.random(), x: pSource.x, y: pSource.y, targetX: eSource.x, targetY: eSource.y },
            { id: Math.random(), x: eSource.x, y: eSource.y, targetX: pSource.x, targetY: pSource.y }
          ]);

          setStats(prev => ({
            ...prev,
            playerShipHp: Math.max(0, prev.playerShipHp - 2),
            enemyShipHp: Math.max(0, prev.enemyShipHp - 2)
          }));
        }
      }

    }, 3000);

    return () => clearInterval(aiInterval);
  }, [battleStarted]);

  return (
    <div className="relative min-h-screen bg-[#030303] text-amber-100 font-sans overflow-x-hidden p-6 md:p-12">
      
      {/* Huge Glowing Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[700px] h-[700px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">
         
         {/* Scoreboard with HP Bars */}
         <div className="bg-gradient-to-r from-[#110a03] via-black to-[#110a03] border border-amber-500/20 rounded-2xl p-6 flex justify-between items-center shadow-2xl">
            <div className="flex flex-col gap-2 w-[250px]">
               <div className="flex justify-between text-xs">
                  <span className="text-cyan-400 font-black uppercase">Флагман</span>
                  <span>{stats.playerShipHp}%</span>
               </div>
               <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${stats.playerShipHp}%` }} />
               </div>
               <p className="text-[10px] text-slate-500">Живых: {sailors.filter(s => s.team === 'player').length}</p>
            </div>

            <div className="flex flex-col items-center">
               <h1 className="text-2xl font-serif font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500">Генеральное Сражение</h1>
               <button 
                  onClick={() => setBattleStarted(!battleStarted)}
                  className={cn(
                    "mt-2 px-5 py-2 rounded-xl font-black uppercase text-xs tracking-wider transition-all hover:scale-105 shadow-lg flex items-center gap-2",
                    battleStarted ? "bg-red-600 text-white" : "bg-gradient-to-r from-amber-500 to-orange-600 text-black"
                  )}
               >
                  {battleStarted ? <Pause size={14} /> : <Play size={14} />}
                  {battleStarted ? "ПАУЗА" : "В БОЙ"}
               </button>
            </div>

            <div className="flex flex-col gap-2 w-[250px]">
               <div className="flex justify-between text-xs">
                  <span className="text-red-500 font-black uppercase">Линкор Врага</span>
                  <span>{stats.enemyShipHp}%</span>
               </div>
               <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${stats.enemyShipHp}%` }} />
               </div>
               <p className="text-[10px] text-slate-500 text-right">Живых: {sailors.filter(s => s.team === 'enemy').length}</p>
            </div>
         </div>

         {/* Arena */}
         <div className="relative flex justify-center">
            <div 
               ref={arenaRef}
               className="bg-gradient-to-b from-[#0a0602] to-black rounded-[2.5rem] border border-amber-500/20 relative h-[1000px] w-[1200px] overflow-hidden shadow-2xl"
            >
               {/* Grid background */}
               <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
               
               {/* Bridge */}
               <div className="absolute top-[480px] left-[500px] w-[150px] h-[40px] bg-amber-900/60 border-t border-b border-amber-500/30 flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-amber-500/40 tracking-widest">Абордажный Мост</span>
               </div>

               {/* PLAYER SHIP HULL */}
               <div className="absolute top-[50px] left-[150px] w-[350px] h-[850px] border-2 border-cyan-500/20 rounded-[80px] bg-cyan-900/5 pointer-events-none"></div>

               {/* ENEMY SHIP HULL */}
               <div className="absolute top-[25px] left-[650px] w-[400px] h-[900px] border-2 border-red-500/20 rounded-[100px_100px_40px_40px] bg-red-900/5 pointer-events-none"></div>

               {/* Zones */}
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

               {/* Sailors */}
               {sailors.map(sailor => (
                  <div
                     key={sailor.id}
                     className={cn(
                       "w-2.5 h-2.5 rounded-full absolute transition-all duration-300 ease-linear shadow-lg", 
                       sailor.color,
                       sailor.state === 'fighting' && "animate-pulse scale-150",
                       sailor.state === 'shooting' && "animate-ping"
                     )}
                     style={{ 
                        left: `${sailor.x}px`, 
                        top: `${sailor.y}px`,
                        transform: 'translate(-50%, -50%)'
                     }}
                  />
               ))}

               {/* Cannonballs */}
               {cannonballs.map(ball => (
                  <div 
                     key={ball.id}
                     className="w-4 h-4 bg-yellow-500 rounded-full absolute shadow-[0_0_10px_#f59e0b] transition-all duration-50 ease-linear"
                     style={{ left: `${ball.x}px`, top: `${ball.y}px`, transform: 'translate(-50%, -50%)' }}
                  />
               ))}

            </div>
         </div>

         {/* BRIGHTER & MORE INFORMATIVE MODAL */}
         <AnimatePresence>
            {activeModalZone && (
               <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <motion.div 
                     initial={{ opacity: 0, translateY: 50 }}
                     animate={{ opacity: 1, translateY: 0 }}
                     exit={{ opacity: 0, translateY: 50 }}
                     className="bg-gradient-to-br from-[#2a1704] via-[#110a03] to-black border-2 border-amber-500/50 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] relative"
                  >
                     <button 
                        onClick={() => setActiveModalZone(null)}
                        className="absolute top-6 right-6 text-amber-500 hover:text-white transition-colors"
                     >
                        <X size={24} />
                     </button>

                     {(() => {
                        const zone = zones.find(z => z.id === activeModalZone);
                        if (!zone) return null;
                        const zoneSailors = sailors.filter(s => s.team === zone.team && Math.sqrt(Math.pow(s.x - zone.x, 2) + Math.pow(s.y - zone.y, 2)) < 50);
                        
                        return (
                           <div className="space-y-8">
                              <div className="text-center">
                                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 mb-1">Информация об отсеке</p>
                                 <h4 className="text-4xl font-serif font-black text-white uppercase tracking-tighter glow-text">{zone.name}</h4>
                              </div>

                              {/* Stats Cards */}
                              <div className="grid grid-cols-3 gap-4">
                                 <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                    <Sword size={20} className="text-cyan-400 mx-auto mb-2" />
                                    <p className="text-[10px] uppercase text-slate-400">Головорезы</p>
                                    <p className="text-xl font-black text-white">{zone.crewTypes.swordsmen}</p>
                                 </div>
                                 <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                    <Target size={20} className="text-amber-500 mx-auto mb-2" />
                                    <p className="text-[10px] uppercase text-slate-400">Стрелки</p>
                                    <p className="text-xl font-black text-white">{zone.crewTypes.gunners}</p>
                                 </div>
                                 <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                                    <Bomb size={20} className="text-purple-500 mx-auto mb-2" />
                                    <p className="text-[10px] uppercase text-slate-400">Мастера</p>
                                    <p className="text-xl font-black text-white">{zone.crewTypes.sappers}</p>
                                 </div>
                              </div>

                              {/* Detailed Info */}
                              <div className="space-y-3">
                                 <h5 className="text-[10px] font-black uppercase text-amber-500/60 tracking-wider">Текущее состояние</h5>
                                 <div className="bg-black/60 p-4 rounded-xl border border-amber-500/10 space-y-2">
                                    <div className="flex justify-between text-sm">
                                       <span className="text-slate-400">Боеспособность:</span>
                                       <span className="text-emerald-400 font-bold">Высокая</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                       <span className="text-slate-400">Мораль:</span>
                                       <span className="text-emerald-400 font-bold">Рвутся в бой</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                       <span className="text-slate-400">Приказ:</span>
                                       <span className="text-amber-500 font-bold">Оборона сектора / Поддержка</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Lore / Flavor Text */}
                              <p className="text-sm text-amber-100/70 font-sans italic text-center leading-relaxed">
                                 "Этот сектор критически важен для контроля над кораблем. Бойцы здесь знают свое дело и будут стоять до последнего."
                              </p>

                              <button 
                                 onClick={() => setActiveModalZone(null)}
                                 className="w-full p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all hover:scale-[1.02] shadow-[0_5px_15px_rgba(245,158,11,0.3)]"
                              >
                                 Вернуться к бою
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
