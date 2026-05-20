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

type Fighter = {
  id: string;
  side: 'player' | 'enemy';
  zoneY: number; // Y% of their initial zone (15, 45, 75)
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  jitterX: number[];
  jitterY: number[];
  duration: number;
  isDead?: boolean;
};

const getOffset = (i: number) => {
  const r = ((i * 137.5) % 25);
  const theta = i * 2.39996;
  const dx = r * Math.cos(theta);
  const dy = r * Math.sin(theta);
  return { dx, dy };
};

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
  const [battlePhase, setBattlePhase] = useState<'idle' | 'gathering' | 'moving_to_bridge' | 'fighting' | 'returning'>('idle');
  const [activeFighters, setActiveFighters] = useState<Fighter[]>([]);

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
    const totalPlayer = playerCrew.helm + playerCrew.cannons + playerCrew.deck;
    if (totalPlayer < 5) {
      addLog("❌ Слишком мало людей для абордажа!");
      return;
    }
    if (isAttacking) return;

    setIsAttacking(true);
    addLog("⚔️ АБОРДАЖ! Вся команда срывается на мост!");

    const generateJitter = (range: number) => {
      const arr = [0];
      for (let k = 0; k < 8; k++) arr.push(Math.random() * range - range / 2);
      arr.push(0);
      return arr;
    };

    const pFighters: Fighter[] = [];
    ['helm', 'cannons', 'deck'].forEach(zoneId => {
       const count = playerCrew[zoneId];
       const startY = zoneId === 'helm' ? 15 : zoneId === 'cannons' ? 45 : 75;
       for (let i = 0; i < count; i++) {
          const { dx, dy } = getOffset(i);
          pFighters.push({
             id: `p-${zoneId}-${Date.now()}-${i}`,
             side: 'player',
             zoneY: startY,
             startX: dx,
             startY: dy,
             offsetX: Math.random() * 40 - 20, // Небольшой разброс на мосту (Y)
             offsetY: Math.random() * 20 - 10,
             jitterX: generateJitter(12), // Малый горизонтальный дергун — не уходят за мост!
             jitterY: generateJitter(20), // Вертикальный дергун для хаоса
             duration: 6 + Math.random() * 4,
          });
       }
    });

    const eFighters: Fighter[] = [];
    ['helm', 'cannons', 'deck'].forEach(zoneId => {
       const count = enemyCrew[zoneId];
       const startY = zoneId === 'helm' ? 15 : zoneId === 'cannons' ? 45 : 75;
       for (let i = 0; i < count; i++) {
          const { dx, dy } = getOffset(i);
          eFighters.push({
             id: `e-${zoneId}-${Date.now()}-${i}`,
             side: 'enemy',
             zoneY: startY,
             startX: dx,
             startY: dy,
             offsetX: Math.random() * 40 - 20,
             offsetY: Math.random() * 20 - 10,
             jitterX: generateJitter(12),
             jitterY: generateJitter(20),
             duration: 6 + Math.random() * 4,
          });
       }
    });

    setPlayerCrew({ helm: 0, cannons: 0, deck: 0 });
    setEnemyCrew({ helm: 0, cannons: 0, deck: 0 });

    setActiveFighters([...pFighters, ...eFighters]);
    setBattlePhase('gathering'); // Сначала собираются у входа на мост
  };

  useEffect(() => {
    const logMsg = (msg: string) => setBattleLog(prev => [...prev, msg]);

    if (battlePhase === 'gathering') {
      const t = setTimeout(() => {
        setBattlePhase('moving_to_bridge');
      }, 4000); // 4 секунды на ооочень медленный спуск к мосту
      return () => clearTimeout(t);
    }

    if (battlePhase === 'moving_to_bridge') {
      const t = setTimeout(() => {
        setBattlePhase('fighting');
        logMsg("💥 Бой кипит по всему мосту!");
      }, 10000); // 10 секунд на продвижение (чтобы точно дошли друг до друга)
      return () => clearTimeout(t);
    }

    // Коллизии — работают с самого начала абордажа
    if (battlePhase === 'gathering' || battlePhase === 'moving_to_bridge' || battlePhase === 'fighting') {
      const t = setInterval(() => {
        setActiveFighters(prev => {
          const next = prev.map(f => ({...f}));
          
          const players = next.filter(f => !f.isDead && f.side === 'player');
          const enemies = next.filter(f => !f.isDead && f.side === 'enemy');

          if (players.length === 0 || enemies.length === 0) {
             clearInterval(t);
             setTimeout(() => {
                setBattlePhase('returning');
                const winner = players.length > 0 ? "Мы захватили судно!" : (enemies.length > 0 ? "Враг отбил атаку!" : "Ничья!");
                logMsg(`🏴‍☠️ Бой окончен. ${winner}`);
             }, 0);
             return next.filter(f => !f.isDead);
          }

          // Проверяем каждую пару — убиваем СРАЗУ при касании (50px радиус)
          const dead = new Set<string>();
          for (const f1 of players) {
             if (dead.has(f1.id)) continue;
             const el1 = document.getElementById(f1.id);
             if (!el1) continue;
             const r1 = el1.getBoundingClientRect();

             for (const f2 of enemies) {
                if (dead.has(f2.id)) continue;
                const el2 = document.getElementById(f2.id);
                if (!el2) continue;
                const r2 = el2.getBoundingClientRect();

                const dist = Math.hypot(r1.x - r2.x, r1.y - r2.y);
                if (dist < 50) { // 50px — касание = смерть одного!
                   // Случайно один из двух умирает
                   dead.add(Math.random() > 0.5 ? f1.id : f2.id);
                   break; // Этот игрок уже сразился
                }
             }
          }

          if (dead.size > 0) {
             return next.filter(f => !dead.has(f.id));
          }
          return prev;
        });
      }, 200);
      return () => clearInterval(t);
    }

    if (battlePhase === 'returning') {
      const t = setTimeout(() => {
        setActiveFighters(prev => {
          const aliveP = prev.filter(f => f.side === 'player');
          const aliveE = prev.filter(f => f.side === 'enemy');
          
          const newPlayerCrew = { helm: 0, cannons: 0, deck: 0 };
          aliveP.forEach(f => {
             if (f.zoneY === 15) newPlayerCrew.helm++;
             else if (f.zoneY === 45) newPlayerCrew.cannons++;
             else newPlayerCrew.deck++;
          });

          const newEnemyCrew = { helm: 0, cannons: 0, deck: 0 };
          aliveE.forEach(f => {
             if (f.zoneY === 15) newEnemyCrew.helm++;
             else if (f.zoneY === 45) newEnemyCrew.cannons++;
             else newEnemyCrew.deck++;
          });
          
          setPlayerCrew(newPlayerCrew);
          setEnemyCrew(newEnemyCrew);
          
          return [];
        });
        setBattlePhase('idle');
        setIsAttacking(false);
        logMsg("⚓ Выжившие вернулись на свои посты.");
      }, 8000); // Возвращаются очень медленно
      return () => clearTimeout(t);
    }
  }, [battlePhase]);

  const renderCrewDots = (count: number, color: string) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
      const { dx, dy } = getOffset(i);
      
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
               
               {/* Арена бойцов (Общий слой поверх всего) */}
               <div className="absolute inset-0 pointer-events-none z-50">
                  <AnimatePresence>
                     {activeFighters.map(fighter => {
                        // Единый формат для обеих команд: calc(50% + Npx)
                        // Игрок: отрицательный N (левее центра), Враг: положительный N (правее центра)
                        const dir = fighter.side === 'player' ? -1 : 1;

                        // Старт = внутри своего корабля у моста
                        const gatherX = dir * 200;
                        // Цель = центр моста
                        const fightX = dir * (8 + Math.abs(fighter.offsetX) * 0.2);

                        let leftPx: number;
                        let phaseDuration = 4;

                        if (battlePhase === 'gathering') {
                           leftPx = gatherX;
                           phaseDuration = 4;
                        } else if (battlePhase === 'moving_to_bridge' || battlePhase === 'fighting') {
                           leftPx = fightX;
                           phaseDuration = 12;
                        } else {
                           // returning — идут назад к своему кораблю
                           leftPx = gatherX;
                           phaseDuration = 8;
                        }

                        const left = `calc(50% + ${leftPx}px)`;
                        const top = `calc(0% + ${404 + fighter.offsetY}px)`;
                        const isActive = battlePhase !== 'idle' && battlePhase !== 'returning';

                        // Стартовая позиция через style — без initial, без телепортации
                        return (
                           <motion.div
                              key={fighter.id}
                              id={fighter.id}
                              style={{ left: `calc(50% + ${gatherX}px)`, top }}
                              animate={{ 
                                 left, 
                                 top,
                                 x: isActive ? fighter.jitterX : 0,
                                 y: isActive ? fighter.jitterY : 0,
                              }}
                              transition={{
                                 left: { duration: phaseDuration, ease: "linear" },
                                 top: { duration: phaseDuration, ease: "linear" },
                                 x: { duration: fighter.duration, repeat: isActive ? Infinity : 0, ease: "easeInOut" },
                                 y: { duration: fighter.duration, repeat: isActive ? Infinity : 0, ease: "easeInOut" },
                              }}
                              exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
                              className={cn(
                                 "w-3 h-3 rounded-full absolute z-50 -translate-x-1/2 -translate-y-1/2",
                                 fighter.side === 'player' ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                              )}
                           />
                        );
                     })}
                  </AnimatePresence>
               </div>

               {/* PLAYER SHIP (Left) */}
               <div className="relative z-20 w-[250px] h-[450px] border-4 border-cyan-500/30 rounded-[80px] bg-cyan-900/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
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
                        <p className="text-xs font-bold text-cyan-400">{playerCrew[zone.id]}</p>
                     </div>
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
               <div className="relative z-20 w-[250px] h-[450px] border-4 border-red-500/30 rounded-[80px] bg-red-900/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
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
                        <p className="text-xs font-bold text-red-400">{enemyCrew[zone.id]}</p>
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
