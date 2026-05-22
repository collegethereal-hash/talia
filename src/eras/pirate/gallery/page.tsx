'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Skull, Map as MapIcon, X, Navigation, Anchor, 
  Coins, Ship, Sparkles, Flame, ZoomIn, ZoomOut, Maximize2,
  Sword, Compass, Waves, Users, Crosshair, Beer, Wind, Tent, Castle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/components/DataProvider";

export default function PirateGallery() {
  const router = useRouter();
  const { moments } = useData();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [scale, setScale] = useState(0.8); // Default zoomed out slightly
  
  // Gamification State
  const [gold, setGold] = useState(1500);
  const [crew, setCrew] = useState(25);
  const [sunkShips, setSunkShips] = useState(0);
  
  // Player Ship State
  const [shipPos, setShipPos] = useState({ x: 50, y: 50 }); // percentages
  
  // Game Entities Modals
  const [activeEnemy, setActiveEnemy] = useState<any>(null);
  const [activeTavern, setActiveTavern] = useState<any>(null);

  // Ship Classes
  const SHIP_CLASSES = [
    { type: 'Sloop', name: 'Торговая Шхуна', minStrength: 5, maxStrength: 15, minReward: 100, maxReward: 300, icon: 'ship' },
    { type: 'Brig', name: 'Пиратский Бриг', minStrength: 20, maxStrength: 40, minReward: 400, maxReward: 800, icon: 'ship' },
    { type: 'Frigate', name: 'Британский Фрегат', minStrength: 45, maxStrength: 70, minReward: 900, maxReward: 1800, icon: 'ship' },
    { type: 'Galleon', name: 'Испанский Галеон', minStrength: 75, maxStrength: 110, minReward: 2000, maxReward: 4000, icon: 'ship' },
    { type: 'ManOWar', name: 'Королевский Мановар', minStrength: 120, maxStrength: 200, minReward: 5000, maxReward: 10000, icon: 'crown' },
    { type: 'Ghost', name: 'Летучий Голландец', minStrength: 150, maxStrength: 300, minReward: 15000, maxReward: 30000, icon: 'skull' },
  ];

  const generateRandomEnemy = () => {
    const shipClass = SHIP_CLASSES[Math.floor(Math.random() * SHIP_CLASSES.length)];
    const strength = Math.floor(Math.random() * (shipClass.maxStrength - shipClass.minStrength + 1)) + shipClass.minStrength;
    const reward = Math.floor(Math.random() * (shipClass.maxReward - shipClass.minReward + 1)) + shipClass.minReward;
    
    return {
      id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      strength,
      reward,
      name: shipClass.name,
      shipType: shipClass.type,
      defeated: false
    };
  };

  const initialEnemies = useMemo(() => [
     { id: 'e1', x: 25, y: 35, strength: 15, reward: 300, name: 'Испанский Галеон', shipType: 'Galleon', defeated: false },
     { id: 'e2', x: 75, y: 20, strength: 25, reward: 600, name: 'Британский Фрегат', shipType: 'Frigate', defeated: false },
     { id: 'e3', x: 60, y: 80, strength: 40, reward: 1200, name: 'Летучий Голландец', shipType: 'Ghost', defeated: false },
     { id: 'e4', x: 15, y: 70, strength: 5, reward: 100, name: 'Торговая Шхуна', shipType: 'Sloop', defeated: false },
     { id: 'e5', x: 85, y: 45, strength: 30, reward: 800, name: 'Пиратский Бриг', shipType: 'Brig', defeated: false },
     { id: 'e6', x: 45, y: 15, strength: 10, reward: 200, name: 'Рыболовецкая Шхуна', shipType: 'Sloop', defeated: false },
   ], []);

  const [liveEnemies, setLiveEnemies] = useState<any[]>([]);

  // Load and check battle results
  useEffect(() => {
    // 1. Load enemies from localStorage or initial
    const savedEnemies = localStorage.getItem('pirate_enemies');
    let currentEnemies = (savedEnemies && JSON.parse(savedEnemies).length > 0) 
      ? JSON.parse(savedEnemies) 
      : initialEnemies;

    // 2. Check if we just returned from a battle
    const battleResultStr = localStorage.getItem('last_battle_result');
    if (battleResultStr) {
      const result = JSON.parse(battleResultStr);
      localStorage.removeItem('last_battle_result');

        if (result.winner === 'player') {
          // Find the enemy we fought and replace them with a new random one
          currentEnemies = currentEnemies.map((e: any) => {
            if (e.id === result.enemyId) {
              return generateRandomEnemy();
            }
            return e;
          });
          
          // Update stats and gold using the ACTUAL value from battle result
          const oldSunk = parseInt(localStorage.getItem('pirate_sunk_ships') || '0', 10);
          const newSunk = oldSunk + 1;
          const oldGold = parseInt(localStorage.getItem('pirate_gold') || '1500', 10);
          const newGold = oldGold + (result.reward || 500);
          
          setGold(newGold);
          setSunkShips(newSunk);
          
          localStorage.setItem('pirate_gold', newGold.toString());
          localStorage.setItem('pirate_sunk_ships', newSunk.toString());
        } else if (result.winner === 'enemy') {
        // Loss handling: crew is already updated by LairPage
        alert("Поражение! Враг разгромил нас. Мы отступили с большими потерями...");
      }
    }

    setLiveEnemies(currentEnemies);
    localStorage.setItem('pirate_enemies', JSON.stringify(currentEnemies));

    // Load other stats
    const savedGold = localStorage.getItem('pirate_gold');
    const savedCrew = localStorage.getItem('pirate_crew');
    const savedSunk = localStorage.getItem('pirate_sunk_ships');
    
    if (savedGold) setGold(parseInt(savedGold, 10));
    if (savedCrew) setCrew(parseInt(savedCrew, 10));
    if (savedSunk) setSunkShips(parseInt(savedSunk, 10));
    
    const savedPos = localStorage.getItem('pirate_ship_pos');
    if (savedPos) setShipPos(JSON.parse(savedPos));
  }, []);

  // Save state helpers
  useEffect(() => {
    localStorage.setItem('pirate_gold', gold.toString());
    localStorage.setItem('pirate_crew', crew.toString());
    localStorage.setItem('pirate_enemies', JSON.stringify(liveEnemies));
  }, [gold, crew, liveEnemies]);

  const getDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const isCloseEnough = activeEnemy ? getDistance(shipPos, activeEnemy) < 8 : false;

  const taverns = useMemo(() => [
    { id: 't1', x: 40, y: 45, name: 'Таверна "Кривая Чайка"' },
    { id: 't2', x: 85, y: 65, name: 'Таверна "Пьяный Боцман"' },
    { id: 't3', x: 20, y: 85, name: 'Трактир "Мертвый Якорь"' },
    { id: 't4', x: 70, y: 15, name: 'Порт Ройал' },
    { id: 't5', x: 10, y: 50, name: 'Бухта Контрабандистов' },
  ], []);

  const locations = useMemo(() => [
    { id: 'l1', x: 15, y: 25, name: 'Остров Проклятых', icon: <Skull size={40} className="text-slate-400" /> },
    { id: 'l2', x: 85, y: 85, name: 'Риф Сирен', icon: <Waves size={40} className="text-sky-400" /> },
    { id: 'l3', x: 50, y: 60, name: 'Бездна Кракена', icon: <Anchor size={40} className="text-purple-500" /> },
    { id: 'l4', x: 30, y: 80, name: 'Затерянный Вулкан', icon: <Flame size={40} className="text-red-500" /> },
    { id: 'l5', x: 60, y: 30, name: 'Водоворот Душ', icon: <Sparkles size={40} className="text-emerald-400" /> },
    { id: 'l6', x: 80, y: 10, name: 'Тортуга', icon: <Castle size={40} className="text-amber-600" /> },
    { id: 'l7', x: 10, y: 90, name: 'Форт Нассау', icon: <Tent size={40} className="text-amber-700" /> },
  ], []);

  // Generate random decorative islands and map elements to fill the void
  const decorations = useMemo(() => {
    const items = [];
    // Coastal lines / small islands
    for(let i=0; i<40; i++) {
      items.push({
        id: `dec-isl-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 50 + Math.random() * 150,
        opacity: 0.1 + Math.random() * 0.2
      });
    }
    return items;
  }, []);

  const getCoordinates = (id: string | number) => {
    const strId = String(id);
    let hash = 0;
    for (let i = 0; i < strId.length; i++) hash = strId.charCodeAt(i) + ((hash << 5) - hash);
    const x = Math.abs(hash % 90) + 5; 
    const y = Math.abs((Math.imul(hash, 31)) % 90) + 5;
    return { x, y };
  };

  const handleSailTo = (x: number, y: number) => {
    setShipPos({ x, y });
    setSelectedLocation(null);
    setActiveEnemy(null);
    setActiveTavern(null);
  };

  const handleAttack = () => {
    if (!activeEnemy || !isCloseEnough) return;

    // Save battle context to localStorage
    localStorage.setItem('current_battle_enemy', JSON.stringify({
      id: activeEnemy.id,
      name: activeEnemy.name,
      strength: activeEnemy.strength,
      reward: activeEnemy.reward
    }));
    
    // Save current ship position to return here later
    localStorage.setItem('pirate_ship_pos', JSON.stringify(shipPos));

    // Navigate to Lair
    router.push('/lair');
  };

  const handleHire = () => {
    if (gold >= 100) {
      setGold(prev => prev - 100);
      setCrew(prev => prev + 5);
    } else {
      alert('Не хватает дублонов!');
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#020a17] text-amber-100 font-serif overflow-hidden select-none">
      
      {/* Fleet Stats (HUD) */}
      <div className="absolute top-6 w-full px-6 z-50 flex justify-between items-start pointer-events-none">
         <div className="flex items-center gap-2 bg-[#051329]/90 p-2 rounded-2xl border-2 border-sky-500/20 backdrop-blur-md pointer-events-auto shadow-[0_0_30px_rgba(14,165,233,0.2)]">
           <button onClick={() => setScale(s => Math.max(0.4, s - 0.2))} className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors">
             <ZoomOut size={20} />
           </button>
           <div className="px-4 border-x border-sky-500/20 text-sky-300 font-black uppercase tracking-widest text-[10px] whitespace-nowrap text-center leading-tight">
             Карта <br/>Архипелага
           </div>
           <button onClick={() => setScale(s => Math.min(1.5, s + 0.2))} className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors">
             <ZoomIn size={20} />
           </button>
         </div>

         <div className="flex flex-col md:flex-row gap-4 pointer-events-auto">
            <ResourceBadge icon={<Coins size={16} />} value={gold} label="Дублоны" color="text-amber-400" />
            <ResourceBadge icon={<Users size={16} />} value={crew} label="Команда" color="text-sky-400" />
            <ResourceBadge icon={<Crosshair size={16} />} value={sunkShips} label="Потоплено" color="text-red-400" />
         </div>
      </div>

      {/* Infinite Ocean Background (Fixed to screen to prevent void) */}
      <div className="absolute inset-0 bg-[#020a17] bg-[radial-gradient(ellipse_at_center,#061a38_0%,#020a17_100%)] pointer-events-none z-0" />

      {/* Draggable Map Container (The World) */}
      <motion.div 
        drag
        dragConstraints={{ left: -7500, right: 0, top: -7500, bottom: 0 }} // Correct constraints for 8000px map
        dragElastic={0.05}
        dragMomentum={false}
        initial={{ x: -2000, y: -2000 }}
        animate={{ scale: scale }}
        transition={{ scale: { type: 'spring', stiffness: 100, damping: 25 } }}
        className="absolute w-[8000px] h-[8000px] cursor-grab active:cursor-grabbing origin-center z-10"
      >
         {/* --- RICH MAP TEXTURE --- */}
         <div className="absolute inset-0 bg-[#061a38]/40 border-8 border-sky-900/30 overflow-hidden shadow-[inset_0_0_1000px_rgba(2,10,23,1)]">
            
            {/* Navigational Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.15)_2px,transparent_2px),linear-gradient(90deg,rgba(14,165,233,0.15)_2px,transparent_2px)] bg-[size:400px_400px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:100px_100px]" />

            {/* Giant Rhumb Lines */}
            <div className="absolute top-[50%] left-[50%] w-[1px] h-[200%] bg-sky-400/20 -rotate-45 transform -translate-x-1/2 -translate-y-1/2 origin-top" />
            <div className="absolute top-[50%] left-[50%] w-[1px] h-[200%] bg-sky-400/20 rotate-45 transform -translate-x-1/2 -translate-y-1/2 origin-top" />

            {/* Map Decorative Compasses */}
            <div className="absolute top-[20%] left-[20%] opacity-[0.1] pointer-events-none">
               <Compass size={1500} className="text-sky-300" />
            </div>
            <div className="absolute bottom-[20%] right-[20%] opacity-[0.05] pointer-events-none">
               <Navigation size={2000} className="text-sky-300" />
            </div>

            {/* Generated Map Details (Islands, Coastlines, Whirlpools) to fill the void */}
            {decorations.map((dec, i) => (
              <div 
                key={dec.id} 
                className="absolute border border-sky-400/20 rounded-[40%_60%_70%_30%] mix-blend-overlay flex flex-col items-center justify-center"
                style={{ 
                  left: `${dec.x}%`, top: `${dec.y}%`, 
                  width: `${dec.size}px`, height: `${dec.size}px`, 
                  opacity: dec.opacity,
                  backgroundColor: 'rgba(14,165,233,0.05)'
                }}
              >
              </div>
            ))}

            {/* Ambient Animated Ships (Beautiful) */}
            {[...Array(30)].map((_, i) => {
               const startX = (i * 137.5) % 100; // Deterministic random-ish distribution
               const startY = (i * 151.1) % 100;
               const duration = 20 + (i % 10) * 5;
               return (
                 <motion.div
                   key={`ambient-ship-${i}`}
                   className="absolute z-10 pointer-events-none flex flex-col items-center"
                   style={{ left: `${startX}%`, top: `${startY}%` }}
                   animate={{ 
                     x: [0, 150, 0, -150, 0],
                     y: [0, 80, 160, 80, 0],
                     rotate: [0, 10, 0, -10, 0]
                   }}
                   transition={{ duration, repeat: Infinity, ease: "easeInOut", delay: -(i * 2) }}
                 >
                   <div className="relative text-sky-200/10">
                     <Ship size={80} className="drop-shadow-[0_0_10px_rgba(14,165,233,0.1)]" />
                     {/* Wake effect */}
                     <motion.div 
                       className="absolute -bottom-1 right-4 w-16 h-3 bg-sky-400/20 blur-md rounded-full"
                       animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                       transition={{ duration: 4, repeat: Infinity }}
                     />
                   </div>
                 </motion.div>
               );
            })}
         </div>

         {/* ================= GAME ENTITIES ================= */}

         {/* 0. Static Locations (Cities, Reefs, Monsters) */}
         {locations.map(loc => (
           <div
             key={loc.id}
             className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
             style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
             onClick={() => setSelectedLocation({ ...loc, type: 'location' })}
           >
              <motion.div whileHover={{ scale: 1.15 }} className="relative flex flex-col items-center">
                 <div className="p-8 bg-[#0a1a38]/90 rounded-full border-4 border-sky-800 shadow-[0_0_60px_rgba(14,165,233,0.3)] backdrop-blur-md">
                   {loc.icon}
                 </div>
                 <div className="absolute -bottom-10 whitespace-nowrap text-[14px] font-black uppercase tracking-[0.4em] text-sky-200/80 drop-shadow-[0_0_10px_rgba(14,165,233,0.8)] bg-[#020a17]/80 px-4 py-1 rounded-lg">
                   {loc.name}
                 </div>
              </motion.div>
           </div>
         ))}

         {/* 1. Taverns & Ports (Cities) */}
         {taverns.map(tavern => (
           <div
             key={tavern.id}
             className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-30 cursor-pointer"
             style={{ left: `${tavern.x}%`, top: `${tavern.y}%` }}
             onClick={() => setActiveTavern(tavern)}
           >
              <motion.div whileHover={{ scale: 1.15 }} className="relative flex flex-col items-center">
                 <div className="p-6 bg-[#2a1a10]/90 rounded-full border-4 border-amber-600 shadow-[0_0_50px_rgba(217,119,6,0.4)] backdrop-blur-md">
                   {tavern.id.includes('t4') || tavern.id.includes('t5') ? <Castle size={40} className="text-amber-500" /> : <Beer size={40} className="text-amber-500" />}
                 </div>
                 <div className="absolute -bottom-10 whitespace-nowrap px-4 py-2 bg-black/90 rounded-xl border border-amber-600/50 text-[12px] font-black uppercase tracking-widest text-amber-300 drop-shadow-xl">
                   {tavern.name}
                 </div>
              </motion.div>
           </div>
         ))}

         {/* 2. Enemy Ships */}
         {liveEnemies.map(enemy => {
           const isBoss = enemy.shipType === 'ManOWar' || enemy.shipType === 'Ghost';
           const isWeak = enemy.shipType === 'Sloop';
           
           return (
             <div
               key={enemy.id}
               className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-30 cursor-pointer"
               style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
               onClick={() => !enemy.defeated && setActiveEnemy(enemy)}
             >
                <motion.div 
                  whileHover={!enemy.defeated ? { scale: 1.15 } : {}}
                  animate={!enemy.defeated ? { 
                    y: isBoss ? [-25, 25, -25] : [-15, 15, -15], 
                    rotate: isBoss ? [-5, 5, -5] : [-3, 3, -3] 
                  } : {}}
                  transition={{ duration: isBoss ? 4 : 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex flex-col items-center"
                >
                   {enemy.defeated ? (
                     <div className="p-6 bg-red-900/10 rounded-full border-2 border-red-900/30 opacity-50">
                       <Skull size={48} className="text-red-900/40" />
                     </div>
                   ) : (
                     <>
                       <div className={cn(
                         "p-6 rounded-full border-4 flex items-center justify-center shadow-2xl transition-all",
                         isBoss 
                           ? "bg-purple-900/90 border-purple-500 shadow-[0_0_80px_rgba(168,85,247,0.6)] scale-125" 
                           : isWeak 
                             ? "bg-slate-800/90 border-slate-500 shadow-[0_0_30px_rgba(100,116,139,0.3)] scale-90"
                             : "bg-[#3a0a0a]/90 border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.5)]"
                       )}>
                         {enemy.shipType === 'Ghost' ? (
                           <Skull size={isBoss ? 72 : 56} className="text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.8)]" />
                         ) : enemy.shipType === 'ManOWar' ? (
                           <Crown size={72} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                         ) : (
                           <Ship size={isWeak ? 40 : 56} className={cn(
                             isWeak ? "text-slate-400" : "text-red-500",
                             "drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]"
                           )} />
                         )}
                       </div>
                       
                       {/* Label with dynamic color */}
                       <div className={cn(
                         "absolute -bottom-14 whitespace-nowrap px-4 py-2 bg-black/90 rounded-xl border flex items-center gap-2 drop-shadow-xl z-10",
                         isBoss ? "border-purple-500 text-purple-300" : isWeak ? "border-slate-500 text-slate-400" : "border-red-600 text-red-400"
                       )}>
                         {isBoss ? <Skull size={14} /> : isWeak ? <Anchor size={14} /> : <Sword size={14} />}
                         <span className="font-black uppercase tracking-widest text-[10px]">{enemy.name}</span>
                         <span className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-[9px] border border-white/5">lvl {enemy.strength}</span>
                       </div>
                     </>
                   )}
                </motion.div>
             </div>
           );
         })}

         {/* 3. Rendering Photos as Treasure Islands (Ports) */}
         {(moments || []).map((photo: any) => {
            const pos = getCoordinates(photo.id);
            return (
              <div
                key={photo.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => setSelectedLocation({ ...photo, type: 'photo', x: pos.x, y: pos.y })}
              >
                 <motion.div whileHover={{ scale: 1.1, zIndex: 50 }} className="relative flex flex-col items-center">
                    <div className="p-3 bg-[#0a1a38] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] border-8 border-sky-800 transform rotate-[3deg] group-hover:rotate-0 transition-transform">
                       <div className="w-32 h-32 sm:w-48 sm:h-48 bg-[#040f24] relative overflow-hidden rounded-lg">
                          <img 
                            src={photo.src || photo.url || photo.image_url} 
                            alt={photo.caption}
                            className="w-full h-full object-cover mix-blend-luminosity opacity-80"
                          />
                          <div className="absolute inset-0 bg-sky-900/20 mix-blend-overlay" />
                          <div className="absolute top-3 right-3 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-2xl border-2 border-sky-200">
                             <Anchor size={16} className="text-slate-900" />
                          </div>
                       </div>
                    </div>
                    
                    <div className="absolute -bottom-16 whitespace-nowrap px-6 py-3 bg-black/90 backdrop-blur-md rounded-2xl border-2 border-sky-500/50 text-[12px] font-black uppercase tracking-widest text-sky-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_30px_rgba(14,165,233,0.5)] flex items-center gap-2">
                      <Anchor size={14} /> Порт: {photo.caption}
                    </div>
                 </motion.div>
              </div>
            );
         })}

         {/* ================= THE PLAYER FLAGSHIP ================= */}
         <motion.div
           className="absolute z-[100] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
           animate={{ left: `${shipPos.x}%`, top: `${shipPos.y}%` }}
           transition={{ duration: 60, ease: "linear" }} // Takes exactly 60 seconds to sail
         >
            <div className="relative flex flex-col items-center">
               {/* Massive Glowing Wake */}
               <motion.div 
                 className="absolute -bottom-10 right-4 w-64 h-24 bg-sky-400/30 blur-[30px] rounded-full"
                 animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                 transition={{ duration: 2.5, repeat: Infinity }}
               />
               
               {/* Ship Body */}
               <div className="relative">
                  <Ship size={160} className="text-amber-400 drop-shadow-[0_0_40px_rgba(251,191,36,0.8)]" />
                  <div className="absolute top-0 right-0 w-10 h-10 bg-emerald-500 rounded-full border-4 border-emerald-900 shadow-[0_0_20px_rgba(16,185,129,0.8)] flex items-center justify-center animate-pulse">
                    <Wind size={18} className="text-white" />
                  </div>
               </div>

               {/* Label */}
               <div className="absolute -bottom-12 px-6 py-2 bg-black/80 backdrop-blur-md rounded-full border-2 border-amber-500/50 text-[14px] font-black uppercase tracking-widest text-amber-300 whitespace-nowrap shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                  Ваш Флагман
               </div>
            </div>
         </motion.div>
      </motion.div>

      {/* ================= MODALS ================= */}

      {/* Generic Location Modal (Photos & Static Locations) */}
      <AnimatePresence>
        {selectedLocation && (
          <ModalOverlay onClose={() => setSelectedLocation(null)}>
             <div className="flex flex-col items-center text-center space-y-6">
                {selectedLocation.type === 'location' ? (
                  <div className="w-32 h-32 bg-[#061a38] border-4 border-sky-800 rounded-full flex items-center justify-center shadow-2xl">
                     {selectedLocation.icon}
                  </div>
                ) : (
                  <div className="w-full max-w-sm aspect-[4/3] bg-black rounded-3xl overflow-hidden border-4 border-sky-500/30 shadow-2xl relative">
                     <img src={selectedLocation.src || selectedLocation.url || selectedLocation.image_url} className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
                  </div>
                )}
                
                <div className="space-y-2">
                   <h2 className="text-4xl font-black uppercase tracking-tighter text-sky-100">{selectedLocation.name || selectedLocation.caption}</h2>
                   <p className="text-sky-500/60 font-bold uppercase text-[10px] tracking-widest">
                     {selectedLocation.type === 'location' ? 'Неизведанные воды' : 'Безопасный Порт'}
                   </p>
                </div>
                
                <p className="text-sky-100/60 italic leading-relaxed text-sm max-w-sm">
                  {selectedLocation.type === 'location' 
                    ? "Легенды гласят, что здесь сокрыты великие тайны. Поднимаем паруса?" 
                    : "Отличное место для отдыха. Направим корабль к этим берегам?"}
                </p>

                <div className="pt-6 w-full flex flex-col gap-4">
                   <button 
                     onClick={() => handleSailTo(selectedLocation.x, selectedLocation.y)}
                     className="w-full py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                   >
                     <Wind size={20} /> Поднять паруса! (Плыть сюда)
                   </button>
                   <button onClick={() => setSelectedLocation(null)} className="py-4 border-2 border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-colors">
                     Отмена
                   </button>
                </div>
             </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Battle Modal */}
      <AnimatePresence>
        {activeEnemy && (
          <ModalOverlay onClose={() => setActiveEnemy(null)}>
             <div className="text-center space-y-4">
                <div className="mx-auto w-32 h-32 bg-red-950 border-4 border-red-500 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                   <Ship size={64} />
                </div>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-sky-100">Враг на горизонте</h2>
                <p className="text-red-400 font-bold text-2xl">{activeEnemy.name}</p>
                
                <div className="flex justify-center gap-8 py-8 border-y border-white/5 bg-black/40 rounded-3xl mt-6">
                   <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-500/40">Сила врага</p>
                      <p className="text-4xl font-bold text-red-400 flex items-center justify-center gap-2"><Sword size={24}/> {activeEnemy.strength}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-500/40">Твоя команда</p>
                      <p className={cn("text-4xl font-bold flex items-center justify-center gap-2", crew >= activeEnemy.strength ? "text-emerald-400" : "text-red-400")}>
                        <Users size={24}/> {crew}
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                   <button 
                     onClick={() => handleSailTo(activeEnemy.x, activeEnemy.y)}
                     className="py-4 bg-emerald-600/20 text-emerald-400 border-2 border-emerald-500/50 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600/40 transition-colors flex items-center justify-center gap-2"
                   >
                     <Wind size={16} /> Плыть к ним
                   </button>
                   {isCloseEnough ? (
                     <button 
                      onClick={handleAttack}
                      className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
                     >
                       <Crosshair size={18} /> ЗАЛП!
                     </button>
                   ) : (
                     <div className="py-4 bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border-2 border-slate-700 opacity-60">
                       Нужно подплыть ближе
                     </div>
                   )}
                </div>
             </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Tavern Modal */}
      <AnimatePresence>
        {activeTavern && (
          <ModalOverlay onClose={() => setActiveTavern(null)}>
             <div className="text-center space-y-4">
                <div className="mx-auto w-32 h-32 bg-[#2a1a10] border-4 border-amber-600 rounded-full flex items-center justify-center text-amber-500 mb-6 shadow-[0_0_50px_rgba(217,119,6,0.5)]">
                   {activeTavern.id.includes('t4') || activeTavern.id.includes('t5') ? <Castle size={64} /> : <Beer size={64} />}
                </div>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-amber-100">{activeTavern.name}</h2>
                <p className="text-sky-100/60 italic leading-relaxed">"Идеальное место, чтобы пополнить запасы и найти новых пиратов в команду."</p>
                
                <div className="bg-black/40 p-8 rounded-[2rem] border border-amber-600/30 flex flex-col items-center my-8 gap-6">
                   <div className="text-center">
                     <p className="text-xl font-bold text-amber-100">Нанять 5 матросов</p>
                     <p className="text-xs font-black uppercase tracking-widest text-amber-500/60 flex items-center justify-center gap-2 mt-2"><Coins size={14}/> Стоимость: 100 дублонов</p>
                   </div>
                   <button 
                    onClick={handleHire}
                    className="w-full py-4 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-transform"
                   >
                     Оплатить ром (Нанять)
                   </button>
                </div>

                <button 
                  onClick={() => handleSailTo(activeTavern.x, activeTavern.y)}
                  className="w-full py-4 bg-emerald-600/20 text-emerald-400 border-2 border-emerald-500/50 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-600/40 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <Wind size={20} /> Плыть сюда
                </button>
             </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResourceBadge({ icon, value, label, color }: any) {
  return (
    <div className="flex items-center gap-3 bg-[#051329]/90 p-2 pr-6 rounded-2xl border-2 border-sky-500/20 backdrop-blur-md shadow-lg">
      <div className={cn("p-2 bg-white/5 rounded-xl border border-white/10", color)}>{icon}</div>
      <div>
        <p className={cn("text-xl font-black leading-none", color)}>{value}</p>
        <p className="text-[8px] font-black uppercase tracking-widest text-sky-400/50 mt-1">{label}</p>
      </div>
    </div>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-auto">
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
       <motion.div initial={{ scale: 0.9, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 50, opacity: 0 }} className="relative w-full max-w-2xl bg-[#020a17] border-4 border-sky-900/50 rounded-[3rem] shadow-[0_0_100px_rgba(14,165,233,0.3)] p-8 md:p-12 overflow-hidden pirate-wood">
          <button onClick={onClose} className="absolute top-6 right-6 text-sky-500/40 hover:text-sky-300 transition-colors z-10"><X size={32} /></button>
          <div className="relative z-10">{children}</div>
       </motion.div>
    </div>
  );
}
