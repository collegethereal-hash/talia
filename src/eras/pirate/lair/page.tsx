'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info, Sparkles,
  Zap, Wind, LifeBuoy, RefreshCw, Compass, Eye, ShieldAlert,
  Heart, FastForward, Pause, Play, Crown, Beer, MessageSquare, Send
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
  
  // MOVED LEFT & WIDER SHIPS
  const [zones, setZones] = useState<Zone[]>([
    // Player Ship (Left) - Center X shifted from 325 to 250. Width = 350.
    { id: 'p_helm', name: 'Капитанский Мостик', x: 250, y: 100, team: 'player', crewTypes: { swordsmen: 2, gunners: 3, sappers: 0 } },
    { id: 'p_masts', name: 'Грот-Мачта', x: 250, y: 200, team: 'player', crewTypes: { swordsmen: 5, gunners: 5, sappers: 2 } },
    { id: 'p_cannons_l', name: 'Батарея Слева', x: 130, y: 320, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 } },
    { id: 'p_cannons_r', name: 'Батарея Справа', x: 370, y: 320, team: 'player', crewTypes: { swordsmen: 0, gunners: 10, sappers: 0 } },
    { id: 'p_deck', name: 'Центральная Палуба', x: 250, y: 450, team: 'player', crewTypes: { swordsmen: 15, gunners: 5, sappers: 5 } },
    { id: 'p_hold', name: 'Трюм (Арсенал)', x: 250, y: 560, team: 'player', crewTypes: { swordsmen: 5, gunners: 2, sappers: 10 } },
    
    // Enemy Ship (Right) - Center X shifted from 850 to 700. Width = 400.
    { id: 'e_cabin', name: 'Адмиральская Каюта', x: 700, y: 90, team: 'enemy', crewTypes: { swordsmen: 5, gunners: 5, sappers: 0 } },
    { id: 'e_battery', name: 'Тяжелая Батарея', x: 700, y: 190, team: 'enemy', crewTypes: { swordsmen: 0, gunners: 15, sappers: 0 } },
    { id: 'e_deck_f', name: 'Носовая Палуба', x: 580, y: 320, team: 'enemy', crewTypes: { swordsmen: 10, gunners: 5, sappers: 2 } },
    { id: 'e_deck_b', name: 'Кормовая Палуба', x: 820, y: 320, team: 'enemy', crewTypes: { swordsmen: 10, gunners: 5, sappers: 2 } },
    { id: 'e_barracks', name: 'Казармы', x: 700, y: 450, team: 'enemy', crewTypes: { swordsmen: 20, gunners: 0, sappers: 0 } },
    { id: 'e_hold', name: 'Пороховой Погреб', x: 700, y: 580, team: 'enemy', crewTypes: { swordsmen: 2, gunners: 2, sappers: 10 } },
  ]);

  const [battleStarted, setBattleStarted] = useState(false);
  const [activeModalZone, setActiveModalZone] = useState<string | null>(null);
  const [stats, setStats] = useState({ playerCasualties: 0, enemyCasualties: 0, playerShipHp: 100, enemyShipHp: 100 });
  const [battleResult, setBattleResult] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Полина', text: 'Капитан, они нападают! Прикажи своим волкам держаться!' },
    { sender: 'Ты', text: 'Не волнуйся, мы их раздавим.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

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

  // Bridge Pathfinding (Adjusted for moved ships)
  const getBridgePath = (startX: number, endX: number, targetX: number, targetY: number) => {
    const leftBridgeX = 425; // Right edge of player ship
    const rightBridgeX = 510; // Left edge of enemy ship
    const bridgeY = 320; 

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

              if (dist < 20 && s1.type === 'swordsman') {
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

        const aliveSailors = updatedSailors.filter(s => s.hp > 0);
        
        // FIX: Capitulation/End Game logic
        const pCount = aliveSailors.filter(s => s.team === 'player').length;
        const eCount = aliveSailors.filter(s => s.team === 'enemy').length;
        
        if (battleStarted && !battleResult) {
          if (eCount < 3 && pCount > 5) {
            setBattleResult("Враг капитулировал! Победа!");
            setBattleStarted(false);
            setChatMessages(prev => [...prev, { sender: 'Полина', text: 'Ура! Они сдаются! Мы победили!' }]);
          } else if (pCount < 3 && eCount > 5) {
            setBattleResult("Мы вынуждены отступить... Поражение.");
            setBattleStarted(false);
            setChatMessages(prev => [...prev, { sender: 'Полина', text: 'Капитан, нужно уходить! Мы проиграли этот бой...' }]);
          }
        }

        return aliveSailors;
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
  }, [battleStarted, battleResult]);

  // Auto AI & Polina Comments
  useEffect(() => {
    if (!battleStarted) return;

    const aiInterval = setInterval(() => {
      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          if (sailor.state !== 'idle') return sailor;
          const coin = Math.random();
          
          // FIX: Prevent camping in corners. Higher chance to attack if idle!
          if (coin < 0.3) { 
            const targetTeam = sailor.team === 'player' ? 'enemy' : 'player';
            const targetZones = zones.filter(z => z.team === targetTeam);
            const randomZone = targetZones[Math.floor(Math.random() * targetZones.length)];
            
            const path = getBridgePath(sailor.x, randomZone.x, randomZone.x, randomZone.y);
            return { ...sailor, state: 'moving', targetX: randomZone.x, targetY: randomZone.y, path: path };
          }
          
          if (coin < 0.7) {
            const ownZones = zones.filter(z => z.team === sailor.team);
            const randomZone = ownZones[Math.floor(Math.random() * ownZones.length)];
            return { ...sailor, state: 'moving', targetX: randomZone.x + (Math.random() * 80 - 40), targetY: randomZone.y + (Math.random() * 80 - 40), path: [] };
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

      // Polina dynamic comments
      if (Math.random() < 0.2) {
        const comments = [
          "Наши пушки бьют точно в цель!",
          "Ой, смотри, сколько их полегло на мостике!",
          "Кажется, они начинают отступать!",
          "Наш трюм под надежной защитой, я проверила.",
          "Ты лучший тактик, которого я видела!"
        ];
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        setChatMessages(prev => [...prev, { sender: 'Полина', text: randomComment }]);
      }

    }, 3000);

    return () => clearInterval(aiInterval);
  }, [battleStarted]);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'Ты', text: inputMessage }]);
    setInputMessage('');
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'Полина', text: 'Я с тобой до конца, капитан!' }]);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-[#0d0702] text-amber-100 font-sans overflow-x-hidden p-4 md:p-8">
      
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-4">
         
         {/* Scoreboard */}
         <div className="bg-gradient-to-br from-[#1a0f05] to-[#0a0501] border-2 border-amber-500/20 rounded-2xl p-4 flex justify-between items-center shadow-2xl">
            <div className="flex flex-col gap-1 w-[200px]">
               <div className="flex justify-between text-xs font-bold text-amber-500/80">
                  <span className="font-serif">ФЛАГМАН</span>
                  <span>{stats.playerShipHp}%</span>
               </div>
               <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-amber-500/10">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400" style={{ width: `${stats.playerShipHp}%` }} />
               </div>
               <p className="text-[10px] text-slate-500 font-mono">Экипаж: {sailors.filter(s => s.team === 'player').length}</p>
            </div>

            <div className="flex flex-col items-center">
               <h1 className="text-xl font-serif font-black uppercase tracking-wider text-amber-100">Каюта Стратега</h1>
               <div className="flex gap-2 items-center">
                  <button 
                     onClick={() => setBattleStarted(!battleStarted)}
                     className={cn(
                       "mt-1 px-4 py-1.5 rounded-lg font-black uppercase text-xs tracking-wider transition-all hover:scale-105 shadow-lg",
                       battleStarted ? "bg-red-700 text-white" : "bg-gradient-to-r from-amber-500 to-amber-600 text-black"
                     )}
                  >
                     {battleStarted ? "Пауза" : "В Бой!"}
                  </button>
                  {battleResult && (
                     <span className="text-xs font-bold text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg bg-black/50">
                        {battleResult}
                     </span>
                  )}
               </div>
            </div>

            <div className="flex flex-col gap-1 w-[200px]">
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

         {/* Main Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Arena - MOVED LEFT, WIDER SHIPS, TEXTURES */}
            <div className="lg:col-span-9 flex justify-start">
               <div 
                  className="bg-[#0a192f] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:20px_20px] rounded-3xl border border-amber-500/10 relative h-[700px] w-[1100px] overflow-hidden shadow-inner"
               >
                  {/* Water Texture Overlay (Simulated with gradients) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/20 to-[#0a192f]/50 pointer-events-none" />

                  {/* Bridge */}
                  <div className="absolute top-[300px] left-[425px] w-[85px] h-[40px] bg-[#1a0f05] border-t border-b border-amber-500/20 flex items-center justify-center">
                     <span className="text-[10px] font-bold uppercase text-amber-500/40 tracking-widest">Мост</span>
                  </div>

                  {/* Ships - WIDER & WOOD TEXTURE */}
                  {/* Player Ship */}
                  <div className="absolute top-[20px] left-[75px] w-[350px] h-[650px] border border-amber-500/20 rounded-2xl bg-[#1a0f05]/80 pointer-events-none bg-[linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:10px_100%]">
                     <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
                  </div>
                  
                  {/* Enemy Ship */}
                  <div className="absolute top-[10px] left-[510px] w-[380px] h-[680px] border border-red-500/20 rounded-2xl bg-[#1a0f05]/80 pointer-events-none bg-[linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:10px_100%]">
                     <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
                  </div>

                  {/* Zones */}
                  {zones.map(zone => {
                     const count = sailors.filter(s => s.team === zone.team && Math.sqrt(Math.pow(s.x - zone.x, 2) + Math.pow(s.y - zone.y, 2)) < 50).length;
                     
                     return (
                        <div 
                           key={zone.id}
                           onClick={() => setActiveModalZone(zone.id)}
                           className={cn(
                             "absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-lg border transition-all cursor-pointer w-[120px] text-center bg-[#0d0702]/90",
                             zone.team === 'player' ? "border-amber-500/20 hover:border-amber-500" : "border-red-500/20 hover:border-red-500"
                           )}
                           style={{ left: zone.x, top: zone.y }} 
                        >
                           <p className="text-xs font-serif font-bold text-amber-100">{zone.name}</p>
                           <p className="text-[10px] text-amber-500/60 font-mono">{count} чел.</p>
                        </div>
                     );
                  })}

                  {/* Sailors - SMALLER (w-2.5 h-2.5) */}
                  {sailors.map(sailor => (
                     <div
                        key={sailor.id}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full absolute transition-all duration-300 ease-linear border border-black/30 shadow-md", 
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

            {/* Right Side: Chat with Polina */}
            <div className="lg:col-span-3 h-[700px] flex flex-col bg-gradient-to-br from-[#1a0f05] to-[#0a0501] border-2 border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden">
               
               <div className="p-4 border-b border-amber-500/10 flex items-center gap-3 bg-black/40">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
                     <span className="text-amber-500 font-serif font-black">П</span>
                  </div>
                  <div>
                     <h4 className="text-sm font-serif font-black text-amber-100">Полина</h4>
                     <p className="text-[10px] text-emerald-400 font-bold uppercase">На связи</p>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, i) => (
                     <div key={i} className={cn("flex flex-col", msg.sender === 'Ты' ? "items-end" : "items-start")}>
                        <div className={cn(
                          "max-w-[80%] p-3 rounded-2xl text-xs font-sans",
                          msg.sender === 'Ты' 
                            ? "bg-amber-600 text-black rounded-br-none" 
                            : "bg-[#110a03] text-amber-100 border border-amber-500/20 rounded-bl-none"
                        )}>
                           {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-600 mt-1 px-1">{msg.sender}</span>
                     </div>
                  ))}
               </div>

               <div className="p-4 border-t border-amber-500/10 bg-black/20">
                  <div className="flex gap-2">
                     <input 
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Написать Полине..."
                        className="flex-1 bg-[#0a0501] border border-amber-500/20 rounded-xl px-4 py-2 text-xs text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                     />
                     <button 
                        onClick={sendMessage}
                        className="bg-amber-600 text-black p-2 rounded-xl hover:bg-amber-500 transition-colors"
                     >
                        <Send size={16} />
                     </button>
                  </div>
               </div>

            </div>
         </div>

         {/* Modal */}
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
