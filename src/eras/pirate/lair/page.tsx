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
  
  // RESTORED POSITIONS & SHAPES FROM IMAGE
  const [zones, setZones] = useState<Zone[]>([
    // Player Ship (Left)
    { id: 'p_helm', name: 'Штурвал', x: 250, y: 150, team: 'player', crewTypes: { swordsmen: 2, gunners: 3, sappers: 0 } },
    { id: 'p_cannons', name: 'Пушки', x: 250, y: 320, team: 'player', crewTypes: { swordsmen: 0, gunners: 20, sappers: 0 } },
    { id: 'p_deck', name: 'Палуба', x: 250, y: 490, team: 'player', crewTypes: { swordsmen: 20, gunners: 5, sappers: 5 } },
    
    // Enemy Ship (Right)
    { id: 'e_cabin', name: 'Мостик', x: 650, y: 150, team: 'enemy', crewTypes: { swordsmen: 5, gunners: 5, sappers: 0 } },
    { id: 'e_battery', name: 'Батарея', x: 650, y: 320, team: 'enemy', crewTypes: { swordsmen: 0, gunners: 15, sappers: 0 } },
    { id: 'e_hold', name: 'Каюты', x: 650, y: 490, team: 'enemy', crewTypes: { swordsmen: 10, gunners: 2, sappers: 10 } },
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

  // Bridge Pathfinding
  const getBridgePath = (startX: number, endX: number, targetX: number, targetY: number) => {
    const leftBridgeX = 375; 
    const rightBridgeX = 525; 
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

  // Auto AI
  useEffect(() => {
    if (!battleStarted) return;

    const aiInterval = setInterval(() => {
      setSailors(prevSailors => 
        prevSailors.map(sailor => {
          if (sailor.state !== 'idle') return sailor;
          const coin = Math.random();
          
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
         
         {/* Title from Image */}
         <div className="flex justify-between items-center">
            <div>
               <p className="text-[10px] font-serif uppercase tracking-widest text-amber-500/60">Симуляция Сражения</p>
               <h1 className="text-4xl font-serif font-black uppercase text-amber-100">Абордаж</h1>
            </div>
            <button 
               onClick={() => setBattleStarted(!battleStarted)}
               className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-black uppercase text-xs tracking-wider rounded-lg hover:scale-105 transition-all shadow-lg flex items-center gap-2"
            >
               <Sword size={14} />
               {battleStarted ? "Пауза" : "Начать Абордаж"}
            </button>
         </div>

         {/* Main Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Arena - RESTORED IMAGE STYLE */}
            <div className="lg:col-span-9 flex justify-start">
               <div 
                  className="bg-[#0c0a09] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:30px:30px] rounded-3xl border border-amber-500/10 relative h-[700px] w-[900px] overflow-hidden shadow-inner"
               >
                  {/* Bridge */}
                  <div className="absolute top-[300px] left-[375px] w-[150px] h-[40px] bg-[#1a0f05] border-t border-b border-amber-500/20 flex items-center justify-center">
                     <span className="text-[10px] font-bold uppercase text-amber-500/40 tracking-widest">Мост</span>
                  </div>

                  {/* Ships - CAPSULE SHAPE WITH POINTED BOTTOM */}
                  {/* Player Ship */}
                  <div className="absolute top-[50px] left-[125px] w-[250px] h-[550px] border-2 border-cyan-500/50 rounded-t-full rounded-b-[100px] bg-[#0a0a0a]/90 shadow-[0_0_20px_rgba(6,182,212,0.2)] pointer-events-none flex flex-col items-center pt-8">
                     <div className="bg-cyan-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full mb-4">Твой Корабль</div>
                     
                     {/* Zones inside ship */}
                     <div className="space-y-16 mt-10">
                        <div className="flex flex-col items-center">
                           <span className="text-sm font-serif font-bold text-white">Штурвал</span>
                           <span className="text-[10px] text-cyan-400 font-mono">5 👤</span>
                        </div>
                        <div className="flex flex-col items-center">
                           <span className="text-sm font-serif font-bold text-white">Пушки</span>
                           <span className="text-[10px] text-cyan-400 font-mono">15 👤</span>
                        </div>
                        <div className="flex flex-col items-center">
                           <span className="text-sm font-serif font-bold text-white">Палуба</span>
                           <span className="text-[10px] text-cyan-400 font-mono">20 👤</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Enemy Ship */}
                  <div className="absolute top-[50px] left-[525px] w-[250px] h-[550px] border-2 border-red-500/50 rounded-t-full rounded-b-[100px] bg-[#0a0a0a]/90 shadow-[0_0_20px_rgba(239,68,68,0.2)] pointer-events-none flex flex-col items-center pt-8">
                     <div className="bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full mb-4">Галеон Врага</div>
                     
                     {/* Zones inside ship */}
                     <div className="space-y-16 mt-10">
                        <div className="flex flex-col items-center">
                           <span className="text-sm font-serif font-bold text-white">Мостик</span>
                           <span className="text-[10px] text-red-400 font-mono">5 👤</span>
                        </div>
                        <div className="flex flex-col items-center">
                           <span className="text-sm font-serif font-bold text-white">Батарея</span>
                           <span className="text-[10px] text-red-400 font-mono">15 👤</span>
                        </div>
                        <div className="flex flex-col items-center">
                           <span className="text-sm font-serif font-bold text-white">Каюты</span>
                           <span className="text-[10px] text-red-400 font-mono">10 👤</span>
                        </div>
                     </div>
                  </div>

                  {/* Sailors */}
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

      </div>
    </div>
  );
}
