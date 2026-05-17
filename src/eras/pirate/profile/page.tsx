'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Skull, Anchor, Sword, Scroll, 
  Map as MapIcon, Compass, Coins, Heart,
  Lock, Calendar, Sparkles, Trash2, Mail,
  Ship, Wind, User, Edit3, Save, X, Flame, Target, Trophy, Crown, Eye, Crosshair, Shield, CheckCircle, Info, Beer, Wrench, History, Navigation
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useData } from '@/components/DataProvider';
import CharacterScene from './CharacterScene';

export default function PirateProfile() {
  const { currentUser, profiles, capsules } = useData();
  const [localProfiles, setLocalProfiles] = useState(profiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Внешность');
  const [customizations, setCustomizations] = useState<Record<string, any>>({
    Grinch: { skinColor: '#e0ac69', hat: 'captain', clothes: 'jacket', weapon: 'saber', accessory: 'eyepatch' },
    default: { skinColor: '#ffdbac', hat: 'bandana', clothes: 'vest', weapon: 'none', accessory: 'none' }
  });
  const [showShipDetails, setShowShipDetails] = useState(false);
  
  // Local Stats from Store/Gameplay
  const [gold, setGold] = useState(0);
  const [crew, setCrew] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [sunkShips, setSunkShips] = useState(0);
  const [shipHealth, setShipHealth] = useState(45); // e.g. 45% damaged

  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [isCreatingPoster, setIsCreatingPoster] = useState(false);
  const [bounty, setBounty] = useState(1000000);
  const [hasBlackSpot, setHasBlackSpot] = useState(false);
  const [posterAlias, setPosterAlias] = useState('');
  const [posterCrime, setPosterCrime] = useState('');
  const [posterStamp, setPosterStamp] = useState<string | null>(null);
  
  const [compassRotation, setCompassRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [compassResult, setCompassResult] = useState<string | null>(null);

  const compassOptions = [
     "Пить ром и смотреть кино!",
     "Спонтанный набег на кухню!",
     "Вечер пиратских историй",
     "Отправиться в торговый порт (Шопинг)",
     "Делить награбленное (Массаж)",
     "Свистать всех наверх! (Уборка)"
  ];

  const handleCompassSpin = () => {
     if (isSpinning) return;
     setIsSpinning(true);
     setCompassResult(null);
     
     const extraSpins = 360 * 5; 
     const randomDegree = Math.floor(Math.random() * 360);
     const newRotation = compassRotation + extraSpins + randomDegree;
     
     setCompassRotation(newRotation);
     
     setTimeout(() => {
        setIsSpinning(false);
        const normalizedDeg = newRotation % 360;
        const index = Math.floor((normalizedDeg / 360) * compassOptions.length);
        setCompassResult(compassOptions[index]);
     }, 3000);
  };
  const [equippedParts, setEquippedParts] = useState({
    hull: 'h1',
    sails: 's1',
    cannons: 'c1',
    figurehead: 'f1'
  });

  const PARTS_DB: Record<string, any[]> = {
    hull: [
      { id: 'h1', name: 'Сгнившие доски', stat: 'Броня: 10', desc: 'Базовый каркас.', pros: 'Низкий вес', cons: 'Легко пробивается', icon: <Anchor size={20}/> },
      { id: 'h2', name: 'Железное Дерево', stat: 'Броня: 80', desc: 'Защитит от ядер.', pros: 'Непробиваемость', cons: 'Очень тяжелое', icon: <Shield size={20}/> }
    ],
    sails: [
      { id: 's1', name: 'Штормовая парусина', stat: 'Скорость: 30', desc: 'Медленно, но верно.', pros: 'Надежность', cons: 'Слабая тяга', icon: <Wind size={20}/> },
      { id: 's2', name: 'Косые паруса', stat: 'Скорость: 90', desc: 'Ловят любой бриз.', pros: 'Высокая маневренность', cons: 'Легко рвутся', icon: <Wind size={20}/> }
    ],
    cannons: [
      { id: 'c1', name: 'Старые пушки', stat: 'Огневая мощь: 15', desc: 'Часто дают осечку.', pros: 'Дешевизна', cons: 'Малый радиус', icon: <Flame size={20}/> },
      { id: 'c2', name: 'Бронзовые Фальконеты', stat: 'Огневая мощь: 95', desc: 'Разнесут форт в щепки.', pros: 'Ужасающий урон', cons: 'Долгая перезарядка', icon: <Target size={20}/> }
    ],
    figurehead: [
      { id: 'f1', name: 'Русалка', stat: 'Харизма: 20', desc: 'Поднимает настроение.', pros: 'Удача в бою', cons: 'Отвлекает матросов', icon: <Eye size={20}/> },
      { id: 'f2', name: 'Золотой Лев', stat: 'Устрашение: 100', desc: 'Внушает ужас врагам.', pros: 'Враги сдаются сами', cons: 'Привлекает пиратов', icon: <Crown size={20}/> }
    ]
  };

  const currentHull = PARTS_DB.hull.find(p => p.id === equippedParts.hull);
  const currentSails = PARTS_DB.sails.find(p => p.id === equippedParts.sails);
  const currentCannons = PARTS_DB.cannons.find(p => p.id === equippedParts.cannons);
  const currentFigurehead = PARTS_DB.figurehead.find(p => p.id === equippedParts.figurehead);

  const handleRepair = () => {
    if (gold >= 100 && shipHealth < 100) {
      setGold(prev => {
        const newGold = prev - 100;
        localStorage.setItem('pirate_gold', newGold.toString());
        return newGold;
      });
      setShipHealth(100);
    }
  };

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

  const selectedProfile = selectedProfileId ? localProfiles[selectedProfileId] : null;

  const handleSaveProfile = (id: string) => {
    // Simulated save functionality
    console.log("Saving changes to profile", id);
  };

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
    <div className="relative min-h-screen bg-[#020a17] text-amber-100 pb-32 font-serif">
      
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
             className="pirate-wood p-8 md:p-12 rounded-[3rem] border-4 border-sky-900/50 shadow-2xl relative group cursor-pointer hover:border-sky-500/50 transition-colors"
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
              {Object.values(localProfiles).map((profile: any, index: number) => {
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

         {/* SECTION 6: PIRATE COMPASS (NEW) */}
         <section className="space-y-8 pt-16 border-t-4 border-emerald-500/10 pb-20">
            <div className="flex items-center justify-center">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-emerald-500 flex items-center gap-4 drop-shadow-lg">
                <Navigation size={36} /> Компас Желаний <Navigation size={36} />
              </h2>
            </div>
            
            <div className="max-w-2xl mx-auto p-12 bg-[#020a17] rounded-[4rem] border-4 border-emerald-900/50 shadow-[0_0_100px_rgba(16,185,129,0.1)] relative overflow-hidden flex flex-col items-center text-center">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1)_0%,transparent_100%)] pointer-events-none" />
               <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/nautical-map.png')]" />
               
               <p className="text-emerald-100/60 font-serif italic mb-10 relative z-10 max-w-sm">"Сломанный компас? Нет... Он указывает не на север, а на то, чего вы хотите больше всего прямо сейчас."</p>
               
               <div className="relative w-64 h-64 mb-10 group cursor-pointer" onClick={handleCompassSpin}>
                  {/* Outer Ring */}
                  <div className="absolute inset-0 rounded-full border-8 border-[#0a1a10] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" />
                  <div className="absolute -inset-4 rounded-full border-2 border-emerald-900/30 border-dashed animate-[spin_10s_linear_infinite] pointer-events-none" />
                  
                  {/* Engraved Details */}
                  <div className="absolute inset-4 rounded-full border border-emerald-500/10" />
                  
                  {/* The Compass Needle */}
                  <div className="absolute inset-0 flex items-center justify-center transition-transform duration-[3000ms] ease-out" style={{ transform: `rotate(${compassRotation}deg)` }}>
                     <div className="h-56 w-6 bg-gradient-to-b from-red-600 via-red-900 to-slate-900 rounded-full shadow-2xl relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[32px] border-l-transparent border-r-transparent border-b-red-500" />
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-t-[32px] border-l-transparent border-r-transparent border-t-slate-800" />
                     </div>
                  </div>
                  
                  {/* Center Pin */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-amber-500 rounded-full border-4 border-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.5)] z-20 flex items-center justify-center">
                     <div className="w-3 h-3 bg-amber-200 rounded-full" />
                  </div>
               </div>
               
               <div className="h-24 flex items-center justify-center relative z-10 w-full">
                  <AnimatePresence mode="wait">
                     {compassResult && (
                       <motion.div key={compassResult} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="p-4 bg-emerald-900/20 rounded-2xl border border-emerald-500/30 w-full backdrop-blur-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50 mb-1">Стрелка указала на:</p>
                          <h3 className="text-xl font-black text-emerald-100">{compassResult}</h3>
                       </motion.div>
                     )}
                  </AnimatePresence>
               </div>
               
               <button 
                 onClick={handleCompassSpin}
                 disabled={isSpinning}
                 className="mt-4 px-8 py-4 w-full bg-emerald-600 text-slate-950 font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
               >
                 {isSpinning ? 'Судьба решает...' : 'Раскрутить Компас'}
               </button>
            </div>
         </section>
      </div>

      {/* MODALS */}

      {/* 1. Flagship Details / Garage Modal */}
      <AnimatePresence>
        {showShipDetails && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShipDetails(false)} className="absolute inset-0 bg-sky-950/90 backdrop-blur-xl" />
             
             <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} 
               className="relative w-full max-w-6xl h-[85vh] bg-[#020a17] rounded-[3rem] border-4 border-sky-500/30 shadow-[0_0_100px_rgba(14,165,233,0.3)] overflow-hidden flex flex-col"
             >
                {/* Blueprint Aesthetic Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_2px,transparent_2px),linear-gradient(90deg,rgba(14,165,233,0.1)_2px,transparent_2px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#020a17_0%,transparent_100%)] opacity-80 pointer-events-none" />

                {/* Header */}
                <div className="relative z-20 flex items-center justify-between p-8 border-b border-sky-500/20 bg-black/40">
                   <div className="flex items-center gap-4">
                      <Wrench size={32} className="text-sky-400" />
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-sky-500/60">Верфь и Ангар</p>
                         <h2 className="text-3xl font-black uppercase tracking-tighter text-sky-100">Сборка: {flagship.name}</h2>
                      </div>
                   </div>
                   <button onClick={() => setShowShipDetails(false)} className="p-3 bg-sky-500/10 rounded-full text-sky-500/40 hover:text-sky-300 hover:bg-sky-500/20 transition-colors">
                     <X size={24} />
                   </button>
                </div>

                {/* Main Garage Content */}
                <div className="flex-1 relative z-10 flex flex-col lg:flex-row overflow-hidden">
                   
                   {/* Left Column: Ship 3D View & Health */}
                   <div className="w-full lg:w-1/3 border-r border-sky-500/20 p-8 flex flex-col items-center justify-center space-y-8 bg-sky-900/5">
                      <div className="relative w-full h-64 flex flex-col items-center justify-center opacity-90 scale-90">
                         {/* Ship Top-Down Schematic View */}
                         
                         {/* Nose / Figurehead */}
                         <div className={cn("absolute top-0 w-16 h-16 rounded-t-full border-4 flex items-center justify-center z-20 shadow-[0_0_30px_currentColor] transition-colors", shipHealth < 30 ? 'border-red-500 bg-red-950 text-red-500 animate-pulse' : 'border-sky-400 bg-sky-950 text-sky-400')}>
                            {currentFigurehead.icon}
                         </div>
                         
                         {/* Sails Area */}
                         <div className={cn("absolute top-10 w-32 h-24 border-4 rounded-3xl flex items-center justify-center z-10 shadow-[0_0_20px_currentColor] transition-colors", shipHealth < 50 ? 'border-orange-500 bg-orange-950/80 text-orange-400' : 'border-sky-500 bg-sky-900/60 text-sky-200')}>
                            {currentSails.icon}
                         </div>
                         
                         {/* Hull / Main Deck */}
                         <div className={cn("absolute top-16 w-24 h-48 border-4 rounded-b-[4rem] flex flex-col items-center justify-end pb-6 z-0 shadow-[0_0_40px_currentColor] transition-colors", shipHealth < 40 ? 'border-red-600 bg-[#1a0505] text-red-600 animate-pulse' : 'border-sky-700 bg-[#020a17] text-sky-600')}>
                            <Anchor size={32} />
                         </div>

                         {/* Cannons Left & Right */}
                         <div className="absolute top-28 w-40 flex justify-between px-1 z-30 pointer-events-none">
                            <div className={cn("w-6 h-12 border-y-4 border-l-4 rounded-l-xl flex items-center justify-center shadow-[0_0_15px_currentColor]", shipHealth < 70 ? 'border-red-500 bg-red-900/80 text-red-400' : 'border-sky-400 bg-sky-900 text-sky-400')}>{currentCannons.icon}</div>
                            <div className={cn("w-6 h-12 border-y-4 border-r-4 rounded-r-xl flex items-center justify-center shadow-[0_0_15px_currentColor]", shipHealth < 70 ? 'border-red-500 bg-red-900/80 text-red-400' : 'border-sky-400 bg-sky-900 text-sky-400')}>{currentCannons.icon}</div>
                         </div>
                      </div>

                      <div className="w-full space-y-4 bg-black/60 p-6 rounded-3xl border border-sky-500/20 shadow-xl">
                         <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
                            <span className="text-sky-200">Целостность</span>
                            <span className={shipHealth > 50 ? "text-emerald-400" : "text-red-400"}>{shipHealth}%</span>
                         </div>
                         <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-sky-500/10">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${shipHealth}%` }} 
                              className={cn("h-full transition-all duration-1000", shipHealth > 50 ? "bg-emerald-500" : "bg-red-500")}
                            />
                         </div>

                         <button 
                           onClick={handleRepair}
                           disabled={shipHealth === 100 || gold < 100}
                           className={cn(
                             "w-full py-4 mt-2 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg",
                             shipHealth === 100 ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 cursor-not-allowed" 
                             : gold >= 100 ? "bg-amber-500 text-slate-950 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                             : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                           )}
                         >
                           <Wrench size={14} /> 
                           {shipHealth === 100 ? 'Ремонт не требуется' : 'Заделать пробоины (100 Золота)'}
                         </button>
                      </div>
                   </div>

                   {/* Middle Column: Ship Parts / Modules */}
                   <div className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar">
                      <div className="flex items-center gap-3 border-b border-sky-500/20 pb-4">
                         <Shield size={24} className="text-sky-400" />
                         <h3 className="text-2xl font-black uppercase tracking-widest text-sky-100">Модули Корабля</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <ModuleSlot isActive={activeSlot === 'hull'} onClick={() => setActiveSlot('hull')} title="Корпус" icon={currentHull.icon} item={currentHull.name} stat={currentHull.stat} type="hull" />
                         <ModuleSlot isActive={activeSlot === 'sails'} onClick={() => setActiveSlot('sails')} title="Паруса" icon={currentSails.icon} item={currentSails.name} stat={currentSails.stat} type="sails" />
                         <ModuleSlot isActive={activeSlot === 'cannons'} onClick={() => setActiveSlot('cannons')} title="Орудия" icon={currentCannons.icon} item={currentCannons.name} stat={currentCannons.stat} type="cannons" />
                         <ModuleSlot isActive={activeSlot === 'figurehead'} onClick={() => setActiveSlot('figurehead')} title="Фигура" icon={currentFigurehead.icon} item={currentFigurehead.name} stat={currentFigurehead.stat} type="figurehead" />
                      </div>

                      <div className="bg-sky-900/10 p-6 rounded-2xl border border-sky-500/20 mt-8 relative overflow-hidden group">
                         <div className="absolute inset-0 bg-sky-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-sky-500/60 mb-2 relative z-10">Сводка Конструктора</p>
                         <p className="text-sky-200/80 font-serif italic leading-relaxed relative z-10">Выберите модуль, чтобы перейти на склад деталей и переоборудовать флагман. Каждая деталь влияет на выживаемость судна.</p>
                      </div>
                   </div>

                   {/* Right Column: Dynamic View (Battle Log OR Inventory) */}
                   <div className="w-full lg:w-1/3 bg-black/60 p-8 overflow-y-auto custom-scrollbar border-l border-sky-500/20">
                      <AnimatePresence mode="wait">
                        {activeSlot ? (
                          <motion.div key="inventory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <div className="flex items-center justify-between border-b border-sky-500/20 pb-4 mb-6">
                               <div className="flex items-center gap-3">
                                  <Wrench size={24} className="text-sky-400" />
                                  <h3 className="text-xl font-black uppercase tracking-widest text-sky-100">Склад Деталей</h3>
                               </div>
                               <button onClick={() => setActiveSlot(null)} className="text-[10px] font-black uppercase tracking-widest text-sky-500/60 hover:text-sky-300">Назад</button>
                            </div>
                            
                            <div className="space-y-4">
                               {PARTS_DB[activeSlot].map(part => (
                                 <div 
                                   key={part.id} 
                                   onClick={() => setEquippedParts(prev => ({...prev, [activeSlot]: part.id}))}
                                   className={cn(
                                     "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group",
                                     equippedParts[activeSlot as keyof typeof equippedParts] === part.id 
                                       ? "bg-sky-500/20 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]" 
                                       : "bg-black/40 border-sky-500/10 hover:border-sky-500/40"
                                   )}
                                 >
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors", equippedParts[activeSlot as keyof typeof equippedParts] === part.id ? "bg-sky-500 text-slate-900" : "bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20")}>
                                       {part.icon}
                                    </div>
                                    <div className="flex-1">
                                       <h4 className="text-sm font-bold text-sky-100">{part.name}</h4>
                                       <p className="text-xs text-sky-200/60 italic mb-2">"{part.desc}"</p>
                                       <div className="flex flex-wrap gap-2 mb-2">
                                          <span className="text-[8px] uppercase font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">+{part.pros}</span>
                                          <span className="text-[8px] uppercase font-black px-2 py-0.5 bg-red-500/10 text-red-400 rounded-md border border-red-500/20">-{part.cons}</span>
                                       </div>
                                       <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">{part.stat}</p>
                                    </div>
                                    {equippedParts[activeSlot as keyof typeof equippedParts] === part.id && (
                                      <CheckCircle size={20} className="text-sky-400" />
                                    )}
                                 </div>
                               ))}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="flex items-center gap-3 border-b border-sky-500/20 pb-4 mb-6">
                               <History size={24} className="text-amber-400" />
                               <h3 className="text-2xl font-black uppercase tracking-widest text-amber-100">Журнал Боёв</h3>
                             </div>
                               <div className="space-y-4">
                                  {[
                                    { date: 'Сегодня', title: 'Побег от Королевского Флота', desc: 'Ушли в шторм, порвали два паруса.', dmg: '-15% корпуса', type: 'escape' },
                                    { date: 'Вчера', title: 'Ограбление Галеона', desc: 'Захватили груз специй и рома.', dmg: '+2500 золота', type: 'victory' },
                                    { date: '3 дня назад', title: 'Нападение Кракена', desc: 'Щупальца пробили нижнюю палубу.', dmg: '-40% корпуса', type: 'danger' },
                                    { date: 'Неделю назад', title: 'Столкновение с Рифом', desc: 'Штурман был пьян.', dmg: '-10% корпуса', type: 'danger' },
                                  ].map((log, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-[#020a17] border border-sky-500/10 hover:border-amber-500/30 transition-colors">
                                       <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/50">{log.date}</p>
                                       <h4 className="text-sm font-bold text-sky-100 mt-1 mb-2">{log.title}</h4>
                                    <p className="text-xs text-sky-200/60 italic mb-3">"{log.desc}"</p>
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg inline-block", 
                                      log.type === 'victory' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                      'bg-red-500/10 text-red-400 border border-red-500/20')}
                                    >
                                       {log.dmg}
                                    </div>
                                 </div>
                               ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>

                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Commander Detail Modal (RPG Character Menu) */}
      <AnimatePresence>
        {selectedProfileId && selectedProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProfileId(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-5xl bg-[#0a0a0a] p-8 rounded-[3rem] border-8 border-amber-900/40 shadow-[0_0_100px_rgba(245,158,11,0.2)] overflow-hidden"
            >
               <button onClick={() => setSelectedProfileId(null)} className="absolute top-6 right-6 text-amber-500/40 hover:text-amber-100 transition-colors z-20"><X size={32} /></button>
               {/* Decorative Glowing Orbs */}
               <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
               <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
               <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

               <div className="flex flex-col md:flex-row gap-8 relative z-10 h-[600px]">
                  {/* Left Side: 3D Avatar */}
                  <div className="w-full md:w-2/5 bg-gradient-to-b from-[#020a17] to-[#0a0a0a] rounded-3xl overflow-hidden border-4 border-amber-500/30 relative group shadow-[0_0_30px_rgba(245,158,11,0.15)] h-full transition-colors hover:border-amber-500/50">
                     <CharacterScene customization={customizations[selectedProfile.id] || customizations.default} />
                     
                     {/* Level Badge */}
                     <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                        <Flame size={12} /> Уровень 99
                     </div>

                     <div className="absolute inset-0 bg-gradient-to-t from-[#020a17] via-transparent to-transparent opacity-80 pointer-events-none" />
                     <div className="absolute bottom-6 left-6 right-6 text-center pointer-events-none">
                        <h3 className="text-4xl font-black text-amber-100 uppercase drop-shadow-lg tracking-tighter">{selectedProfile.name}</h3>
                        <p className="text-amber-500 text-xs font-black uppercase tracking-widest mt-1 flex items-center justify-center gap-2">
                           <Skull size={12} />
                           {selectedProfile.id === 'Grinch' ? 'Грозный Капитан' : 'Прекрасная Сирена'}
                           <Skull size={12} />
                        </p>
                     </div>
                  </div>

                  {/* Right Side: RPG Controls */}
                  <div className="flex-1 space-y-6 flex flex-col h-full">
                     <div className="flex justify-between items-center border-b border-amber-900/30 pb-4 shrink-0">
                        <h2 className="text-3xl font-black text-amber-100 uppercase tracking-tighter">Каюта Командира</h2>
                     </div>

                     {/* Tabs */}
                     <div className="flex gap-2 border-b border-amber-900/20 pb-2 overflow-x-auto shrink-0">
                        {['Внешность', 'Характеристики', 'Способности', 'Заслуги'].map(tab => (
                           <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={cn(
                                 "px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap",
                                 activeTab === tab ? "text-amber-400 border-b-2 border-amber-500" : "text-slate-500 hover:text-slate-300"
                              )}
                           >
                              {tab}
                           </button>
                        ))}
                     </div>

                     {/* Tab Content */}
                     <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                        {activeTab === 'Внешность' && (
                           <div className="space-y-4">
                              {/* Hats */}
                              <div className="bg-black/40 p-4 rounded-xl border border-amber-900/20">
                                 <label className="text-[10px] font-black uppercase text-amber-500 mb-2 block">Головной убор</label>
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                       { id: 'none', name: 'Нет', icon: X },
                                       { id: 'captain', name: 'Треуголка', icon: Trophy },
                                       { id: 'bandana', name: 'Бандана', icon: Wind },
                                       { id: 'crown', name: 'Корона', icon: Crown }
                                    ].map(h => (
                                       <button
                                          key={h.id}
                                          onClick={() => setCustomizations(prev => ({...prev, [selectedProfile.id]: {...(prev[selectedProfile.id] || prev.default), hat: h.id}}))}
                                          className={cn("p-3 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-2", (customizations[selectedProfile.id]?.hat || 'none') === h.id ? "bg-amber-500/20 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-black/60 border-amber-900/30 text-slate-400 hover:border-amber-500/50 hover:text-slate-200")}
                                       >
                                          <h.icon size={16} className={(customizations[selectedProfile.id]?.hat || 'none') === h.id ? "text-amber-400" : "text-slate-500"} />
                                          <span>{h.name}</span>
                                       </button>
                                    ))}
                                 </div>
                              </div>

                              {/* Clothes */}
                              <div className="bg-black/40 p-4 rounded-xl border border-amber-900/20">
                                 <label className="text-[10px] font-black uppercase text-amber-500 mb-2 block">Одежда</label>
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                       { id: 'none', name: 'Нет', icon: X },
                                       { id: 'jacket', name: 'Камзол', icon: User },
                                       { id: 'vest', name: 'Жилет', icon: User },
                                       { id: 'armor', name: 'Доспех', icon: Shield }
                                    ].map(c => (
                                       <button
                                          key={c.id}
                                          onClick={() => setCustomizations(prev => ({...prev, [selectedProfile.id]: {...(prev[selectedProfile.id] || prev.default), clothes: c.id}}))}
                                          className={cn("p-3 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-2", (customizations[selectedProfile.id]?.clothes || 'none') === c.id ? "bg-amber-500/20 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-black/60 border-amber-900/30 text-slate-400 hover:border-amber-500/50 hover:text-slate-200")}
                                       >
                                          <c.icon size={16} className={(customizations[selectedProfile.id]?.clothes || 'none') === c.id ? "text-amber-400" : "text-slate-500"} />
                                          <span>{c.name}</span>
                                       </button>
                                    ))}
                                 </div>
                              </div>

                              {/* Weapons */}
                              <div className="bg-black/40 p-4 rounded-xl border border-amber-900/20">
                                 <label className="text-[10px] font-black uppercase text-amber-500 mb-2 block">Оружие</label>
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                       { id: 'none', name: 'Нет', icon: X },
                                       { id: 'saber', name: 'Сабля', icon: Sword },
                                       { id: 'hook', name: 'Крюк', icon: Anchor },
                                       { id: 'pistol', name: 'Пистоль', icon: Crosshair }
                                    ].map(w => (
                                       <button
                                          key={w.id}
                                          onClick={() => setCustomizations(prev => ({...prev, [selectedProfile.id]: {...(prev[selectedProfile.id] || prev.default), weapon: w.id}}))}
                                          className={cn("p-3 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-2", (customizations[selectedProfile.id]?.weapon || 'none') === w.id ? "bg-amber-500/20 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-black/60 border-amber-900/30 text-slate-400 hover:border-amber-500/50 hover:text-slate-200")}
                                       >
                                          <w.icon size={16} className={(customizations[selectedProfile.id]?.weapon || 'none') === w.id ? "text-amber-400" : "text-slate-500"} />
                                          <span>{w.name}</span>
                                       </button>
                                    ))}
                                 </div>
                              </div>

                              {/* Accessories */}
                              <div className="bg-black/40 p-4 rounded-xl border border-amber-900/20">
                                 <label className="text-[10px] font-black uppercase text-amber-500 mb-2 block">Аксессуары</label>
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                       { id: 'none', name: 'Нет', icon: X },
                                       { id: 'eyepatch', name: 'Повязка', icon: Eye }
                                    ].map(a => (
                                       <button
                                          key={a.id}
                                          onClick={() => setCustomizations(prev => ({...prev, [selectedProfile.id]: {...(prev[selectedProfile.id] || prev.default), accessory: a.id}}))}
                                          className={cn("p-3 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-2", (customizations[selectedProfile.id]?.accessory || 'none') === a.id ? "bg-amber-500/20 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-black/60 border-amber-900/30 text-slate-400 hover:border-amber-500/50 hover:text-slate-200")}
                                       >
                                          <a.icon size={16} className={(customizations[selectedProfile.id]?.accessory || 'none') === a.id ? "text-amber-400" : "text-slate-500"} />
                                          <span>{a.name}</span>
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'Характеристики' && (
                           <div className="space-y-4">
                              <div className="bg-black/40 p-6 rounded-2xl border border-amber-900/20">
                                 <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Характеристики</h4>
                                    <span className="text-[10px] font-black uppercase text-slate-500">Очки опыта: 5</span>
                                 </div>
                                 <div className="space-y-4">
                                    {/* Сила */}
                                    <div className="flex items-center justify-between gap-4">
                                       <span className="text-xs font-bold text-slate-300 w-24">Сила</span>
                                       <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-red-500" style={{ width: `75%` }} />
                                       </div>
                                       <span className="text-sm font-bold text-amber-400 w-8 text-right">75</span>
                                       <button className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors font-bold">+</button>
                                    </div>
                                    {/* Ловкость */}
                                    <div className="flex items-center justify-between gap-4">
                                       <span className="text-xs font-bold text-slate-300 w-24">Ловкость</span>
                                       <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-emerald-500" style={{ width: `90%` }} />
                                       </div>
                                       <span className="text-sm font-bold text-amber-400 w-8 text-right">90</span>
                                       <button className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors font-bold">+</button>
                                    </div>
                                    {/* Удача */}
                                    <div className="flex items-center justify-between gap-4">
                                       <span className="text-xs font-bold text-slate-300 w-24">Удача</span>
                                       <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-blue-500" style={{ width: `60%` }} />
                                       </div>
                                       <span className="text-sm font-bold text-amber-400 w-8 text-right">60</span>
                                       <button className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors font-bold">+</button>
                                    </div>
                                    {/* Харизма */}
                                    <div className="flex items-center justify-between gap-4">
                                       <span className="text-xs font-bold text-slate-300 w-24">Харизма</span>
                                       <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-amber-500" style={{ width: `100%` }} />
                                       </div>
                                       <span className="text-sm font-bold text-amber-400 w-8 text-right">100</span>
                                       <button className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors font-bold">+</button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'Способности' && (
                           <div className="space-y-4">
                              <div className="bg-black/40 p-6 rounded-2xl border border-amber-900/20">
                                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-4">Боевые Умения</h4>
                                 <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-3 bg-black/60 rounded-xl border border-amber-900/20">
                                       <Flame size={20} className="text-red-500" />
                                       <div className="flex-1">
                                          <h5 className="text-sm font-bold text-amber-100">Огненный Залп</h5>
                                          <p className="text-xs text-slate-400">Повышает урон от пушек на 20%</p>
                                       </div>
                                       <span className="text-xs font-black text-amber-500">Ур. 3</span>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 bg-black/60 rounded-xl border border-amber-900/20">
                                       <Shield size={20} className="text-sky-500" />
                                       <div className="flex-1">
                                          <h5 className="text-sm font-bold text-amber-100">Крепкий Корпус</h5>
                                          <p className="text-xs text-slate-400">Снижает входящий урон на 15%</p>
                                       </div>
                                       <span className="text-xs font-black text-amber-500">Ур. 1</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'Заслуги' && (
                           <div className="space-y-4">
                              <div className="bg-black/40 p-6 rounded-2xl border border-amber-900/20">
                                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-4">Пиратские Достижения</h4>
                                 <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-3 bg-black/60 rounded-xl border border-emerald-500/20">
                                       <Trophy size={20} className="text-emerald-500" />
                                       <div className="flex-1">
                                          <h5 className="text-sm font-bold text-amber-100">Гроза Морей</h5>
                                          <p className="text-xs text-slate-400">Потоплено 50 кораблей</p>
                                       </div>
                                       <CheckCircle size={16} className="text-emerald-500" />
                                    </div>
                                    <div className="flex items-center gap-4 p-3 bg-black/60 rounded-xl border border-amber-900/20 opacity-50">
                                       <Trophy size={20} className="text-slate-500" />
                                       <div className="flex-1">
                                          <h5 className="text-sm font-bold text-amber-100">Золотой Кракен</h5>
                                          <p className="text-xs text-slate-400">Собрать 10,000,000 золота</p>
                                       </div>
                                       <Lock size={16} className="text-slate-500" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Motto Section (Fixed at bottom) */}
                     <div className="bg-black/40 p-4 rounded-xl border border-amber-900/20 relative group shrink-0">
                        <div className="flex justify-between items-center mb-1">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Девиз</h4>
                           <Edit3 size={12} className="text-amber-500/50 group-hover:text-amber-500 cursor-pointer" />
                        </div>
                        <p className="text-amber-100/80 italic font-serif text-sm">"{selectedProfile.pref || 'Молчание — золото.'}"</p>
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

function ModuleSlot({ title, icon, item, stat, onClick, isActive }: any) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group",
        isActive 
          ? "bg-sky-500/20 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]" 
          : "bg-sky-900/10 border-sky-500/20 hover:border-sky-500/50 hover:bg-sky-500/5"
      )}
    >
       <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform", isActive ? "bg-sky-500 text-slate-900 scale-110" : "bg-sky-500/10 text-sky-400 group-hover:scale-110")}>
          {icon}
       </div>
       <div className="flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-sky-500/50">{title}</p>
          <p className="font-bold text-sky-100 text-sm leading-tight">{item}</p>
          <p className="text-[10px] text-amber-400/80 mt-1">{stat}</p>
       </div>
    </div>
  );
}
