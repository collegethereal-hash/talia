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
        return { ...o, loyalty: Math.min(100, o.loyalty + 15), status: 'Счастлив', statusColor: 'text-emerald-400' };
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

  const resetAllRaids = () => {
    const newStates = { 1: 'ready' as const, 2: 'ready' as const, 3: 'ready' as const };
    saveRaidStates(newStates);
    setRaidTimers({});
    showNotif('🗺️ Карты обновлены, новые рейды доступны капитан!');
  };

  // NEW DYNAMIC MYSTERY CHESTS MERCHANT LOGIC CONFIGURATION
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

  return (
    <div className="relative min-h-screen bg-[#030303] text-amber-100 font-serif overflow-x-hidden selection:bg-amber-500/30 pb-32">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-150px] left-[-150px] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[50px] right-[-150px] w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-cyan-700/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      {/* Wood pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-[0.08] pointer-events-none z-0" />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 px-8 py-4 rounded-full font-black text-sm shadow-[0_0_40px_rgba(245,158,11,0.5)] border border-amber-200/30 flex items-center gap-3 backdrop-blur-md"
          >
            <CheckCircle2 size={18} className="text-slate-950" />
            <span className="tracking-wide uppercase text-xs">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ParrotKoko open={cocoOpen} onClose={() => setCocoOpen(false)} showTrigger={false} />

      {/* DETAILED PIRATE DEAL SCROLL MODAL (CHEST STORY & BUYING) */}
      <AnimatePresence>
        {selectedMerchant && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
             {/* Dark overlay backdrop */}
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={handleCloseModal} 
               className="absolute inset-0 bg-black/85 backdrop-blur-md" 
             />
             
             {/* The Old Parchment Scroll container */}
             <motion.div 
               initial={{ scale: 0.9, y: 50, opacity: 0 }} 
               animate={{ scale: 1, y: 0, opacity: 1 }} 
               exit={{ scale: 0.9, y: 50, opacity: 0 }} 
               className="relative w-full max-w-lg bg-[#140b05] border-4 border-amber-500/30 rounded-[3rem] shadow-[0_0_60px_rgba(245,158,11,0.35)] p-8 overflow-hidden pirate-wood flex flex-col justify-between z-10"
             >
                {/* Close Button */}
                <button onClick={handleCloseModal} className="absolute top-6 right-6 text-amber-500/40 hover:text-amber-300 transition-colors z-20">
                  <X size={24} />
                </button>

                <div className="space-y-6">
                   
                   {/* Pirate Portrait Header */}
                   <div className="flex items-center gap-4 border-b border-amber-500/20 pb-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-[#1d0e05] border-2 border-amber-500/20 flex items-center justify-center text-4xl shadow-md">
                         {selectedMerchant.pirateAvatar}
                      </div>
                      <div className="text-left">
                         <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/50 block">Торговец сундуками</span>
                         <h3 className="text-xl font-bold text-amber-100 leading-none uppercase">{selectedMerchant.pirateName}</h3>
                         <p className="text-[10px] text-amber-100/40 italic mt-1 leading-tight">{selectedMerchant.pirateTitle}</p>
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
                           className="text-8xl filter drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] select-none"
                         >
                            💼
                         </motion.div>
                      ) : chestOpenedEffect || unlockedTreasures[selectedMerchant.id] ? (
                         <motion.div 
                           initial={{ scale: 0.8, rotate: -10 }}
                           animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                           className={cn(
                             "w-28 h-28 rounded-full border-4 flex items-center justify-center bg-black/60 shadow-inner",
                             selectedMerchant.glowColor
                           )}
                         >
                            {selectedMerchant.treasureIcon}
                         </motion.div>
                      ) : (
                         <div className="text-8xl select-none filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                            {selectedMerchant.chestIcon}
                         </div>
                      )}
                      
                      {isOpeningChest && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full font-black uppercase text-amber-400 text-xs tracking-widest animate-pulse">
                            Сбиваем замки...
                         </div>
                      )}
                   </div>

                   {/* Scroll of Pirate's Adventure Story */}
                   <div className="relative p-5 bg-gradient-to-br from-[#1a0f07] to-[#0a0603] rounded-2xl border border-amber-500/10 text-left overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.03] pointer-events-none" />
                      <h4 className="text-[9px] font-black uppercase text-amber-400 tracking-wider mb-2">История находки от пирата:</h4>
                      <p className="text-xs text-amber-200/80 leading-relaxed italic font-medium">
                         {selectedMerchant.story}
                      </p>
                   </div>

                   {/* Romantic message revealed ONLY if unlocked */}
                   {(chestOpenedEffect || unlockedTreasures[selectedMerchant.id]) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-left shadow-inner relative overflow-hidden"
                      >
                         <h4 className="text-[8px] font-black uppercase tracking-widest text-amber-500 mb-1.5 flex items-center gap-1">
                            💝 Любовное Послание внутри:
                         </h4>
                         <p className="text-xs text-amber-100 font-bold leading-relaxed italic text-center w-full">
                            {selectedMerchant.romanticMessage}
                         </p>
                      </motion.div>
                   )}

                </div>

                {/* Purchase Buttons Footer */}
                <div className="mt-8 pt-4 border-t border-amber-500/10">
                   {unlockedTreasures[selectedMerchant.id] || chestOpenedEffect ? (
                      <div className="w-full py-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl font-black uppercase tracking-widest text-xs text-center flex justify-center items-center gap-2">
                        <CheckCircle2 size={16} /> Сундук открыт • Реликвия извлечена
                      </div>
                   ) : (
                      <button 
                        onClick={() => handleOpenChest(selectedMerchant)}
                        disabled={gold < selectedMerchant.cost || isOpeningChest}
                        className={cn(
                          "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border-2 shadow-xl cursor-pointer active:scale-95",
                          gold >= selectedMerchant.cost 
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 text-slate-950 hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                            : "bg-[#140c06] text-slate-500 border-slate-900 cursor-not-allowed"
                        )}
                      >
                         <Coins size={14} /> Выкупить и Сбить Замки ({selectedMerchant.cost} дублонов)
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
              <div className="flex items-center justify-center md:justify-start gap-2.5 text-amber-500/60 uppercase text-[10px] font-black tracking-[0.5em]">
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
             className="flex items-center gap-4 bg-gradient-to-br from-[#24170c] to-[#0c0804] border-2 border-amber-500/30 hover:border-amber-500/60 rounded-[2rem] pl-5 pr-12 py-3.5 shadow-2xl backdrop-blur-md transition-all relative group cursor-pointer"
           >
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#140b05] border border-amber-500/20 text-3xl shadow-lg relative group-hover:rotate-12 transition-transform duration-300">
                 🦜
              </div>
              <div className="text-left">
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400 leading-none">Попугай Коко</p>
                 <p className="text-[11px] text-amber-100/50 mt-1 leading-tight whitespace-nowrap">Мудрый советник в амурных баталиях</p>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-amber-500">
                <ArrowRight size={16} />
              </div>
           </motion.button>
        </header>

        {/* 3D INTERACTIVE SAFE PIRATE BAY SCENARIO (Top featured block) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
           
           {/* Left Column: Huge 3D Interactive Haven Diorama */}
           <div className="lg:col-span-8 h-[380px] md:h-[450px] pirate-wood rounded-[3rem] border-4 border-amber-500/30 overflow-hidden relative shadow-[0_0_60px_rgba(245,158,11,0.2)]">
              {isMounted ? (
                <BayScene />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 gap-4">
                  <Anchor size={36} className="animate-spin text-amber-500" />
                  <span className="text-xs uppercase font-black text-amber-500/60 tracking-widest animate-pulse">Заряжаем пушки, строим бухту...</span>
                </div>
              )}
           </div>

           {/* Right Column: Immersive safe harbor parchment status sheet */}
           <div className="lg:col-span-4 rounded-[3rem] p-8 bg-gradient-to-br from-[#1a0f07] to-[#080503] border-2 border-amber-500/20 relative shadow-2xl overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

              <div className="space-y-6 text-left relative z-10">
                 <div className="border-b border-amber-500/10 pb-4">
                    <span className="text-[8px] font-black uppercase text-amber-500 tracking-[0.3em] block">Ведомости бухты</span>
                    <h2 className="text-2xl font-black text-amber-100 uppercase tracking-tight mt-1">Мирная Гавань Тортуга</h2>
                 </div>

                 <p className="text-xs text-amber-100/70 leading-relaxed font-sans font-medium">
                    Капитан! Пришвартовывайся к тихой пристани. Это самое **безопасное и теплое место** во всем архипелаге. Здесь шторма бессильны, пушки молчат, а команда может спокойно отдохнуть в таверне, пока ты изучаешь сокровища и планируешь новые приключения с Полиной.
                 </p>

                 <div className="p-4 bg-black/45 rounded-2xl border border-white/5 space-y-3.5">
                    <h4 className="text-[9px] font-black uppercase text-amber-400 tracking-wider">Сводка по форпосту:</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                       <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-amber-100/60 font-bold">Бухта безопасна</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span>🔥</span>
                          <span className="text-amber-100/60 font-bold">Костер разожжен</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-amber-500/10 text-center relative z-10">
                 <p className="text-[9px] text-amber-500/40 uppercase tracking-[0.2em] font-black">
                    Коко вещает: «Любовь греет круче рома!»
                 </p>
              </div>
           </div>

        </section>

        {/* TABS SELECTOR */}
        <div className="flex items-center justify-center bg-[#0a0603]/80 p-2 rounded-[2.5rem] border border-amber-500/10 backdrop-blur-sm shadow-2xl relative z-20 max-w-3xl mx-auto">
           <div className="flex items-center justify-between w-full gap-2">
             {[
               { id: 'ship', label: 'Борт фрегата', icon: <Anchor size={14} /> },
               { id: 'crew', label: 'Офицеры WANTED', icon: <Users size={14} /> },
               { id: 'raids', label: 'Походы', icon: <Compass size={14} /> },
               { id: 'chests', label: 'Сундуки сделок', icon: <Trophy size={14} /> },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={cn(
                   "flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-xs transition-all cursor-pointer",
                   activeTab === tab.id 
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-105" 
                    : "text-amber-500/55 hover:text-amber-300 hover:bg-amber-950/20"
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
             
             {/* TAB 1: SHIP (БОРТ) — Unified, highly visual tactical layout */}
             {activeTab === 'ship' && (
                <motion.div
                  key="ship"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                   {/* 3 Heavy stat & action widgets grid */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Card 1: Hull */}
                      <div className="pirate-wood p-6 rounded-[2.5rem] border-amber-900/40 relative overflow-hidden flex flex-col justify-between group shadow-xl">
                         <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors" />
                         <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-center">
                               <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1.5">
                                  <Shield size={14} /> Прочность корпуса
                               </p>
                               <span className="text-[9px] font-black text-orange-400 bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-500/20">{hull}%</span>
                            </div>
                            
                            {/* Circular vintage dial indicator */}
                            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                               <svg className="w-full h-full transform -rotate-90">
                                  <circle cx="64" cy="64" r="50" className="stroke-black/50 fill-none" strokeWidth="8" />
                                  <circle cx="64" cy="64" r="50" className="stroke-orange-500 fill-none transition-all duration-700" strokeWidth="8" strokeDasharray="314" strokeDashoffset={314 - (314 * hull) / 100} strokeLinecap="round" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                   <span className="text-3xl font-black text-amber-100">{hull}%</span>
                                   <span className="text-[8px] font-black uppercase tracking-widest text-amber-100/40">Ок</span>
                                </div>
                            </div>

                            <p className="text-[10px] text-center text-amber-100/40 italic">«Корпус сдерживает натиск волн и снарядов противника»</p>
                         </div>
                         <div className="relative z-10 mt-6 pt-4 border-t border-amber-500/10">
                            <button 
                              onClick={handleRepair}
                              className="w-full py-4 bg-gradient-to-r from-[#2c170a] to-[#140b05] hover:from-orange-500 hover:to-orange-600 hover:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-amber-500/20 hover:border-orange-400 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                            >
                               <Hammer size={12} /> Заделать пробоины
                            </button>
                         </div>
                      </div>

                      {/* Card 2: Supplies */}
                      <div className="pirate-wood p-6 rounded-[2.5rem] border-amber-900/40 relative overflow-hidden flex flex-col justify-between group shadow-xl">
                         <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors" />
                         <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-center">
                               <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                                  <Package size={14} /> Припасы в трюме
                               </p>
                               <span className="text-[9px] font-black text-sky-400 bg-sky-950/30 px-2 py-0.5 rounded-full border border-sky-500/20">{hold}%</span>
                            </div>
                            
                            {/* Circular dial indicator */}
                            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                               <svg className="w-full h-full transform -rotate-90">
                                  <circle cx="64" cy="64" r="50" className="stroke-black/50 fill-none" strokeWidth="8" />
                                  <circle cx="64" cy="64" r="50" className="stroke-sky-400 fill-none transition-all duration-700" strokeWidth="8" strokeDasharray="314" strokeDashoffset={314 - (314 * hold) / 100} strokeLinecap="round" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                   <span className="text-3xl font-black text-amber-100">{hold}%</span>
                                   <span className="text-[8px] font-black uppercase tracking-widest text-amber-100/40">Полн</span>
                                </div>
                            </div>

                            <p className="text-[10px] text-center text-amber-100/40 italic">«Еда и боеприпасы необходимы для долгих плаваний»</p>
                         </div>
                         <div className="relative z-10 mt-6 pt-4 border-t border-amber-500/10">
                            <button 
                              onClick={handleLoad}
                              className="w-full py-4 bg-gradient-to-r from-[#2c170a] to-[#140b05] hover:from-sky-500 hover:to-sky-600 hover:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-amber-500/20 hover:border-sky-400 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                            >
                               <Package size={12} /> Пополнить припасы
                            </button>
                         </div>
                      </div>

                      {/* Card 3: Morale */}
                      <div className="pirate-wood p-6 rounded-[2.5rem] border-amber-900/40 relative overflow-hidden flex flex-col justify-between group shadow-xl">
                         <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors" />
                         <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-center">
                               <p className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5">
                                  <Heart size={14} /> Боевой дух команды
                               </p>
                               <span className="text-[9px] font-black text-red-400 bg-red-950/30 px-2 py-0.5 rounded-full border border-red-500/20">{morale}%</span>
                            </div>
                            
                            {/* Circular dial indicator */}
                            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                               <svg className="w-full h-full transform -rotate-90">
                                  <circle cx="64" cy="64" r="50" className="stroke-black/50 fill-none" strokeWidth="8" />
                                  <circle cx="64" cy="64" r="50" className="stroke-red-500 fill-none transition-all duration-700" strokeWidth="8" strokeDasharray="314" strokeDashoffset={314 - (314 * morale) / 100} strokeLinecap="round" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                   <span className="text-3xl font-black text-amber-100">{morale}%</span>
                                   <span className="text-[8px] font-black uppercase tracking-widest text-amber-100/40">Лоял</span>
                                </div>
                            </div>

                            <p className="text-[10px] text-center text-amber-100/40 italic">«Высокий дух матросов предотвращает мятеж на борту»</p>
                         </div>
                         <div className="relative z-10 mt-6 pt-4 border-t border-amber-500/10">
                            <button 
                              onClick={handleRum}
                              className="w-full py-4 bg-gradient-to-r from-[#2c170a] to-[#140b05] hover:from-red-500 hover:to-red-600 hover:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-amber-500/20 hover:border-red-400 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                            >
                               <Beer size={12} /> Вскрыть бочку рома
                            </button>
                         </div>
                      </div>

                   </div>

                   {/* Gossip & Weather (Parchment styled cards) */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative p-6 rounded-[2.5rem] bg-gradient-to-br from-[#1c0b05] to-[#0a0402] border-2 border-red-500/20 text-left shadow-lg overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
                         <div className="flex justify-between items-center border-b border-red-500/10 pb-3 mb-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 flex items-center gap-1.5">
                               <Wind size={12} /> Штормовое предупреждение
                            </p>
                            <span className="text-[8px] font-black text-red-500 bg-red-950/20 px-2.5 py-0.5 rounded-full border border-red-500/20">Опасно</span>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-500/10 rounded-2xl text-red-400 border border-red-500/20 shrink-0">
                               <CloudLightning size={24} className="animate-pulse" />
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-sm font-bold text-amber-100">Буря в Карибском море</h4>
                               <p className="text-[10px] text-amber-100/50 italic leading-relaxed">Волны высотой до 8 метров. Кораблям не рекомендуется покидать бухту Тортуга до полного отлива во избежание крушения.</p>
                            </div>
                         </div>
                      </div>

                      <div className="relative p-6 rounded-[2.5rem] bg-gradient-to-br from-[#1c1305] to-[#0a0702] border-2 border-amber-500/15 text-left shadow-lg overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
                         <div className="flex justify-between items-center border-b border-amber-500/10 pb-3 mb-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/50 flex items-center gap-1.5">
                               <Scroll size={12} /> Слухи из таверны «Кракен»
                            </p>
                            <span className="text-[8px] font-black text-amber-400 bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-500/20">Слухи</span>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 shrink-0">
                               <Coins size={24} />
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-sm font-bold text-amber-100">Испанский Золотой Галеон</h4>
                               <p className="text-[10px] text-amber-100/50 italic leading-relaxed">Матросы шепчутся, что груженый до краев галеон бросил якорь неподалеку. Это отличный шанс наполнить казну золотом!</p>
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
                           className="relative rounded-[2.5rem] p-6 border-4 border-[#5a3e2b] flex flex-col justify-between overflow-hidden shadow-2xl group bg-gradient-to-b from-[#24150c] to-[#0f0905]"
                         >
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-0" />
                            
                            {/* Decorative wanted lines */}
                            <div className="absolute inset-x-4 top-4 h-0.5 bg-amber-500/10 z-10" />
                            <div className="absolute inset-x-4 bottom-4 h-0.5 bg-amber-500/10 z-10" />
                            
                            <div className="relative z-10 space-y-6 flex flex-col items-center text-center">
                               {/* Wanted Badge */}
                               <div className="px-4 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-[8px] font-black uppercase tracking-[0.2em] shadow-md">
                                  WANTED • ЖИВЫМ
                               </div>

                               {/* Portrait frame */}
                               <div className="w-24 h-24 rounded-[2rem] bg-[#140b05] border-4 border-[#5a3e2b] flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(0,0,0,0.8)] relative group-hover:rotate-3 transition-transform duration-300">
                                  {officer.avatar}
                               </div>

                               <div className="space-y-1">
                                  <h4 className="text-2xl font-bold text-amber-100 tracking-tight leading-none uppercase">{officer.name}</h4>
                                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest leading-none mt-1">{officer.role}</p>
                               </div>

                               <p className="text-[10px] text-amber-100/50 italic leading-relaxed px-2 font-medium">"{officer.description}"</p>

                               {/* Custom loyalty bar with anchors */}
                               <div className="w-full space-y-2 px-2 bg-black/35 p-4 rounded-2xl border border-white/5">
                                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-amber-500/40">
                                     <span className="flex items-center gap-1"><HeartHandshake size={10} /> Преданность</span>
                                     <span className={cn(officer.loyalty > 70 ? "text-emerald-400" : "text-yellow-400")}>{officer.loyalty}%</span>
                                  </div>
                                  <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-amber-950/20 p-0.5">
                                     <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700" style={{ width: `${officer.loyalty}%` }} />
                                  </div>
                                  <div className="flex justify-between items-center pt-1 text-[8px] text-amber-100/30 italic">
                                     <span>Статус: <strong className={officer.statusColor}>{officer.status}</strong></span>
                                     <span>Награда: {officer.wantedReward}</span>
                                  </div>
                               </div>
                            </div>

                            {/* Award premium button */}
                            <div className="relative z-10 mt-6 pt-4 border-t border-amber-500/10">
                               <button 
                                 onClick={() => rewardOfficer(officer.id)}
                                 className="w-full py-4 bg-gradient-to-r from-[#201309] to-[#0c0804] hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-amber-500/20 hover:border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                               >
                                  <Coins size={12} /> Жалованье (25 золотых)
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </motion.div>
             )}

             {/* TAB 3: EXPEDITIONS (РЕЙДЫ) — Styled like epic old parchment scrolls */}
             {activeTab === 'raids' && (
                <motion.div
                  key="raids"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                   {Object.values(raidStates).includes('completed') && (
                     <div className="flex justify-center">
                       <button 
                         onClick={resetAllRaids}
                         className="px-6 py-3 bg-gradient-to-r from-[#24150c] to-[#0f0905] border-2 border-amber-500/30 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-amber-500 hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
                       >
                         <Compass size={12} className="animate-spin-slow text-amber-400" /> Обновить Карты Экспедиций
                       </button>
                     </div>
                   )}

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {raids.map(raid => {
                         const state = raidStates[raid.id] || 'ready';
                         const timer = raidTimers[raid.id] || 0;
                         const progress = timer > 0 ? ((raid.duration - timer) / raid.duration) * 100 : 0;
                         const canAffordCrew = crewCount >= raid.crewRequired;

                         return (
                            <div 
                              key={raid.id}
                              className={cn(
                                "relative rounded-[2.5rem] p-6 border-4 flex flex-col justify-between overflow-hidden group transition-all bg-gradient-to-b from-[#1a0f07] to-[#090502]",
                                state === 'completed' ? "border-emerald-500/20 opacity-70" : "border-[#5a3e2b] hover:border-amber-500/40"
                              )}
                            >
                               <div className="absolute inset-0 bg-black/45 z-0" />
                               
                               <div className="relative z-10 space-y-6 text-left">
                                  {/* Header area with custom states badge */}
                                  <div className="flex justify-between items-start">
                                     <div className="w-14 h-14 rounded-2xl bg-[#140b05] border-2 border-[#5a3e2b] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                                        {raid.icon}
                                     </div>
                                     
                                     <div className="text-right">
                                        <span className={cn(
                                          "text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border",
                                          state === 'ready' && "text-cyan-400 bg-cyan-950/30 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]",
                                          state === 'sailing' && "text-amber-400 bg-amber-950/30 border-amber-500/20 animate-pulse",
                                          state === 'claim' && "text-orange-400 bg-orange-950/30 border-orange-500/20 animate-bounce shadow-[0_0_15px_rgba(249,115,22,0.2)]",
                                          state === 'completed' && "text-emerald-400 bg-emerald-950/30 border-emerald-500/20"
                                        )}>
                                           {state === 'ready' && 'К отплытию'}
                                           {state === 'sailing' && 'В походе'}
                                           {state === 'claim' && 'Добыча ждет!'}
                                           {state === 'completed' && 'Завершено'}
                                        </span>
                                        <p className="text-[8px] text-amber-500/35 font-black uppercase tracking-widest mt-2">Карта #{raid.id}</p>
                                     </div>
                                  </div>

                                  {/* Content */}
                                  <div className="space-y-1">
                                     <h4 className="text-xl font-bold text-amber-100 leading-tight uppercase tracking-tight">{raid.name}</h4>
                                     <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                                        <Coins size={12} /> Награда: +{raid.reward} дублонов
                                     </p>
                                     <p className="text-[10px] text-amber-100/40 italic leading-relaxed pt-1 font-medium">"{raid.desc}"</p>
                                  </div>

                                  {/* Goal parchment styled container */}
                                  <div className="p-3.5 bg-black/45 rounded-2xl border border-white/5 text-[10px] text-amber-100/80 font-sans leading-relaxed relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.03] pointer-events-none" />
                                     <div className="relative z-10 flex items-start gap-2">
                                        <CheckCircle2 size={12} className="text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                                        <div>
                                           <span className="font-black uppercase text-amber-400 tracking-wider text-[8px] block mb-0.5">Суть экспедиции:</span>
                                           {raid.mission}
                                        </div>
                                     </div>
                                  </div>

                                  {/* Sailing progress bar WITH SLIDING SHIP MINI-ANIMATION */}
                                  {state === 'sailing' && (
                                     <div className="space-y-2 pt-2 relative">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-amber-400">
                                           <span className="flex items-center gap-1"><Clock size={10} /> До причала: {timer} сек</span>
                                           <span>{Math.round(progress)}%</span>
                                        </div>
                                        
                                        <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-amber-950/20 p-0.5 relative">
                                           {/* Sliding ship indicator */}
                                           <motion.div 
                                             className="absolute top-1/2 -translate-y-1/2 text-xs z-20"
                                             style={{ left: `${Math.min(92, Math.max(2, progress))}%` }}
                                           >
                                             ⛵
                                           </motion.div>
                                           <div className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${progress}%` }} />
                                        </div>
                                     </div>
                                  )}
                               </div>

                               {/* Action Button */}
                               <div className="relative z-10 mt-6 pt-4 border-t border-amber-500/10">
                                  {state === 'ready' && (
                                     <button 
                                       onClick={() => startRaid(raid.id, raid.crewRequired, raid.duration)}
                                       disabled={!canAffordCrew}
                                       className={cn(
                                         "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border-2 shadow-lg",
                                         canAffordCrew 
                                           ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 text-slate-950 hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.25)]" 
                                           : "bg-[#140c06] text-slate-500 border-slate-900 cursor-not-allowed"
                                       )}
                                     >
                                        <Play size={10} /> {canAffordCrew ? `Отправить судно (${raid.crewRequired} матросов)` : `Не хватает команды (нужно ${raid.crewRequired})`}
                                     </button>
                                  )}
                                  {state === 'sailing' && (
                                     <div className="w-full py-3.5 bg-[#110c05] border border-amber-500/10 rounded-2xl text-[9px] font-black text-amber-400/60 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                                        <Anchor size={12} className="animate-spin-slow text-amber-500/60" /> Корабль режет волны...
                                     </div>
                                  )}
                                  {state === 'claim' && (
                                     <button 
                                       onClick={() => claimRaidReward(raid.id, raid.reward)}
                                       className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[9px] border-2 border-orange-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-bounce cursor-pointer flex items-center justify-center gap-1.5"
                                     >
                                        <Coins size={12} /> Разгрузить добычу!
                                     </button>
                                  )}
                                  {state === 'completed' && (
                                     <div className="w-full py-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl text-[9px] font-black text-emerald-400 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                                        <UserCheck size={12} /> Поход Успешно Завершен
                                     </div>
                                  )}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </motion.div>
             )}

             {/* TAB 4: MYSTERY CHESTS (СУНДУКИ СДЕЛКИ) — The brand-new pirate merchant chest gameplay */}
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
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">Сделки на причале</span>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-amber-100">Контрабандные Сундуки Пиратов</h2>
                      <p className="text-xs text-amber-500/50 italic leading-relaxed">
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
                                "relative rounded-[2.5rem] p-6 border-4 transition-all flex flex-col justify-between items-center text-center overflow-hidden group pirate-wood shadow-2xl min-h-[420px] cursor-pointer hover:scale-[1.02]",
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
                                     "text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                                     isUnlocked 
                                       ? "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" 
                                       : "text-amber-500/40 border-amber-500/10 bg-amber-950/10"
                                  )}>
                                     {merchant.rarity}
                                  </span>

                                  {/* Pirate Seller Avatar Badge */}
                                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                     <span className="text-sm">{merchant.pirateAvatar}</span>
                                     <span className="text-[8px] font-black uppercase tracking-wider text-amber-100/60 truncate max-w-[100px]">{merchant.pirateName}</span>
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
                                  <h3 className="text-md font-black text-amber-100 leading-tight uppercase tracking-tight">
                                     {isUnlocked ? merchant.treasureName : merchant.name}
                                  </h3>
                                  <p className="text-[8px] text-amber-100/35 italic font-bold">
                                     {isUnlocked ? 'Сундук взломан' : 'Кликни, чтобы узнать историю'}
                                  </p>
                               </div>

                               {/* Unlock Status or Price Button */}
                               <div className="relative z-10 w-full mt-6 pt-4 border-t border-amber-500/10">
                                  {isUnlocked ? (
                                     <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-black uppercase tracking-widest text-[8px] flex justify-center items-center gap-1.5 shadow-inner">
                                       <CheckCircle2 size={12} /> Открыт • Посмотреть
                                     </div>
                                  ) : (
                                     <div 
                                       className={cn(
                                         "w-full py-3 rounded-xl font-black uppercase tracking-widest text-[8px] flex items-center justify-center gap-1.5 border transition-all",
                                         canAfford 
                                           ? "bg-[#1d0e05] border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-400" 
                                           : "bg-[#140c06] text-slate-500 border-slate-900"
                                       )}
                                     >
                                        <Coins size={10} /> {merchant.cost} дублонов
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
