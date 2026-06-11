'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Anchor, Sword, Scroll, Skull, Bomb, Shield, Crown, Feather, Coins, MapPin, Clock, Target, Eye, Gem, X, Check, Map, Compass, Navigation, Info, Trash2, ArrowLeft,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PirateBucketList() {
  const [activeTab, setActiveTab] = useState<'code'>('code');
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [signed, setSigned] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'reset' | 'view' | 'delete' | 'seal', id?: number } | null>(null);
  const [viewingArchiveId, setViewingArchiveId] = useState<number | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [contractTitle, setContractTitle] = useState("Закон Тортуги");
  const [dice, setDice] = useState({ d1: 1, d2: 1, rolling: false });
  
  const DEFAULT_LAWS = [
    { id: 1, title: "Закон Честности", desc: "Мы всегда говорим правду друг другу, даже если она кажется сложной. В нашей каюте нет места тайнам, которые могут омрачить наше плавание." },
    { id: 2, title: "Кодекс Поддержки", desc: "Если один из нас устал или расстроен, второй становится его тихой гаванью. Мы не критикуем, а помогаем найти путь к свету." },
    { id: 3, title: "Право на Пространство", desc: "Мы уважаем время и личные границы друг друга. Личное время — это не отдаление, а способ набраться сил для новых общих приключений." },
    { id: 4, title: "Обет Общих Мечтаний", desc: "Мы делимся своими желаниями и вместе строим карту нашего будущего. Каждая маленькая цель — это шаг к нашему общему сокровищу." },
  ];

  const [laws, setLaws] = useState(DEFAULT_LAWS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [archive, setArchive] = useState<any[]>([]);
  const archiveRef = useRef<HTMLDivElement>(null);

  const scrollToArchive = () => {
    archiveRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const PIRATE_QUOTES = [
    "«Даже в самый сильный шторм, твои объятия — мой самый надежный якорь»",
    "«Любовь — это единственное сокровище, которое не нужно прятать в сундук»",
    "«Наш курс проложен по звездам нежности и меридианам заботы»",
    "«В океане жизни мы — два капитана одного непотопляемого корабля»",
    "«Честь пирата — в его слове, а счастье — в улыбке его помощника»",
    "«Лучшая добыча за день — это время, проведенное вместе в тихой гавани»",
  ];

  const [randomQuote, setRandomQuote] = useState("");

  useEffect(() => {
    setRandomQuote(PIRATE_QUOTES[Math.floor(Math.random() * PIRATE_QUOTES.length)]);
    const savedArchive = localStorage.getItem('pirate_laws_archive');
    if (savedArchive) setArchive(JSON.parse(savedArchive));
    const savedTitle = localStorage.getItem('pirate_contract_title');
    if (savedTitle) setContractTitle(savedTitle);
  }, []);

  useEffect(() => {
    // Auto-resize all textareas when laws or archive changes
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [laws, viewingArchiveId]);

  const saveToArchive = () => {
    if (!signed) return;
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ru-RU'),
      title: contractTitle,
      laws: [...laws]
    };
    const updatedArchive = [newEntry, ...archive];
    setArchive(updatedArchive);
    localStorage.setItem('pirate_laws_archive', JSON.stringify(updatedArchive));
    setSigned(false);
    setLaws(DEFAULT_LAWS);
    setContractTitle("Закон Тортуги");
    setConfirmAction(null);
  };

  const deleteFromArchive = (id: number) => {
    const updatedArchive = archive.filter(entry => entry.id !== id);
    setArchive(updatedArchive);
    localStorage.setItem('pirate_laws_archive', JSON.stringify(updatedArchive));
    if (viewingArchiveId === id) {
      setViewingArchiveId(null);
      setLaws(DEFAULT_LAWS);
      setContractTitle("Закон Тортуги");
    }
    setConfirmAction(null);
  };

  const viewArchive = (id: number) => {
    const entry = archive.find(e => e.id === id);
    if (entry) {
      setLaws(entry.laws);
      setContractTitle(entry.title || "Закон Тортуги");
      setViewingArchiveId(id);
    }
    setConfirmAction(null);
  };

  const resetToTemplate = () => {
    setLaws(DEFAULT_LAWS);
    const savedTitle = localStorage.getItem('pirate_contract_title') || "Закон Тортуги";
    setContractTitle(savedTitle);
    setViewingArchiveId(null);
    setConfirmAction(null);
  };

  const updateLaw = (id: number, field: 'title' | 'desc', value: string) => {
    if (viewingArchiveId) return; // Cannot edit archived laws
    setLaws(laws.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const sendCallNotification = () => {
    if (isCalling) return;
    setIsCalling(true);
    
    const savedRole = localStorage.getItem('pirate_user_role');
    const userName = savedRole === 'Polina' ? 'Полина' : 'Карим';
    const partnerName = savedRole === 'Polina' ? 'Карима' : 'Полину';

    const chatData = localStorage.getItem('pirate_live_chat') || '[]';
    const messages = JSON.parse(chatData);
    
    messages.push({
      id: `sys-call-${Date.now()}`,
      sender: 'system',
      text: `📢 ${userName} вызывает ${partnerName} в Кодекс чести!`,
      timestamp: new Date(),
      isSystem: true
    });
    
    localStorage.setItem('pirate_live_chat', JSON.stringify(messages));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('storage_sync'));

    setTimeout(() => setIsCalling(false), 5000);
  };

  return (
    <div className="relative min-h-screen bg-[#f4ebd0] text-stone-900 font-serif overflow-hidden">
      {/* Background Decor - Old Map style */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyrus.png')] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-amber-900/10" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-700/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-700/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 pb-60 space-y-12">
        {/* HEADER BLOCK */}
        <header className="flex flex-row justify-between items-center gap-6 border-b-4 border-amber-900/10 pb-12">
           <div className="text-left space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-white/40 px-4 py-2 shadow-sm backdrop-blur-sm">
                <Scroll size={14} className="text-amber-700/60" />
                <span className="text-[9px] font-black uppercase tracking-[0.32em] text-amber-900/45">Кодекс чести капитанов</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-amber-900 drop-shadow-sm">
                 Кодекс <span className="text-amber-600">Тортуги</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base italic text-amber-900/55 whitespace-nowrap overflow-hidden text-ellipsis">
                Свод незыблемых правил, скреплённых нашей верностью и честью.
              </p>
           </div>

           <div className="shrink-0 z-20">
             <motion.button
               whileHover={{ scale: 1.05, rotate: 2 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setShowInfo(true)}
               className="flex items-center gap-3 px-10 py-5 bg-amber-500 text-slate-900 border-b-4 border-amber-700 rounded-2xl transition-all duration-300 shadow-xl font-black uppercase tracking-widest text-xs"
             >
               <Info size={18} />
               <span>О Кодексе</span>
             </motion.button>
           </div>
        </header>

        {/* 3D INTERACTIVE AREA - Styled like BayScene container */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
           
           {/* Left Column: Huge Scroll Diorama */}
           <div 
             className="lg:col-span-8 flex flex-col gap-6 w-full group/archive"
           >
              <div className="h-[450px] rounded-[3rem] border-[12px] border-[#3e2723]/10 overflow-hidden relative shadow-[20px_20px_60px_rgba(0,0,0,0.1)] bg-[#f2e2ba]">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40" />
                 
                 <div className="w-full h-full flex flex-col items-center justify-center relative z-10 p-12 transition-transform duration-500">
                    <div className="relative w-64 h-64 mb-8">
                       <div className="absolute -inset-10 bg-amber-500/10 rounded-full blur-3xl transition-all" />
                       <div className="absolute inset-0 bg-white/40 rounded-[3rem] border-8 border-amber-600/30 flex items-center justify-center shadow-inner overflow-hidden transition-all">
                          <Scroll size={120} className="text-amber-700 transition-transform duration-500" />
                       </div>
                       <div className="absolute -bottom-4 -right-4 bg-amber-500 text-slate-900 p-4 rounded-2xl shadow-xl transform -rotate-12 border-4 border-amber-700">
                          <Feather size={32} />
                       </div>
                    </div>
                    
                    <div className="text-center space-y-4">
                       <h2 className="text-4xl font-black uppercase tracking-tight text-amber-950">Архив Обязательств</h2>
                       <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-4 px-8 py-3 bg-white/60 rounded-full border-2 border-amber-500/20 shadow-sm transition-all">
                             <span className="text-[14px] font-black uppercase text-amber-900 tracking-widest">
                                Скреплено обетов: <span className="text-amber-600 text-xl ml-1">{archive.length}</span>
                             </span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Decorative Corner Screws */}
                 <div className="absolute top-4 left-4 w-4 h-4 bg-amber-900/10 rounded-full shadow-inner" />
                 <div className="absolute top-4 right-4 w-4 h-4 bg-amber-900/10 rounded-full shadow-inner" />
                 <div className="absolute bottom-4 left-4 w-4 h-4 bg-amber-900/10 rounded-full shadow-inner" />
                 <div className="absolute bottom-4 right-4 w-4 h-4 bg-amber-900/10 rounded-full shadow-inner" />
              </div>
           </div>

           {/* Right Column: Lore / Info Container */}
           <div className="lg:col-span-4 rounded-[3rem] p-10 bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 relative shadow-[20px_20px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col justify-between group/lore">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
              
              <div className="space-y-8 text-left relative z-10">
                 <div className="border-b-2 border-amber-900/10 pb-6">
                    <span className="text-[10px] font-black uppercase text-amber-900/40 tracking-[0.25em] block">Пиратский Вестник</span>
                    <h2 className="text-3xl font-black text-amber-950 uppercase tracking-tight mt-1">Кодекс Чести</h2>
                 </div>

                 <div className="min-h-[120px] flex flex-col justify-center">
                    <p className="text-lg text-amber-900/70 leading-relaxed italic font-serif">
                       {randomQuote}
                    </p>
                 </div>

                 <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={sendCallNotification}
                    disabled={isCalling}
                    className={cn(
                      "w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl border-b-8 transition-all flex items-center justify-center gap-2 mb-10",
                      isCalling 
                        ? "bg-emerald-500 text-white border-emerald-700 opacity-80" 
                        : "bg-amber-500 text-slate-900 border-amber-700"
                    )}
                 >
                    {isCalling ? (
                      <>
                        <Check size={16} />
                        Сигнал отправлен!
                      </>
                    ) : (
                      <>
                        <Bell size={16} className="animate-bounce" />
                        Позвать Капитана
                      </>
                    )}
                 </motion.button>
                 
                 <div className="text-center w-full mb-4">
                    <p className="text-[11px] text-amber-900/30 uppercase tracking-[0.3em] font-black italic">
                       «Честь дороже золота!»
                    </p>
                 </div>
              </div>

              <div className="pt-8 border-t-2 border-amber-900/10 text-center relative z-10 w-full opacity-50">
                 {/* This line is now pushed to the very bottom */}
              </div>
           </div>
        </section>

        {/* DYNAMIC CONTENT AREA - Filters & Main Content */}
        <div className="space-y-12">
           <AnimatePresence mode="wait">
              <motion.div
                 key="code"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                 {/* Left: The Laws - Paper Style */}
                 <div className="lg:col-span-8 space-y-0">
                    <div className="p-10 md:p-16 bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 rounded-[3rem] shadow-[20px_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden group -mt-16">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40" />
                       
                       {viewingArchiveId && (
                          <motion.button 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setConfirmAction({ type: 'reset' })}
                            className="absolute top-0 right-0 z-50 px-5 py-2.5 bg-amber-500 text-amber-950 rounded-bl-2xl font-black uppercase text-[9px] tracking-wider shadow-xl border-l-[6px] border-b-[6px] border-[#3e2723]/10 hover:bg-amber-400 active:scale-95 flex items-center gap-2 transition-all"
                          >
                            <ArrowLeft size={12} />
                            Вернуться к текущему
                          </motion.button>
                        )}

                       <div className="relative z-10 space-y-12">
                          <div className="text-center border-b-4 border-amber-900/10 pb-8 relative">
                             <input 
                                value={contractTitle}
                                onChange={(e) => {
                                   if (!viewingArchiveId) {
                                      setContractTitle(e.target.value);
                                      localStorage.setItem('pirate_contract_title', e.target.value);
                                   }
                                }}
                                disabled={!!viewingArchiveId}
                                className={cn(
                                   "w-full bg-transparent text-center font-black uppercase tracking-tighter text-amber-950 text-5xl focus:outline-none transition-all placeholder:text-amber-900/20",
                                   !viewingArchiveId && "hover:bg-white/20 rounded-xl"
                                )}
                             />
                             <p className="text-xs font-black text-red-800 uppercase tracking-[0.3em] mt-2">
                                {viewingArchiveId ? `Архив от ${archive.find(a => a.id === viewingArchiveId)?.date}` : "Свод нерушимых обязательств"}
                             </p>
                          </div>

                          <div className="space-y-10">
                             {laws.map((law, index) => (
                                <div key={law.id} className="flex gap-6 items-start border-b-2 border-amber-900/5 pb-8 last:border-0 group/law">
                                   <span className="font-black text-amber-900/40 text-4xl leading-none">{index + 1}.</span>
                                   <div className="space-y-2 flex-1">
                                      <div className="relative group/edit">
                                        <input 
                                          value={law.title} 
                                          onChange={(e) => updateLaw(law.id, 'title', e.target.value)}
                                          placeholder="Заголовок правила..."
                                          disabled={!!viewingArchiveId}
                                          className={cn(
                                            "w-full bg-transparent border-b-2 border-transparent font-black uppercase tracking-tight text-amber-950 text-2xl focus:outline-none transition-all placeholder:text-amber-900/20 px-4 -mx-4 py-1",
                                            !viewingArchiveId && "hover:bg-white/30 hover:border-amber-500/30 focus:bg-white/20 focus:border-amber-500 rounded-xl"
                                          )}
                                        />
                                        <textarea 
                                          value={law.desc} 
                                          onChange={(e) => updateLaw(law.id, 'desc', e.target.value)}
                                          placeholder="Описание обязанности..."
                                          disabled={!!viewingArchiveId}
                                          rows={1}
                                          className={cn(
                                            "w-full bg-transparent border-b-2 border-transparent italic font-serif text-amber-900/70 text-lg leading-relaxed focus:outline-none resize-none transition-all placeholder:text-amber-900/20 overflow-hidden px-4 -mx-4 py-2 mt-1",
                                            !viewingArchiveId && "hover:bg-white/30 hover:border-amber-500/30 focus:bg-white/20 focus:border-amber-500 rounded-xl"
                                          )}
                                        />
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>

                          <div className="flex justify-between items-center pt-10 border-t-4 border-amber-900/10">
                             <div className="space-y-1">
                                <p className="font-serif italic text-sm text-amber-900/50">Скреплено клятвой здоровьем девочек</p>
                                <p className="font-black text-amber-950 uppercase tracking-widest text-lg">Кошечкой и ее котиком</p>
                             </div>
                             
                             {!viewingArchiveId ? (
                               <motion.div 
                                  onClick={() => signed && setConfirmAction({ type: 'seal' })}
                                  whileHover={signed ? { scale: 1.05 } : {}}
                                  whileTap={signed ? { scale: 0.95 } : {}}
                                  className={cn(
                                     "px-10 py-5 rounded-[2rem] border-[6px] font-black text-[11px] uppercase transition-all cursor-pointer shadow-xl flex items-center gap-3 relative overflow-hidden",
                                     signed 
                                        ? "bg-amber-500 border-[#3e2723]/20 text-slate-900 hover:bg-amber-400" 
                                        : "bg-stone-200 border-stone-300 text-stone-400 opacity-50 cursor-not-allowed"
                                  )}
                               >
                                  {signed && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />}
                                  <Scroll size={18} className="relative z-10" />
                                  <span className="relative z-10">{signed ? "Запечатать Обет" : "Ожидает Подписи"}</span>
                               </motion.div>
                             ) : (
                               <div className="px-10 py-5 rounded-[2rem] border-[6px] border-[#3e2723]/10 bg-amber-500 text-amber-950 font-black text-[11px] uppercase shadow-inner flex items-center gap-3 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
                                  <Check size={18} className="relative z-10" />
                                  <span className="relative z-10">Обет Запечатан</span>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>


                 </div>

                 {/* Right: Interactive elements - Styled like site cards */}
                 <div className="lg:col-span-4 flex flex-col gap-8 h-fit">
                    {/* Sign Button Card */}
                    <div className="p-10 rounded-[3rem] bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 shadow-[20px_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col items-center text-center">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                       
                       <div className="relative z-10 space-y-8 w-full">
                          <div className="w-24 h-24 bg-white/40 border-4 border-amber-900/10 rounded-3xl flex items-center justify-center text-amber-700 mx-auto shadow-inner">
                             <Feather size={48} />
                          </div>
                          <div className="space-y-3">
                             <h3 className="text-3xl font-black uppercase tracking-tight text-amber-950 leading-none">Подписать</h3>
                             <p className="text-sm text-amber-900/60 leading-relaxed font-serif italic">Подтверди верность законам Тортуги</p>
                          </div>
                          <button
                             onClick={() => setSigned(true)}
                             className={cn(
                                "w-full py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all border-[8px] shadow-xl flex items-center justify-center gap-3 relative overflow-hidden",
                                (signed || viewingArchiveId) 
                                   ? "bg-amber-500 border-[#3e2723]/10 text-amber-950 cursor-default shadow-inner" 
                                   : "bg-amber-500 border-[#3e2723]/10 text-slate-900 hover:bg-amber-400 active:scale-[0.98]"
                             )}
                          >
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
                             {(signed || viewingArchiveId) ? (
                                <>
                                   <Check size={18} className="relative z-10" />
                                   <span className="relative z-10">{viewingArchiveId ? "Обет Запечатан" : "Договор Скреплен"}</span>
                                </>
                             ) : (
                                <>
                                   <Feather size={18} className="relative z-10" />
                                   <span className="relative z-10">Поставить Подпись</span>
                                </>
                             )}
                          </button>
                          
                          {!viewingArchiveId && (
                            <button 
                              onClick={() => setConfirmAction({ type: 'reset' })}
                              className="text-[9px] font-black uppercase text-amber-900/40 hover:text-red-800 transition-colors"
                            >
                              Сбросить до шаблона
                            </button>
                          )}
                       </div>
                    </div>

                    {/* Pirate Dice Box */}
                    <div className="p-10 rounded-[3rem] bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 shadow-[20px_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[520px]">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                       
                       <div className="relative z-10 space-y-8 w-full flex flex-col items-center justify-center">
                          <div className="w-24 h-24 bg-white/40 border-4 border-amber-900/10 rounded-3xl flex items-center justify-center text-amber-700 mx-auto shadow-inner shrink-0">
                             <Skull size={48} />
                          </div>
                          <div className="space-y-4 shrink-0">
                             <h3 className="text-4xl font-black uppercase tracking-tight text-amber-950 leading-none">Кости Судьбы</h3>
                             <p className="text-base text-amber-900/60 leading-relaxed font-serif italic px-4">Для решения жарких споров</p>
                          </div>
                          
                          <div className="flex justify-center gap-8 py-6 shrink-0">
                             <motion.div 
                                animate={dice.rolling ? { rotate: [0, 720, 0], scale: [1, 1.3, 1], y: [0, -30, 0] } : {}}
                                transition={{ duration: 0.8 }}
                                className="w-24 h-24 bg-white/60 text-amber-950 rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-inner border-4 border-amber-900/10"
                             >
                                {dice.d1}
                             </motion.div>
                             <motion.div 
                                animate={dice.rolling ? { rotate: [0, -720, 0], scale: [1, 1.3, 1], y: [0, -30, 0] } : {}}
                                transition={{ duration: 0.8 }}
                                className="w-24 h-24 bg-white/60 text-amber-950 rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-inner border-4 border-amber-900/10"
                             >
                                {dice.d2}
                             </motion.div>
                          </div>

                          <button
                             onClick={() => {
                                setDice({ ...dice, rolling: true });
                                setTimeout(() => {
                                  setDice({
                                    d1: Math.floor(Math.random() * 6) + 1,
                                    d2: Math.floor(Math.random() * 6) + 1,
                                    rolling: false
                                  });
                                }, 1000);
                             }}
                             disabled={dice.rolling}
                             className="w-full py-8 bg-amber-500 text-slate-950 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-amber-400 transition-all border-b-8 border-amber-700 active:border-b-0 active:translate-y-2 shadow-xl disabled:opacity-50 mt-4 shrink-0"
                          >
                             {dice.rolling ? "Кости в воздухе..." : "Бросить Кости"}
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </AnimatePresence>

           {/* ARCHIVE SECTION - Moved outside for full-width centering */}
            {archive.length > 0 && (
              <div ref={archiveRef} className="pt-20 space-y-12 w-full max-w-7xl mx-auto px-4 md:px-8">
               <div className="flex items-center gap-10">
                  <div className="h-px flex-1 bg-amber-900/10" />
                  <h3 className="text-4xl font-black uppercase tracking-[0.2em] text-amber-900/30 text-center">Архив Обязанностей</h3>
                  <div className="h-px flex-1 bg-amber-900/10" />
               </div>
               
               <div className="flex flex-wrap justify-center gap-10">
                  {archive.map((entry) => (
                    <motion.div 
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setConfirmAction({ type: 'view', id: entry.id })}
                      className={cn(
                        "w-full sm:w-[calc(50%-1.25rem)] lg:w-[calc(33.33%-1.5rem)] xl:w-[calc(25%-2rem)] min-w-[320px] max-w-[380px] p-8 bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 rounded-[3.5rem] shadow-xl relative overflow-hidden group transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-2",
                        viewingArchiveId === entry.id ? "border-amber-600 bg-amber-50 shadow-inner" : "hover:border-amber-600/40"
                      )}
                    >
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
                       
                       <div className="absolute -top-6 -right-6 p-8 opacity-[0.04] group-hover:opacity-[0.1] transition-opacity rotate-12">
                          <Scroll size={120} className="text-amber-900" />
                       </div>

                       <div className="relative z-10 space-y-6">
                           <div className="flex justify-between items-center border-b-4 border-amber-900/10 pb-5">
                              <div className="flex flex-col flex-1 mr-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-900/40 leading-none mb-2">Заголовок закона</span>
                                <span className="text-lg font-black text-amber-950 uppercase line-clamp-1 group-hover:text-amber-900 transition-colors tracking-tighter">{entry.title || "Без названия"}</span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmAction({ type: 'delete', id: entry.id });
                                }}
                                className="p-3 hover:bg-red-500/20 hover:text-red-700 text-amber-900/20 rounded-2xl transition-all"
                              >
                                <Trash2 size={20} />
                              </button>
                           </div>

                           <div className="space-y-3 min-h-[140px] py-2">
                              {entry.laws.slice(0, 4).map((l: any, idx: number) => (
                                <div key={l.id} className="flex gap-3 items-center">
                                   <div className="w-2.5 h-2.5 rounded-full bg-amber-600/40 shrink-0 group-hover:bg-amber-600 transition-colors shadow-sm" />
                                   <p className="text-[13px] font-bold text-amber-950/80 line-clamp-1 uppercase tracking-tight italic font-serif group-hover:text-amber-950">{l.title}</p>
                                </div>
                              ))}
                              {entry.laws.length > 4 && (
                                <p className="text-[10px] font-black text-amber-900/30 uppercase tracking-widest pl-5 mt-2">
                                  + еще {entry.laws.length - 4} закона
                                </p>
                              )}
                           </div>

                           <div className="pt-6 border-t-4 border-amber-900/10 flex justify-between items-center gap-2">
                              <div className="flex items-center gap-3 px-4 py-2 bg-white/40 rounded-xl border-2 border-amber-900/5 -ml-2 shrink-0">
                                <Clock size={14} className="text-amber-700" />
                                <span className="text-[11px] font-black text-amber-900/80 tracking-wider">{entry.date}</span>
                              </div>
                              <div className="bg-amber-500 text-amber-950 px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] shadow-lg group-hover:bg-amber-400 group-hover:scale-105 transition-all border-b-4 border-amber-700">
                                Открыть
                              </div>
                           </div>
                       </div>

                       {/* Decorative corner */}
                       <div className="absolute top-4 left-4 w-3 h-3 bg-amber-900/10 rounded-full shadow-inner" />
                    </motion.div>
                  ))}
               </div>
             </div>
           )}
        </div>

        {/* Info Modal */}
        <AnimatePresence>
          {showInfo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex items-center justify-center p-6 md:p-12"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#f2e2ba] border-[12px] border-[#3e2723]/20 rounded-[3rem] p-8 md:p-12 max-w-2xl w-full relative overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                
                <button 
                  onClick={() => setShowInfo(false)}
                  className="absolute top-6 right-6 p-3 text-amber-900/40 hover:text-red-700 transition-colors"
                >
                  <X size={32} />
                </button>

                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#3e2723] rounded-3xl flex items-center justify-center text-amber-500 shadow-xl border-4 border-amber-600/30">
                      <Shield size={40} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-900/40">О Кодексе</h4>
                      <h3 className="text-4xl font-black text-amber-950 uppercase tracking-tighter">Законы Моря</h3>
                    </div>
                  </div>

                  <div className="space-y-6 text-amber-950/80 font-serif text-lg leading-relaxed italic">
                    <p>Этот свиток — не просто бумага. Это клятва, связывающая сердца капитанов Тортуги. Здесь записаны правила, которые делают наше плавание мирным и радостным.</p>
                    <p>Соблюдай их, и твой трюм всегда будет полон дублонов, а в каюте будет царить уют!</p>
                  </div>

                  <button 
                    onClick={() => setShowInfo(false)}
                    className="w-full py-6 bg-amber-500 text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl border-b-8 border-amber-700 active:border-b-0 active:translate-y-2 transition-all"
                  >
                    Принято, Капитан!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {confirmAction && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[600] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#f2e2ba] border-[12px] border-[#3e2723]/20 rounded-[3rem] p-8 md:p-12 max-w-md w-full relative overflow-hidden shadow-2xl text-center"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                
                <div className="relative z-10 space-y-8">
                  <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-slate-900 mx-auto shadow-xl border-4 border-amber-600">
                    <Skull size={40} />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-amber-950 uppercase tracking-tighter leading-none">Вы уверены?</h3>
                    <p className="text-amber-900/70 font-serif italic text-lg leading-relaxed">
                      {confirmAction.type === 'reset' && "Это действие сбросит все изменения и вернет кодекс к исходному шаблону."}
                      {confirmAction.type === 'view' && "Вы хотите просмотреть эту архивную запись? Текущие несохраненные изменения будут потеряны."}
                      {confirmAction.type === 'delete' && "Это действие навсегда удалит запись из архива. Пути назад не будет!"}
                      {confirmAction.type === 'seal' && "Запечатывание кодекса отправит его в архив и создаст новый шаблон для следующего дня."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => {
                        if (confirmAction.type === 'reset') resetToTemplate();
                        if (confirmAction.type === 'view') viewArchive(confirmAction.id!);
                        if (confirmAction.type === 'delete') deleteFromArchive(confirmAction.id!);
                        if (confirmAction.type === 'seal') saveToArchive();
                      }}
                      className="w-full py-5 bg-amber-500 text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl border-b-8 border-amber-700 active:border-b-0 active:translate-y-2 transition-all"
                    >
                      Да, Капитан!
                    </button>
                    <button 
                      onClick={() => setConfirmAction(null)}
                      className="w-full py-5 bg-white/40 text-amber-900 rounded-2xl font-black uppercase tracking-widest hover:bg-white/60 transition-all"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
      `}</style>
    </div>
  );
}
