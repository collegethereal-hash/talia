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
  state: 'idle' | 'moving' | 'fighting' | 'retreating' | 'shooting';
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
}

export default function LairPage() {
  const [battleLog, setBattleLog] = useState<string[]>([
    "Капитан! Вражеский галеон подошел на расстояние выстрела!",
    "Прикажите начать абордаж или открыть огонь!"
  ]);
  
  const [sailors, setSailors] = useState<Sailor[]>([]);
  const [cannonballs, setCannonballs] = useState<Cannonball[]>([]);
  
  // Positions matching the 250x450 ships
  const [zones, setZones] = useState<Zone[]>([
    { id: 'p_helm', name: 'Штурвал', x: 250, y: 150, team: 'player' },
    { id: 'p_cannons', name: 'Пушки', x: 250, y: 300, team: 'player' },
    { id: 'p_deck', name: 'Палуба', x: 250, y: 450, team: 'player' },
    
    { id: 'e_cabin', name: 'Мостик', x: 650, y: 150, team: 'enemy' },
    { id: 'e_battery', name: 'Батарея', x: 650, y: 300, team: 'enemy' },
    { id: 'e_hold', name: 'Каюты', x: 650, y: 450, team: 'enemy' },
  ]);

  const [battleStarted, setBattleStarted] = useState(false);
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

    // Player
    for (let i = 0; i < 40; i++) {
      const zone = zones[Math.floor(Math.random() * 3)];
      initialSailors.push({ 
        id: id++, 
        x: zone.x + (Math.random() * 60 - 30), 
        y: zone.y + (Math.random() * 60 - 30), 
        targetX: zone.x, 
        targetY: zone.y, 
        color: 'bg-cyan-400', 
        team: 'player', 
        state: 'idle', 
        path: [], 
        hp: 100, 
        type: i < 20 ? 'swordsman' : (i < 35 ? 'gunner' : 'sapper')
      });
    }

    // Enemy
    for (let i = 0; i < 40; i++) {
      const zone = zones[3 + Math.floor(Math.random() * 3)];
      initialSailors.push({ 
        id: id++, 
        x: zone.x + (Math.random() * 60 - 30), 
        y: zone.y + (Math.random() * 60 - 30), 
        targetX: zone.x, 
        targetY: zone.y, 
        color: 'bg-red-500', 
        team: 'enemy', 
        state: 'idle', 
        path: [], 
        hp: 100, 
        type: i < 20 ? 'swordsman' : (i < 35 ? 'gunner' : 'sapper')
      });
    }

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
    <div className="relative min-h-screen bg-[#070402] text-amber-100 font-sans overflow-x-hidden p-4 md:p-8">
      
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-4">
         
         {/* Title */}
         <div className="flex justify-between items-center border-b-2 border-amber-500/30 pb-4">
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
            
            {/* Arena */}
            <div className="lg:col-span-9 flex justify-start">
               <div 
                  className="bg-[#0c0a09] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:30px_30px] rounded-3xl border border-amber-500/10 relative h-[650px] w-[900px] overflow-hidden shadow-inner flex justify-around items-center"
               >
                  {/* Bridge with Wood Planks Style */}
                  <div 
                     className="absolute top-[300px] left-[375px] w-[150px] h-[40px] bg-[#2d1a0a] border-t border-b border-amber-500/30 flex items-center justify-center shadow-lg"
                     style={{
                        backgroundImage: 'linear-gradient(90deg, transparent 9px, rgba(0,0,0,0.4) 1px)',
                        backgroundSize: '10px 100%'
                     }}
                  >
                     <span className="text-[10px] font-bold uppercase text-amber-500/60 tracking-widest bg-[#2d1a0a] px-2">Мост</span>
                  </div>

                  {/* PLAYER SHIP (Left) */}
                  <div className="relative w-[250px] h-[450px] border-4 border-cyan-500/30 rounded-[80px] bg-cyan-900/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                     <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-cyan-500 text-black px-4 py-1 text-xs font-black uppercase rounded-full">Твой Корабль</div>
                     
                     {/* Bow (Triangle at bottom) */}
                     <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[125px] border-r-[125px] border-t-[60px] border-l-transparent border-r-transparent border-t-cyan-500/20" />
                     
                     {/* Zones inside ship */}
                     <div className="space-y-16 mt-16 text-center relative z-10">
                        <div>
                           <h4 className="text-sm font-serif font-bold text-white">Штурвал</h4>
                           <p className="text-[10px] text-cyan-400 font-mono">5 👤</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-serif font-bold text-white">Пушки</h4>
                           <p className="text-[10px] text-cyan-400 font-mono">15 👤</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-serif font-bold text-white">Палуба</h4>
                           <p className="text-[10px] text-cyan-400 font-mono">20 👤</p>
                        </div>
                     </div>
                  </div>
                  
                  {/* ENEMY SHIP (Right) */}
                  <div className="relative w-[250px] h-[450px] border-4 border-red-500/30 rounded-[80px] bg-red-900/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                     <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-1 text-xs font-black uppercase rounded-full">Галеон Врага</div>
                     
                     {/* Bow (Triangle at bottom) */}
                     <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[125px] border-r-[125px] border-t-[60px] border-l-transparent border-r-transparent border-t-red-500/20" />
                     
                     {/* Zones inside ship */}
                     <div className="space-y-16 mt-16 text-center relative z-10">
                        <div>
                           <h4 className="text-sm font-serif font-bold text-white">Мостик</h4>
                           <p className="text-[10px] text-red-400 font-mono">5 👤</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-serif font-bold text-white">Батарея</h4>
                           <p className="text-[10px] text-red-400 font-mono">15 👤</p>
                        </div>
                        <div>
                           <h4 className="text-sm font-serif font-bold text-white">Каюты</h4>
                           <p className="text-[10px] text-red-400 font-mono">10 👤</p>
                        </div>
                     </div>
                  </div>

                  {/* Sailors */}
                  {sailors.map(sailor => (
                     <div
                        key={sailor.id}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full absolute transition-all duration-300 ease-linear border border-black/30 shadow-md z-20", 
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
                        className="w-3 h-3 bg-yellow-500 rounded-full absolute shadow-lg z-20"
                        style={{ left: `${ball.x}px`, top: `${ball.y}px`, transform: 'translate(-50%, -50%)' }}
                     />
                  ))}

               </div>
            </div>

            {/* Right Side: Chat with Polina (Instead of Journal) */}
            <div className="lg:col-span-3 h-[650px] flex flex-col bg-gradient-to-br from-[#1a0f05] to-[#0a0501] border-2 border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden">
               
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
