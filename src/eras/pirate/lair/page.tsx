'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info, Sparkles,
  Zap, Wind, LifeBuoy, RefreshCw, Compass, Eye, ShieldAlert,
  Heart, FastForward, Pause, Play, Crown, Beer
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
  
  // REDUCED Y COORDINATES FOR SHORTER SHIPS
  const [zones, setZones] = useState<Zone[]>([
    // Player Ship (Left) - Height reduced to 750 (was 850)
    { id: 'p_helm', name: 'Капитанский Мостик', x: 325, y: 130, team: 'player', crewTypes: { swordsmen: 2, gunners: 3, sappers: 0 } },
    { id: 'p_masts', name: 'Грот-Мачта', x: 325, y: 260, team: 'player', crewTypes: { swordsmen: 5, gunners: 5, sappers: 2 } },
    { id: 'p_cannons_l', name: 'Батарея Слева', x: 225, y: 390, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 } },
    { id: 'p_cannons_r', name: 'Батарея Справа', x: 425, y: 390, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 } },
    { id: 'p_deck', name: 'Центральная Палуба', x: 325, y: 520, team: 'player', crewTypes: { swordsmen: 15, gunners: 5, sappers: 5 } },
    { id: 'p_hold', name: 'Трюм (Арсенал)', x: 325, y: 650, team: 'player', crewTypes: { swordsmen: 5, gunners: 2, sappers: 10 } },
    
    // Enemy Ship (Right) - Height reduced to 800 (was 900)
    { id: 'e_cabin', name: 'Адмиральская Каюта', x: 850, y: 110, team: 'enemy', crewTypes: { swordsmen: 5, gunners: 5, sappers: 0 } },
    { id: 'e_battery', name: 'Тяжелая Батарея', x: 850, y: 240, team: 'enemy', crewTypes: { swordsmen: 0, gunners: 15, sappers: 0 } },
    { id: 'e_deck_f', name: 'Носовая Палуба', x: 750, y: 390, team: 'enemy', crewTypes: { swordsmen: 10, gunners: 5, sappers: 2 } },
    { id: 'e_deck_b', name: 'Кормовая Палуба', x: 950, y: 390, team: 'enemy', crewTypes: { swordsmen: 10, gunners: 5, sappers: 2 } },
    { id: 'e_barracks', name: 'Казармы', x: 850, y: 540, team: 'enemy', crewTypes: { swordsmen: 20, gunners: 0, sappers: 0 } },
    { id: 'e_hold', name: 'Пороховой Погреб', x: 850, y: 680, team: 'enemy', crewTypes: { swordsmen: 2, gunners: 2, sappers: 10 } },
  ]);

  const [battleStarted, setBattleStarted] = useState(false);
  const [activeModalZone, setActiveModalZone] = useState<string | null>(null);
  const [stats, setStats] = useState({ playerCasualties: 0, enemyCasualties: 0, playerShipHp: 100, enemyShipHp: 100 });

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
          color: zone.team === 'player' ? 'bg-sky-500' : 'bg-rose-500', 
          team: zone.team, 
          state: 'idle', 
          path: [], 
          hp: 100, 
          type: i < zone.crewTypes.swordsmen ? 'swordsman' : (i < zone.crewTypes.swordsmen + zone.crewTypes.gunners ? 'gunner' : 'sapper')
        });
      }
    });

    setSailors(initialSailors);
  }, []);

  // Bridge Pathfinding (Adjusted Y for shorter ships)
  const getBridgePath = (startX: number, endX: number, targetX: number, targetY: number) => {
    const leftBridgeX = 500;
    const rightBridgeX = 650;
    const bridgeY = 390; // Moved up slightly to match deck

    if (startX < leftBridgeX && endX > rightBridgeX) {
      return [{ x: leftBridgeX, y: bridgeY }, { x: rightBridgeX, y: bridgeY }, { x: targetX, y: targetY }];
    }
    if (startX > rightBridgeX && endX < leftBridgeX) {
      return [{ x: rightBridgeX, y: bridgeY }, { x: leftBridgeX, y: bridgeY }, { x: targetX, y: targetY }];
    }
    return [{ x: targetX, y: targetY }];
  };

  // Real-time loop
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
          
          const speed = sailor.state === 'retreating' ? 3 : 1.5; 
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

              if (dist < 15 && s1.type === 'swordsman') {
                s1.state = 'fighting';
                s2.state = 'fighting';
                s1.hp -= 3;
                s2.hp -= 3;
              }

              if (dist < 120 && dist > 30 && s1.type === 'gunner' && Math.random() < 0.05) {
                s1.state = 'shooting';
                s2.hp -= 10;
              }
            }
          }

          if (s1.hp < 30 && s1.state !== 'retreating') {
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

      // Move Cannonballs
      setCannonballs(prev => 
        prev.map(ball => {
          const dx = ball.targetX - ball.x;
          const dy = ball.targetY - ball.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 15) return null;
          return { ...ball, x: ball.x + (dx / dist) * 15, y: ball.y + (dy / dist) * 15 };
        }).filter(Boolean) as Cannonball[]
      );

    }, 50); 

    return () => clearInterval(interval);
  }, []);

  // Auto AI
  useEffect(() => {
    if (!battleStarted) return;

    const aiInterval = setInterval(() => {
      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          if (sailor.state !== 'idle') return sailor;
          const coin = Math.random();
          
          if (coin < 0.15) { 
            const targetTeam = sailor.team === 'player' ? 'enemy' : 'player';
            const targetZones = zones.filter(z => z.team === targetTeam);
            const randomZone = targetZones[Math.floor(Math.random() * targetZones.length)];
            
            const path = getBridgePath(sailor.x, randomZone.x, randomZone.x, randomZone.y);
            return { ...sailor, state: 'moving', targetX: randomZone.x, targetY: randomZone.y, path: path };
          }
          
          if (coin < 0.5) {
            const ownZones = zones.filter(z => z.team === sailor.team);
            const randomZone = ownZones[Math.floor(Math.random() * ownZones.length)];
            return { ...sailor, state: 'moving', targetX: randomZone.x + (Math.random() * 40 - 20), targetY: randomZone.y + (Math.random() * 40 - 20), path: [] };
          }
          return sailor;
        })
      );

      // Cannon fire
      if (Math.random() < 0.3) {
        const playerCannons = zones.filter(z => z.team === 'player' && z.id.includes('cannons'));
        const enemyCannons = zones.filter(z => z.team === 'enemy' && z.id.includes('battery'));
        
        if (playerCannons.length > 0 && enemyCannons.length > 0) {
          const pSource = playerCannons[Math.floor(Math.random() * playerCannons.length)];
          const eSource = enemyCannons[Math.floor(Math.random() * enemyCannons.length)];

          setCannonballs(prev => [
            ...prev,
            { id: Math.random(), x: pSource.x, y: pSource.y, targetX: eSource.x, targetY: eSource.y }
          ]);

          setStats(prev => ({ ...prev, enemyShipHp: Math.max(0, prev.enemyShipHp - 5) }));
        }
      }

    }, 3000);

    return () => clearInterval(aiInterval);
  }, [battleStarted]);

  return (
    <div className="relative min-h-screen bg-[#0d0702] text-amber-100 font-sans overflow-x-hidden p-6 md:p-12">
      
      {/* Warm Pirate Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">
         
         {/* Scoreboard - PIRATE STYLE (Wood/Amber) */}
         <div className="bg-gradient-to-br from-[#1a0f05] to-[#0a0501] border-2 border-amber-500/20 rounded-2xl p-6 flex justify-between items-center shadow-2xl">
            <div className="flex flex-col gap-2 w-[250px]">
               <div className="flex justify-between text-xs font-bold text-amber-500/80">
                  <span className="font-serif">НАШ ФЛАГМАН</span>
                  <span>{stats.playerShipHp}%</span>
               </div>
               <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-amber-500/10">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400" style={{ width: `${stats.playerShipHp}%` }} />
               </div>
               <p className="text-[10px] text-slate-500 font-mono">Экипаж: {sailors.filter(s => s.team === 'player').length}</p>
            </div>

            <div className="flex flex-col items-center">
               <h1 className="text-2xl font-serif font-black uppercase tracking-wider text-amber-100">Каюта Стратега</h1>
               <button 
                  onClick={() => setBattleStarted(!battleStarted)}
                  className={cn(
                    "mt-2 px-6 py-2 rounded-lg font-black uppercase text-xs tracking-wider transition-all hover:scale-105 shadow-lg",
                    battleStarted ? "bg-red-700 text-white" : "bg-gradient-to-r from-amber-500 to-amber-600 text-black"
                  )}
               >
                  {battleStarted ? "Пауза" : "В Бой!"}
               </button>
            </div>

            <div className="flex flex-col gap-2 w-[250px]">
               <div className="flex justify-between text-xs font-bold text-amber-500/80">
                  <span className="font-serif">ВРАЖЕСКИЙ ЛИНКОР</span>
                  <span>{stats.enemyShipHp}%</span>
               </div>
               <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-amber-500/10">
                  <div className="h-full bg-gradient-to-r from-red-700 to-red-500" style={{ width: `${stats.enemyShipHp}%` }} />
               </div>
               <p className="text-[10px] text-slate-500 text-right font-mono">Экипаж: {sailors.filter(s => s.team === 'enemy').length}</p>
            </div>
         </div>

         {/* Arena - Clean Dark Background with Ships */}
         <div className="relative flex justify-center">
            <div 
               className="bg-[#0a0501] rounded-3xl border border-amber-500/10 relative h-[850px] w-[1200px] overflow-hidden shadow-inner"
            >
               {/* Bridge */}
               <div className="absolute top-[370px] left-[500px] w-[150px] h-[40px] bg-[#1a0f05] border-t border-b border-amber-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold uppercase text-amber-500/40 tracking-widest">Мостик</span>
               </div>

               {/* Ships - SHORTER VERTICALLY */}
               <div className="absolute top-[30px] left-[150px] w-[350px] h-[750px] border border-amber-500/20 rounded-2xl bg-[#1a0f05]/30 pointer-events-none" />
               <div className="absolute top-[10px] left-[650px] w-[400px] h-[800px] border border-red-500/20 rounded-2xl bg-[#1a0f05]/30 pointer-events-none" />

               {/* Zones */}
               {zones.map(zone => {
                  const count = sailors.filter(s => s.team === zone.team && Math.sqrt(Math.pow(s.x - zone.x, 2) + Math.pow(s.y - zone.y, 2)) < 50).length;
                  
                  return (
                     <div 
                        key={zone.id}
                        onClick={() => setActiveModalZone(zone.id)}
                        className={cn(
                          "absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-lg border transition-all cursor-pointer w-[130px] text-center bg-[#0d0702]/90",
                          zone.team === 'player' ? "border-amber-500/20 hover:border-amber-500" : "border-red-500/20 hover:border-red-500"
                        )}
                        style={{ left: zone.x, top: zone.y }}
                     >
                        <p className="text-xs font-serif font-bold text-amber-100">{zone.name}</p>
                        <p className="text-[10px] text-amber-500/60 font-mono">{count} чел.</p>
                     </div>
                  );
               })}

               {/* Sailors - Clean dots */}
               {sailors.map(sailor => (
                  <div
                     key={sailor.id}
                     className={cn(
                       "w-2 h-2 rounded-full absolute transition-all duration-300 ease-linear", 
                       sailor.color,
                       sailor.state === 'shooting' && "ring-2 ring-yellow-400"
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
                     className="w-3 h-3 bg-yellow-500 rounded-full absolute shadow-lg"
                     style={{ left: `${ball.x}px`, top: `${ball.y}px`, transform: 'translate(-50%, -50%)' }}
                  />
               ))}

            </div>
         </div>

         {/* PIRATE STYLE MODAL (Parchment/Wood) */}
         <AnimatePresence>
            {activeModalZone && (
               <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-[#1a0f05] border-2 border-amber-500/30 rounded-2xl p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
                  >
                     <button 
                        onClick={() => setActiveModalZone(null)}
                        className="absolute top-6 right-6 text-amber-500/50 hover:text-amber-500 transition-colors"
                     >
                        <X size={20} />
                     </button>

                     {(() => {
                        const zone = zones.find(z => z.id === activeModalZone);
                        if (!zone) return null;
                        const lore = zoneLore[zone.id];
                        const Icon = lore?.icon || Compass;
                        
                        return (
                           <div className="space-y-6">
                              <div className="flex items-center gap-4 border-b border-amber-500/10 pb-4">
                                 <div className="bg-[#0a0501] p-3 rounded-xl border border-amber-500/20">
                                    <Icon size={24} className="text-amber-500" />
                                 </div>
                                 <div>
                                    <h4 className="text-2xl font-serif font-black text-amber-100">{zone.name}</h4>
                                    <p className="text-[10px] text-amber-500/60 uppercase tracking-wider">
                                       {zone.team === 'player' ? 'Наш Сектор' : 'Вражеский Сектор'}
                                    </p>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Left: Lore */}
                                 <div className="space-y-3">
                                    <h5 className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Описание</h5>
                                    <p className="text-sm text-amber-100/80 font-sans leading-relaxed">
                                       "{lore?.desc || "Описание этого сектора утеряно в пучинах океана..."}"
                                    </p>
                                    <div className="bg-[#0a0501] p-3 rounded-lg border border-amber-500/10 mt-2">
                                       <p className="text-xs font-bold text-amber-400">{lore?.perk}</p>
                                       <p className="text-xs text-slate-400">{lore?.bonus}</p>
                                    </div>
                                 </div>

                                 {/* Right: Garrison */}
                                 <div className="space-y-3">
                                    <h5 className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Гарнизон</h5>
                                    <div className="space-y-2">
                                       <div className="bg-[#0a0501] p-3 rounded-lg flex justify-between items-center border border-amber-500/10">
                                          <span className="text-xs text-amber-100/70">Головорезы</span>
                                          <span className="text-sm font-bold text-white font-mono">{zone.crewTypes.swordsmen}</span>
                                       </div>
                                       <div className="bg-[#0a0501] p-3 rounded-lg flex justify-between items-center border border-amber-500/10">
                                          <span className="text-xs text-amber-100/70">Стрелки</span>
                                          <span className="text-sm font-bold text-white font-mono">{zone.crewTypes.gunners}</span>
                                       </div>
                                       <div className="bg-[#0a0501] p-3 rounded-lg flex justify-between items-center border border-amber-500/10">
                                          <span className="text-xs text-amber-100/70">Саперы</span>
                                          <span className="text-sm font-bold text-white font-mono">{zone.crewTypes.sappers}</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <button 
                                 onClick={() => setActiveModalZone(null)}
                                 className="w-full p-3 bg-gradient-to-r from-amber-600 to-amber-700 text-black font-black uppercase text-xs tracking-wider rounded-lg transition-all hover:opacity-90"
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
