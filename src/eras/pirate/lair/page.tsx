'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function LairPage() {
  const [battleLog, setBattleLog] = useState<string[]>([
    "Вы вошли в Логово. Команда готова к бою.",
    "На горизонте замечен Британский Торговый Флот!"
  ]);
  
  const [playerShip, setPlayerShip] = useState({
    health: 100,
    crew: 80,
    training: 70, // %
    cannons: 40,
    ammo: 100
  });

  const [enemyShip, setEnemyShip] = useState({
    name: "Золотая Лань",
    type: "Галеон",
    health: 120,
    crew: 100,
    cannons: 50,
    parts: {
      hull: 100,
      sails: 100,
      deck: 100
    }
  });

  const [isFighting, setIsFighting] = useState(false);

  const addLog = (msg: string) => {
    setBattleLog(prev => [...prev, msg]);
  };

  const handleAttack = (type: string) => {
    setIsFighting(true);
    setTimeout(() => {
      let msg = "";
      let dmg = 0;
      
      const trainingFactor = playerShip.training / 100;
      const crewFactor = playerShip.crew / 100;

      switch (type) {
        case 'cannons':
          dmg = Math.floor((playerShip.cannons * 0.8) + (20 * trainingFactor));
          msg = `🔥 Залп из всех пушек! Нанесено ${dmg} урона по корпусу врага.`;
          setEnemyShip(prev => ({...prev, health: Math.max(0, prev.health - dmg), parts: {...prev.parts, hull: Math.max(0, prev.parts.hull - dmg)}}));
          break;
        case 'sabotage':
          dmg = 15;
          msg = `💣 Диверсионная группа пробралась на борт! Вражеские паруса повреждены на ${dmg}%.`;
          setEnemyShip(prev => ({...prev, parts: {...prev.parts, sails: Math.max(0, prev.parts.sails - dmg)}}));
          break;
        case 'boarding':
          const playerLosses = Math.floor(Math.random() * 10);
          const enemyLosses = Math.floor(15 * crewFactor * trainingFactor);
          msg = `⚔️ АБОРДАЖ! Наша команда бросилась на палубу. Мы потеряли ${playerLosses} матросов, враг потерял ${enemyLosses}.`;
          setPlayerShip(prev => ({...prev, crew: Math.max(0, prev.crew - playerLosses)}));
          setEnemyShip(prev => ({...prev, crew: Math.max(0, prev.crew - enemyLosses), parts: {...prev.parts, deck: Math.max(0, prev.parts.deck - 20)}}));
          break;
      }
      
      addLog(msg);
      setIsFighting(false);
      
      // Enemy counter attack
      if (enemyShip.health > 0) {
        setTimeout(() => {
          const enemyDmg = Math.floor(Math.random() * 15);
          setPlayerShip(prev => ({...prev, health: Math.max(0, prev.health - enemyDmg)}));
          addLog(`💢 Враг отвечает огнем! Получено ${enemyDmg} урона.`);
        }, 1000);
      }
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0501] text-amber-100 font-serif overflow-x-hidden p-6 md:p-12">
      
      {/* HUGE Glowing Orbs for massive brightness and atmosphere */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-orange-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[700px] h-[700px] bg-red-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-yellow-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Sparkles everywhere */}
      <div className="absolute inset-0 pointer-events-none">
         {/* Sparkles removed due to TS error */}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
         
         {/* Header - Super Bright and Epic */}
         <div className="flex flex-col md:flex-row justify-between md:items-center border-b-2 border-amber-500/30 pb-6 gap-4">
            <div>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-amber-400">Пиратский Военный Совет</p>
               <h1 className="text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-red-600 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">Логово</h1>
            </div>
            <div className="flex gap-4">
               <div className="p-4 bg-gradient-to-br from-amber-900/40 to-black rounded-2xl border-2 border-amber-500/50 text-xs shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <span className="text-amber-200/60 uppercase font-black text-[9px] block mb-1">Золото Казны</span>
                  <span className="text-amber-400 font-black text-xl">10,000 🪙</span>
               </div>
               <div className="p-4 bg-gradient-to-br from-sky-900/40 to-black rounded-2xl border-2 border-sky-500/50 text-xs shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                  <span className="text-sky-200/60 uppercase font-black text-[9px] block mb-1">Верные Матросы</span>
                  <span className="text-sky-400 font-black text-xl">{playerShip.crew} 👥</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Battle Map / Visuals */}
            <div className="lg:col-span-8 space-y-6">
               
               {/* Enemy Ship Card - Very Bright */}
               <div className="bg-gradient-to-br from-[#2c1404] via-[#1a0a02] to-[#0a0501] p-8 rounded-[2.5rem] border-2 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-15">
                     <Skull size={120} className="text-red-500" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                     <div>
                        <span className="text-[10px] font-black uppercase bg-red-500 text-white px-3 py-1 rounded-full shadow-lg">Цель для Нападения</span>
                        <h2 className="text-4xl font-black text-amber-100 uppercase mt-2 drop-shadow-lg">{enemyShip.name}</h2>
                        <p className="text-sm text-red-400 font-bold flex items-center gap-2">
                           <Flame size={14} /> Тяжелый {enemyShip.type}
                        </p>
                     </div>
                     <div className="flex-1 max-w-xs space-y-4">
                        {/* Health */}
                        <div>
                           <div className="flex justify-between text-xs font-black mb-1">
                              <span className="text-amber-200">ПРОЧНОСТЬ КОРПУСА</span>
                              <span className="text-red-400">{enemyShip.health} / 120</span>
                           </div>
                           <div className="h-3 bg-black rounded-full overflow-hidden border border-red-500/30">
                              <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${(enemyShip.health/120)*100}%` }} />
                           </div>
                        </div>
                        {/* Parts */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                           <div className="text-center bg-black/60 p-2 rounded-lg border border-amber-500/20">
                              <p className="text-[9px] font-black uppercase text-slate-500">Паруса</p>
                              <p className="text-sm font-black text-amber-400">{enemyShip.parts.sails}%</p>
                           </div>
                           <div className="text-center bg-black/60 p-2 rounded-lg border border-amber-500/20">
                              <p className="text-[9px] font-black uppercase text-slate-500">Палуба</p>
                              <p className="text-sm font-black text-amber-400">{enemyShip.parts.deck}%</p>
                           </div>
                           <div className="text-center bg-black/60 p-2 rounded-lg border border-amber-500/20">
                              <p className="text-[9px] font-black uppercase text-slate-500">Команда</p>
                              <p className="text-sm font-black text-amber-400">{enemyShip.crew}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Battle Arena - Brighter and Larger */}
               <div className="h-[350px] bg-gradient-to-b from-[#0a0501] to-[#1a0a02] rounded-[2.5rem] border-2 border-amber-500/30 relative flex items-center justify-center overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
                  
                  {/* Glowing ocean grid lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(245,158,11,0.05)_100%)]" />
                  
                  {/* Player Ship Icon */}
                  <motion.div 
                    animate={{ y: [0, -15, 0], rotate: [0, -2, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute left-1/5 flex flex-col items-center"
                  >
                     <div className="w-24 h-24 bg-gradient-to-br from-amber-500/30 to-transparent rounded-3xl border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] backdrop-blur-sm">
                        <Anchor size={48} />
                     </div>
                     <p className="text-sm font-black mt-3 text-amber-100 uppercase tracking-widest">Твой Флагман</p>
                  </motion.div>

                  {/* VS Element */}
                  <div className="relative z-10 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl font-black text-white italic shadow-[0_0_20px_rgba(239,68,68,0.5)] border-4 border-white/20">
                     VS
                  </div>

                  {/* Enemy Ship Icon */}
                  <motion.div 
                    animate={{ y: [0, 15, 0], rotate: [0, 2, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 4, delay: 2 }}
                    className="absolute right-1/5 flex flex-col items-center"
                  >
                     <div className="w-24 h-24 bg-gradient-to-br from-red-500/30 to-transparent rounded-3xl border-2 border-red-500 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-sm">
                        <Skull size={48} />
                     </div>
                     <p className="text-sm font-black mt-3 text-red-400 uppercase tracking-widest">{enemyShip.name}</p>
                  </motion.div>

                  {/* Effects (Fighting) */}
                  {isFighting && (
                    <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none flex items-center justify-center">
                       <div className="text-6xl font-black text-white uppercase tracking-widest drop-shadow-2xl">ОГОНЬ!</div>
                    </div>
                  )}
               </div>

               {/* Strategies / Actions - Massive and Bright */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ActionButton 
                    title="Залп Пушек" 
                    desc="Массированный огонь по корпусу" 
                    icon={<Bomb size={24} />} 
                    color="text-orange-500"
                    bg="bg-gradient-to-br from-orange-600/20 to-black"
                    border="border-orange-500/50"
                    onClick={() => handleAttack('cannons')}
                    disabled={isFighting}
                  />
                  <ActionButton 
                    title="Диверсия" 
                    desc="Порвать паруса и сломать руль" 
                    icon={<Crosshair size={24} />} 
                    color="text-cyan-400"
                    bg="bg-gradient-to-br from-cyan-600/20 to-black"
                    border="border-cyan-500/50"
                    onClick={() => handleAttack('sabotage')}
                    disabled={isFighting}
                  />
                  <ActionButton 
                    title="Абордаж" 
                    desc="Рукопашный бой на палубе" 
                    icon={<Sword size={24} />} 
                    color="text-red-500"
                    bg="bg-gradient-to-br from-red-600/20 to-black"
                    border="border-red-500/50"
                    onClick={() => handleAttack('boarding')}
                    disabled={isFighting}
                  />
               </div>

            </div>

            {/* Right: Battle Log & Stats */}
            <div className="lg:col-span-4 space-y-6">
               
               {/* Player Stats - Brighter */}
               <div className="bg-gradient-to-br from-[#1a0a02] to-black p-6 rounded-[2rem] border-2 border-amber-500/30 space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-400">Твое Состояние</h4>
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-xs font-black mb-1">
                           <span className="text-amber-200/60">ПРОЧНОСТЬ</span>
                           <span className="text-amber-400">{playerShip.health}%</span>
                        </div>
                        <div className="h-2 bg-black rounded-full overflow-hidden border border-amber-500/20">
                           <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${playerShip.health}%` }} />
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-xs font-black mb-1">
                           <span className="text-sky-200/60">ПОДГОТОВКА</span>
                           <span className="text-sky-400">{playerShip.training}%</span>
                        </div>
                        <div className="h-2 bg-black rounded-full overflow-hidden border border-sky-500/20">
                           <div className="h-full bg-gradient-to-r from-sky-600 to-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${playerShip.training}%` }} />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Battle Log - Brighter with better contrast */}
               <div className="bg-gradient-to-br from-[#0a0501] to-black p-6 rounded-[2rem] border-2 border-amber-500/30 h-[430px] flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-400 mb-4">Журнал Сражения</h4>
                  <div className="flex-1 overflow-y-auto space-y-3 text-xs text-amber-100/90 font-mono">
                     {battleLog.map((log, i) => (
                        <div key={i} className="border-b border-amber-900/20 pb-2 leading-relaxed">
                           <span className="text-amber-500 font-black">[{i+1}]</span> {log}
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

function ActionButton({ title, desc, icon, color, bg, border, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-6 rounded-2xl border-2 text-left hover:scale-[1.02] transition-all group relative overflow-hidden shadow-lg",
        bg,
        border,
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      )}
    >
       <div className={cn("p-4 bg-black/60 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform shadow-lg", color)}>
          {icon}
       </div>
       <h5 className="text-xl font-black text-amber-100 uppercase tracking-tighter">{title}</h5>
       <p className="text-xs text-slate-400 mt-2 leading-relaxed">{desc}</p>
       <div className="absolute top-4 right-4 opacity-30 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={18} className="text-amber-500" />
       </div>
    </button>
  );
}
