'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info, Sparkles,
  Zap, Wind, LifeBuoy, RefreshCw
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Define Card Interface
interface Card {
  id: string;
  name: string;
  desc: string;
  cost: number;
  type: 'attack' | 'skill' | 'power';
  icon: any;
  effect: () => void;
}

export default function LairPage() {
  const [battleLog, setBattleLog] = useState<string[]>([
    "Вы вошли в Логово. Бой начинается!",
    "Капитан, прикажите поднять паруса!"
  ]);
  
  const [player, setPlayer] = useState({
    health: 100,
    maxHealth: 100,
    ap: 3,
    maxAp: 3,
    crew: 80,
    training: 70,
    evasion: 10, // %
  });

  const [enemy, setEnemy] = useState({
    name: "Летучий Голландец",
    type: "Проклятый Галеон",
    health: 150,
    maxHealth: 150,
    sails: 100,
    crew: 120,
    evasion: 5,
    intent: { type: 'attack', value: 20, desc: 'Готовится к залпу!' }
  });

  const [deck, setDeck] = useState<Card[]>([
    { id: '1', name: 'Залп Ядрами', desc: 'Наносит 15 урона корпусу.', cost: 1, type: 'attack', icon: Bomb, effect: () => attackEnemy(15, 'hull') },
    { id: '2', name: 'Цепные Ядра', desc: 'Наносит 10 урона. Снижает паруса на 20%.', cost: 1, type: 'attack', icon: Crosshair, effect: () => attackEnemy(10, 'sails') },
    { id: '3', name: 'Ложный Маневр', desc: 'Повышает уклонение на 25% на этот ход.', cost: 2, type: 'skill', icon: Wind, effect: () => changePlayerStat('evasion', 25) },
    { id: '4', name: 'Абордажный Крюк', desc: 'Наносит 30 урона. Требует, чтобы паруса врага были < 50%.', cost: 2, type: 'attack', icon: Sword, effect: () => boardingAttack() },
    { id: '5', name: 'Аврал (Ремонт)', desc: 'Восстанавливает 20 прочности.', cost: 2, type: 'skill', icon: LifeBuoy, effect: () => changePlayerStat('health', 20) },
    { id: '6', name: 'Вдохновение', desc: 'Дает +1 Энергию.', cost: 0, type: 'power', icon: Zap, effect: () => changePlayerStat('ap', 1) },
  ]);

  const [hand, setHand] = useState<Card[]>(deck.slice(0, 4));
  const [isFighting, setIsFighting] = useState(false);

  const addLog = (msg: string) => {
    setBattleLog(prev => [...prev, msg]);
  };

  const attackEnemy = (dmg: number, target: 'hull' | 'sails') => {
    setEnemy(prev => {
      if (target === 'hull') {
        return { ...prev, health: Math.max(0, prev.health - dmg) };
      } else {
        return { ...prev, sails: Math.max(0, prev.sails - dmg) };
      }
    });
    addLog(`⚔️ Вы использовали карту! Нанесено ${dmg} урона по ${target === 'hull' ? 'корпусу' : 'парусам'}.`);
  };

  const changePlayerStat = (stat: 'evasion' | 'health' | 'ap', value: number) => {
    setPlayer(prev => ({ ...prev, [stat]: Math.min(stat === 'health' ? prev.maxHealth : 100, prev[stat] + value) }));
    addLog(`✨ Эффект карты: +${value} к ${stat === 'evasion' ? 'уклонению' : stat === 'health' ? 'прочности' : 'энергии'}.`);
  };

  const boardingAttack = () => {
    if (enemy.sails >= 50) {
      addLog("❌ Нельзя идти на абордаж! Сначала нужно сбить паруса врага ниже 50%!");
      return;
    }
    setEnemy(prev => ({ ...prev, health: Math.max(0, prev.health - 40), crew: Math.max(0, prev.crew - 30) }));
    addLog("☠️ АБОРДАЖ! Вы нанесли сокрушительный урон экипажу и корпусу!");
  };

  const playCard = (card: Card) => {
    if (player.ap < card.cost) {
      addLog("❌ Недостаточно энергии!");
      return;
    }
    setPlayer(prev => ({ ...prev, ap: prev.ap - card.cost }));
    card.effect();
    setHand(prev => prev.filter(c => c.id !== card.id));
    
    // Check win
    if (enemy.health <= 0) {
      addLog("🏆 ПОБЕДА! Вражеский корабль идет на дно!");
    }
  };

  const endTurn = () => {
    setIsFighting(true);
    addLog("⏳ Ход завершен. Враг атакует!");
    
    setTimeout(() => {
      // Enemy action
      const hit = Math.random() * 100 > player.evasion;
      if (hit) {
        setPlayer(prev => ({ ...prev, health: Math.max(0, prev.health - enemy.intent.value) }));
        addLog(`💥 Враг попал! Вы получили ${enemy.intent.value} урона.`);
      } else {
        addLog("🛡️ Вы уклонились от атаки врага!");
      }

      // Reset turn
      setPlayer(prev => ({ ...prev, ap: prev.maxAp, evasion: 10 })); // Reset evasion
      setHand(deck.slice(0, 4)); // Redraw
      setIsFighting(false);
      addLog("🟢 Ваш ход! Энергия восстановлена.");
      
      // Randomize enemy intent for next turn
      const intents = [
        { type: 'attack', value: 20, desc: 'Готовится к залпу!' },
        { type: 'heavy', value: 35, desc: 'Заряжает мощное ядро!' },
        { type: 'debuff', value: 10, desc: 'Целится в ваши паруса!' }
      ];
      setEnemy(prev => ({ ...prev, intent: intents[Math.floor(Math.random() * intents.length)] }));
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-amber-100 font-serif overflow-x-hidden p-6 md:p-12">
      
      {/* Huge Glowing Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
         
         {/* Header */}
         <div className="flex justify-between items-center border-b-2 border-amber-500/20 pb-4">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Тактическая Карта</p>
               <h1 className="text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500">Морской Бой</h1>
            </div>
            <div className="flex gap-2">
               <div className="p-3 bg-black/80 rounded-xl border border-amber-500/30 text-xs flex items-center gap-2">
                  <span className="text-amber-500 font-bold">Энергия:</span>
                  <div className="flex gap-1">
                     {Array.from({ length: player.maxAp }).map((_, i) => (
                        <div key={i} className={cn("w-3 h-3 rounded-full shadow-lg", i < player.ap ? "bg-cyan-400 shadow-cyan-500/50" : "bg-slate-700")} />
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Battle Scene */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Player Ship */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#1a0f00] to-black p-6 rounded-[2rem] border-2 border-amber-500/30 relative">
               <div className="absolute top-4 left-4 p-2 bg-amber-500/20 rounded-lg text-amber-500">
                  <Anchor size={20} />
               </div>
               <div className="text-center mt-6">
                  <h3 className="text-xl font-black uppercase text-amber-100">Ваш Корабль</h3>
                  <p className="text-xs text-amber-500/60">Команда: {player.crew} | Уклон: {player.evasion}%</p>
               </div>
               
               <div className="mt-6 space-y-4">
                  {/* Health */}
                  <div>
                     <div className="flex justify-between text-xs font-black mb-1">
                        <span>ПРОЧНОСТЬ</span>
                        <span className="text-amber-400">{player.health} / {player.maxHealth}</span>
                     </div>
                     <div className="h-3 bg-black rounded-full overflow-hidden border border-amber-500/20">
                        <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400" style={{ width: `${(player.health/player.maxHealth)*100}%` }} />
                     </div>
                  </div>
               </div>
            </div>

            {/* Battle Arena & Enemy */}
            <div className="lg:col-span-8 bg-gradient-to-br from-[#1c0000] to-black p-6 rounded-[2rem] border-2 border-red-500/30 relative">
               <div className="absolute top-4 right-4 p-2 bg-red-500/20 rounded-lg text-red-500">
                  <Skull size={20} />
               </div>
               
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-2xl font-black uppercase text-red-100">{enemy.name}</h3>
                     <p className="text-xs text-red-500/60">{enemy.type}</p>
                  </div>
                  
                  {/* Enemy Intent */}
                  <div className="bg-black/60 p-3 rounded-xl border border-red-500/30 flex items-center gap-2">
                     <Target size={16} className="text-red-500 animate-pulse" />
                     <div>
                        <p className="text-[8px] font-black uppercase text-red-500">Намерение</p>
                        <p className="text-xs font-bold text-amber-100">{enemy.intent.desc} ({enemy.intent.value} ур.)</p>
                     </div>
                  </div>
               </div>

               <div className="mt-6 grid grid-cols-2 gap-6">
                  {/* Enemy Health */}
                  <div>
                     <div className="flex justify-between text-xs font-black mb-1">
                        <span className="text-red-400">КОРПУС</span>
                        <span className="text-red-400">{enemy.health} / {enemy.maxHealth}</span>
                     </div>
                     <div className="h-3 bg-black rounded-full overflow-hidden border border-red-500/20">
                        <div className="h-full bg-gradient-to-r from-red-600 to-orange-500" style={{ width: `${(enemy.health/enemy.maxHealth)*100}%` }} />
                     </div>
                  </div>
                  {/* Enemy Sails */}
                  <div>
                     <div className="flex justify-between text-xs font-black mb-1">
                        <span className="text-cyan-400">ПАРУСА</span>
                        <span className="text-cyan-400">{enemy.sails}%</span>
                     </div>
                     <div className="h-3 bg-black rounded-full overflow-hidden border border-cyan-500/20">
                        <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" style={{ width: `${enemy.sails}%` }} />
                     </div>
                  </div>
               </div>

               {/* Battle Log Overlay inside Arena */}
               <div className="mt-6 bg-black/40 p-4 rounded-xl border border-white/5 h-[100px] overflow-y-auto text-xs font-mono text-slate-400">
                  {battleLog.slice(-3).map((log, i) => (
                     <div key={i} className="mb-1">
                        <span className="text-amber-500/50">&gt;</span> {log}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Hand of Cards (The strategic part) */}
         <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-500">Ваши Команды (Карты)</h4>
               <button 
                  onClick={endTurn}
                  disabled={isFighting}
                  className={cn(
                    "px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-black uppercase text-xs tracking-wider transition-all hover:scale-105 shadow-lg flex items-center gap-2",
                    isFighting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
               >
                  <RefreshCw size={14} className={isFighting ? "animate-spin" : ""} />
                  Завершить Ход
               </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               <AnimatePresence>
                  {hand.map((card) => (
                     <motion.div
                        key={card.id}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ y: -10, scale: 1.05 }}
                        className={cn(
                          "relative p-4 rounded-2xl border-2 cursor-pointer transition-all h-[180px] flex flex-col justify-between overflow-hidden group shadow-2xl",
                          card.type === 'attack' && "bg-gradient-to-br from-red-900/40 to-black border-red-500/30 hover:border-red-500",
                          card.type === 'skill' && "bg-gradient-to-br from-cyan-900/40 to-black border-cyan-500/30 hover:border-cyan-500",
                          card.type === 'power' && "bg-gradient-to-br from-amber-900/40 to-black border-amber-500/30 hover:border-amber-500",
                          player.ap < card.cost && "opacity-50 cursor-not-allowed border-slate-700 hover:border-slate-700"
                        )}
                        onClick={() => playCard(card)}
                     >
                        {/* Cost Badge */}
                        <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-black text-black shadow-lg">
                           {card.cost}
                        </div>

                        {/* Icon */}
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                          card.type === 'attack' && "bg-red-500/20 text-red-400",
                          card.type === 'skill' && "bg-cyan-500/20 text-cyan-400",
                          card.type === 'power' && "bg-amber-500/20 text-amber-400"
                        )}>
                           <card.icon size={20} />
                        </div>

                        {/* Content */}
                        <div>
                           <h5 className="text-sm font-black text-amber-100 uppercase tracking-tighter">{card.name}</h5>
                           <p className="text-[10px] text-slate-400 mt-1 leading-tight">{card.desc}</p>
                        </div>

                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>

      </div>
    </div>
  );
}
