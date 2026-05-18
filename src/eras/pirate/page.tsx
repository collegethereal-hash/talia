'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Anchor, Shield, Heart, Hammer, Package, Beer, Users,
  Telescope, CloudLightning, Scroll, Wind, Coins, CheckCircle2,
  Navigation, Compass, Trophy, Sword, Gem, Clock, Play,
  Lock, Unlock, ArrowRight, Flame, UserCheck, HeartHandshake, X
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useData } from "@/components/DataProvider";
import Link from 'next/link';
import { ParrotKoko } from "@/eras/pirate/components/ParrotKoko";
import BayScene from "@/eras/pirate/components/BayScene";

interface Officer {
  id: number;
  name: string;
  role: string;
  status: string;
  statusColor: string;
  loyalty: number;
  avatar: string;
  description: string;
  wantedReward: string;
}

interface Raid {
  id: number;
  name: string;
  desc: string;
  mission: string;
  crewRequired: number;
  duration: number; // in seconds
  reward: number;
  icon: React.ReactNode;
}

interface ChestMerchant {
  id: string;
  name: string;
  pirateName: string;
  pirateAvatar: string;
  pirateTitle: string;
  cost: number;
  chestIcon: string;
  story: string;
  treasureName: string;
  treasureIcon: React.ReactNode;
  rarity: 'Редкое' | 'Эпическое' | 'Легендарное';
  glowColor: string;
  romanticMessage: string;
}

export default function PirateDashboard() {
  const { currentUser } = useData();
  const [activeTab, setActiveTab] = useState<'ship' | 'crew' | 'raids' | 'chests'>('ship');
  const [cocoOpen, setCocoOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Mounted check for Hydration-safe R3F Canvas
  const [isMounted, setIsMounted] = useState(false);

  // Ship stats
  const [hull, setHull] = useState(62);
  const [hold, setHold] = useState(85);
  const [morale, setMorale] = useState(94);

  // Economy & Crew from store
  const [gold, setGold] = useState(1500);
  const [crewCount, setCrewCount] = useState(25);

  // Selected Voyage on the interactive map
  const [selectedRaidId, setSelectedRaidId] = useState<number>(1);

  // Officers State
  const [officers, setOfficers] = useState<Officer[]>([
    { id: 1, name: "Билл 'Бочонок'", role: 'Штурман', status: 'Пьян', statusColor: 'text-red-400', loyalty: 45, avatar: "🧭", description: "Напивается быстрее, чем прокладывает курс, но имеет золотое сердце.", wantedReward: "50 дублонов" },
    { id: 2, name: "Джон 'Длинный'", role: 'Кок', status: 'Недоволен', statusColor: 'text-yellow-400', loyalty: 30, avatar: "🍳", description: "Его похлебка может свалить акулу, зато он знает все сплетни Тортуги.", wantedReward: "100 дублонов" },
    { id: 3, name: "Джек 'Громила'", role: 'Канонир', status: 'Готов к бою', statusColor: 'text-emerald-400', loyalty: 80, avatar: "💣", description: "Лучший стрелок Карибского моря. Любит взрывы и крепкие объятия.", wantedReward: "250 дублонов" },
  ]);

  // Raid system states
  const [raidTimers, setRaidTimers] = useState<Record<number, number>>({}); // id -> remaining seconds
  const [raidStates, setRaidStates] = useState<Record<number, 'ready' | 'sailing' | 'claim' | 'completed'>>({});

  // Treasures unlocked state (mysterious chests purchased)
  const [unlockedTreasures, setUnlockedTreasures] = useState<Record<string, boolean>>({});

  // Mystery Chest Modal viewing state
  const [selectedMerchant, setSelectedMerchant] = useState<ChestMerchant | null>(null);
  const [isOpeningChest, setIsOpeningChest] = useState(false);
  const [chestOpenedEffect, setChestOpenedEffect] = useState(false);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Sync data on mount and focused screen
  useEffect(() => {
    setIsMounted(true);
    
    const loadStats = () => {
      const savedGold = localStorage.getItem('pirate_gold');
      const savedCrew = localStorage.getItem('pirate_crew');
      const savedHull = localStorage.getItem('pirate_hull');
      const savedHold = localStorage.getItem('pirate_hold');
      const savedMorale = localStorage.getItem('pirate_morale');
      
      if (savedGold) setGold(parseInt(savedGold, 10));
      if (savedCrew) setCrewCount(parseInt(savedCrew, 10));
      if (savedHull) setHull(parseInt(savedHull, 10));
      if (savedHold) setHold(parseInt(savedHold, 10));
      if (savedMorale) setMorale(parseInt(savedMorale, 10));

      // Load officers loyalty
      const savedOfficers = localStorage.getItem('pirate_officers');
      if (savedOfficers) {
        setOfficers(JSON.parse(savedOfficers));
      }

      // Load raid states
      const savedRaidStates = localStorage.getItem('pirate_raid_states');
      if (savedRaidStates) {
        setRaidStates(JSON.parse(savedRaidStates));
      } else {
        setRaidStates({ 1: 'ready', 2: 'ready', 3: 'ready' });
      }

      // Load treasures
      const savedTreasures = localStorage.getItem('pirate_treasures');
      if (savedTreasures) {
        setUnlockedTreasures(JSON.parse(savedTreasures));
      }
    };

    loadStats();

    window.addEventListener('storage', loadStats);
    window.addEventListener('focus', loadStats);
    return () => {
      window.removeEventListener('storage', loadStats);
      window.removeEventListener('focus', loadStats);
    };
  }, []);

  // Sync back to localstorage when state changes
  const saveGold = (val: number) => {
    setGold(val);
    localStorage.setItem('pirate_gold', val.toString());
  };

  const saveCrew = (val: number) => {
    setCrewCount(val);
    localStorage.setItem('pirate_crew', val.toString());
  };

  const saveHull = (val: number) => {
    setHull(val);
    localStorage.setItem('pirate_hull', val.toString());
  };

  const saveHold = (val: number) => {
    setHold(val);
    localStorage.setItem('pirate_hold', val.toString());
  };

  const saveMorale = (val: number) => {
    setMorale(val);
    localStorage.setItem('pirate_morale', val.toString());
  };

  const saveOfficers = (newOfficers: Officer[]) => {
    setOfficers(newOfficers);
    localStorage.setItem('pirate_officers', JSON.stringify(newOfficers));
  };

  const saveRaidStates = (states: Record<number, 'ready' | 'sailing' | 'claim' | 'completed'>) => {
    setRaidStates(states);
    localStorage.setItem('pirate_raid_states', JSON.stringify(states));
  };

  const saveTreasures = (treasures: Record<string, boolean>) => {
    setUnlockedTreasures(treasures);
    localStorage.setItem('pirate_treasures', JSON.stringify(treasures));
  };

  // Ship interaction actions
  const handleRepair = () => {
    if (hull >= 100) return showNotif('🛠️ Корпус уже в идеальном состоянии!');
    const newHull = Math.min(100, hull + 10);
    saveHull(newHull);
    showNotif('⚒️ Корпус подлатан! +10% прочности');
  };

  const handleLoad = () => {
    if (hold >= 100) return showNotif('📦 Трюмы забиты до отказа!');
    const newHold = Math.min(100, hold + 10);
    saveHold(newHold);
    showNotif('📦 Трюмы загружены! +10% припасов');
  };

  const handleRum = () => {
    if (morale >= 100) return showNotif('🍺 Команда поет песни, ром льется рекой!');
    const newMorale = Math.min(100, morale + 15);
    saveMorale(newMorale);
    showNotif('🍺 Бочки вскрыты! Боевой дух команды +15%');
  };

  // Officer interactions
  const rewardOfficer = (id: number) => {
    const cost = 25;
    if (gold < cost) return showNotif('❌ Недостаточно золота для премии!');

    const updated = officers.map(o => {
      if (o.id === id) {
        if (o.loyalty >= 100) {
          showNotif(`⚓ ${o.name} уже бесконечно предан вам!`);
          return o;
        }
        showNotif(`💰 Премия выдана! Преданность ${o.name} возросла!`);
        return { ...o, loyalty: Math.min(100, o.loyalty + 15), status: 'Счастлив', statusColor: 'text-emerald-400 font-bold' };
      }
      return o;
    });

    saveGold(gold - cost);
    saveOfficers(updated);
  };

  // Raid list configuration
  const raids: Raid[] = [
    { 
      id: 1, 
      name: 'Остров Сладких Грез', 
      desc: 'Романтический побег под теплый плед с какао.', 
      mission: 'Устроить уютный домашний кинопросмотр.',
      crewRequired: 10, 
      duration: 15, 
      reward: 150, 
      icon: <Clock size={28} className="text-cyan-400 animate-pulse" /> 
    },
    { 
      id: 2, 
      name: 'Мыс Страстных Объятий', 
      desc: 'Тайное десантирование в пиццерию за самой вкусной едой.', 
      mission: 'Заказать пиццу и кушать прямо на полу.',
      crewRequired: 20, 
      duration: 30, 
      reward: 350, 
      icon: <Flame size={28} className="text-orange-500 animate-bounce" /> 
    },
    { 
      id: 3, 
      name: 'Бухта Нежных Записок', 
      desc: 'Запуск почтовых бутылок с посланиями в Судовой Журнал.', 
      mission: 'Написать друг другу нежные письма.',
      crewRequired: 35, 
      duration: 60, 
      reward: 800, 
      icon: <Scroll size={28} className="text-amber-400" /> 
    }
  ];

  // Raid interactions
  const startRaid = (id: number, crewRequired: number, duration: number) => {
    if (crewCount < crewRequired) return showNotif(`❌ Нужно как минимум ${crewRequired} матросов! Наймите их в казне!`);
    if (raidStates[id] === 'sailing') return;

    // Start timer
    setRaidTimers(prev => ({ ...prev, [id]: duration }));
    const newStates = { ...raidStates, [id]: 'sailing' as const };
    saveRaidStates(newStates);

    showNotif('⛵ Корабль поднял паруса! Рейд начался!');
  };

  // Timer tick effect for sailing raids
  useEffect(() => {
    const activeIds = Object.keys(raidTimers).map(Number).filter(id => raidTimers[id] > 0);
    if (activeIds.length === 0) return;

    const interval = setInterval(() => {
      setRaidTimers(prev => {
        const next = { ...prev };
        activeIds.forEach(id => {
          if (next[id] <= 1) {
            next[id] = 0;
            // Transition raid to claim
            const newStates = { ...raidStates, [id]: 'claim' as const };
            saveRaidStates(newStates);
            showNotif('🪙 Корабль вернулся из плавания с добычей!');
          } else {
            next[id] -= 1;
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [raidTimers, raidStates]);

  const claimRaidReward = (id: number, reward: number) => {
    saveGold(gold + reward);
    const newStates = { ...raidStates, [id]: 'completed' as const };
    saveRaidStates(newStates);
    showNotif(`🪙 Добыча собрана! Казна пополнена на +${reward} дублонов!`);
  };

  // DYNAMIC MYSTERY CHESTS MERCHANT LOGIC CONFIGURATION
  const chestMerchants: ChestMerchant[] = [
    {
      id: 't_compass',
      name: 'Замшелый Сундук Рифов',
      pirateName: 'Одноглазый Барнаби',
      pirateAvatar: '🏴‍☠️',
      pirateTitle: 'Старый контрабандист и бродяга',
      cost: 300,
      chestIcon: '📦',
      story: '«Я наткнулся на этот сундук застрявшим между коралловыми рифами на Заливе Грез, когда отчаянно спасался от карательного испанского галеона. Замок старый, обросший морской солью и водорослями, но сквозь замочную скважину пробивается яркий бирюзовый свет, указывающий путь... Уступлю за 300 дублонов!»',
      treasureName: 'Компас Вечности',
      treasureIcon: <Compass size={40} className="text-cyan-400 animate-pulse" />,
      rarity: 'Редкое',
      glowColor: 'shadow-[0_0_30px_rgba(34,211,238,0.4)] text-cyan-400 border-cyan-500/30',
      romanticMessage: '«Этот компас всегда указывает на тебя, Полина. Мой единственный верный курс во всех бескрайних мирах и временах.»'
    },
    {
      id: 't_cup',
      name: 'Стальной Окованный Сундук',
      pirateName: 'Капитан Кровавая Мэри',
      pirateAvatar: '⚓',
      pirateTitle: 'Гроза испанских фортов',
      cost: 650,
      chestIcon: '🧰',
      story: '«Мы выловили этот чертов ящик прочной сетью в самом центре штормового водоворота возле Мыса Объятий. Местные чайки целыми часами кружили над ним, напевая странные песни. Мой кок клянется, что слышал тихий звон золотых бокалов изнутри. Отдам за 650 золотых!»',
      treasureName: 'Кубок Приключений',
      treasureIcon: <Trophy size={40} className="text-red-400 animate-bounce" />,
      rarity: 'Эпическое',
      glowColor: 'shadow-[0_0_30px_rgba(248,113,113,0.4)] text-red-400 border-red-500/30',
      romanticMessage: '«За каждую курьезную и безумную идею, которую мы разделили вместе, и за тысячи захватывающих путешествий, которые ждут нас впереди!»'
    },
    {
      id: 't_sabre',
      name: 'Золоченый Королевский Сундук',
      pirateName: 'Быстрый Сильвер',
      pirateAvatar: '☠️',
      pirateTitle: 'Квартирмейстер и авантюрист',
      cost: 1200,
      chestIcon: '🎁',
      story: '«Эту роскошную вещь вез личный фрегат испанского губернатора в подарок королеве. Но губернатор не умел ценить истинные богатства — преданность и бесконечное терпение своей леди. Я заграбастал его в честном абордаже. Сундук закрыт королевской печатью, но сталь клинка звенит внутри... Возьмешь за 1200 дублонов?»',
      treasureName: 'Шпага Терпения',
      treasureIcon: <Sword size={40} className="text-amber-400" />,
      rarity: 'Эпическое',
      glowColor: 'shadow-[0_0_30px_rgba(251,191,36,0.4)] text-amber-400 border-amber-500/30',
      romanticMessage: '«Выдается Полине за безграничную нежность и царское терпение во время моих капризов и штормов. Мой щит и опора!»'
    },
    {
      id: 't_heart',
      name: 'Древний Сундук Глубин',
      pirateName: 'Грозный Черная Борода',
      pirateAvatar: '🦜',
      pirateTitle: 'Легендарный Ужас Семи Морей',
      cost: 2500,
      chestIcon: '💎',
      story: '«Древние матросские легенды гласят, что это личный ларец самого Дэйви Джонса, укрытый на самом дне океанской бездны. Из его щелей исходит неописуемое сияние, способное согреть даже самое заледеневшее сердце. Я достал его из пасти левиафана! Уважь старика, цена вопроса — 2500 дублонов.»',
      treasureName: 'Сердце Океана',
      treasureIcon: <Gem size={40} className="text-purple-400" />,
      rarity: 'Легендарное',
      glowColor: 'shadow-[0_0_30px_rgba(192,132,252,0.4)] text-purple-400 border-purple-500/30',
      romanticMessage: '«Величайшее и самое сияющее сокровище во всех океанах мира — твое любящее сердце, которое освещает мне путь даже в самый лютый мрак.»'
    }
  ];

  // Chest purchase and shake unlock animation logic
  const handleOpenChest = (chest: ChestMerchant) => {
    if (gold < chest.cost) return showNotif('❌ В казне не хватает золотых дублонов!');
    if (unlockedTreasures[chest.id]) return;

    setIsOpeningChest(true);

    // Simulated shaking unlock effect
    setTimeout(() => {
      setIsOpeningChest(false);
      setChestOpenedEffect(true);
      
      const newTreasures = { ...unlockedTreasures, [chest.id]: true };
      saveTreasures(newTreasures);
      saveGold(gold - chest.cost);
      showNotif(`🔓 ${chest.treasureName} успешно освобожден из сундука!`);
    }, 1800);
  };

  const handleCloseModal = () => {
    setSelectedMerchant(null);
    setChestOpenedEffect(false);
    setIsOpeningChest(false);
  };

  // Get active selected raid data
  const activeRaid = raids.find(r => r.id === selectedRaidId) || raids[0];

  return (
    <div className="relative min-h-screen bg-[#000000] text-amber-100 font-serif overflow-x-hidden selection:bg-amber-500/30 pb-32">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-150px] left-[-150px] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[50px] right-[-150px] w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      
      {/* Wood pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-[0.05] pointer-events-none z-0" />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 px-10 py-5 rounded-full font-black text-sm sm:text-base shadow-[0_0_50px_rgba(245,158,11,0.6)] border border-amber-200/30 flex items-center gap-3.5 backdrop-blur-md"
          >
            <CheckCircle2 size={20} className="text-slate-950" />
            <span className="tracking-widest uppercase font-black">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ParrotKoko open={cocoOpen} onClose={() => setCocoOpen(false)} showTrigger={false} />

      {/* DETAILED PIRATE DEAL SCROLL MODAL */}
      <AnimatePresence>
        {selectedMerchant && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
             {/* Dark overlay backdrop */}
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={handleCloseModal} 
               className="absolute inset-0 bg-black/95 backdrop-blur-md" 
             />
             
             {/* The Old Scroll container (Pure Black & Gold styling) */}
             <motion.div 
               initial={{ scale: 0.9, y: 50, opacity: 0 }} 
               animate={{ scale: 1, y: 0, opacity: 1 }} 
               exit={{ scale: 0.9, y: 50, opacity: 0 }} 
               className="relative w-full max-w-lg bg-[#0c0c0c] border-4 border-amber-500/40 rounded-[3rem] shadow-[0_0_80px_rgba(245,158,11,0.4)] p-8 overflow-hidden flex flex-col justify-between z-10"
             >
                {/* Close Button */}
                <button onClick={handleCloseModal} className="absolute top-6 right-6 text-amber-500/50 hover:text-amber-300 transition-colors z-20">
                  <X size={28} />
                </button>

                <div className="space-y-6">
                   
                   {/* Pirate Portrait Header */}
                   <div className="flex items-center gap-4 border-b border-amber-500/25 pb-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-[#111] border-2 border-amber-500/30 flex items-center justify-center text-4xl shadow-md">
                         {selectedMerchant.pirateAvatar}
                      </div>
                      <div className="text-left">
                         <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 block">Торговец сундуками</span>
                         <h3 className="text-2xl font-black text-amber-100 leading-none uppercase tracking-tight">{selectedMerchant.pirateName}</h3>
                         <p className="text-xs text-amber-200/50 font-bold italic mt-1 leading-tight">{selectedMerchant.pirateTitle}</p>
                      </div>
                   </div>

                   {/* Chest Illustration with Dynamic Shaking Animation */}
                   <div className="py-6 flex justify-center relative">
                      {isOpeningChest ? (
                         <motion.div 
                           animate={{ 
                             rotate: [-4, 4, -4, 4, -4, 4, 0],
                             y: [0, -5, 0, -5, 0]
                           }}
                           transition={{ repeat: Infinity, duration: 0.3 }}
                           className="text-8xl filter drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] select-none"
                         >
                            💼
                         </motion.div>
                      ) : chestOpenedEffect || unlockedTreasures[selectedMerchant.id] ? (
                         <motion.div 
                           initial={{ scale: 0.8, rotate: -10 }}
                           animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                           className={cn(
                             "w-28 h-28 rounded-full border-4 flex items-center justify-center bg-black/80 shadow-inner",
                             selectedMerchant.glowColor
                           )}
                         >
                            {selectedMerchant.treasureIcon}
                         </motion.div>
                      ) : (
                         <div className="text-8xl select-none filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
                            {selectedMerchant.chestIcon}
                         </div>
                      )}
                      
                      {isOpeningChest && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full font-black uppercase text-amber-400 text-sm tracking-[0.2em] animate-pulse">
                            Сбиваем замки...
                         </div>
                      )}
                   </div>

                   {/* Scroll of Pirate's Adventure Story (Boosted size/boldness) */}
                   <div className="relative p-6 bg-gradient-to-br from-[#111] to-[#000] rounded-2xl border border-amber-500/20 text-left overflow-hidden shadow-inner">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.03] pointer-events-none" />
                      <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em] mb-2.5">История находки от пирата:</h4>
                      <p className="text-sm text-amber-100 font-bold leading-relaxed italic">
                         {selectedMerchant.story}
                      </p>
                   </div>

                   {/* Romantic message revealed */}
                   {(chestOpenedEffect || unlockedTreasures[selectedMerchant.id]) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl text-left shadow-2xl relative overflow-hidden"
                      >
                         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-2 flex items-center gap-1">
                            💝 Любовное Послание внутри:
                         </h4>
                         <p className="text-sm sm:text-base text-amber-100 font-black leading-relaxed italic text-center w-full">
                            {selectedMerchant.romanticMessage}
                         </p>
                      </motion.div>
                   )}

                </div>

                {/* Purchase Buttons Footer */}
                <div className="mt-8 pt-4 border-t border-amber-500/20">
                   {unlockedTreasures[selectedMerchant.id] || chestOpenedEffect ? (
                      <div className="w-full py-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl font-black uppercase tracking-[0.15em] text-xs sm:text-sm text-center flex justify-center items-center gap-2 shadow-inner">
                        <CheckCircle2 size={18} /> Сундук открыт • Реликвия извлечена
                      </div>
                   ) : (
                      <button 
                        onClick={() => handleOpenChest(selectedMerchant)}
                        disabled={gold < selectedMerchant.cost || isOpeningChest}
                        className={cn(
                          "w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border-2 shadow-2xl cursor-pointer active:scale-95",
                          gold >= selectedMerchant.cost 
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 text-slate-950 hover:scale-[1.02] shadow-[0_0_30px_rgba(245,158,11,0.4)]" 
                            : "bg-[#111111] text-slate-500 border-slate-900 cursor-not-allowed"
                        )}
                      >
                         <Coins size={16} /> Выкупить и Сбить Замки ({selectedMerchant.cost} дублонов)
                      </button>
                   )}
                </div>

             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12">
        
        {/* HEADER BLOCK */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-2 border-amber-500/20 pb-8">
           <div className="text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2.5 text-amber-500/70 uppercase text-[11px] font-black tracking-[0.4em]">
                 <Anchor size={14} className="text-amber-500" />
                 <span>Капитанский Мостик · Тортуга</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-amber-700 drop-shadow-[0_2px_15px_rgba(245,158,11,0.35)]">
                 Бухта Тортуга
              </h1>
           </div>

           {/* Coco Plaque Card */}
           <motion.button
             whileHover={{ scale: 1.03, y: -2 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => setCocoOpen(true)}
             className="flex items-center gap-4 bg-gradient-to-br from-[#111] to-[#000] border-2 border-amber-500/20 hover:border-amber-500/60 rounded-[2rem] pl-5 pr-12 py-3.5 shadow-2xl backdrop-blur-md transition-all relative group cursor-pointer"
           >
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#050505] border border-amber-500/20 text-3xl shadow-lg relative group-hover:rotate-12 transition-transform duration-300">
                 🦜
              </div>
              <div className="text-left">
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400 leading-none">Попугай Коко</p>
                 <p className="text-xs text-amber-100 font-bold mt-1 leading-tight whitespace-nowrap">Мудрый советник в амурных баталиях</p>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-amber-500">
                <ArrowRight size={16} />
              </div>
           </motion.button>
        </header>

        {/* 3D INTERACTIVE SAFE PIRATE BAY SCENARIO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
           
           {/* Left Column: Huge 3D Interactive Haven Diorama */}
           <div className="lg:col-span-8 h-[380px] md:h-[450px] rounded-[3rem] border-4 border-amber-500/30 overflow-hidden relative shadow-[0_0_60px_rgba(245,158,11,0.35)] bg-black">
              {isMounted ? (
                <BayScene />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black gap-4">
                  <Anchor size={36} className="animate-spin text-amber-500" />
                  <span className="text-xs uppercase font-black text-amber-500/60 tracking-widest animate-pulse">Заряжаем пушки, строим бухту...</span>
                </div>
              )}
           </div>

           {/* Right Column: Immersive safe harbor status sheet */}
           <div className="lg:col-span-4 rounded-[3rem] p-8 bg-gradient-to-br from-[#0c0c0c] to-[#000000] border-2 border-amber-500/20 relative shadow-2xl overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

              <div className="space-y-6 text-left relative z-10">
                 <div className="border-b border-amber-500/20 pb-4">
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.25em] block">Ведомости бухты</span>
                    <h2 className="text-2xl font-black text-amber-100 uppercase tracking-tight mt-1">Мирная Гавань Тортуга</h2>
                 </div>

                 <p className="text-sm text-amber-100/90 leading-relaxed font-sans font-bold">
                    Капитан! Пришвартовывайся к тихой пристани. Это самое **безопасное и теплое место** во всем архипелаге. Здесь шторма бессильны, пушки молчат, а команда может спокойно отдохнуть в таверне, пока ты изучаешь сокровища и планируешь новые приключения с Полиной.
                 </p>

                 <div className="p-5 bg-black border border-white/5 rounded-2xl space-y-4 shadow-inner">
                    <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Сводка по форпосту:</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-sans font-black">
                       <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-amber-100 font-black">Бухта безопасна</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span>🔥</span>
                          <span className="text-amber-100 font-black">Костер разожжен</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-amber-500/10 text-center relative z-10">
                 <p className="text-[10px] text-amber-500/50 uppercase tracking-[0.2em] font-black">
                    Коко вещает: «Любовь греет круче рома!»
                 </p>
              </div>
           </div>

        </section>

        {/* TABS SELECTOR */}
        <div className="flex items-center justify-center bg-black/95 p-2.5 rounded-[2.5rem] border border-amber-500/20 backdrop-blur-sm shadow-2xl relative z-20 max-w-3xl mx-auto">
           <div className="flex items-center justify-between w-full gap-2.5">
             {[
               { id: 'ship', label: 'Борт фрегата', icon: <Anchor size={16} /> },
               { id: 'crew', label: 'Офицеры WANTED', icon: <Users size={16} /> },
               { id: 'raids', label: 'Карта походов', icon: <Compass size={16} /> },
               { id: 'chests', label: 'Сундуки сделок', icon: <Trophy size={16} /> },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={cn(
                   "flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all cursor-pointer",
                   activeTab === tab.id 
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-105" 
                    : "text-amber-500/60 hover:text-amber-300 hover:bg-amber-950/20"
                 )}
               >
                 {tab.icon} <span>{tab.label}</span>
               </button>
             ))}
           </div>
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="relative min-h-[480px] z-10">
          <AnimatePresence mode="wait">
             
             {/* TAB 1: SHIP (БОРТ) — Unified Captain's Steering Console */}
             {activeTab === 'ship' && (
                <motion.div
                  key="ship"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                   {/* Captain's Steering Console Panel */}
                   <div className="bg-[#050505] rounded-[3.5rem] border-2 border-amber-500/20 p-8 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-8 items-center justify-between min-h-[380px]">
                      
                      {/* Rotating ship wheel background vector */}
                      <div className="absolute -left-16 -bottom-16 opacity-[0.04] text-amber-500 pointer-events-none animate-spin-slow">
                         <svg width="350" height="350" viewBox="0 0 100 100" fill="currentColor">
                           <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none"/>
                           <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                           {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                             <line key={deg} x1="50" y1="50" x2={50 + 48 * Math.cos(deg * Math.PI / 180)} y2={50 + 48 * Math.sin(deg * Math.PI / 180)} stroke="currentColor" strokeWidth="2"/>
                           ))}
                         </svg>
                      </div>

                      {/* Left: Decorative console description & status indicator */}
                      <div className="text-left space-y-4 max-w-sm z-10">
                         <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Система Навигации</span>
                         <h3 className="text-3xl font-black text-amber-100 uppercase tracking-tight leading-none">Приборная Панель</h3>
                         <p className="text-sm text-amber-100/70 font-bold leading-relaxed font-sans">
                            Эти приборы показывают текущее физическое и душевное состояние вашего корабля. Держите прочность высокой, а трюмы полными, чтобы экипаж оставался лояльным и готовым к плаваниям!
                         </p>
                         <div className="flex gap-2">
                           <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mt-0.5" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Системы функционируют нормально</span>
                         </div>
                      </div>

                      {/* Right: 3 Ornate Vintage Compass Gauges (Flawless centered circles using responsive viewBox="0 0 100 100") */}
                      <div className="flex flex-col sm:flex-row gap-8 items-center justify-center w-full lg:w-auto z-10">
                         
                         {/* Dial 1: Hull */}
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-36 h-36 rounded-full border-4 border-amber-500/20 bg-black flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] group hover:border-orange-500/40 transition-colors duration-500">
                               <div className="absolute inset-0 rounded-full bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                               
                               <Shield size={24} className="text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                               <span className="text-3xl font-black text-amber-100 mt-1">{hull}%</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-orange-400/80 mt-0.5">Корпус</span>
                               
                               {/* Glowing circle progress overlay - Flawlessly Centered and bounds-constrained */}
                               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                                 <circle cx="50" cy="50" r="44" className="stroke-orange-500/10 fill-none" strokeWidth="4" />
                                 <circle 
                                   cx="50" 
                                   cy="50" 
                                   r="44" 
                                   className="stroke-orange-500 fill-none transition-all duration-700" 
                                   strokeWidth="4" 
                                   strokeDasharray="276.4" 
                                   strokeDashoffset={276.4 - (276.4 * hull) / 100} 
                                   strokeLinecap="round" 
                                 />
                               </svg>
                            </div>
                            
                            <button 
                              onClick={handleRepair}
                              className="px-5 py-3 bg-gradient-to-r from-[#111] to-[#000] hover:from-orange-500 hover:to-orange-600 hover:text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs border border-amber-500/30 hover:border-orange-400 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg"
                            >
                               <Hammer size={14} /> Чинить (+10%)
                            </button>
                         </div>

                         {/* Dial 2: Hold Supplies */}
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-36 h-36 rounded-full border-4 border-amber-500/20 bg-black flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] group hover:border-sky-500/40 transition-colors duration-500">
                               <div className="absolute inset-0 rounded-full bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                               
                               <Package size={24} className="text-sky-400 group-hover:scale-110 transition-transform duration-300" />
                               <span className="text-3xl font-black text-amber-100 mt-1">{hold}%</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-sky-400/80 mt-0.5">Трюмы</span>
                               
                               {/* Glowing circle progress overlay - Flawlessly Centered and bounds-constrained */}
                               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                                 <circle cx="50" cy="50" r="44" className="stroke-sky-500/10 fill-none" strokeWidth="4" />
                                 <circle 
                                   cx="50" 
                                   cy="50" 
                                   r="44" 
                                   className="stroke-sky-400 fill-none transition-all duration-700" 
                                   strokeWidth="4" 
                                   strokeDasharray="276.4" 
                                   strokeDashoffset={276.4 - (276.4 * hold) / 100} 
                                   strokeLinecap="round" 
                                 />
                               </svg>
                            </div>
                            
                            <button 
                              onClick={handleLoad}
                              className="px-5 py-3 bg-gradient-to-r from-[#111] to-[#000] hover:from-sky-500 hover:to-sky-600 hover:text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs border border-amber-500/30 hover:border-sky-400 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg"
                            >
                               <Package size={14} /> Грузить (+10%)
                            </button>
                         </div>

                         {/* Dial 3: Morale */}
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-36 h-36 rounded-full border-4 border-amber-500/20 bg-black flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] group hover:border-red-500/40 transition-colors duration-500">
                               <div className="absolute inset-0 rounded-full bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                               
                               <Beer size={24} className="text-red-400 group-hover:scale-110 transition-transform duration-300" />
                               <span className="text-3xl font-black text-amber-100 mt-1">{morale}%</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-red-400/80 mt-0.5">Дух</span>
                               
                               {/* Glowing circle progress overlay - Flawlessly Centered and bounds-constrained */}
                               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                                 <circle cx="50" cy="50" r="44" className="stroke-red-500/10 fill-none" strokeWidth="4" />
                                 <circle 
                                   cx="50" 
                                   cy="50" 
                                   r="44" 
                                   className="stroke-red-500 fill-none transition-all duration-700" 
                                   strokeWidth="4" 
                                   strokeDasharray="276.4" 
                                   strokeDashoffset={276.4 - (276.4 * morale) / 100} 
                                   strokeLinecap="round" 
                                 />
                               </svg>
                            </div>
                            
                            <button 
                              onClick={handleRum}
                              className="px-5 py-3 bg-gradient-to-r from-[#111] to-[#000] hover:from-red-500 hover:to-red-600 hover:text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs border border-amber-500/30 hover:border-red-400 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg"
                            >
                               <Beer size={14} /> Налить Рома (+15%)
                            </button>
                         </div>

                      </div>

                   </div>

                   {/* Gossip & Weather (Pure Black Glass cards) */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative p-6 rounded-[2.5rem] bg-black border-2 border-red-500/25 text-left shadow-lg overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
                         <div className="flex justify-between items-center border-b border-red-500/15 pb-3 mb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 flex items-center gap-1.5">
                               <Wind size={14} /> Штормовое предупреждение
                            </p>
                            <span className="text-[9px] font-black text-red-400 bg-red-950/20 px-2.5 py-0.5 rounded-full border border-red-500/25">Опасно</span>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="p-3.5 bg-red-500/10 rounded-2xl text-red-400 border border-red-500/20 shrink-0">
                               <CloudLightning size={24} className="animate-pulse" />
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-base font-black text-amber-100">Буря в Карибском море</h4>
                               <p className="text-xs text-amber-100 font-bold leading-relaxed">Волны высотой до 8 метров. Кораблям не рекомендуется покидать бухту Тортуга до полного отлива во избежание крушения.</p>
                            </div>
                         </div>
                      </div>

                      <div className="relative p-6 rounded-[2.5rem] bg-black border-2 border-amber-500/20 text-left shadow-lg overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
                         <div className="flex justify-between items-center border-b border-amber-500/15 pb-3 mb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60 flex items-center gap-1.5">
                               <Scroll size={14} /> Слухи из таверны «Кракен»
                            </p>
                            <span className="text-[9px] font-black text-amber-400 bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-500/20">Слухи</span>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 shrink-0">
                               <Coins size={24} />
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-base font-black text-amber-100">Испанский Золотой Галеон</h4>
                               <p className="text-xs text-amber-100 font-bold leading-relaxed">Матросы шепчутся, что груженый до краев галеон бросил якорь неподалеку. Это отличный шанс наполнить казну золотом!</p>
                            </div>
                         </div>
                      </div>
                   </div>

                </motion.div>
             )}

             {/* TAB 2: OFFICERS (ЭКИПАЖ) — WANTED posters layout */}
             {activeTab === 'crew' && (
                <motion.div
                  key="crew"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {officers.map(officer => (
                         <div 
                           key={officer.id}
                           className="relative rounded-[2.5rem] p-6 border-4 border-amber-500/20 flex flex-col justify-between overflow-hidden shadow-2xl group bg-gradient-to-b from-[#111111] to-[#050505]"
                         >
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-0" />
                            
                            {/* Decorative wanted lines */}
                            <div className="absolute inset-x-4 top-4 h-0.5 bg-amber-500/10 z-10" />
                            <div className="absolute inset-x-4 bottom-4 h-0.5 bg-amber-500/10 z-10" />
                            
                            <div className="relative z-10 space-y-6 flex flex-col items-center text-center">
                               {/* Wanted Badge */}
                               <div className="px-4 py-1.5 bg-amber-500/15 border border-amber-500/35 rounded-lg text-amber-400 text-[10px] font-black uppercase tracking-[0.25em] shadow-md">
                                  WANTED • ЖИВЫМ
                               </div>

                               {/* Portrait frame */}
                               <div className="w-24 h-24 rounded-[2rem] bg-black border-4 border-amber-500/25 flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(0,0,0,0.8)] relative group-hover:rotate-3 transition-transform duration-300">
                                  {officer.avatar}
                               </div>

                               <div className="space-y-1">
                                  <h4 className="text-2xl font-black text-amber-100 tracking-tight leading-none uppercase">{officer.name}</h4>
                                  <p className="text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none mt-1">{officer.role}</p>
                               </div>

                               <p className="text-xs text-amber-100 font-bold leading-relaxed px-2 italic">"{officer.description}"</p>

                               {/* Custom loyalty bar with anchors */}
                               <div className="w-full space-y-2 px-2 bg-black/60 p-4 rounded-2xl border border-white/5">
                                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-500/50">
                                     <span className="flex items-center gap-1"><HeartHandshake size={12} /> Преданность</span>
                                     <span className={cn(officer.loyalty > 70 ? "text-emerald-400 font-black" : "text-yellow-400 font-black")}>{officer.loyalty}%</span>
                                  </div>
                                  <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-amber-950/20 p-0.5">
                                     <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700" style={{ width: `${officer.loyalty}%` }} />
                                  </div>
                                  <div className="flex justify-between items-center pt-1 text-[10px] text-amber-100/40 font-bold italic">
                                     <span>Статус: <strong className={officer.statusColor}>{officer.status}</strong></span>
                                     <span>Награда: <strong className="text-amber-400 font-black">{officer.wantedReward}</strong></span>
                                  </div>
                                </div>
                            </div>

                            {/* Award premium button */}
                            <div className="relative z-10 mt-6 pt-4 border-t border-amber-500/10">
                               <button 
                                 onClick={() => rewardOfficer(officer.id)}
                                 className="w-full py-4 bg-gradient-to-r from-[#111111] to-[#050505] hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                               >
                                  <Coins size={14} /> Жалованье (25 золотых)
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </motion.div>
             )}

             {/* TAB 3: EXPEDITIONS (РЕЙДЫ) — Epic Interactive Voyages Map */}
             {activeTab === 'raids' && (
                <motion.div
                  key="raids"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                   {/* Interactive Map Layout Container */}
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                      
                      {/* Left: Sea Archipelago Navigation Map */}
                      <div className="lg:col-span-8 bg-[#04090e] border-2 border-cyan-500/20 rounded-[3rem] p-6 relative overflow-hidden min-h-[400px] shadow-[inset_0_0_40px_rgba(0,255,200,0.08)] flex flex-col justify-between group">
                         
                         {/* Nautical grid lines and decorations */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,204,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,204,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dashed border-cyan-500/5 rounded-full pointer-events-none" />
                         
                         {/* Compass Rose vector element */}
                         <div className="absolute bottom-6 left-6 text-cyan-500/10 pointer-events-none">
                            <Compass size={120} className="animate-spin-slow" />
                         </div>

                         {/* Title overlay */}
                         <div className="relative z-10 flex justify-between items-start">
                            <div>
                               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">Навигационная Карта</span>
                               <h3 className="text-2xl font-black uppercase tracking-tight text-amber-100">Карта Плаваний</h3>
                            </div>
                            <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/40 px-2.5 py-1.5 rounded-lg border border-cyan-500/20">Архипелаг Грез</span>
                         </div>

                         {/* Interactive Island Nodes (Dotted lines leading to Tortuga at bottom center) */}
                         <div className="absolute inset-0 pointer-events-auto">
                            
                            {/* Tortuga Base Point (Bottom Center) */}
                            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                               <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                  ⚓
                                </div>
                                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider mt-1 bg-black/80 px-2 py-0.5 rounded border border-amber-500/25">Тортуга</span>
                            </div>

                            {/* Node 1: Остров Сладких Грез (Top Left) */}
                            <div className="absolute top-[18%] left-[18%]">
                               <svg className="absolute top-10 left-10 w-[200px] h-[150px] pointer-events-none opacity-20 overflow-visible">
                                  <path d="M 0,0 C 50,50 100,100 150,150" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 6" />
                               </svg>
                               
                               <button 
                                 onClick={() => setSelectedRaidId(1)}
                                 className={cn(
                                   "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 hover:scale-105 transition-all shadow-xl cursor-pointer relative",
                                   selectedRaidId === 1 
                                     ? "bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.3)]" 
                                     : "bg-black/90 border-cyan-500/20 text-cyan-500/60 hover:border-cyan-400"
                                 )}
                               >
                                  {raidStates[1] === 'sailing' && (
                                     <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950 animate-bounce">⛵</span>
                                  )}
                                  {raidStates[1] === 'claim' && (
                                     <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950 animate-ping">🪙</span>
                                  )}
                                  <span className="text-2xl">🌴</span>
                                  <span className="text-xs font-black uppercase tracking-wider">Грезы</span>
                               </button>
                            </div>

                            {/* Node 2: Мыс Страстных Объятий (Middle Right) */}
                            <div className="absolute top-[35%] right-[22%]">
                               <button 
                                 onClick={() => setSelectedRaidId(2)}
                                 className={cn(
                                   "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 hover:scale-105 transition-all shadow-xl cursor-pointer relative",
                                   selectedRaidId === 2 
                                     ? "bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.3)]" 
                                     : "bg-black/90 border-cyan-500/20 text-cyan-500/60 hover:border-cyan-400"
                                 )}
                               >
                                  {raidStates[2] === 'sailing' && (
                                     <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950 animate-bounce">⛵</span>
                                  )}
                                  {raidStates[2] === 'claim' && (
                                     <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950 animate-ping">🪙</span>
                                  )}
                                  <span className="text-2xl">🌋</span>
                                  <span className="text-xs font-black uppercase tracking-wider">Объятия</span>
                               </button>
                            </div>

                            {/* Node 3: Бухта Нежных Записок (Top Right) */}
                            <div className="absolute top-[12%] right-[12%]">
                               <button 
                                 onClick={() => setSelectedRaidId(3)}
                                 className={cn(
                                   "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 hover:scale-105 transition-all shadow-xl cursor-pointer relative",
                                   selectedRaidId === 3 
                                     ? "bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.3)]" 
                                     : "bg-black/90 border-cyan-500/20 text-cyan-500/60 hover:border-cyan-400"
                                 )}
                               >
                                  {raidStates[3] === 'sailing' && (
                                     <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950 animate-bounce">⛵</span>
                                  )}
                                  {raidStates[3] === 'claim' && (
                                     <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950 animate-ping">🪙</span>
                                  )}
                                  <span className="text-2xl">📜</span>
                                  <span className="text-xs font-black uppercase tracking-wider">Записки</span>
                               </button>
                            </div>

                         </div>

                         {/* Bottom status helper */}
                         <div className="relative z-10 mt-auto flex justify-between text-[10px] font-black uppercase tracking-widest text-cyan-400/60 pointer-events-none">
                            <span>🗺️ Выбери порт на карте для отправки</span>
                            <span>Тортуга Форпост</span>
                         </div>
                      </div>

                      {/* Right: Logbook & Captain's orders */}
                      <div className="lg:col-span-4 bg-black border-2 border-amber-500/20 rounded-[3rem] p-6 flex flex-col justify-between min-h-[400px] shadow-2xl relative">
                         <div className="space-y-6 text-left">
                            
                            {/* Mission Header */}
                            <div className="border-b border-amber-500/25 pb-3">
                               <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em]">Судовой Журнал</span>
                                  <span className="text-[10px] font-black text-amber-400 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/20">Порт #{activeRaid.id}</span>
                               </div>
                               <h3 className="text-2xl font-black uppercase tracking-tight text-amber-100 mt-1">{activeRaid.name}</h3>
                            </div>

                            {/* Details list */}
                            <div className="space-y-4">
                               <div className="flex gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-black border border-amber-500/20 flex items-center justify-center shrink-0">
                                     {activeRaid.icon}
                                  </div>
                                  <div>
                                     <p className="text-[10px] text-amber-100/50 font-black uppercase tracking-wider">Описание:</p>
                                     <p className="text-xs text-amber-100 font-bold italic">"{activeRaid.desc}"</p>
                                  </div>
                               </div>

                               <div className="p-4 bg-[#0a0a0a] rounded-2xl border border-white/5 space-y-2 text-sm">
                                  <div className="flex justify-between">
                                     <span className="text-amber-100/50 font-bold">Награда:</span>
                                     <strong className="text-amber-400 font-black flex items-center gap-1"><Coins size={14} />+{activeRaid.reward} дублонов</strong>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-amber-100/50 font-bold">Время пути:</span>
                                     <strong className="text-amber-100 font-black">{activeRaid.duration} сек</strong>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-amber-100/50 font-bold">Матросы:</span>
                                     <strong className="text-amber-100 font-black">{activeRaid.crewRequired} чел</strong>
                                  </div>
                               </div>

                               <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs text-amber-100 font-bold leading-relaxed relative overflow-hidden shadow-inner">
                                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.03] pointer-events-none" />
                                  <span className="font-black uppercase text-amber-400 tracking-wider text-[9px] block mb-0.5">Суть экспедиции:</span>
                                  {activeRaid.mission}
                                </div>

                               {/* Sailing progress bar */}
                               {raidStates[activeRaid.id] === 'sailing' && (
                                  <div className="space-y-2 pt-2 relative">
                                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-400">
                                        <span className="flex items-center gap-1"><Clock size={10} /> До причала: {raidTimers[activeRaid.id] || 0} сек</span>
                                        <span>{Math.round(((activeRaid.duration - (raidTimers[activeRaid.id] || 0)) / activeRaid.duration) * 100)}%</span>
                                     </div>
                                     
                                     <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-amber-950/20 p-0.5 relative">
                                        <motion.div 
                                          className="absolute top-1/2 -translate-y-1/2 text-xs z-20"
                                          style={{ left: `${Math.min(92, Math.max(2, ((activeRaid.duration - (raidTimers[activeRaid.id] || 0)) / activeRaid.duration) * 100))}%` }}
                                        >
                                          ⛵
                                        </motion.div>
                                        <div className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${((activeRaid.duration - (raidTimers[activeRaid.id] || 0)) / activeRaid.duration) * 100}%` }} />
                                     </div>
                                  </div>
                               )}
                            </div>

                         </div>

                         {/* Action Buttons */}
                         <div className="pt-6 border-t border-amber-500/10">
                            {raidStates[activeRaid.id] === 'ready' || !raidStates[activeRaid.id] ? (
                               <button 
                                 onClick={() => startRaid(activeRaid.id, activeRaid.crewRequired, activeRaid.duration)}
                                 disabled={crewCount < activeRaid.crewRequired}
                                 className={cn(
                                   "w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border-2 shadow-lg",
                                   crewCount >= activeRaid.crewRequired 
                                     ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 text-slate-950 hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.25)]" 
                                     : "bg-[#111] text-slate-500 border-slate-900 cursor-not-allowed"
                                 )}
                               >
                                  <Play size={12} /> {crewCount >= activeRaid.crewRequired ? `Поднять Паруса!` : `Не хватает команды (нужно ${activeRaid.crewRequired})`}
                               </button>
                            ) : null}

                            {raidStates[activeRaid.id] === 'sailing' && (
                               <div className="w-full py-3.5 bg-black border border-amber-500/10 rounded-2xl text-[10px] font-black text-amber-400/60 uppercase tracking-widest text-center flex items-center justify-center gap-1.5 shadow-inner">
                                  <Anchor size={12} className="animate-spin-slow text-amber-500/60" /> Фрегат режет волны...
                               </div>
                            )}

                            {raidStates[activeRaid.id] === 'claim' && (
                               <button 
                                 onClick={() => claimRaidReward(activeRaid.id, activeRaid.reward)}
                                 className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] text-xs border-2 border-orange-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-bounce cursor-pointer flex items-center justify-center gap-1.5"
                               >
                                  <Coins size={14} /> Разгрузить добычу!
                               </button>
                            )}

                            {raidStates[activeRaid.id] === 'completed' && (
                               <div className="w-full py-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                                  <UserCheck size={12} /> Поход Успешно Завершен
                               </div>
                            )}
                         </div>

                      </div>

                   </div>
                </motion.div>
             )}

             {/* TAB 4: MYSTERY CHESTS (СУНДУКИ СДЕЛКИ) */}
             {activeTab === 'chests' && (
                <motion.div
                  key="chests"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                   {/* Chest Shop Header */}
                   <div className="text-center space-y-2 max-w-xl mx-auto">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Сделки на причале</span>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-amber-100">Контрабандные Сундуки Пиратов</h2>
                      <p className="text-sm text-amber-500/70 font-bold leading-relaxed">
                         «Проезжие пираты постоянно завозят в гавань закрытые сундуки. Выкупайте их у купцов, слушайте их невероятные истории и взламывайте замки, чтобы добраться до истинных сокровищ любви!»
                      </p>
                   </div>

                   {/* Grid of 4 columns, showing merchants with closed chests */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {chestMerchants.map(merchant => {
                         const isUnlocked = unlockedTreasures[merchant.id] || false;
                         const canAfford = gold >= merchant.cost;

                         return (
                            <div 
                              key={merchant.id}
                              onClick={() => setSelectedMerchant(merchant)}
                              className={cn(
                                "relative rounded-[2.5rem] p-6 border-4 transition-all flex flex-col justify-between items-center text-center overflow-hidden group shadow-2xl min-h-[420px] cursor-pointer hover:scale-[1.02] bg-[#0c0c0c]",
                                isUnlocked 
                                  ? `border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]` 
                                  : "border-amber-900/40 hover:border-amber-500/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.2)]"
                              )}
                            >
                               <div className="absolute inset-0 bg-black/55 z-0 transition-colors group-hover:bg-black/45" />

                               {/* Merchant Header */}
                               <div className="relative z-10 w-full flex flex-col items-center space-y-3.5">
                                  {/* Rarity Label */}
                                  <span className={cn(
                                     "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                                     isUnlocked 
                                       ? "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" 
                                       : "text-amber-500 border-amber-500/10 bg-amber-950/10"
                                  )}>
                                     {merchant.rarity}
                                  </span>

                                  {/* Pirate Seller Avatar Badge */}
                                  <div className="flex items-center gap-1.5 bg-black/45 px-3 py-1 rounded-full border border-white/5">
                                     <span className="text-sm">{merchant.pirateAvatar}</span>
                                     <span className="text-[10px] font-black uppercase tracking-wider text-amber-100/60 truncate max-w-[100px]">{merchant.pirateName}</span>
                                  </div>
                               </div>

                               {/* Chest or Unlocked Item Graphic */}
                               <div className="relative z-10 my-4 flex items-center justify-center">
                                  {isUnlocked ? (
                                     <div className={cn(
                                        "w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl shadow-xl transition-all bg-[#0e0703]",
                                        merchant.glowColor
                                     )}>
                                        {merchant.treasureIcon}
                                     </div>
                                  ) : (
                                     <div className="text-7xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] group-hover:scale-115 group-hover:-rotate-3 transition-transform duration-300 select-none">
                                        {merchant.chestIcon}
                                     </div>
                                  )}
                               </div>

                               {/* Chest Details */}
                               <div className="relative z-10 w-full space-y-1">
                                  <h3 className="text-lg font-black text-amber-100 leading-tight uppercase tracking-tight">
                                     {isUnlocked ? merchant.treasureName : merchant.name}
                                  </h3>
                                  <p className="text-[10px] text-amber-100/40 font-black italic">
                                     {isUnlocked ? 'Сундук взломан' : 'Кликни, чтобы узнать историю'}
                                  </p>
                               </div>

                               {/* Unlock Status or Price Button */}
                               <div className="relative z-10 w-full mt-6 pt-4 border-t border-amber-500/10">
                                  {isUnlocked ? (
                                     <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-black uppercase tracking-widest text-[9px] flex justify-center items-center gap-1.5 shadow-inner">
                                       <CheckCircle2 size={12} /> Открыт • Посмотреть
                                     </div>
                                  ) : (
                                     <div 
                                       className={cn(
                                         "w-full py-3 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 border transition-all",
                                         canAfford 
                                           ? "bg-[#111111] border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-400" 
                                           : "bg-[#050505] text-slate-500 border-slate-900"
                                       )}
                                     >
                                        <Coins size={12} /> {merchant.cost} дублонов
                                     </div>
                                  )}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </motion.div>
             )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
