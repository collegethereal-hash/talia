'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog, Heart, Zap, Utensils, Droplets, X, Star, Settings2, Flame, MessageCircle, Clock, Book, Quote, Info, Sparkles, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

import dynamic from 'next/dynamic';

const ArchiScene = dynamic(() => import('./ArchiScene'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-[#5c4a33] opacity-20"><Dog size={80} /></div>
});

type PetType = 'dog';

interface CareAction {
  id: number;
  user: 'The Grinch' | 'Cindy Lou';
  type: 'feed' | 'water' | 'pet';
  timestamp: number;
}

interface PetState {
  hunger: number;
  happiness: number;
  thirst: number;
  level: number;
  xp: number;
  lastInteraction: number;
  isFull: boolean;
  isHappy: boolean;
  isHydrated: boolean;
  streak: number;
  lastVisitDay: string; // YYYY-MM-DD
  careLog: CareAction[];
}

const PET_CONFIGS: Record<PetType, { icon: any; color: string; bgColor: string; name: string; species: string; hexColor: string }> = {
  dog: { icon: Dog, color: 'text-amber-600', hexColor: '#d97706', bgColor: 'bg-amber-50', name: 'Арчи', species: 'Звездный пес' },
};

const ARCHI_THOUGHTS = {
  hungry: ["Животик урчит... Гринч, покорми меня!", "Синди Лу, я бы не отказался от вкусняшки 🍖", "Кто-нибудь видел мою миску? Она пуста!"],
  thirsty: ["Хочу пить... Где моя водичка?", "В горле пересохло, принесите воды! 💧"],
  sad: ["Мне скучно... Погладь меня!", "Арчи хочет внимания! ❤️", "Гав? (Мне одиноко)"],
  happy: ["Я самый счастливый пес в мире!", "Вы лучшие хозяева! ✨", "Ррр-гав! Пойдем играть?", "Сегодня отличный день для приключений!"],
};

const ARCHI_HISTORY = `Арчи — не просто пес, он Звездный Хранитель вашего уюта. Рожденный в свете кометы "Сердце Ориона", он приземлился в мире Talia, чтобы оберегать связь Гринча и Синди Лу. 

Многие спрашивают, почему Арчи иногда выглядит как загадочная "черная субстанция", парящая в пространстве. Дело в том, что в мире Talia энергия любви настолько плотная, что Арчи принимает свою истинную астральную форму — форму текучей звездной материи. Эта темная энергия — не пустота, а концентрат всех ваших общих воспоминаний, которые еще не обрели физическую форму. 

Только когда он чувствует абсолютную гармонию между Гринчем и Синди Лу, он проявляет свой золотистый свет. С каждым новым уровнем (Lvl) Арчи обретает новые силы, а его хвост — это компас, который всегда указывает путь друг к другу.`;

const ARCHI_DETAILS = [
  { label: 'Возраст', value: '2 косм. года', icon: <Clock className="text-blue-500" size={16} />, desc: 'Бесконечность по земным меркам' },
  { label: 'Порода', value: 'Эфирный Голден', icon: <Dog className="text-amber-500" size={16} />, desc: 'Редчайший звездный подвид' },
  { label: 'Особенность', value: 'Черное сияние', icon: <Sparkles className="text-purple-500" size={16} />, desc: 'Астральная форма энергии' },
  { label: 'Статус', value: 'Хранитель', icon: <ShieldCheck className="text-green-500" size={16} />, desc: 'Оберегает связь пары' },
];

const LEVEL_MILESTONES = [
  { level: 1, title: "Звездный щенок", desc: "Только прибыл из космоса" },
  { level: 5, title: "Ловец снов", desc: "Приносит добрые сны по ночам" },
  { level: 10, title: "Хранитель облаков", desc: "Может менять погоду в Talia" },
  { level: 30, title: "Мастер прогулок", desc: "Открывает скрытые локации сайта" },
  { level: 50, title: "Астральный проводник", desc: "Связывает мысли Гринча и Синди Лу" },
  { level: 75, title: "Вечный спутник", desc: "Арчи больше никогда не грустит" },
  { level: 100, title: "Божество Уюта", desc: "Ваша любовь становится легендой миров" },
];

export const PetHub = () => {
  const [petType] = useState<PetType>('dog');
  const [activeTab, setActiveTab] = useState<'status' | 'history' | 'log' | 'progress'>('status');
  const [state, setState] = useState<PetState>({
    hunger: 80,
    happiness: 90,
    thirst: 75,
    level: 1,
    xp: 0,
    lastInteraction: Date.now(),
    isFull: false,
    isHappy: false,
    isHydrated: false,
    streak: 0,
    lastVisitDay: '',
    careLog: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<'The Grinch' | 'Cindy Lou'>('The Grinch');

  // Read current user from localStorage (same as DataProvider)
  useEffect(() => {
    const auth = localStorage.getItem('lumina_auth');
    if (auth) {
      setCurrentUser(auth === 'grinch' ? 'The Grinch' : 'Cindy Lou');
    }
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('lock-scroll');
    } else {
      document.body.classList.remove('lock-scroll');
    }
    return () => document.body.classList.remove('lock-scroll');
  }, [isModalOpen]);

  const [showHeart, setShowHeart] = useState(false);
  const [currentThought, setCurrentThought] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchArchiState();
  }, []);

  const fetchArchiState = async () => {
    const { data, error } = await supabase
      .from('global_state')
      .select('value')
      .eq('key', 'archi_state')
      .single();

    if (data) {
      const parsed = data.value as PetState;
      const now = Date.now();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const secondsPassed = Math.floor((now - parsed.lastInteraction) / 1000);

      // Calculate offline decay
      const hungerDecay = secondsPassed * 0.0023;
      const thirstDecay = secondsPassed * 0.0034;
      const happinessDecay = secondsPassed * 0.0011;

      let newStreak = parsed.streak || 0;
      if (parsed.lastVisitDay !== today && parsed.lastVisitDay !== yesterday) {
        newStreak = 0;
      }

      setState({ 
        ...parsed, 
        hunger: Math.max(0, parsed.hunger - hungerDecay),
        thirst: Math.max(0, parsed.thirst - thirstDecay),
        happiness: Math.max(0, parsed.happiness - happinessDecay),
        streak: newStreak,
        lastInteraction: now,
      });
    } else {
      // Initialize with default state if not found
      const defaultState: PetState = {
        hunger: 80,
        happiness: 90,
        thirst: 75,
        level: 1,
        xp: 0,
        lastInteraction: Date.now(),
        isFull: false,
        isHappy: false,
        isHydrated: false,
        streak: 0,
        lastVisitDay: new Date().toISOString().split('T')[0],
        careLog: []
      };
      setState(defaultState);
      saveArchiState(defaultState);
    }
  };

  const saveArchiState = async (newState: PetState) => {
    setIsSyncing(true);
    const { error } = await supabase
      .from('global_state')
      .upsert({
        key: 'archi_state',
        value: newState
      });
    
    if (error) console.error('Error syncing Archi state:', error);
    setIsSyncing(false);
  };

  // Sync state to Supabase on changes (Debounced manually in the interaction handlers or here)
  useEffect(() => {
    if (state.lastVisitDay !== '') { // Avoid initial empty sync
      const timer = setTimeout(() => {
        saveArchiState(state);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);


  // Update thoughts - less frequent
  useEffect(() => {
    const updateThought = () => {
      // 25% chance to show a thought, otherwise empty
      if (Math.random() > 0.25) {
        setCurrentThought("");
        return;
      }

      let category: keyof typeof ARCHI_THOUGHTS = 'happy';
      if (state.hunger < 40) category = 'hungry';
      else if (state.thirst < 40) category = 'thirsty';
      else if (state.happiness < 40) category = 'sad';
      
      const thoughts = ARCHI_THOUGHTS[category];
      setCurrentThought(thoughts[Math.floor(Math.random() * thoughts.length)]);
      
      // Hide thought after 6 seconds
      setTimeout(() => setCurrentThought(""), 6000);
    };

    updateThought();
    const timer = setInterval(updateThought, 90000); // Check every 1.5 minutes
    return () => clearInterval(timer);
  }, [state.hunger, state.thirst, state.happiness]);
  useEffect(() => {
    const checkNeglect = () => {
      const isNeglected = state.hunger === 0 || state.thirst === 0 || state.happiness === 0;
      if (isNeglected && state.streak > 0) {
        setState(prev => ({ ...prev, streak: 0 }));
        setCurrentThought("Я так ослаб... Кажется, огонек нашей связи гаснет 😢");
        setTimeout(() => setCurrentThought(""), 8000);
      }
    };
    
    const timer = setInterval(checkNeglect, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [state.hunger, state.thirst, state.happiness, state.streak]);

  // Passive decay based on time intervals
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        // Calculations based on 10-second intervals
        // Hunger: 100% in 12h (43200s) -> 100 / (43200 / 10) = 0.023 per 10s
        // Thirst: 100% in 8h (28800s) -> 100 / (28800 / 10) = 0.034 per 10s
        // Happiness: 100% in 24h (86400s) -> 100 / (86400 / 10) = 0.011 per 10s
        
        const newHunger = Math.max(0, prev.hunger - 0.023);
        const newThirst = Math.max(0, prev.thirst - 0.034);
        const newHappiness = Math.max(0, prev.happiness - 0.011);
        
        // Streak loss logic: if any stat is 0 for too long, streak could reset
        // For simplicity, we check if they are very low
        
        return {
          ...prev,
          hunger: newHunger,
          thirst: newThirst,
          happiness: newHappiness,
          isFull: newHunger >= 95,
          isHappy: newHappiness >= 95,
          isHydrated: newThirst >= 95
        };
      });
    }, 10000); // Check every 10 seconds
    return () => clearInterval(timer);
  }, []);

  const interact = (type: 'feed' | 'water' | 'pet') => {
    setState(prev => {
      let newState = { ...prev };
      
      // Streak logic on interaction
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (prev.lastVisitDay === yesterday) {
        newState.streak = prev.streak + 1;
      } else if (prev.lastVisitDay !== today) {
        newState.streak = 1;
      }
      newState.lastVisitDay = today;

      if (type === 'feed' && !prev.isFull) {
        newState.hunger = Math.min(100, prev.hunger + 20);
        if (newState.hunger >= 95) newState.isFull = true;
      }
      if (type === 'water' && !prev.isHydrated) {
        newState.thirst = Math.min(100, prev.thirst + 25);
        if (newState.thirst >= 95) newState.isHydrated = true;
      }
      if (type === 'pet' && !prev.isHappy) {
        newState.happiness = Math.min(100, prev.happiness + 15);
        if (newState.happiness >= 95) newState.isHappy = true;
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);
      }
      
      // Update care log
      const newAction: CareAction = {
        id: Date.now(),
        user: currentUser,
        type,
        timestamp: Date.now()
      };
      newState.careLog = [newAction, ...prev.careLog].slice(0, 10);
      
      newState.xp += 10;
      if (newState.xp >= 100) {
        newState.level += 1;
        newState.xp = 0;
      }
      
      return newState;
    });
  };

  const avgMood = (state.hunger + state.thirst + state.happiness) / 3;

  const currentPet = PET_CONFIGS[petType];
  const PetIcon = currentPet.icon;

  const getStatusColor = (value: number) => {
    if (value > 70) return 'bg-green-400';
    if (value > 30) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getMoodEmoji = () => {
    const avg = (state.hunger + state.thirst + state.happiness) / 3;
    if (avg > 80) return '✨ Счастлив';
    if (avg > 50) return '🙂 В порядке';
    if (avg > 20) return '🥱 Устал';
    return '😭 Грустит';
  };

  return (
    <>
      {/* Mini Card for Home Screen */}
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer h-full"
      >
        <Card className="relative overflow-hidden p-0 bg-[#fdfaf3] border-4 border-[#e6d5bc] shadow-2xl group h-full flex flex-col justify-center min-h-[180px] rounded-[2rem]">
          {/* Pin */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-md border border-red-700/20" />
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>

          <div className="p-4 md:p-6 flex items-center gap-4 md:gap-6">
            <div className="relative shrink-0">
              <div className={cn("w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-2 transition-transform group-hover:rotate-6 bg-[#f5e6d3] border-4 border-[#e6d5bc]")}>
                <PetIcon className="text-[#5c4a33]" size={48} />
              </div>
              {state.streak > 0 && (
                <div className="absolute -top-3 -right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg animate-bounce border-2 border-white">
                  <Flame size={12} fill="currentColor" />
                  {state.streak}
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2 md:space-y-3">
              <div className="space-y-1">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#5c4a33] tracking-tight">{currentPet.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 bg-[#5c4a33] text-[#fdfaf3] rounded-full uppercase tracking-widest shadow-sm">
                    Lvl {state.level}
                  </span>
                  <p className="text-[9px] md:text-[10px] text-[#8b7355] font-black uppercase tracking-tighter">{getMoodEmoji()}</p>
                </div>
              </div>
              
              <div className="flex gap-1.5 md:gap-2 w-full">
                <div className="flex-1 h-2 md:h-2.5 bg-[#e6d5bc] rounded-full overflow-hidden border border-[#d4c3ab]">
                  <motion.div 
                    animate={{ width: `${state.hunger}%` }}
                    className="h-full bg-orange-400" 
                  />
                </div>
                <div className="flex-1 h-2 md:h-2.5 bg-[#e6d5bc] rounded-full overflow-hidden border border-[#d4c3ab]">
                  <motion.div 
                    animate={{ width: `${state.happiness}%` }}
                    className="h-full bg-pink-400" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Texture Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] rounded-3xl" />
        </Card>
      </motion.div>

      {/* Detailed Interaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-5xl h-[85vh] md:h-[700px] bg-[#fdfaf3] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border-8 border-[#e6d5bc] z-10 overscroll-contain"
              >
              {/* Left Side: Archi 3D & Status (Visual focus) */}
              <div className="w-full md:w-2/5 bg-[#f5e6d3] relative flex flex-col items-center justify-center p-4 md:p-8 border-b md:border-b-0 md:border-r-4 border-[#e6d5bc] shrink-0">
                {/* Pin in the corner */}
                <div className="absolute top-6 left-6 z-20">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-md border border-red-700/20" />
                </div>

                {/* Archi Thought Bubble (Styled like Palia) */}
                <AnimatePresence>
                  {currentThought && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-12 left-1/2 -translate-x-1/2 z-30 w-[80%]"
                    >
                      <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-[#e6d5bc] relative">
                        <p className="text-sm font-medium text-zinc-700 italic text-center">
                          "{currentThought}"
                        </p>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-[#e6d5bc]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative w-full aspect-square md:aspect-auto md:flex-1 bg-[#f5e6d3]/30 rounded-[3rem] overflow-hidden border-4 border-[#e6d5bc]/50 shadow-inner group">
                <ArchiScene color={currentPet.hexColor} mood={avgMood} />
                
                {/* Floating status badges */}
                  <AnimatePresence>
                    {showHeart && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0, y: 0 }}
                        animate={{ opacity: 1, scale: 1.5, y: -100 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 text-red-400 z-20"
                      >
                        <Heart fill="currentColor" size={60} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-4 md:mt-6 text-center">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5c4a33]">{currentPet.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-1 md:mt-2">
                    <span className="px-3 py-1 bg-[#5c4a33] text-[#fdfaf3] rounded-full text-[10px] font-bold uppercase tracking-widest">
                      Lvl {state.level}
                    </span>
                    <span className="text-[#8b7355] font-bold text-xs">{getMoodEmoji()}</span>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="w-full mt-4 md:mt-8 px-4 space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#8b7355]">
                    <span>Опыт</span>
                    <span>{state.xp}%</span>
                  </div>
                  <div className="h-3 bg-[#e6d5bc] rounded-full overflow-hidden border-2 border-[#d4c3ab]">
                    <motion.div 
                      animate={{ width: `${state.xp}%` }}
                      className="h-full bg-[#8b7355]" 
                    />
                  </div>
                </div>
              </div>

              {/* Right Side: Tabs & Content */}
              <div className="flex-1 flex flex-col bg-[#fdfaf3] relative min-h-0">
                {/* Close Button */}
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-[#f5e6d3] text-[#5c4a33] transition-colors z-40"
                >
                  <X size={24} />
                </button>

                {/* Tabs Navigation */}
                <div className="flex p-4 md:p-6 gap-2 border-b-2 border-[#e6d5bc] overflow-x-auto no-scrollbar touch-pan-x">
                  <TabButton 
                    active={activeTab === 'status'} 
                    onClick={() => setActiveTab('status')} 
                    icon={<Settings2 size={18} />} 
                    label="Уход" 
                  />
                  <TabButton 
                    active={activeTab === 'progress'} 
                    onClick={() => setActiveTab('progress')} 
                    icon={<Star size={18} />} 
                    label="Прогресс" 
                  />
                  <TabButton 
                    active={activeTab === 'history'} 
                    onClick={() => setActiveTab('history')} 
                    icon={<Book size={18} />} 
                    label="История" 
                  />
                  <TabButton 
                    active={activeTab === 'log'} 
                    onClick={() => setActiveTab('log')} 
                    icon={<Clock size={18} />} 
                    label="Журнал" 
                  />
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar overscroll-contain touch-pan-y">
                  <AnimatePresence mode="wait">
                    {activeTab === 'status' && (
                      <motion.div
                        key="status"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <StatBox label="Сытость" value={state.hunger} icon={<Utensils size={20} />} color="bg-orange-400" />
                          <StatBox label="Жажда" value={state.thirst} icon={<Droplets size={20} />} color="bg-blue-400" />
                          <StatBox label="Радость" value={state.happiness} icon={<Heart size={20} />} color="bg-pink-400" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                          <BigActionButton 
                            icon={<Utensils size={24} />} 
                            label="Покормить" 
                            desc="Дать косточку"
                            onClick={() => interact('feed')}
                            disabled={state.isFull}
                            hoverClass="hover:border-orange-400 hover:text-orange-600"
                            iconHoverClass="group-hover:bg-orange-50 group-hover:text-orange-600"
                          />
                          <BigActionButton 
                            icon={<Droplets size={24} />} 
                            label="Напоить" 
                            desc="Свежая вода"
                            onClick={() => interact('water')}
                            disabled={state.isHydrated}
                            hoverClass="hover:border-blue-400 hover:text-blue-600"
                            iconHoverClass="group-hover:bg-blue-50 group-hover:text-blue-600"
                          />
                          <BigActionButton 
                            icon={<Heart size={24} />} 
                            label="Погладить" 
                            desc="Дать любовь"
                            onClick={() => interact('pet')}
                            disabled={state.isHappy}
                            hoverClass="hover:border-pink-400 hover:text-pink-600"
                            iconHoverClass="group-hover:bg-pink-50 group-hover:text-pink-600"
                          />
                        </div>

                        {/* Locked Actions for Future Updates */}
                        <div className="pt-8 border-t-2 border-[#e6d5bc] space-y-4">
                          <h4 className="text-[#8b7355] font-black uppercase text-[10px] tracking-widest px-2 flex items-center gap-2">
                            <Star size={12} /> Скоро в Talia
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f5e6d3]/50 border-2 border-dashed border-[#e6d5bc] opacity-60">
                              <div className="w-10 h-10 rounded-xl bg-[#e6d5bc] flex items-center justify-center text-[#8b7355]">
                                <Book size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-[#5c4a33] text-sm">Обучение командам</p>
                                <p className="text-[10px] text-[#8b7355]">Доступно в версии 2.0</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f5e6d3]/50 border-2 border-dashed border-[#e6d5bc] opacity-60">
                              <div className="w-10 h-10 rounded-xl bg-[#e6d5bc] flex items-center justify-center text-[#8b7355]">
                                <Sparkles size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-[#5c4a33] text-sm">Смена облика</p>
                                <p className="text-[10px] text-[#8b7355]">Требуется 50 уровень</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'history' && (
                      <motion.div
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="bg-[#f5e6d3] p-8 rounded-3xl border-2 border-[#e6d5bc] shadow-inner relative overflow-hidden">
                          <h3 className="text-2xl font-serif font-bold text-[#5c4a33] mb-4 flex items-center gap-2">
                            <Info size={24} /> Легенда об Арчи
                          </h3>
                          <p className="text-[#5c4a33] leading-relaxed italic text-lg whitespace-pre-line relative z-10">
                            {ARCHI_HISTORY}
                          </p>
                          <Dog size={120} className="absolute -right-8 -bottom-8 text-[#5c4a33]/5 -rotate-12" />
                        </div>

                        {/* Archi Identity Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {ARCHI_DETAILS.map((detail, idx) => (
                            <motion.div
                              key={detail.label}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-white p-5 rounded-2xl border-2 border-[#e6d5bc] shadow-sm flex items-center gap-4 group hover:border-[#8b7355] transition-colors"
                            >
                              <div className="w-12 h-12 rounded-xl bg-[#f5e6d3] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                {detail.icon}
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#8b7355] mb-0.5">{detail.label}</p>
                                <p className="text-lg font-serif font-bold text-[#5c4a33] leading-none mb-1">{detail.value}</p>
                                <p className="text-[10px] text-[#8b7355]/60 font-medium">{detail.desc}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'progress' && (
                      <motion.div
                        key="progress"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Streak Card */}
                        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                              <Flame size={32} fill="currentColor" className="animate-pulse" />
                              <h3 className="text-3xl font-black uppercase tracking-tighter">Серия заботы</h3>
                            </div>
                            <p className="text-4xl font-black mb-2">{state.streak} {state.streak === 1 ? 'день' : 'дня'}</p>
                            <p className="text-white/80 font-medium">
                              {state.streak > 0 
                                ? "Вы отлично справляетесь! Не пропускайте дни, чтобы Арчи был счастлив." 
                                : "Начните серию сегодня, покормив или погладив Арчи!"}
                            </p>
                          </div>
                          <Flame size={120} className="absolute -right-4 -bottom-4 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        </div>

                        {/* Milestones */}
                        <div className="space-y-4">
                          <h4 className="text-[#5c4a33] font-black uppercase text-xs tracking-widest px-2">Этапы развития</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {LEVEL_MILESTONES.map((m) => (
                              <div 
                                key={m.level} 
                                className={cn(
                                  "p-4 rounded-2xl border-2 flex items-center gap-4 transition-all",
                                  state.level >= m.level 
                                    ? "bg-white border-[#84cc16] shadow-md" 
                                    : "bg-zinc-50 border-[#e6d5bc] opacity-60"
                                )}
                              >
                                <div className={cn(
                                  "w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner",
                                  state.level >= m.level ? "bg-[#84cc16] text-white" : "bg-[#e6d5bc] text-[#8b7355]"
                                )}>
                                  {state.level >= m.level ? "✓" : m.level}
                                </div>
                                <div>
                                  <p className="font-bold text-[#5c4a33]">{m.title}</p>
                                  <p className="text-xs text-[#8b7355]">{m.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'log' && (
                      <motion.div
                        key="log"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {state.careLog.length > 0 ? state.careLog.map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-[#e6d5bc] shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-md",
                                log.user === 'The Grinch' ? 'bg-[#84cc16]' : 'bg-[#ec4899]'
                              )}>
                                {log.user[0]}
                              </div>
                              <div>
                                <p className="font-bold text-[#5c4a33]">
                                  {log.user}
                                </p>
                                <p className="text-xs text-[#8b7355] font-medium">
                                  {log.type === 'feed' ? 'Наполнил(а) миску' : log.type === 'water' ? 'Налил(а) водички' : 'Подарил(а) ласку'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#5c4a33]">
                                {new Date(log.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-[10px] text-[#8b7355] uppercase font-bold tracking-tighter">Сегодня</p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-12">
                            <Clock size={48} className="mx-auto text-[#e6d5bc] mb-4" />
                            <p className="text-[#8b7355] font-bold italic">Журнал заботы пока пуст...</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all",
      active 
        ? "bg-[#5c4a33] text-[#fdfaf3] shadow-md scale-105" 
        : "text-[#8b7355] hover:bg-[#f5e6d3]"
    )}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const StatBox = ({ label, value, icon, color }: { label: string, value: number, icon: any, color: string }) => (
  <div className="bg-white p-4 rounded-2xl border-2 border-[#e6d5bc] shadow-sm">
    <div className="flex items-center gap-2 text-[#8b7355] mb-2 font-black uppercase text-[10px] tracking-widest">
      {icon}
      <span>{label}</span>
    </div>
    <div className="h-4 bg-[#f5e6d3] rounded-full overflow-hidden border border-[#e6d5bc]">
      <motion.div 
        animate={{ width: `${value}%` }}
        className={cn("h-full", color)} 
      />
    </div>
    <div className="mt-1 text-right text-[10px] font-black text-[#8b7355]">{Math.round(value)}%</div>
  </div>
);

const BigActionButton = ({ icon, label, desc, onClick, disabled, hoverClass, iconHoverClass }: { icon: any, label: string, desc: string, onClick: () => void, disabled: boolean, hoverClass: string, iconHoverClass: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex flex-col items-center text-center p-6 rounded-3xl border-4 transition-all group",
      disabled 
        ? "bg-zinc-100 border-zinc-200 opacity-50 cursor-not-allowed" 
        : cn("bg-white border-[#e6d5bc] text-[#5c4a33] hover:shadow-xl hover:-translate-y-1 active:scale-95", hoverClass)
    )}
  >
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all",
      disabled ? "bg-zinc-200 text-zinc-400" : cn("bg-[#f5e6d3] text-[#5c4a33]", iconHoverClass)
    )}>
      {icon}
    </div>
    <span className="font-black uppercase tracking-widest text-xs mb-1">{label}</span>
    <span className="text-[10px] opacity-60 font-medium">{desc}</span>
  </button>
);

