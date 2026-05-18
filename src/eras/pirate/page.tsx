'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Anchor, Shield, Hammer, Package, Beer, 
  CloudLightning, Scroll, Wind, Coins, CheckCircle2,
  Sparkles, Send, MessageCircle, RefreshCw, Trash2,
  User, Volume2, ShieldAlert, Settings
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useData } from "@/components/DataProvider";
import BayScene from "@/eras/pirate/components/BayScene";
import { chatWithKoko } from '@/app/actions/koko';

export default function PirateDashboard() {
  const { currentUser } = useData();
  const [activeTab, setActiveTab] = useState<'ship' | 'koko'>('ship');
  const [notification, setNotification] = useState<string | null>(null);
  
  // Mounted check for Hydration-safe R3F Canvas
  const [isMounted, setIsMounted] = useState(false);

  // Ship stats
  const [hull, setHull] = useState(62);
  const [hold, setHold] = useState(85);
  const [morale, setMorale] = useState(94);

  // Economy
  const [gold, setGold] = useState(1500);

  // Coco Chatbot State
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'koko'; text: string }[]>([
    { role: 'koko', text: 'Каррр! Я Коко, твой личный пиратский психолог-терапевт. Какая буря настигла твоё сердце сегодня, Гринч? Расскажи мне, и мы проложим верный курс! 🦜🌊' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Sync data on mount and focused screen
  useEffect(() => {
    setIsMounted(true);
    
    const loadStats = () => {
      const savedGold = localStorage.getItem('pirate_gold');
      const savedHull = localStorage.getItem('pirate_hull');
      const savedHold = localStorage.getItem('pirate_hold');
      const savedMorale = localStorage.getItem('pirate_morale');
      
      if (savedGold) setGold(parseInt(savedGold, 10));
      if (savedHull) setHull(parseInt(savedHull, 10));
      if (savedHold) setHold(parseInt(savedHold, 10));
      if (savedMorale) setMorale(parseInt(savedMorale, 10));

      const savedChat = localStorage.getItem('pirate_koko_chat');
      if (savedChat) {
        setChat(JSON.parse(savedChat));
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

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  // Sync back to localstorage when state changes
  const saveGold = (val: number) => {
    setGold(val);
    localStorage.setItem('pirate_gold', val.toString());
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

  const saveChat = (newChat: typeof chat) => {
    setChat(newChat);
    localStorage.setItem('pirate_koko_chat', JSON.stringify(newChat));
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

  // Coco Chat actions
  const handleSend = async (customMsg?: string) => {
    const textToSend = customMsg || message;
    if (!textToSend.trim()) return;

    const userMsg = textToSend;
    if (!customMsg) setMessage('');

    const updatedChatWithUser = [...chat, { role: 'user' as const, text: userMsg }];
    saveChat(updatedChatWithUser);
    setIsTyping(true);

    try {
      const response = await chatWithKoko(userMsg);
      const updatedChatWithKoko = [...updatedChatWithUser, { role: 'koko' as const, text: response }];
      saveChat(updatedChatWithKoko);
    } catch (e) {
      const errorMsg = 'Каррр! Похоже, в океане бушует сильный шторм и мысли путаются. Давай попробуем еще раз через минуту! 🦜';
      saveChat([...updatedChatWithUser, { role: 'koko' as const, text: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    const defaultChat = [
      { role: 'koko' as const, text: 'Каррр! Бортовой журнал очищен. Я снова готов выслушать любые твои душевные шторма, капитан! 🦜🌊' }
    ];
    saveChat(defaultChat);
    showNotif('🗑️ Диалог с Коко очищен!');
  };

  // Romantic suggest prompts for Polina
  const suggestPrompts = [
    { text: 'Дай пиратский совет дня для нас 💖', icon: '✨' },
    { text: 'Как справиться со штормом в паре? 🌪️', icon: '⚓' },
    { text: 'Коко, расскажи притчу о верности 🦜', icon: '📜' },
    { text: 'Где спрятано наше главное сокровище? 💎', icon: '🔑' }
  ];

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12">
        
        {/* HEADER BLOCK */}
        <header className="flex flex-row justify-between items-center gap-6 border-b-2 border-amber-500/20 pb-8">
           <div className="text-left space-y-2">
              <div className="flex items-center justify-start gap-2.5 text-amber-500/70 uppercase text-[11px] font-black tracking-[0.4em]">
                 <Anchor size={14} className="text-amber-500" />
                 <span>Капитанский Мостик · ТОРТУГА</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-amber-700 drop-shadow-[0_2px_15px_rgba(245,158,11,0.35)]">
                 Бухта Тортуга
              </h1>
           </div>

           {/* Beautiful Theme Changer / Admin Panel Switcher */}
           <div className="shrink-0 z-20">
             <Link href="/admin">
               <motion.button
                 whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(245, 158, 11, 0.45)" }}
                 whileTap={{ scale: 0.95 }}
                 className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 bg-gradient-to-r from-amber-950/40 to-amber-900/20 hover:from-amber-500 hover:to-amber-600 border border-amber-500/30 hover:border-amber-300 hover:text-slate-950 rounded-2xl transition-all duration-300 shadow-lg cursor-pointer font-sans font-black"
               >
                 <Settings size={15} className="animate-spin-slow text-amber-500 hover:text-slate-950" />
                 <span className="text-[10px] uppercase tracking-widest hidden sm:inline text-amber-500 hover:text-slate-950">Сменить тему (Talia)</span>
                 <span className="text-[9px] uppercase tracking-widest sm:hidden text-amber-500 hover:text-slate-950">Talia</span>
               </motion.button>
             </Link>
           </div>
        </header>

        {/* 3D INTERACTIVE SAFE PIRATE BAY SCENARIO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* Left Column: Huge 3D Interactive Haven Diorama + Category Selector under it */}
           <div className="lg:col-span-8 flex flex-col gap-6 w-full">
              <div className="h-[380px] md:h-[430px] rounded-[3rem] border-4 border-amber-500/30 overflow-hidden relative shadow-[0_0_60px_rgba(245,158,11,0.35)] bg-black">
                 {isMounted ? (
                   <BayScene />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-black gap-4">
                     <Anchor size={36} className="animate-spin text-amber-500" />
                     <span className="text-xs uppercase font-black text-amber-500/60 tracking-widest animate-pulse">Заряжаем пушки, строим бухту...</span>
                   </div>
                 )}
              </div>

              {/* TABS SELECTOR (Centered perfectly under the 3D diorama model) */}
              <div className="flex items-center justify-center bg-black/95 p-2 rounded-[2rem] border border-amber-500/20 backdrop-blur-sm shadow-2xl relative z-20 w-full max-w-xl mx-auto">
                 <div className="flex items-center justify-between w-full gap-2">
                   {[
                     { id: 'ship', label: 'Борт фрегата', icon: <Anchor size={16} /> },
                     { id: 'koko', label: 'ИИ-Терапевт Коко', icon: <MessageCircle size={16} /> },
                   ].map(tab => (
                     <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id as any)}
                       className={cn(
                         "flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all cursor-pointer",
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
           </div>

           {/* Right Column: Immersive safe harbor status sheet */}
           <div className="lg:col-span-4 rounded-[3rem] p-8 bg-gradient-to-br from-[#0c0c0c] to-[#000000] border-2 border-amber-500/20 relative shadow-2xl overflow-hidden flex flex-col justify-between h-full min-h-[505px]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

              <div className="space-y-6 text-left relative z-10">
                 <div className="border-b border-amber-500/20 pb-4">
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.25em] block">Ведомости бухты</span>
                    <h2 className="text-2xl font-black text-amber-100 uppercase tracking-tight mt-1">Мирная Гавань Тортуга</h2>
                 </div>

                 <p className="text-sm text-amber-100/90 leading-relaxed font-sans font-bold">
                    Капитан! Пришвартовывайся к тихой пристани. Это самое **безопасное и теплое место** во всем архипелаге. Здесь шторма бессильны, пушки молчат, а команда может спокойно отдохнуть в таверне, пока ты общаешься с ИИ-попугаем Коко и занимаешься корабельными приборами.
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

                      <div className="flex flex-col sm:flex-row gap-8 items-center justify-center w-full lg:w-auto z-10">
                         
                         {/* Dial 1: Hull */}
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-36 h-36 rounded-full border-4 border-amber-500/20 bg-black flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] group hover:border-orange-500/40 transition-colors duration-500">
                               <div className="absolute inset-0 rounded-full bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                               
                               <Shield size={24} className="text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                               <span className="text-3xl font-black text-amber-100 mt-1">{hull}%</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-orange-400/80 mt-0.5">Корпус</span>
                               
                               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                                 <circle cx="50" cy="50" r="44" className="stroke-orange-500/10 fill-none" strokeWidth="4" />
                                 <circle cx="50" cy="50" r="44" className="stroke-orange-500 fill-none transition-all duration-700" strokeWidth="4" strokeDasharray="276.4" strokeDashoffset={276.4 - (276.4 * hull) / 100} strokeLinecap="round" />
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
                               
                               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                                 <circle cx="50" cy="50" r="44" className="stroke-sky-500/10 fill-none" strokeWidth="4" />
                                 <circle cx="50" cy="50" r="44" className="stroke-sky-400 fill-none transition-all duration-700" strokeWidth="4" strokeDasharray="276.4" strokeDashoffset={276.4 - (276.4 * hold) / 100} strokeLinecap="round" />
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
                               
                               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                                 <circle cx="50" cy="50" r="44" className="stroke-red-500/10 fill-none" strokeWidth="4" />
                                 <circle cx="50" cy="50" r="44" className="stroke-red-500 fill-none transition-all duration-700" strokeWidth="4" strokeDasharray="276.4" strokeDashoffset={276.4 - (276.4 * morale) / 100} strokeLinecap="round" />
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

                   {/* Gossip & Weather */}
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

             {/* TAB 2: COCO ONLINE AI THERAPIST (ИИ-ТЕРАПЕВТ КОКО) — Immersive interactive chat station */}
             {activeTab === 'koko' && (
                <motion.div
                  key="koko"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
                >
                   {/* Left Side Column: Coco Psych Profile Card */}
                   <div className="lg:col-span-4 rounded-[3rem] p-8 bg-gradient-to-br from-[#080503] to-[#120803] border-4 border-amber-500/30 flex flex-col justify-between items-center text-center overflow-hidden relative shadow-2xl min-h-[480px]">
                      
                      {/* Paper texture overlay */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.03] pointer-events-none" />
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

                      <div className="space-y-6 w-full relative z-10">
                         {/* Live Badge */}
                         <div className="flex items-center justify-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full w-fit mx-auto shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">КОКО В СЕТИ</span>
                         </div>

                         {/* Coco Avatar Container */}
                         <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 rounded-[2.5rem] bg-amber-500/10 border-2 border-amber-500/20 blur-md animate-pulse" />
                            <div className="w-28 h-28 rounded-[2.2rem] bg-[#0c0704] border-2 border-amber-500/40 shadow-inner flex items-center justify-center text-7xl select-none animate-bounce-slow transform hover:rotate-6 transition-all duration-300">
                               🦜
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-2 rounded-xl border border-amber-300 shadow-md">
                               <Sparkles size={16} className="animate-spin-slow" />
                            </div>
                         </div>

                         {/* Description texts */}
                         <div className="space-y-2">
                            <h3 className="text-2xl font-black text-amber-100 uppercase tracking-tight leading-none">Психолог Коко</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">Личный ии-терапевт Тортуги</p>
                         </div>

                         <p className="text-xs text-amber-200/70 font-sans font-bold leading-relaxed px-2">
                            «Йо-хо-хо! Не давай сердечным штормам порвать паруса твоей любви. Выговорись старому попугаю, и я укажу надежный курс сквозь любые туманы!»
                         </p>
                      </div>

                      {/* Interactive Clear Chat Button */}
                      <button 
                        onClick={handleClearChat}
                        className="w-full mt-8 py-3.5 bg-gradient-to-r from-red-950/20 to-red-900/10 hover:from-red-600 hover:to-red-700 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-red-500/20 hover:border-red-400 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg relative z-10"
                      >
                         <Trash2 size={12} /> Очистить Бортжурнал
                      </button>
                   </div>

                   {/* Right Side Column: Gorgeous Scrollable Consult Terminal */}
                   <div className="lg:col-span-8 rounded-[3rem] p-6 bg-[#040404] border-2 border-amber-500/15 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[480px]">
                      
                      {/* Header bar inside consult panel */}
                      <div className="flex items-center justify-between border-b border-amber-500/10 pb-4 mb-4 shrink-0">
                         <div className="flex items-center gap-2.5">
                            <MessageCircle size={16} className="text-amber-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-100/50">Сеанс онлайн-терапии в реальном времени</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-400 tracking-wider">Шифрование надежно</span>
                         </div>
                      </div>

                      {/* Message History Workspace */}
                      <div className="flex-1 overflow-y-auto space-y-4 px-2 py-4 max-h-[340px] scrollbar-thin scrollbar-thumb-amber-500/10">
                         {chat.map((msg, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                 "flex gap-3 max-w-[85%] items-start text-left",
                                 msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                              )}
                            >
                               {/* Avatar */}
                               <div className={cn(
                                  "w-8 h-8 rounded-lg border flex items-center justify-center text-sm shrink-0 shadow-md",
                                  msg.role === 'user' 
                                    ? "bg-amber-500 border-amber-400 text-slate-900" 
                                    : "bg-amber-950/40 border-amber-500/20 text-amber-100"
                               )}>
                                  {msg.role === 'user' ? <User size={14} /> : '🦜'}
                               </div>

                               {/* Bubble */}
                               <div className={cn(
                                  "p-4 rounded-2xl font-bold leading-relaxed text-sm font-sans relative shadow-inner",
                                  msg.role === 'user' 
                                    ? "bg-amber-500 text-slate-950 rounded-tr-none" 
                                    : "bg-[#0b0b0b] text-amber-100 rounded-tl-none border border-amber-500/10"
                               )}>
                                  {msg.text}
                               </div>
                            </motion.div>
                         ))}

                         {isTyping && (
                            <div className="flex gap-3 items-center mr-auto text-left">
                               <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-sm shrink-0">
                                  🦜
                               </div>
                               <div className="bg-[#0b0b0b] border border-amber-500/10 p-4 rounded-2xl rounded-tl-none w-16 flex gap-1 justify-center shadow-inner">
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                               </div>
                            </div>
                         )}
                         <div ref={chatEndRef} />
                      </div>

                      {/* Footer: Quick suggesting prompts & Input console */}
                      <div className="mt-4 pt-4 border-t border-amber-500/10 space-y-4 shrink-0">
                         
                         {/* Prompt suggestions grid */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {suggestPrompts.map((prompt, i) => (
                               <button
                                 key={i}
                                 onClick={() => handleSend(prompt.text)}
                                 disabled={isTyping}
                                 className="px-3 py-2 bg-[#080808] hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/30 rounded-xl text-[10px] font-sans font-black text-amber-400 text-left transition-all cursor-pointer truncate flex items-center gap-1.5 active:scale-95"
                               >
                                  <span>{prompt.icon}</span> <span className="truncate">{prompt.text}</span>
                               </button>
                            ))}
                         </div>

                         {/* Console Input Bar */}
                         <div className="relative">
                            <input
                              type="text"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                              placeholder="Задай Коко вопрос об отношениях..."
                              disabled={isTyping}
                              className="w-full bg-[#070707] border border-amber-500/20 focus:border-amber-500/40 rounded-2xl px-5 py-4 text-amber-100 placeholder:text-amber-500/30 focus:outline-none transition-all pr-14 text-sm font-sans font-medium"
                            />
                            <button
                              onClick={() => handleSend()}
                              disabled={isTyping}
                              className="absolute right-2 top-2 bottom-2 w-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                            >
                               <Send size={16} />
                            </button>
                         </div>
                      </div>

                   </div>
                </motion.div>
             )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
