'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Skull, Anchor, Sword, Scroll, 
  Map as MapIcon, Compass, Coins, Heart,
  Lock, Calendar, Sparkles, Trash2, Mail,
  Ship, Wind, User, Edit3, Save, X, Flame, Target, Trophy, Crown, Eye, Crosshair, Shield, CheckCircle, Info, Beer
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useData } from '@/components/DataProvider';

export default function PirateProfile() {
  const { currentUser, profiles, capsules } = useData();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showShipDetails, setShowShipDetails] = useState(false);
  
  // Local Stats from Store/Gameplay
  const [gold, setGold] = useState(0);
  const [crew, setCrew] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [sunkShips, setSunkShips] = useState(0);

  useEffect(() => {
    const savedGold = localStorage.getItem('pirate_gold');
    const savedCrew = localStorage.getItem('pirate_crew');
    const savedInv = localStorage.getItem('pirate_inventory');
    const savedSunk = localStorage.getItem('pirate_sunk_ships');
    
    if (savedGold) setGold(parseInt(savedGold, 10));
    if (savedCrew) setCrew(parseInt(savedCrew, 10));
    if (savedInv) setInventory(JSON.parse(savedInv));
    if (savedSunk) setSunkShips(parseInt(savedSunk, 10));
    else setSunkShips(Math.floor(Math.random() * 20) + 5); 
  }, []);

  const selectedProfile = selectedProfileId ? profiles[selectedProfileId] : null;

  // Determine Ship based on inventory
  const getFlagship = () => {
    if (inventory.includes('s4')) return { 
      name: 'Летучий Голландец', desc: 'Корабль призраков. Неуязвим для ядер.', icon: <Skull size={80} className="text-teal-400 drop-shadow-[0_0_20px_rgba(45,212,191,0.5)]" />, 
      stats: { speed: 100, armor: 100, cannons: 100, cargo: 20 },
      modules: { hull: 'Проклятое Дерево', sails: 'Рваные тени', figurehead: 'Жнец Душ' },
      blueprint: 'Секретные записи Ост-Индской компании гласят, что этот корабль может погружаться под воду и плыть против ветра. На его борту нет живых матросов, только те, кто обменял свою душу на вечность.'
    };
    if (inventory.includes('s3')) return { 
      name: 'Испанский Галеон', desc: 'Огромный трюм и непробиваемая броня.', icon: <Shield size={80} className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />, 
      stats: { speed: 30, armor: 95, cannons: 80, cargo: 100 },
      modules: { hull: 'Железное Дерево', sails: 'Испанский Шелк', figurehead: 'Золотой Лев' },
      blueprint: 'Плавучая крепость. Галеон невозможно потопить одним залпом, а его трюмы способны вместить золото целой империи. Единственный минус — он медленный, как сонная черепаха.'
    };
    if (inventory.includes('s2')) return { 
      name: 'Шхуна "Морской Волк"', desc: 'Быстрая и невероятно маневренная.', icon: <Wind size={80} className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />, 
      stats: { speed: 90, armor: 40, cannons: 40, cargo: 40 },
      modules: { hull: 'Кедровые доски', sails: 'Косые паруса', figurehead: 'Морской Волк' },
      blueprint: 'Корабль для дерзких налетов. Оснащен косыми парусами, что позволяет плыть круто к ветру. Идеален для того, чтобы ограбить галеон и скрыться в тумане до того, как они успеют развернуть пушки.'
    };
    if (inventory.includes('s1')) return { 
      name: 'Рыбацкая Лодка', desc: 'Лучше, чем ничего.', icon: <Anchor size={80} className="text-slate-400 drop-shadow-[0_0_20px_rgba(148,163,184,0.5)]" />, 
      stats: { speed: 10, armor: 5, cannons: 0, cargo: 5 },
      modules: { hull: 'Гнилые доски', sails: 'Простыня', figurehead: 'Отсутствует' },
      blueprint: 'Мы нашли эту дырявую посудину на берегу. Она пахнет рыбой и отчаянием. Надеюсь, мы сможем купить нормальный корабль до первого шторма.'
    };
    return { 
      name: 'Бриг Lumina', desc: 'Наш первый общий корабль.', icon: <Ship size={80} className="text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]" />, 
      stats: { speed: 50, armor: 50, cannons: 30, cargo: 50 },
      modules: { hull: 'Крепкий Дуб', sails: 'Штормовая парусина', figurehead: 'Русалка' },
      blueprint: 'Стандартный пиратский бриг. Двадцатипушечный корабль с отличным балансом между скоростью и огневой мощью. Здесь началась наша история.'
    };
  };

  const flagship = getFlagship();

  return (
    <div className="relative min-h-screen bg-[#020a17] text-amber-100 pb-32 font-serif overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.1)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.05)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 space-y-20">
        
        {/* HEADER */}
        <header className="text-center space-y-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] -z-10" />
          <div className="inline-flex items-center justify-center p-6 bg-black/40 rounded-full border-4 border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-md">
            <Compass size={56} className="text-amber-400" />
          </div>
          <div className="space-y-2">
             <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-lg">
               Пиратская Хартия
             </h1>
             <p className="text-sky-200/60 font-black uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-4">
                <Sword size={16} /> Легенда о двух капитанах <Sword size={16} />
             </p>
          </div>
        </header>

        {/* SECTION 1: THE SHIP */}
        <section className="relative">
           <div className="absolute -inset-4 bg-sky-900/10 blur-2xl rounded-[4rem] -z-10" />
           <div 
             onClick={() => setShowShipDetails(true)}
             className="pirate-wood p-8 md:p-12 rounded-[3rem] border-4 border-sky-900/50 shadow-2xl overflow-hidden relative group cursor-pointer hover:border-sky-500/50 transition-colors"
           >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-0" />
              <div className="absolute top-6 right-6 p-3 bg-sky-500/10 rounded-full text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Info size={24} />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                 {/* Ship Icon Display */}
                 <div className="w-48 h-48 bg-[#020a17] rounded-full border-8 border-sky-800 flex items-center justify-center shadow-[0_0_60px_rgba(14,165,233,0.3)] relative shrink-0 group-hover:scale-105 transition-transform">
                    <div className="absolute inset-0 rounded-full border-2 border-sky-400/30 animate-spin-slow border-dashed" />
                    <div className="scale-[0.8]">{flagship.icon}</div>
                 </div>
                 
                 <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-sky-400/60">Текущий Флагман</p>
                       <h2 className="text-5xl font-black uppercase tracking-tighter text-sky-100 drop-shadow-lg">{flagship.name}</h2>
                       <p className="text-sky-100/60 italic text-lg border-l-4 border-sky-500/30 pl-4">"{flagship.desc}"</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-sky-500/20">
                       <div className="bg-black/40 p-4 rounded-2xl border border-sky-500/10 group-hover:border-sky-500/30 transition-colors">
                          <p className="text-[9px] font-black uppercase tracking-widest text-sky-400/40 mb-1">Скорость</p>
                          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2"><div className="h-full bg-sky-400" style={{ width: `${flagship.stats.speed}%`}} /></div>
                       </div>
                       <div className="bg-black/40 p-4 rounded-2xl border border-sky-500/10 group-hover:border-red-500/30 transition-colors">
                          <p className="text-[9px] font-black uppercase tracking-widest text-sky-400/40 mb-1">Орудия</p>
                          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2"><div className="h-full bg-red-400" style={{ width: `${flagship.stats.cannons}%`}} /></div>
                       </div>
                       <div className="bg-black/40 p-4 rounded-2xl border border-sky-500/10 group-hover:border-amber-500/30 transition-colors">
                          <p className="text-[9px] font-black uppercase tracking-widest text-sky-400/40 mb-1">Броня</p>
                          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2"><div className="h-full bg-amber-400" style={{ width: `${flagship.stats.armor}%`}} /></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* SECTION 2: CREW STATS (From Store) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <StatBlock icon={<Coins size={28} className="text-amber-400" />} label="Казна (Золото)" value={gold} color="amber" />
           <StatBlock icon={<Users size={28} className="text-blue-400" />} label="Размер Команды" value={crew} color="blue" />
           <StatBlock icon={<Crosshair size={28} className="text-red-400" />} label="Врагов Потоплено" value={sunkShips} color="red" />
           <StatBlock icon={<Trophy size={28} className="text-emerald-400" />} label="Артефактов" value={inventory.length} color="emerald" />
        </section>

        {/* SECTION 3: THE TWO COMMANDERS */}
        <section className="space-y-8 pt-8">
           <div className="flex items-center justify-center gap-6">
              <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-amber-500/20" />
              <h2 className="text-4xl font-black uppercase tracking-widest text-amber-500 text-center flex items-center gap-4">
                 <Crown size={32} /> Командование <Crown size={32} />
              </h2>
              <div className="h-1 flex-1 bg-gradient-to-l from-transparent to-amber-500/20" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {Object.values(profiles).map((profile: any, index: number) => {
                 const isGrinch = profile.id === 'Grinch';
                 const accentColor = isGrinch ? 'border-red-500/30 text-red-400' : 'border-purple-500/30 text-purple-400';
                 const bgAccent = isGrinch ? 'bg-red-500/5' : 'bg-purple-500/5';
                 
                 return (
                   <motion.div
                     key={profile.id}
                     whileHover={{ y: -10 }}
                     onClick={() => setSelectedProfileId(profile.id)}
                     className="group cursor-pointer"
                   >
                     <div className={cn("relative p-8 bg-black/40 rounded-[3rem] border-4 shadow-2xl backdrop-blur-md transition-all overflow-hidden", accentColor, bgAccent)}>
                        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/nautical-map.png')]" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                           
                           <div className="relative">
                              <div className={cn("absolute -inset-4 border-2 rounded-full border-dashed animate-spin-slow opacity-20", accentColor)} />
                              <div className={cn("w-40 h-40 rounded-full border-4 shadow-2xl overflow-hidden bg-slate-900", accentColor)}>
                                 <img 
                                   src={isGrinch ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Grinch&beard=0.5" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Cindy&hair=long"} 
                                   alt={profile.name} 
                                   className="w-full h-full object-cover" 
                                 />
                              </div>
                              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-900 border-2 rounded-full whitespace-nowrap shadow-xl">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                                   {isGrinch ? 'Кровавый Капитан' : 'Квартирмейстер'}
                                 </p>
                              </div>
                           </div>

                           <div className="space-y-2 pt-4">
                              <h3 className="text-4xl font-black uppercase tracking-tighter text-slate-100 drop-shadow-lg">{profile.name}</h3>
                              <p className="text-slate-400 italic text-sm border-b border-white/10 pb-4">"{profile.pref || 'Молчание — золото.'}"</p>
                           </div>

                           <div className="grid grid-cols-2 gap-4 w-full">
                              <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-left">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-2"><Sword size={12}/> Оружие</p>
                                 <p className="font-bold text-slate-300 text-sm">{isGrinch ? 'Двойные Сабли' : 'Мушкет & Кинжал'}</p>
                              </div>
                              <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-left">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-2"><Target size={12}/> Роль в бою</p>
                                 <p className="font-bold text-slate-300 text-sm">{isGrinch ? 'Авангард / Абордаж' : 'Снайпер / Тактик'}</p>
                              </div>
                              <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-left">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-2"><Heart size={12}/> Слабость</p>
                                 <p className="font-bold text-slate-300 text-sm">{isGrinch ? 'Её глаза' : 'Его улыбка'}</p>
                              </div>
                              <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-left">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-2"><Eye size={12}/> Награда за голову</p>
                                 <p className="font-bold text-amber-400 text-sm">Бесценно</p>
                              </div>
                           </div>

                           <button className="w-full py-4 mt-4 bg-slate-800 text-amber-500 rounded-xl font-black uppercase tracking-widest text-[10px] group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors shadow-lg">
                              Изучить дело
                           </button>
                        </div>
                     </div>
                   </motion.div>
                 );
              })}
           </div>
        </section>

        {/* SECTION 4: PIRATE CODE & FUN FACTS (NEW) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-8">
           {/* Pirate Code */}
           <div className="p-8 md:p-10 rounded-[3rem] bg-[#2a1a10] border-4 border-amber-900/50 shadow-2xl relative overflow-hidden pirate-wood">
              <div className="absolute top-4 right-4 text-amber-900/20"><Scroll size={120} /></div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-4 border-b-2 border-amber-700/50 pb-4">
                    <Scroll size={32} className="text-amber-500" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-amber-400">Пиратский Кодекс</h2>
                 </div>
                 <ul className="space-y-4">
                    <li className="flex gap-4 items-start text-amber-100/80 leading-relaxed">
                       <span className="font-black text-amber-500 text-xl">I.</span>
                       <p>Капитан Гринч всегда прав. Если Капитан не прав, смотри Статью II.</p>
                    </li>
                    <li className="flex gap-4 items-start text-amber-100/80 leading-relaxed">
                       <span className="font-black text-amber-500 text-xl">II.</span>
                       <p>Квартирмейстер Синди решает, когда Капитан прав. А прав он только когда она согласна.</p>
                    </li>
                    <li className="flex gap-4 items-start text-amber-100/80 leading-relaxed">
                       <span className="font-black text-amber-500 text-xl">III.</span>
                       <p>Добытый ром, сокровища и поцелуи делятся строго поровну между командирами.</p>
                    </li>
                    <li className="flex gap-4 items-start text-amber-100/80 leading-relaxed">
                       <span className="font-black text-amber-500 text-xl">IV.</span>
                       <p>Тот, кто отстает на суше, остается на суше. Но мы никого не бросаем.</p>
                    </li>
                 </ul>
                 <div className="pt-6 mt-6 border-t border-amber-900/50 flex justify-between items-end opacity-50">
                    <p className="font-serif italic text-sm">Подписано кровью,<br/> Богдан и Полина</p>
                    <div className="w-16 h-16 rounded-full border-2 border-red-900 flex items-center justify-center text-red-900 rotate-12">
                      Печать
                    </div>
                 </div>
              </div>
           </div>

           {/* Fun Facts Logbook */}
           <div className="p-8 md:p-10 rounded-[3rem] bg-slate-900/60 border-4 border-sky-900/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-4 right-4 text-sky-500/10"><Ship size={150} /></div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-4 border-b-2 border-sky-500/20 pb-4">
                    <Compass size={32} className="text-sky-400" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-sky-100">Бортовой Журнал</h2>
                 </div>
                 
                 <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-sky-500/10">
                       <div className="flex items-center gap-3 text-sky-200">
                          <CheckCircle size={20} className="text-emerald-500" /> Дней без бунта на корабле
                       </div>
                       <p className="font-black text-2xl text-emerald-400">342</p>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-sky-500/10">
                       <div className="flex items-center gap-3 text-sky-200">
                          <Beer size={20} className="text-amber-500" /> Выпито бочек рома
                       </div>
                       <p className="font-black text-2xl text-amber-400">14</p>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-sky-500/10">
                       <div className="flex items-center gap-3 text-sky-200">
                          <Heart size={20} className="text-red-500" /> Романтичных закатов в море
                       </div>
                       <p className="font-black text-2xl text-red-400">∞</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* SECTION 5: TIME CAPSULES (Buried Treasures) */}
        <section className="space-y-8 pt-16 border-t-4 border-amber-500/10">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-amber-900/40 rounded-2xl text-amber-400 border border-amber-500/20 shadow-inner">
                    <Lock size={28} />
                 </div>
                 <div>
                   <h2 className="text-4xl font-black uppercase tracking-tighter text-amber-100">Закопанные Клады</h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/50">Сундуки, ожидающие своего часа</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {capsules.map(capsule => (
                <div key={capsule.id} className="p-8 bg-black/60 border-2 border-amber-900/50 rounded-3xl flex items-center gap-6 group hover:border-amber-500/50 transition-colors cursor-pointer relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   
                   <div className="w-20 h-20 bg-[#1a1a1a] border-4 border-amber-900/50 rounded-2xl flex items-center justify-center text-amber-500 shadow-xl group-hover:scale-110 transition-transform relative shrink-0">
                      <div className="absolute top-1 right-1"><Lock size={12} className="text-amber-500/40" /></div>
                      <MapIcon size={32} />
                   </div>
                   
                   <div className="space-y-2 relative z-10">
                      <h4 className="text-2xl font-bold text-amber-100 leading-tight">{capsule.title}</h4>
                      <p className="text-xs font-black uppercase tracking-widest text-amber-500/60 flex items-center gap-2">
                        <Calendar size={14} /> Откроется: {capsule.unlockDate}
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>

      {/* MODALS */}

      {/* 1. Flagship Details Modal */}
      <AnimatePresence>
        {showShipDetails && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShipDetails(false)} className="absolute inset-0 bg-sky-950/90 backdrop-blur-xl" />
             
             <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} 
               className="relative w-full max-w-4xl bg-[#020a17] p-8 md:p-12 rounded-[3rem] border-4 border-sky-500/30 shadow-[0_0_100px_rgba(14,165,233,0.3)] overflow-hidden"
             >
                {/* Blueprint Aesthetic Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_2px,transparent_2px),linear-gradient(90deg,rgba(14,165,233,0.1)_2px,transparent_2px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#020a17_0%,transparent_100%)] opacity-80" />

                <button onClick={() => setShowShipDetails(false)} className="absolute top-6 right-6 text-sky-500/40 hover:text-sky-300 transition-colors z-20">
                  <X size={32} />
                </button>

                <div className="relative z-10 space-y-10">
                   <div className="text-center space-y-2">
                      <p className="text-[12px] font-black uppercase tracking-[0.5em] text-sky-500/80">Чертежи Флагмана</p>
                      <h2 className="text-6xl font-black uppercase tracking-tighter text-sky-100">{flagship.name}</h2>
                   </div>

                   <div className="flex flex-col md:flex-row gap-10 items-center">
                      {/* Big Blueprint Graphic */}
                      <div className="w-64 h-64 border-2 border-sky-500/30 rounded-full flex items-center justify-center bg-sky-900/10 shadow-[inset_0_0_50px_rgba(14,165,233,0.2)] shrink-0 relative">
                         <div className="absolute inset-0 rounded-full border border-sky-400/20 animate-spin-slow border-dashed" />
                         <div className="scale-150 opacity-80">{flagship.icon}</div>
                         
                         {/* Callout lines */}
                         <div className="absolute -left-10 top-20 w-16 h-[1px] bg-sky-500/50" />
                         <div className="absolute -right-10 bottom-20 w-16 h-[1px] bg-sky-500/50" />
                      </div>

                      <div className="flex-1 space-y-8">
                         <div className="bg-sky-900/20 p-6 rounded-2xl border border-sky-500/20">
                            <p className="text-sky-200/80 font-serif italic text-lg leading-relaxed">"{flagship.blueprint}"</p>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-sky-500/60">Материал корпуса</p>
                               <p className="text-lg font-bold text-sky-200">{flagship.modules.hull}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-sky-500/60">Парусное вооружение</p>
                               <p className="text-lg font-bold text-sky-200">{flagship.modules.sails}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-sky-500/60">Ростровая фигура</p>
                               <p className="text-lg font-bold text-sky-200">{flagship.modules.figurehead}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-sky-500/60">Грузоподъемность</p>
                               <p className="text-lg font-bold text-amber-400">{flagship.stats.cargo} бочек рома</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Commander Detail Modal */}
      <AnimatePresence>
        {selectedProfileId && selectedProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProfileId(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] p-12 rounded-[3rem] border-8 border-amber-900/40 shadow-[0_0_100px_rgba(245,158,11,0.2)] overflow-hidden"
            >
               <button onClick={() => setSelectedProfileId(null)} className="absolute top-6 right-6 text-amber-500/40 hover:text-amber-100 transition-colors z-20"><X size={32} /></button>

               <div className="space-y-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-8 border-b-2 border-white/5 pb-8">
                     <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-amber-500/50 shadow-2xl overflow-hidden shrink-0">
                        <img src={selectedProfile.id === 'Grinch' ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Grinch&beard=0.5" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Cindy&hair=long"} alt="Profile" className="w-full h-full object-cover" />
                     </div>
                     <div className="text-center md:text-left">
                        <p className="text-amber-500 font-bold uppercase text-[10px] tracking-[0.4em] mb-2 flex items-center justify-center md:justify-start gap-2">
                          <Scroll size={12} /> Личное дело №{selectedProfile.id.slice(0, 4)}
                        </p>
                        <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-100 mb-2">{selectedProfile.name}</h2>
                        <p className="text-slate-400 italic font-serif">"{selectedProfile.pref || 'Сведений нет...'}"</p>
                     </div>
                  </div>

                  <div className="bg-black/60 p-8 rounded-3xl border border-white/5 space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/50 mb-4">Характеристики</h4>
                     
                     <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-300 mb-2"><span>Харизма</span> <span>99/100</span></div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[99%]" /></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-300 mb-2"><span>Владение саблей</span> <span>85/100</span></div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-[85%]" /></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-300 mb-2"><span>Выпито Рома</span> <span>Безлимит</span></div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-full" /></div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBlock({ icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    amber: "border-amber-500/20 text-amber-400 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
    blue: "border-blue-500/20 text-blue-400 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]",
    red: "border-red-500/20 text-red-400 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
    emerald: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
  };

  return (
    <div className={cn("p-6 rounded-[2rem] border text-center flex flex-col items-center justify-center backdrop-blur-md transition-transform hover:scale-105 cursor-default", colors[color])}>
      <div className="mb-3 opacity-80">{icon}</div>
      <p className="text-4xl font-black tracking-tighter text-slate-100 leading-none mb-2">{value}</p>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</p>
    </div>
  );
}
