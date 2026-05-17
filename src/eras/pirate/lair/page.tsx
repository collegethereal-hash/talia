'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info, Sparkles,
  Zap, Wind, LifeBuoy, RefreshCw, Compass, Eye, ShieldAlert,
  Heart, FastForward, Pause, Play, Wand2, Crown, Beer
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
  x: number; 
  y: number;
  team: 'player' | 'enemy';
  crewTypes: {
    swordsmen: number;
    gunners: number;
    sappers: number;
  };
}

const zoneLore: Record<string, { desc: string, perk: string, bonus: string, icon: any }> = {
  p_helm: { desc: "Святая святых корабля. Отсюда капитан отдает приказы, меняющие ход истории.", perk: "Железная Воля", bonus: "Защита +25%", icon: Crown },
  p_masts: { desc: "Стрелки на марсах видят всё поле боя. Идеальная позиция для снайперов.", perk: "Орлиный Глаз", bonus: "Крит. урон +40%", icon: Target },
  p_cannons_l: { desc: "Тяжелые медные пушки, готовые изрыгать огонь по приказу канонира.", perk: "Бортовой Залп", bonus: "Урон по кораблю", icon: Bomb },
  p_cannons_r: { desc: "Правая батарея. Расчеты работают как часы, забивая порох и ядра.", perk: "Бортовой Залп", bonus: "Урон по кораблю", icon: Bomb },
  p_deck: { desc: "Здесь пахнет кровью и порохом. Главная арена абордажных схваток.", perk: "Мясная Лавка", bonus: "Скорость атаки +15%", icon: Sword },
  p_hold: { desc: "Внизу темно и сыро. Здесь хранятся бочки с ромом и сундуки с золотом.", perk: "Заначка Рома", bonus: "Регенерация HP", icon: Beer },
  
  e_cabin: { desc: "Каюта вражеского адмирала. Роскошь, купленная на крови невинных.", perk: "Тирания", bonus: "Фанатизм", icon: Skull },
  e_battery: { desc: "Проклятые пушки, стреляющие ядрами с ядовитым зеленым огнем.", perk: "Залп Бездны", bonus: "Проклятие", icon: Flame },
  e_deck_f: { desc: "Носовая часть. Отсюда враги готовятся прыгать на наш борт.", perk: "Авангард", bonus: "Натиск", icon: Zap },
  e_deck_b: { desc: "Задняя палуба. Здесь кучкуются трусливые офицеры.", perk: "Резерв", bonus: "Оборона", icon: Shield },
  e_barracks: { desc: "Грязные гамаки и вонь. Место обитания вражеской плоти.", perk: "Орда", bonus: "Численность", icon: Users },
  e_hold: { desc: "Пороховой погреб врага. Одно попадание — и они взлетят на воздух.", perk: "Пороховая Бочка", bonus: "Взрывоопасно", icon: Bomb },
};

export default function LairPage() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [sailors, setSailors] = useState<Sailor[]>([]);
  const [cannonballs, setCannonballs] = useState<Cannonball[]>([]);
  const [zones, setZones] = useState<Zone[]>([
    { id: 'p_helm', name: 'Капитанский Мостик', x: 325, y: 150, team: 'player', crewTypes: { swordsmen: 2, gunners: 3, sappers: 0 } },
    { id: 'p_masts', name: 'Грот-Мачта', x: 325, y: 300, team: 'player', crewTypes: { swordsmen: 5, gunners: 5, sappers: 2 } },
    { id: 'p_cannons_l', name: 'Батарея Слева', x: 225, y: 450, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 } },
    { id: 'p_cannons_r', name: 'Батарея Справа', x: 425, y: 450, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 } },
    { id: 'p_deck', name: 'Центральная Палуба', x: 325, y: 600, team: 'player', crewTypes: { swordsmen: 15, gunners: 5, sappers: 5 } },
    { id: 'p_hold', name: 'Трюм (Арсенал)', x: 325, y: 750, team: 'player', crewTypes: { swordsmen: 5, gunners: 2, sappers: 10 } },
    
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
  const [battleEvent, setBattleEvent] = useState<string | null>(null);

  // Initialize sailors
  useEffect(() => {
    const initialSailors: Sailor[] = [];
    let id = 0;

    zones.forEach(zone => {
      for (let i = 0; i < zone.crewTypes.swordsmen; i++) {
        initialSailors.push({ id: id++, x: zone.x + (Math.random() * 60 - 30), y: zone.y + (Math.random() * 60 - 30), targetX: zone.x, targetY: zone.y, color: zone.team === 'player' ? 'bg-cyan-400' : 'bg-red-500', team: zone.team, state: 'idle', path: [], hp: 100, type: 'swordsman' });
      }
      for (let i = 0; i < zone.crewTypes.gunners; i++) {
        initialSailors.push({ id: id++, x: zone.x + (Math.random() * 60 - 30), y: zone.y + (Math.random() * 60 - 30), targetX: zone.x, targetY: zone.y, color: zone.team === 'player' ? 'bg-amber-400' : 'bg-orange-500', team: zone.team, state: 'idle', path: [], hp: 100, type: 'gunner' });
      }
      for (let i = 0; i < zone.crewTypes.sappers; i++) {
        initialSailors.push({ id: id++, x: zone.x + (Math.random() * 60 - 30), y: zone.y + (Math.random() * 60 - 30), targetX: zone.x, targetY: zone.y, color: zone.team === 'player' ? 'bg-purple-400' : 'bg-pink-500', team: zone.team, state: 'idle', path: [], hp: 100, type: 'sapper' });
      }
    });

    setSailors(initialSailors);
  }, []);

  // Bridge Pathfinding
  const getBridgePath = (startX: number, endX: number, targetX: number, targetY: number) => {
    const leftBridgeX = 500;
    const rightBridgeX = 650;
    const bridgeY = 500;

    if (startX < leftBridgeX && endX > rightBridgeX) {
      return [{ x: leftBridgeX, y: bridgeY }, { x: rightBridgeX, y: bridgeY }, { x: targetX, y: targetY }];
    }
    if (startX > rightBridgeX && endX < leftBridgeX) {
      return [{ x: rightBridgeX, y: bridgeY }, { x: leftBridgeX, y: bridgeY }, { x: targetX, y: targetY }];
    }
    return [{ x: targetX, y: targetY }];
  };

  // Real-time loop (MORE DYNAMIC)
  useEffect(() => {
    const interval = setInterval(() => {
      setSailors(prevSailors => {
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
          
          const speed = sailor.state === 'retreating' ? 4 : 2.5; // FASTER MOVEMENT
          return {
            ...sailor,
            x: sailor.x + (dx / dist) * speed,
            y: sailor.y + (dy / dist) * speed,
            path: newPath
          };
        });

        const updatedSailors = [...movedSailors];
        for (let i = 0; i < updatedSailors.length; i++) {
          const s1 = updatedSailors[i];
          for (let j = 0; j < updatedSailors.length; j++) {
            const s2 = updatedSailors[j];

            if (s1.team !== s2.team) {
              const dx = s1.x - s2.x;
              const dy = s1.y - s2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 20 && s1.type === 'swordsman') {
                s1.state = 'fighting';
                s2.state = 'fighting';
                s1.hp -= 5; // MORE DAMAGE
                s2.hp -= 5;
              }

              if (dist < 180 && dist > 40 && s1.type === 'gunner' && Math.random() < 0.1) {
                s1.state = 'shooting';
                s2.hp -= 15;
              }
            }
          }

          if (s1.hp < 40 && s1.state !== 'retreating') {
            s1.state = 'retreating';
            const homeZone = zones.find(z => z.team === s1.team);
            if (homeZone) {
              s1.path = getBridgePath(s1.x, homeZone.x, homeZone.x, homeZone.y);
              s1.targetX = homeZone.x;
              s1.targetY = homeZone.y;
            }
          }
        }

        return updatedSailors.filter(s => s.hp > 0);
      });

      // Move Cannonballs faster
      setCannonballs(prev => 
        prev.map(ball => {
          const dx = ball.targetX - ball.x;
          const dy = ball.targetY - ball.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 15) return null;
          return { ...ball, x: ball.x + (dx / dist) * 25, y: ball.y + (dy / dist) * 25 };
        }).filter(Boolean) as Cannonball[]
      );

    }, 30); // FASTER TICK RATE (30ms instead of 50ms)

    return () => clearInterval(interval);
  }, []);

  // Auto AI & Dynamic Events
  useEffect(() => {
    if (!battleStarted) return;

    const aiInterval = setInterval(() => {
      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          if (sailor.state !== 'idle') return sailor;
          const coin = Math.random();
          
          if (coin < 0.25) { // MORE AGGRESSIVE
            const targetTeam = sailor.team === 'player' ? 'enemy' : 'player';
            const targetZones = zones.filter(z => z.team === targetTeam);
            const randomZone = targetZones[Math.floor(Math.random() * targetZones.length)];
            
            const path = getBridgePath(sailor.x, randomZone.x, randomZone.x, randomZone.y);
            return { ...sailor, state: 'moving', targetX: randomZone.x, targetY: randomZone.y, path: path };
          }
          
          if (coin < 0.6) {
            const ownZones = zones.filter(z => z.team === sailor.team);
            const randomZone = ownZones[Math.floor(Math.random() * ownZones.length)];
            return { ...sailor, state: 'moving', targetX: randomZone.x + (Math.random() * 60 - 30), targetY: randomZone.y + (Math.random() * 60 - 30), path: [] };
          }
          return sailor;
        })
      );

      // Cannon fire
      if (Math.random() < 0.5) {
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
            playerShipHp: Math.max(0, prev.playerShipHp - 5),
            enemyShipHp: Math.max(0, prev.enemyShipHp - 5)
          }));
        }
      }

      // RANDOM EVENTS TO MAKE IT EXCITING!
      const eventCoin = Math.random();
      if (eventCoin < 0.1) {
        setBattleEvent("🔥 ПОЖАР НА ПАЛУБЕ! Все бегут в рассыпную!");
        setTimeout(() => setBattleEvent(null), 2000);
      } else if (eventCoin < 0.2) {
        setBattleEvent("🍺 КРИК КАПИТАНА: 'За РОМ!' Скорость х2!");
        setTimeout(() => setBattleEvent(null), 2000);
      }

    }, 2000); // More frequent decisions

    return () => clearInterval(aiInterval);
  }, [battleStarted]);

  return (
    <div className="relative min-h-screen bg-[#020202] text-amber-100 font-sans overflow-x-hidden p-6 md:p-12">
      
      {/* Huge Glowing Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">
         
         {/* Scoreboard with HP Bars */}
         <div className="bg-gradient-to-r from-[#1a0f05] via-black to-[#1a0f05] border-2 border-amber-500/30 rounded-3xl p-6 flex justify-between items-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <div className="flex flex-col gap-2 w-[250px]">
               <div className="flex justify-between text-xs font-black">
                  <span className="text-cyan-400 tracking-wider">НАШ ФЛАГМАН</span>
                  <span>{stats.playerShipHp}%</span>
               </div>
               <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: `${stats.playerShipHp}%` }} />
               </div>
               <p className="text-[10px] text-slate-500 font-mono">Живых бойцов: {sailors.filter(s => s.team === 'player').length}</p>
            </div>

            <div className="flex flex-col items-center">
               {battleEvent ? (
                  <motion.div 
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="text-lg font-black text-amber-400 uppercase tracking-wide bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20"
                  >
                     {battleEvent}
                  </motion.div>
               ) : (
                  <>
                     <h1 className="text-3xl font-serif font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500">Кровавый Абордаж</h1>
                     <button 
                        onClick={() => setBattleStarted(!battleStarted)}
                        className={cn(
                          "mt-2 px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all hover:scale-105 shadow-lg flex items-center gap-2",
                          battleStarted ? "bg-red-600 text-white shadow-red-600/30" : "bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-amber-500/30"
                        )}
                     >
                        {battleStarted ? <Pause size={14} /> : <Play size={14} />}
                        {battleStarted ? "ПАУЗА" : "В БОЙ, ПСЫ!"}
                     </button>
                  </>
               )}
            </div>

            <div className="flex flex-col gap-2 w-[250px]">
               <div className="flex justify-between text-xs font-black">
                  <span className="text-red-500 tracking-wider">ЧЕРНЫЙ ЛИНКОР</span>
                  <span>{stats.enemyShipHp}%</span>
               </div>
               <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-red-700 to-red-500" style={{ width: `${stats.enemyShipHp}%` }} />
               </div>
               <p className="text-[10px] text-slate-500 text-right font-mono">Живых бойцов: {sailors.filter(s => s.team === 'enemy').length}</p>
            </div>
         </div>

         {/* Arena */}
         <div className="relative flex justify-center">
            <div 
               ref={arenaRef}
               className="bg-gradient-to-b from-[#0a0602] to-black rounded-[3rem] border border-amber-500/20 relative h-[1000px] w-[1200px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
               {/* Bridge */}
               <div className="absolute top-[480px] left-[500px] w-[150px] h-[40px] bg-gradient-to-r from-cyan-900/40 via-amber-900/60 to-red-900/40 border-t border-b border-amber-500/30 flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest">Зона Смерти</span>
               </div>

               {/* Ships */}
               <div className="absolute top-[50px] left-[150px] w-[350px] h-[850px] border-2 border-cyan-500/10 rounded-[80px] bg-cyan-900/5 pointer-events-none" />
               <div className="absolute top-[25px] left-[650px] w-[400px] h-[900px] border-2 border-red-500/10 rounded-[100px_100px_40px_40px] bg-red-900/5 pointer-events-none" />

               {/* Zones */}
               {zones.map(zone => {
                  const count = sailors.filter(s => s.team === zone.team && Math.sqrt(Math.pow(s.x - zone.x, 2) + Math.pow(s.y - zone.y, 2)) < 50).length;
                  const lore = zoneLore[zone.id];
                  const Icon = lore?.icon || Compass;
                  
                  return (
                     <div 
                        key={zone.id}
                        onClick={() => setActiveModalZone(zone.id)}
                        className={cn(
                          "absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-2xl border transition-all cursor-pointer w-[150px] text-center backdrop-blur-md flex flex-col items-center gap-1",
                          "border-white/5 bg-black/60 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] group",
                          zone.team === 'player' ? "hover:border-cyan-500/50" : "hover:border-red-500/50"
                        )}
                        style={{ left: zone.x, top: zone.y }}
                     >
                        <Icon size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{zone.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{count} чел.</p>
                     </div>
                  );
               })}

               {/* Sailors (Dynamic size/glow) */}
               {sailors.map(sailor => (
                  <div
                     key={sailor.id}
                     className={cn(
                       "rounded-full absolute transition-all duration-300 ease-linear shadow-lg", 
                       sailor.color,
                       sailor.state === 'fighting' && "w-4 h-4 animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)]",
                       sailor.state === 'shooting' && "w-3 h-3 animate-ping",
                       sailor.state === 'retreating' && "w-2 h-2 opacity-50",
                       sailor.state === 'idle' && "w-2.5 h-2.5"
                     )}
                     style={{ 
                        left: `${sailor.x}px`, 
                        top: `${sailor.y}px`,
                        transform: 'translate(-50%, -50%)'
                     }}
                  />
               ))}

               {/* Fast Cannonballs */}
               {cannonballs.map(ball => (
                  <div 
                     key={ball.id}
                     className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full absolute shadow-[0_0_20px_#ff9f00] transition-all duration-30"
                     style={{ left: `${ball.x}px`, top: `${ball.y}px`, transform: 'translate(-50%, -50%)' }}
                  />
               ))}

            </div>
         </div>

         {/* ULTRA BEAUTIFUL & INFORMATIVE MODAL */}
         <AnimatePresence>
            {activeModalZone && (
               <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                     animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                     exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                     transition={{ type: "spring", damping: 15 }}
                     className="bg-gradient-to-br from-[#2a1a0a] via-[#0d0702] to-[#000] border-2 border-amber-500/40 rounded-[3rem] p-10 max-w-3xl w-full shadow-[0_0_100px_rgba(245,158,11,0.15)] relative overflow-hidden"
                  >
                     {/* Decorative Corners */}
                     <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-500/30 rounded-tl-[3rem]" />
                     <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-500/30 rounded-br-[3rem]" />

                     <button 
                        onClick={() => setActiveModalZone(null)}
                        className="absolute top-6 right-6 text-amber-500/50 hover:text-amber-400 transition-colors hover:rotate-90 duration-300"
                     >
                        <X size={28} />
                     </button>

                     {(() => {
                        const zone = zones.find(z => z.id === activeModalZone);
                        if (!zone) return null;
                        const lore = zoneLore[zone.id];
                        const Icon = lore?.icon || Compass;
                        
                        return (
                           <div className="space-y-8">
                              <div className="text-center">
                                 <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                                    <Icon size={32} className="text-amber-500" />
                                 </div>
                                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/60 mb-1">Сектор Корабля</p>
                                 <h4 className="text-5xl font-serif font-black text-white uppercase tracking-tighter glow-text-amber">{zone.name}</h4>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Left: Lore & Description */}
                                 <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                                    <div>
                                       <h5 className="text-[10px] font-black uppercase text-amber-500 mb-2 tracking-wider">Судовой Журнал</h5>
                                       <p className="text-sm text-amber-100/80 font-sans leading-relaxed italic">
                                          "{lore?.desc || "Описание этого сектора утеряно в пучинах океана..."}"
                                       </p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                       <div className="flex items-center gap-2">
                                          <Zap size={14} className="text-amber-400" />
                                          <span className="text-xs font-black uppercase text-amber-400">{lore?.perk}</span>
                                       </div>
                                       <p className="text-xs text-slate-400 mt-1">{lore?.bonus}</p>
                                    </div>
                                 </div>

                                 {/* Right: Crew & Stats */}
                                 <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Гарнизон Сектора</h5>
                                    
                                    <div className="space-y-2">
                                       <div className="bg-black/60 p-3 rounded-xl border border-white/5 flex justify-between items-center hover:border-cyan-500/20 transition-all">
                                          <div className="flex items-center gap-2">
                                             <Sword size={14} className="text-cyan-400" />
                                             <span className="text-xs text-amber-100">Головорезы</span>
                                          </div>
                                          <span className="text-sm font-bold text-cyan-400 font-mono">{zone.crewTypes.swordsmen}</span>
                                       </div>
                                       <div className="bg-black/60 p-3 rounded-xl border border-white/5 flex justify-between items-center hover:border-amber-500/20 transition-all">
                                          <div className="flex items-center gap-2">
                                             <Target size={14} className="text-amber-400" />
                                             <span className="text-xs text-amber-100">Стрелки</span>
                                          </div>
                                          <span className="text-sm font-bold text-amber-400 font-mono">{zone.crewTypes.gunners}</span>
                                       </div>
                                       <div className="bg-black/60 p-3 rounded-xl border border-white/5 flex justify-between items-center hover:border-purple-500/20 transition-all">
                                          <div className="flex items-center gap-2">
                                             <Bomb size={14} className="text-purple-400" />
                                             <span className="text-xs text-amber-100">Саперы</span>
                                          </div>
                                          <span className="text-sm font-bold text-purple-400 font-mono">{zone.crewTypes.sappers}</span>
                                       </div>
                                    </div>

                                    <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 flex justify-between items-center">
                                       <span className="text-xs text-emerald-400 font-black uppercase">Статус</span>
                                       <span className="text-xs text-emerald-400 font-bold">Готовы к бою</span>
                                    </div>
                                 </div>
                              </div>

                              <button 
                                 onClick={() => setActiveModalZone(null)}
                                 className="w-full p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all hover:scale-[1.02] shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
                              >
                                 Вернуться к управлению
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
