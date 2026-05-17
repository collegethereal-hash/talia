'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, Anchor, Waves, Ship, Compass, 
  Coins, Sword, Sparkles, Map, Wind, 
  Flag, Bird, Package, MessageCircle, 
  ChevronRight, Bomb, Search, Crosshair, Settings, Scroll,
  Telescope, Zap, Flame, Star, Heart, X
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useData } from "@/components/DataProvider";
import Link from 'next/link';

import { PirateAuth } from "@/eras/pirate/components/PirateAuth";
import { PirateTimer } from "@/eras/pirate/components/PirateTimer";
import { ParrotKoko } from "@/eras/pirate/components/ParrotKoko";

export default function PirateDashboard() {
  const { currentUser } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pirateMode, setPirateMode] = useState<'harbor' | 'sail' | 'ghost'>('harbor');
  const [showDossier, setShowDossier] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('lumina_auth');
    if (auth) setIsAuthenticated(true);
  }, []);

  if (!isAuthenticated) {
    return <PirateAuth onComplete={(user) => {
      localStorage.setItem('lumina_auth', user);
      setIsAuthenticated(true);
    }} />;
  }

  const modes = {
    harbor: { label: 'Тихая Гавань', color: 'text-emerald-400', glow: 'bg-emerald-500/10' },
    sail: { label: 'Полный Вперед', color: 'text-amber-400', glow: 'bg-amber-500/10' },
    ghost: { label: 'Летучий Голландец', color: 'text-purple-400', glow: 'bg-purple-500/10' },
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-amber-100 font-serif overflow-x-hidden selection:bg-amber-500/30">
      {/* Background Layer: Subtle Texture & Deep Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#0f172a_0%,#020617_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-amber-500/10 pb-12">
          <div className="space-y-4">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3 text-amber-500/60 uppercase text-[10px] font-black tracking-[0.5em]"
             >
               <Anchor size={14} />
               <span>Флагман Lumina</span>
             </motion.div>
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600"
             >
               Tortuga Bay
             </motion.h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Mode Switcher */}
             <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                {(['harbor', 'sail', 'ghost'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPirateMode(m)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      pirateMode === m 
                        ? "bg-amber-500 text-slate-950 shadow-lg" 
                        : "text-amber-500/40 hover:text-amber-500"
                    )}
                  >
                    {modes[m].label}
                  </button>
                ))}
             </div>
             
             <Link href="/admin" className="p-4 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500 transition-all group">
                <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500" />
             </Link>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Captains & Timer (Primary Info) */}
          <div className="lg:col-span-7 space-y-8">
             
             {/* Captain's Card */}
             <div 
               onClick={() => setShowDossier(true)}
               className={cn(
               "relative p-8 md:p-12 rounded-[3.5rem] border-2 backdrop-blur-3xl overflow-hidden shadow-2xl transition-all duration-700 cursor-pointer group",
               pirateMode === 'harbor' && "bg-slate-900/40 border-amber-500/10 hover:border-amber-500/30",
               pirateMode === 'sail' && "bg-amber-900/10 border-amber-500/30 hover:border-amber-500/50",
               pirateMode === 'ghost' && "bg-purple-900/10 border-purple-500/20 hover:border-purple-500/40"
             )}>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Skull size={200} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                   <div className="relative">
                      <div className="w-40 h-40 rounded-[2.5rem] bg-amber-500/10 border-4 border-amber-500/20 flex items-center justify-center text-7xl shadow-2xl group-hover:scale-105 transition-transform">
                         {currentUser === 'Grinch' ? '🏴‍☠️' : '🧜‍♀️'}
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500 rounded-full border-4 border-[#020617] animate-pulse" />
                   </div>
                   
                   <div className="text-center md:text-left space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/40 mb-1">Действующий Капитан</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-amber-100">{currentUser === 'Grinch' ? 'Капитан Гринч' : 'Синди Лу'}</h2>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                         <Badge icon={<Waves size={12} />} label="На плаву" color="text-blue-400" />
                         <Badge icon={<Flame size={12} />} label="Боевой дух" color="text-red-400" />
                         <Badge icon={<Star size={12} />} label={modes[pirateMode].label} color={modes[pirateMode].color} />
                      </div>
                   </div>
                </div>
                
                <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-40 transition-opacity text-[8px] font-black uppercase tracking-[0.3em] text-amber-500">
                  Нажми для просмотра досье
                </div>
             </div>

             {/* Timer Card */}
             <PirateTimer />
          </div>

          {/* Right: Navigation & Action Cards */}
          <div className="lg:col-span-5 space-y-8">
             
             {/* Navigation Section */}
             <div className="grid grid-cols-1 gap-4">
                <NavCard 
                  title="Галлерея" 
                  desc="Ваши зафиксированные открытия" 
                  icon={<Telescope size={24} />} 
                  href="/gallery" 
                />
                <NavCard 
                  title="Казна" 
                  desc="Черный рынок и верфь" 
                  icon={<Coins size={24} />} 
                  href="/store" 
                />
                <NavCard 
                  title="Журнал" 
                  desc="Бортовые записи и мысли" 
                  icon={<Scroll size={24} />} 
                  href="/journal" 
                />
                <NavCard 
                  title="Сокровища" 
                  desc="Список общих целей и мечт" 
                  icon={<Map size={24} />} 
                  href="/bucket-list" 
                />
                <NavCard 
                  title="Логово" 
                  desc="Военная комната и бои" 
                  icon={<Bomb size={24} />} 
                  href="/lair" 
                />
             </div>

             {/* Special Interactive Card */}
             <div className="relative group p-8 rounded-[3rem] bg-gradient-to-br from-amber-600/20 to-transparent border-2 border-amber-500/20 overflow-hidden cursor-pointer hover:border-amber-500/40 transition-all shadow-xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
                <div className="relative z-10 flex items-center justify-between">
                   <div className="space-y-2">
                      <h4 className="text-xl font-bold uppercase tracking-widest text-amber-400">Попугай Коко</h4>
                      <p className="text-xs text-amber-100/60 leading-relaxed max-w-[200px]">Твой личный ИИ-психолог и советник в делах амурных.</p>
                   </div>
                   <ParrotKoko />
                </div>
             </div>

             {/* Mini Stats Grid */}
             <div className="grid grid-cols-2 gap-4">
                <MiniStat label="Дублоны" value="4.2k" icon={<Coins size={16} />} />
                <MiniStat label="Ветер" value="98%" icon={<Wind size={16} />} />
             </div>
          </div>
        </div>

        {/* Wanted Poster / Identity Card (Fixed Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
           
           {/* Wanted Poster */}
           <div className="relative p-8 bg-[#f5e6d3] text-slate-900 rounded-2xl shadow-xl border-[12px] border-[#3e2723]/10 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              <div className="relative z-10 space-y-6 text-center">
                 <h4 className="text-4xl font-black uppercase tracking-tighter border-b-4 border-slate-900/10 pb-4">Разыскивается</h4>
                 <div className="w-full aspect-square bg-slate-200 rounded-xl overflow-hidden grayscale contrast-125 border-4 border-slate-900/5">
                    <img src={currentUser === 'Grinch' ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Grinch" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Cindy"} alt="Wanted" className="w-full h-full object-cover" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-2xl font-bold uppercase tracking-tight">{currentUser === 'Grinch' ? 'Капитан Гринч' : 'Синди Лу'}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-red-600">Награда: 1,000,000 поцелуев</p>
                 </div>
              </div>
           </div>

           {/* Voyage Origin Card (New) */}
           <div className="relative p-8 rounded-[3rem] bg-slate-900/40 border-2 border-amber-500/10 flex flex-col justify-center items-center text-center space-y-6 overflow-hidden group">
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
              
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
                 <Compass size={40} />
              </div>

              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/40">Первый порт приписки</p>
                 <h4 className="text-3xl font-bold text-amber-100 italic">17 марта 2026</h4>
                 <p className="text-xs text-amber-100/40 max-w-[250px] mx-auto">День, когда наши корабли встретились в тумане и решили плыть вместе.</p>
              </div>

              <div className="grid grid-cols-3 gap-8 w-full pt-4 border-t border-amber-500/10">
                 <div>
                    <p className="text-xl font-bold text-amber-100">12</p>
                    <p className="text-[8px] uppercase font-black tracking-widest text-amber-500/30">Островов</p>
                 </div>
                 <div>
                    <p className="text-xl font-bold text-amber-100">850</p>
                    <p className="text-[8px] uppercase font-black tracking-widest text-amber-500/30">Миль</p>
                 </div>
                 <div>
                    <p className="text-xl font-bold text-amber-100">∞</p>
                    <p className="text-[8px] uppercase font-black tracking-widest text-amber-500/30">Любви</p>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Decorative Background Icons */}
      <div className="fixed bottom-[-10%] right-[-5%] opacity-[0.02] pointer-events-none select-none z-0">
        <Anchor size={600} />
      </div>
      <div className="fixed top-[20%] left-[-10%] opacity-[0.02] pointer-events-none select-none z-0">
        <Compass size={400} />
      </div>

      {/* Dossier Modal */}
      <AnimatePresence>
        {showDossier && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowDossier(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-xl"
             />
             
             <motion.div
               initial={{ scale: 0.9, y: 20, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.9, y: 20, opacity: 0 }}
               className="relative w-full max-w-2xl bg-slate-950 border-4 border-amber-500/20 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                
                {/* Left Side: Avatar & Action */}
                <div className="w-full md:w-1/3 p-8 bg-amber-500/5 flex flex-col items-center justify-center gap-6 border-r border-amber-500/10">
                   <div className="w-32 h-32 rounded-3xl bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center text-6xl shadow-xl">
                      {currentUser === 'Grinch' ? '🏴‍☠️' : '🧜‍♀️'}
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/40">Звание</p>
                      <h4 className="text-xl font-bold text-amber-100">Капитан</h4>
                   </div>
                   <button 
                    onClick={() => {
                      alert('Любовь отправлена по всем канонам пиратского кодекса! ❤️🏴‍☠️');
                    }}
                    className="w-full py-4 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg"
                   >
                     Подать сигнал любви
                   </button>
                </div>

                {/* Right Side: Content */}
                <div className="flex-1 p-8 md:p-12 space-y-8 relative">
                   <button 
                    onClick={() => setShowDossier(false)}
                    className="absolute top-6 right-6 text-amber-500/20 hover:text-amber-500 transition-colors"
                   >
                     <X size={24} />
                   </button>

                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/60">Засекречено • Dossier</p>
                      <h3 className="text-4xl font-bold text-amber-100">{currentUser === 'Grinch' ? 'Гринч' : 'Синди Лу'}</h3>
                   </div>

                   <div className="space-y-4">
                      <p className="text-sm italic text-amber-100/60 leading-relaxed">
                         {currentUser === 'Grinch' 
                           ? "Гроза северных морей и мастер скрытых подарков. Обладает уникальным даром находить сокровища там, где другие видят лишь туман."
                           : "Прекрасная Сирена, чья улыбка способна успокоить самый свирепый шторм. Единственная, кто знает истинные координаты сердца Гринча."
                         }
                      </p>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 gap-4">
                      <DossierStat label="Харизма" value="MAX" icon={<Sparkles size={14} />} />
                      <DossierStat label="Удача" value="99%" icon={<Star size={14} />} />
                      <DossierStat label="Сила" value="100%" icon={<Sword size={14} />} />
                      <DossierStat label="Преданность" value="∞" icon={<Heart size={14} />} />
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DossierStat({ label, value, icon }: any) {
  return (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
       <div className="text-amber-500/40">{icon}</div>
       <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-amber-500/20 leading-none">{label}</p>
          <p className="text-sm font-bold text-amber-100">{value}</p>
       </div>
    </div>
  );
}

function Badge({ icon, label, color }: any) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest", color)}>
       {icon}
       <span>{label}</span>
    </div>
  );
}

function NavCard({ title, desc, icon, href }: any) {
  return (
    <Link href={href} className="group relative p-6 rounded-[2.5rem] bg-slate-900/60 border-2 border-amber-500/5 hover:border-amber-500/30 hover:bg-slate-900/80 transition-all shadow-xl flex items-center justify-between">
       <div className="flex items-center gap-6">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform shadow-lg">
             {icon}
          </div>
          <div>
             <h4 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 transition-colors">{title}</h4>
             <p className="text-[10px] text-amber-100/40 uppercase tracking-widest font-black">{desc}</p>
          </div>
       </div>
       <ChevronRight size={20} className="text-amber-500/20 group-hover:text-amber-500 transition-colors" />
    </Link>
  );
}

function MiniStat({ label, value, icon }: any) {
  return (
    <div className="p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 text-center space-y-1">
       <div className="flex justify-center mb-1 text-amber-500/40">{icon}</div>
       <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/20">{label}</p>
       <p className="text-xl font-bold text-amber-100">{value}</p>
    </div>
  );
}
