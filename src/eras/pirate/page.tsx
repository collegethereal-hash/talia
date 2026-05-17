'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Anchor, Shield, Heart, Hammer, Package, Beer, Sparkles, X, UserMinus, Scroll, Telescope, Bomb, Flag, Flame,
  Bird, MessageCircle, RefreshCw
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useData } from "@/components/DataProvider";
import Link from 'next/link';

import { ParrotKoko } from "@/eras/pirate/components/ParrotKoko";

export default function PirateDashboard() {
  const { currentUser } = useData();
  const [activeTab, setActiveTab] = useState<'ship' | 'crew' | 'coco'>('ship');
  const [cocoMessage, setCocoMessage] = useState("Карр! Вижу, в ваших отношениях штиль. Пора поднять паруса страсти!");

  const cocoAdvices = [
    "Карр! Вижу, в ваших отношениях штиль. Пора поднять паруса страсти!",
    "Йо-хо-хо! Вчерашняя ссора — это просто шторм в стакане рома. Обнимитесь!",
    "Капитан, твоя половинка заслуживает больше золотых дублонов... и комплиментов!",
    "Секрет крепкого брака на Тортуге — делиться награбленным поровну!",
    "Если на горизонте тучи — приготовьте вместе ужин, это разгонит любой туман."
  ];

  const handleTalkToCoco = () => {
    const random = Math.floor(Math.random() * cocoAdvices.length);
    setCocoMessage(cocoAdvices[random]);
  };

  // Crew State
  const [crew, setCrew] = useState([
    { id: 1, name: "Билл 'Бочонок'", role: "Штурман", status: "Пьян 🥴", loyalty: 40 },
    { id: 2, name: "Джон 'Длинный'", role: "Кок", status: "Недоволен 😠", loyalty: 30 },
    { id: 3, name: "Джек 'Громила'", role: "Канонир", status: "Готов к бою ⚔️", loyalty: 80 },
  ]);

  return (
    <div className="relative min-h-screen bg-[#0d0705] text-amber-100 font-serif overflow-hidden selection:bg-amber-500/30">
      
      {/* Background: Stormy Sea / Dark Wood Vibe */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c100b]/90 via-[#0d0705] to-[#020a17]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-amber-900/30 pb-6">
           <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-500/40 uppercase text-[10px] font-black tracking-[0.4em]">
                 <Anchor size={14} />
                 <span>Капитанский Мостик</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700">
                 Тортуга: Бухта
              </h1>
           </div>
           <div className="flex items-center gap-4">
              <Link href="/admin" className="p-3 bg-amber-900/10 hover:bg-amber-900/20 rounded-xl border border-amber-900/30 text-amber-500 transition-all">
                 <Anchor size={20} />
              </Link>
           </div>
        </header>

        {/* Main Project Window */}
        <div className="bg-[#1a100a] rounded-[2.5rem] border-2 border-amber-900/40 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">
           
           {/* LEFT SIDE: Ship & Coco Display */}
           <div className="w-full md:w-[35%] bg-[#0d0705]/50 p-8 flex flex-col items-center justify-between gap-6 border-r border-amber-900/20 relative">
              
              {/* Corner Iron Brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-900/50" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-900/50" />

              {/* Speech Bubble */}
              <div className="relative bg-[#2d1b10] text-amber-100 text-xs italic p-4 rounded-2xl shadow-xl max-w-[220px] text-center border border-amber-900/30">
                 "{cocoMessage}"
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-t-[8px] border-t-[#2d1b10] border-x-[8px] border-x-transparent" />
              </div>

              {/* Center Display */}
              <div className="relative">
                 <div className="w-48 h-48 bg-[#1c100b] rounded-full border-4 border-amber-900/40 flex items-center justify-center shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1)_0%,transparent_70%)]" />
                    <Telescope size={64} className="text-amber-500/80 group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 {/* Coco Badge */}
                 <div className="absolute -top-2 -right-2 bg-[#2d1b10] p-2.5 rounded-xl border border-amber-900/40 shadow-lg">
                    <ParrotKoko />
                 </div>
              </div>

              {/* Info */}
              <div className="text-center space-y-1">
                 <h2 className="text-2xl font-bold uppercase tracking-tight text-amber-100">Чёрная Жемчужина</h2>
                 <p className="text-xs font-black uppercase tracking-widest text-amber-500/40">Ранг: Легендарный</p>
              </div>

              {/* Experience Bar */}
              <div className="w-full space-y-1">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-500/40">
                    <span>Известность</span>
                    <span>78%</span>
                 </div>
                 <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-amber-900/20">
                    <div className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full" style={{ width: '78%' }} />
                 </div>
              </div>
           </div>

           {/* RIGHT SIDE: Tabs & Logic */}
           <div className="w-full md:w-[65%] p-8 space-y-6 flex flex-col justify-between">
              
              {/* Tabs */}
              <div className="flex justify-between items-center border-b border-amber-900/20 pb-4">
                 <div className="flex bg-black/30 p-1 rounded-xl border border-amber-900/10">
                    <button 
                      onClick={() => setActiveTab('ship')}
                      className={cn("px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === 'ship' ? "bg-amber-600 text-black shadow-lg" : "text-amber-500/40 hover:text-amber-100")}
                    >
                       <Anchor size={14} /> Борт
                    </button>
                    <button 
                      onClick={() => setActiveTab('crew')}
                      className={cn("px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === 'crew' ? "bg-amber-600 text-black shadow-lg" : "text-amber-500/40 hover:text-amber-100")}
                    >
                       <UserMinus size={14} /> Экипаж
                    </button>
                    <button 
                      onClick={() => setActiveTab('coco')}
                      className={cn("px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === 'coco' ? "bg-amber-600 text-black shadow-lg" : "text-amber-500/40 hover:text-amber-100")}
                    >
                       <MessageCircle size={14} /> Сеанс у Коко
                    </button>
                 </div>
                 <span className="text-amber-500/20 text-xs font-mono">ID: 404_SHIP</span>
              </div>

              {/* Content Panels */}
              <AnimatePresence mode="wait">
                 {activeTab === 'ship' && (
                    <motion.div
                      key="ship"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                       {/* Status Bars */}
                       <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-black/40 rounded-xl border border-amber-900/20 space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/40 flex items-center gap-1">
                                <Shield size={12} /> Прочность
                             </p>
                             <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                                <div className="h-full bg-orange-600 rounded-full" style={{ width: '92%' }} />
                             </div>
                             <p className="text-right text-[10px] font-bold text-orange-400">92%</p>
                          </div>
                          <div className="p-4 bg-black/40 rounded-xl border border-amber-900/20 space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/40 flex items-center gap-1">
                                <Package size={12} /> Трюм
                             </p>
                             <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
                             </div>
                             <p className="text-right text-[10px] font-bold text-blue-400">85%</p>
                          </div>
                          <div className="p-4 bg-black/40 rounded-xl border border-amber-900/20 space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/40 flex items-center gap-1">
                                <Heart size={12} /> Боевой Дух
                             </p>
                             <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                                <div className="h-full bg-red-600 rounded-full" style={{ width: '94%' }} />
                             </div>
                             <p className="text-right text-[10px] font-bold text-red-400">94%</p>
                          </div>
                       </div>

                       {/* Action Buttons */}
                       <div className="grid grid-cols-3 gap-4">
                          <button className="p-5 bg-[#2d1b10] hover:bg-[#3d271a] rounded-xl border border-amber-900/30 flex flex-col items-center gap-3 transition-all group">
                             <Hammer size={20} className="text-amber-500" />
                             <span className="font-bold text-sm text-amber-100">Починить</span>
                          </button>
                          <button className="p-5 bg-[#2d1b10] hover:bg-[#3d271a] rounded-xl border border-amber-900/30 flex flex-col items-center gap-3 transition-all group">
                             <Package size={20} className="text-amber-500" />
                             <span className="font-bold text-sm text-amber-100">Загрузить</span>
                          </button>
                          <button className="p-5 bg-[#2d1b10] hover:bg-[#3d271a] rounded-xl border border-amber-900/30 flex flex-col items-center gap-3 transition-all group">
                             <Beer size={20} className="text-amber-500" />
                             <span className="text-[10px] font-black uppercase text-stone-700">Выдать ром</span>
                          </button>
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'crew' && (
                    <motion.div
                      key="crew"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                       <h3 className="text-sm font-bold uppercase text-amber-500/40 tracking-widest">Офицерский Состав</h3>
                       <div className="space-y-3">
                          {crew.map(member => (
                             <div key={member.id} className="p-4 bg-black/40 rounded-xl border border-amber-900/20 flex items-center justify-between hover:border-amber-500/20 transition-colors">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-[#2d1b10] rounded-lg flex items-center justify-center text-xl border border-amber-900/10">{member.avatar}</div>
                                   <div>
                                      <p className="font-bold text-sm text-amber-100">{member.name}</p>
                                      <p className="text-[10px] uppercase tracking-widest text-amber-500/40">{member.role}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <span className="text-xs font-bold text-amber-100">{member.status}</span>
                                   <div className="text-[10px] text-amber-500/40 mt-0.5">Лояльность: {member.loyalty}%</div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'coco' && (
                    <motion.div
                      key="coco"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center text-center space-y-6 py-6"
                    >
                       <div className="w-20 h-20 bg-[#2d1b10] rounded-full flex items-center justify-center border-2 border-amber-900/40 shadow-2xl relative">
                          <Bird size={40} className="text-amber-500" />
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#1a100a] flex items-center justify-center text-[10px] text-white font-bold">✓</div>
                       </div>
                       
                       <div className="space-y-2 max-w-md">
                          <h3 className="text-lg font-bold text-amber-100">Психологическая помощь от Коко</h3>
                          <p className="text-sm text-amber-100/60 italic leading-relaxed">
                             "{cocoMessage}"
                          </p>
                       </div>

                       <button 
                         onClick={handleTalkToCoco}
                         className="px-6 py-3 bg-amber-600 text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-colors shadow-lg flex items-center gap-2"
                       >
                          <RefreshCw size={14} /> Спросить совета
                       </button>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
