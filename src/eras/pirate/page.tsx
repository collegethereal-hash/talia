'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Anchor, Shield, Heart, Hammer, Package, Beer, UserMinus,
  Telescope, CloudLightning, Scroll, Wind, Coins, CheckCircle2,
  MapPin, Navigation
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useData } from "@/components/DataProvider";
import Link from 'next/link';
import { ParrotKoko } from "@/eras/pirate/components/ParrotKoko";

export default function PirateDashboard() {
  const { currentUser } = useData();
  const [activeTab, setActiveTab] = useState<'ship' | 'crew'>('ship');
  const [cocoOpen, setCocoOpen] = useState(false);

  const [hull, setHull] = useState(62);
  const [hold, setHold] = useState(85);
  const [morale, setMorale] = useState(94);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleRepair = () => {
    if (hull >= 100) return showNotif('Корпус уже в отличном состоянии!');
    setHull(v => Math.min(100, v + 10));
    showNotif('⚒ Корпус починен! +10% прочности');
  };

  const handleLoad = () => {
    if (hold >= 100) return showNotif('Трюм полон до краёв!');
    setHold(v => Math.min(100, v + 10));
    showNotif('📦 Трюм загружен! +10% запасов');
  };

  const handleRum = () => {
    if (morale >= 100) return showNotif('Экипаж и так доволен!');
    setMorale(v => Math.min(100, v + 15));
    showNotif('🍺 Ром выдан! Боевой дух +15%');
  };

  const [crew] = useState([
    { id: 1, name: "Билл 'Бочонок'", role: 'Штурман', status: 'Пьян', statusColor: 'text-red-400', loyalty: 40 },
    { id: 2, name: "Джон 'Длинный'", role: 'Кок', status: 'Недоволен', statusColor: 'text-yellow-400', loyalty: 30 },
    { id: 3, name: "Джек 'Громила'", role: 'Канонир', status: 'Готов к бою', statusColor: 'text-emerald-400', loyalty: 80 },
  ]);

  const statBar = (value: number, color: string) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-black text-amber-100 w-8 text-right">{value}%</span>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#060c14] text-amber-100 font-serif overflow-hidden selection:bg-amber-500/30">
      
      {/* Background — rich ocean atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#0c0905] to-[#060d18]" />
        <div className="absolute -top-24 -left-24 w-[550px] h-[550px] bg-amber-900/30 rounded-full blur-[130px]" />
        <div className="absolute -bottom-10 -right-10 w-[600px] h-[450px] bg-sky-950/50 rounded-full blur-[110px]" />
        <div className="absolute top-0 right-1/3 w-[350px] h-[350px] bg-red-950/25 rounded-full blur-[90px]" />
      </div>

      {/* Floating Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-amber-600 text-black px-6 py-3 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coco Modal — rendered at root level to avoid overflow-hidden clipping */}
      <ParrotKoko open={cocoOpen} onClose={() => setCocoOpen(false)} showTrigger={false} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-8">
        
        {/* Header */}
        <header className="flex items-center border-b border-amber-900/20 pb-6 gap-8">
           <div className="space-y-1 shrink-0">
              <div className="flex items-center gap-2 text-amber-500/40 uppercase text-[10px] font-black tracking-[0.4em]">
                 <Anchor size={14} />
                 <span>Капитанский Мостик</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700">
                 Тортуга: Бухта
              </h1>
           </div>

           {/* Coco Card — entire card is clickable */}
           <button
             onClick={() => setCocoOpen(true)}
             className="ml-16 flex items-center gap-4 bg-[#100b05]/80 border border-amber-900/30 hover:border-amber-500/40 rounded-3xl pl-4 pr-14 py-3 shadow-lg backdrop-blur-sm transition-all hover:bg-[#1a100a]/80 active:scale-95 cursor-pointer"
           >
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-[#1c100b] border border-amber-900/20 text-xl">
                 🦜
              </div>
              <div className="text-left">
                 <p className="text-xs font-black uppercase tracking-widest text-amber-400 leading-none">Коко</p>
                 <p className="text-[11px] text-amber-100/50 mt-0.5 leading-tight whitespace-nowrap">Твой помощник в делах амурных</p>
              </div>
           </button>

           <div className="ml-auto flex items-center gap-4">
              <Link href="/admin" className="p-3 bg-amber-900/10 hover:bg-amber-900/20 rounded-xl border border-amber-900/30 text-amber-500 transition-all">
                 <Anchor size={20} />
              </Link>
           </div>
        </header>

        {/* Main Window */}
        <div className="bg-[#0f0a06]/80 backdrop-blur-sm rounded-[2.5rem] border-2 border-amber-900/30 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">
           
           {/* LEFT: Ship */}
           <div className="w-full md:w-[35%] bg-[#080604]/60 p-7 flex flex-col gap-5 border-r border-amber-900/15 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-900/40" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-900/40" />

              {/* Ship Icon + Name */}
              <div className="flex flex-col items-center gap-3">
                 <div className="w-36 h-36 bg-[#1c100b] rounded-full border-4 border-amber-900/40 flex items-center justify-center shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)]" />
                    <Telescope size={52} className="text-amber-500/80 group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 <div className="text-center">
                    <h2 className="text-xl font-bold uppercase tracking-tight text-amber-100">Чёрная Жемчужина</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/40">Ранг: Легендарный</p>
                 </div>
              </div>

              {/* Mini stats 2x2 */}
              <div className="grid grid-cols-2 gap-2.5">
                 <div className="p-3 bg-black/30 rounded-xl border border-amber-900/15 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/40">Экипаж</p>
                    <p className="text-lg font-black text-amber-100 mt-0.5">24</p>
                 </div>
                 <div className="p-3 bg-black/30 rounded-xl border border-amber-900/15 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/40">Пушки</p>
                    <p className="text-lg font-black text-amber-100 mt-0.5">32</p>
                 </div>
                 <div className="p-3 bg-black/30 rounded-xl border border-amber-900/15 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/40">Скорость</p>
                    <p className="text-lg font-black text-amber-100 mt-0.5">12 уз</p>
                 </div>
                 <div className="p-3 bg-black/30 rounded-xl border border-amber-900/15 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/40">Добыча</p>
                    <p className="text-lg font-black text-amber-100 mt-0.5">4.2k</p>
                 </div>
              </div>

              {/* Известность */}
              <div className="space-y-1.5">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-500/40">
                    <span>Известность</span>
                    <span>78%</span>
                 </div>
                 <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-amber-900/20">
                    <div className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full" style={{ width: '78%' }} />
                 </div>
              </div>

              {/* Следующий порт */}
               <div className="mt-8 p-5 bg-black/30 rounded-xl border border-sky-900/25 flex items-center gap-4">
                 <div className="p-2.5 bg-sky-900/20 rounded-lg border border-sky-900/25 shrink-0">
                    <Navigation size={16} className="text-sky-400" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-sky-400/50 mb-0.5">Следующий порт</p>
                    <p className="text-sm font-bold text-amber-100">Порт-Роял</p>
                    <p className="text-[9px] text-amber-100/40 italic">340 миль · ~3 дня · Курс: NNW</p>
                 </div>
                 <div className="shrink-0 text-right">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Открыт</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                       <MapPin size={8} className="text-sky-400/50" />
                       <span className="text-[8px] text-sky-400/50">Jamaica</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* RIGHT: Tabs */}
           <div className="w-full md:w-[65%] p-8 space-y-4 flex flex-col">
              
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
                 </div>
                 <span className="text-amber-500/20 text-xs font-mono">ID: 404_SHIP</span>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                 {activeTab === 'ship' && (
                    <motion.div
                      key="ship"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                       {/* Status Bars */}
                       <div className="space-y-2.5">
                          <div className="p-3.5 bg-black/30 rounded-xl border border-amber-900/15 space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/50 flex items-center gap-1.5">
                                <Shield size={12} className="text-orange-400" /> Прочность корпуса
                             </p>
                             {statBar(hull, 'bg-orange-500')}
                          </div>
                          <div className="p-3.5 bg-black/30 rounded-xl border border-amber-900/15 space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/50 flex items-center gap-1.5">
                                <Package size={12} className="text-blue-400" /> Припасы в трюме
                             </p>
                             {statBar(hold, 'bg-blue-500')}
                          </div>
                          <div className="p-3.5 bg-black/30 rounded-xl border border-amber-900/15 space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/50 flex items-center gap-1.5">
                                <Heart size={12} className="text-red-400" /> Боевой дух экипажа
                             </p>
                             {statBar(morale, 'bg-red-500')}
                          </div>
                       </div>

                       {/* Action Buttons */}
                       <div className="grid grid-cols-3 gap-3">
                          <button onClick={handleRepair} className="p-4 bg-[#1c100b] hover:bg-[#2d1b10] active:scale-95 rounded-xl border border-amber-900/25 flex flex-col items-center gap-2 transition-all">
                             <Hammer size={18} className="text-orange-400" />
                             <span className="font-bold text-xs text-amber-100">Починить</span>
                          </button>
                          <button onClick={handleLoad} className="p-4 bg-[#1c100b] hover:bg-[#2d1b10] active:scale-95 rounded-xl border border-amber-900/25 flex flex-col items-center gap-2 transition-all">
                             <Package size={18} className="text-blue-400" />
                             <span className="font-bold text-xs text-amber-100">Загрузить</span>
                          </button>
                          <button onClick={handleRum} className="p-4 bg-[#1c100b] hover:bg-[#2d1b10] active:scale-95 rounded-xl border border-amber-900/25 flex flex-col items-center gap-2 transition-all">
                             <Beer size={18} className="text-amber-400" />
                             <span className="font-bold text-xs text-amber-100">Выдать ром</span>
                          </button>
                       </div>

                       {/* Two Info Cards */}
                       <div className="grid grid-cols-2 gap-3 mt-6">
                          <div className="p-4 bg-black/30 rounded-2xl border border-red-900/35 flex flex-col gap-2">
                             <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-400/70 flex items-center gap-1">
                                   <Wind size={10} /> Погода
                                </p>
                                <span className="text-[9px] font-black text-red-400 bg-red-900/20 px-2 py-0.5 rounded-full border border-red-900/30">ОПАСНО</span>
                             </div>
                             <CloudLightning size={24} className="text-red-400/80" />
                             <div>
                                <p className="text-sm font-bold text-amber-100">Сильный шторм</p>
                                <p className="text-[10px] text-amber-100/50 mt-0.5 leading-relaxed italic">Волны 8 баллов. Рекомендуем остаться в бухте до утра.</p>
                             </div>
                             <div className="flex items-center gap-1.5 mt-auto">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[9px] text-red-400 font-black uppercase tracking-wider">Шторм идёт</span>
                             </div>
                          </div>

                          <div className="p-4 bg-black/30 rounded-2xl border border-amber-900/25 flex flex-col gap-2">
                             <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/50 flex items-center gap-1">
                                   <Scroll size={10} /> Слухи
                                </p>
                                <span className="text-[9px] font-black text-amber-400 bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-900/30">НОВОЕ</span>
                             </div>
                             <Coins size={24} className="text-amber-400/80" />
                             <div>
                                <p className="text-sm font-bold text-amber-100">Испанский галеон</p>
                                <p className="text-[10px] text-amber-100/50 mt-0.5 leading-relaxed italic">В порту Тортуга замечен груженый золотом галеон. Капитан дремлет?</p>
                             </div>
                             <div className="flex items-center gap-1.5 mt-auto">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider">Таверна «Кракен»</span>
                             </div>
                          </div>
                       </div>


                    </motion.div>
                 )}

                 {activeTab === 'crew' && (
                    <motion.div
                      key="crew"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500/40">Офицерский Состав</h3>
                       {crew.map(member => (
                          <div key={member.id} className="p-4 bg-black/30 rounded-xl border border-amber-900/15 flex items-center justify-between hover:border-amber-500/20 transition-colors">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#1c100b] rounded-lg flex items-center justify-center border border-amber-900/20 text-amber-500">
                                   <UserMinus size={18} />
                                </div>
                                <div>
                                   <p className="font-bold text-sm text-amber-100">{member.name}</p>
                                   <p className="text-[10px] uppercase tracking-widest text-amber-500/40">{member.role}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <span className={cn("text-xs font-bold", member.statusColor)}>{member.status}</span>
                                <div className="flex items-center gap-1.5 mt-1 justify-end">
                                   <div className="w-16 h-1 bg-black/60 rounded-full overflow-hidden">
                                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${member.loyalty}%` }} />
                                   </div>
                                   <span className="text-[9px] text-amber-500/40">{member.loyalty}%</span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
