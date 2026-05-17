'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, Star, Trophy, Target, Plus, X, Edit3, Save, Trash2, Gift, 
  Sparkles, ChevronRight, MapPin, Calendar, ListChecks, ShieldCheck, 
  Heart, User, Clock, CheckCircle2, Coins, Trees, Moon, Camera, Film, Mic,
  Anchor, Sword, Scroll, Skull, Bomb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';

export default function PirateBucketList() {
  const { currentUser, quests, refreshQuests, profiles } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);

  const totalPoints = quests.filter(q => q.completed).reduce((acc, q) => acc + q.points, 0);
  const currentXP = totalPoints; // Simplified for now

  return (
    <div className="relative min-h-screen bg-[#020617] text-amber-100 pb-32 font-serif overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10" />
        <div className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-t from-blue-950/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 space-y-16">
        <header className="text-center space-y-4">
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            className="inline-block"
          >
             <div className="p-4 bg-amber-400/10 rounded-full border-2 border-amber-400/20 shadow-2xl">
                <Skull size={64} className="text-amber-400" />
             </div>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-700">
            Пиратский Кодекс
          </h1>
          <p className="text-amber-200/50 italic text-xl">"Задания для истинных волков моря"</p>
        </header>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <PirateStat card title="Всего дублонов" value={totalPoints} icon={<Coins className="text-amber-400" />} />
           <PirateStat card title="Выполнено дел" value={quests.filter(q => q.completed).length} icon={<Anchor className="text-blue-400" />} />
           <PirateStat card title="В ожидании" value={quests.filter(q => !q.completed).length} icon={<Clock className="text-red-400" />} />
        </div>

        {/* Quest Grid */}
        <div className="space-y-10">
           <div className="flex items-center justify-between border-b-4 border-amber-500/10 pb-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-amber-400/10 rounded-xl text-amber-400">
                    <Sword size={24} />
                 </div>
                 <h2 className="text-3xl font-bold uppercase tracking-widest">Список Поручений</h2>
              </div>
              <button className="px-8 py-4 bg-amber-400 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                 <Plus size={18} /> Новое дело
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {quests.map((quest) => (
                <motion.div
                  key={quest.id}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                >
                  <div className="relative p-1 bg-amber-500/10 rounded-[2.5rem] shadow-xl group-hover:bg-amber-500/30 transition-all h-full">
                    <div className={cn(
                      "pirate-wood rounded-[2.3rem] p-8 space-y-6 h-full flex flex-col relative overflow-hidden",
                      quest.completed && "opacity-50"
                    )}>
                      {/* Wax Seal effect */}
                      <div className="absolute top-4 right-4 w-10 h-10 bg-red-600 rounded-full shadow-inner border-4 border-red-900/30 flex items-center justify-center text-red-100 opacity-80">
                         <Skull size={20} />
                      </div>

                      <div className="space-y-3 flex-1">
                        <h3 className={cn("text-2xl font-bold tracking-tight text-amber-100", quest.completed && "line-through")}>
                          {quest.title}
                        </h3>
                        <p className="text-amber-100/40 text-sm italic leading-relaxed">
                          "{quest.description}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t-2 border-amber-500/10">
                         <div className="flex items-center gap-2 text-amber-400">
                            <Coins size={16} fill="currentColor" className="opacity-40" />
                            <span className="text-lg font-bold">{quest.points}</span>
                         </div>
                         <div className="flex gap-2">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                              quest.completedByGrinch ? "bg-amber-400 text-slate-900 border-amber-400" : "bg-black/20 border-amber-500/10 text-amber-500/20"
                            )}>
                              <Trees size={16} />
                            </div>
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                              quest.completedByCindy ? "bg-amber-400 text-slate-900 border-amber-400" : "bg-black/20 border-amber-500/10 text-amber-500/20"
                            )}>
                              <Moon size={16} />
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function PirateStat({ title, value, icon, card }: any) {
  return (
    <div className={cn(
      "p-6 rounded-[2rem] border-2 border-amber-500/10 bg-black/40 backdrop-blur-xl flex items-center gap-6",
      card && "shadow-xl"
    )}>
       <div className="p-4 bg-amber-400/5 rounded-2xl text-2xl border border-amber-500/10">
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/40">{title}</p>
          <p className="text-3xl font-bold text-amber-100">{value}</p>
       </div>
    </div>
  );
}
