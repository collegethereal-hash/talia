'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/Card";
import { 
  CheckSquare, Star, Trophy, Target, Plus, X, Edit3, Save, Trash2, Gift, 
  Sparkles, ChevronRight, MapPin, Calendar, ListChecks, ShieldCheck, 
  Heart, User, Clock, CheckCircle2, Coins, Trees, Moon, Camera, Film, Mic
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';

const CATEGORY_COLORS = [
  { bg: 'bg-[#ff7e7e]', text: 'text-white', border: 'border-[#ff7e7e]', name: 'Красный' },
  { bg: 'bg-[#7eafff]', text: 'text-white', border: 'border-[#7eafff]', name: 'Синий' },
  { bg: 'bg-[#7eff9e]', text: 'text-[#2d5a3a]', border: 'border-[#7eff9e]', name: 'Зеленый' },
  { bg: 'bg-[#ffde7e]', text: 'text-[#5a4a2d]', border: 'border-[#ffde7e]', name: 'Желтый' },
  { bg: 'bg-[#ff7eb6]', text: 'text-white', border: 'border-[#ff7eb6]', name: 'Розовый' },
  { bg: 'bg-[#bc7eff]', text: 'text-white', border: 'border-[#bc7eff]', name: 'Фиолетовый' },
];

interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedByGrinch: boolean;
  completedByCindy: boolean;
  points: number;
  category: string;
  categoryColor: typeof CATEGORY_COLORS[0];
  proposedBy: 'Grinch' | 'Cindy';
  approvedByPartner: boolean;
  deleteRequestedBy?: 'Grinch' | 'Cindy' | null;
  location?: string;
}

interface Reward {
  id: string;
  title: string;
  cost: number;
  unlocked: boolean;
  icon: string;
}

const INITIAL_QUESTS: Quest[] = [];

const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', title: 'Селфи прямо сейчас', cost: 1000, unlocked: false, icon: 'camera' },
  { id: 'r4', title: 'Выбор фильма для вечера', cost: 800, unlocked: false, icon: 'film' },
  { id: 'r5', title: 'Длинное голосовое (5 мин+)', cost: 1500, unlocked: false, icon: 'mic' },
  { id: 'r6', title: 'Любой каприз (в рамках LDR)', cost: 5000, unlocked: false, icon: 'sparkles' },
];

export default function BucketListPage() {
  const { currentUser, quests, setQuests, refreshQuests, profiles } = useData();
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Quest>>({});
  const [purchasedReward, setPurchasedReward] = useState<Reward | null>(null);

  useEffect(() => {
    fetchRewards();
  }, [currentUser, profiles]);

  const fetchRewards = () => {
    if (!currentUser) return;
    const profileId = currentUser === 'Grinch' ? 'me' : 'polina';
    const profile = profiles[profileId];

    if (profile && profile.unlocked_rewards) {
      const unlockedIds = profile.unlocked_rewards as string[];
      setRewards(prev => prev.map(r => ({ ...r, unlocked: unlockedIds.includes(r.id) })));
    }
  };

  const toggleQuest = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const quest = quests.find(q => q.id === id);
    if (!quest) return;

    const updated = { ...quest };
    if (currentUser === 'Grinch') updated.completedByGrinch = !updated.completedByGrinch;
    if (currentUser === 'Cindy') updated.completedByCindy = !updated.completedByCindy;
    updated.completed = updated.completedByGrinch && updated.completedByCindy;

    // Optimistic update
    setQuests(quests.map(q => q.id === id ? updated : q));

    const { error } = await supabase
      .from('bucket_list')
      .update({
        completed_by_grinch: updated.completedByGrinch,
        completed_by_cindy: updated.completedByCindy,
        is_completed: updated.completed
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating quest:', error);
      refreshQuests();
    }
  };

  const approveQuest = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const { error } = await supabase
      .from('bucket_list')
      .update({ approved_by_partner: true })
      .eq('id', id);

    if (error) {
      console.error('Error approving quest:', error);
    } else {
    refreshQuests();
    }
  };

  const rejectQuest = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const { error } = await supabase
      .from('bucket_list')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error rejecting quest:', error);
    } else {
    refreshQuests();
    }
  };

  const openQuest = (quest: Quest) => {
    if (!quest.approvedByPartner && quest.proposedBy === currentUser) {
      // Allow proposer to view/edit their pending quest
    } else if (!quest.approvedByPartner && quest.proposedBy !== currentUser) {
      // Allow partner to view/approve pending quest
    }
    setSelectedQuest(quest);
    setEditData(quest);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const startCreate = () => {
    if (!currentUser) return;
    setSelectedQuest(null);
    setEditData({ 
      title: '', 
      description: '', 
      points: 500, 
      category: 'Общее',
      categoryColor: CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const saveQuest = async () => {
    if (!currentUser) return;

    const questData = {
      title: editData.title || 'Новый квест',
      description: editData.description || '',
      points: editData.points || 500,
      category: editData.category || 'Общее',
      category_color: editData.categoryColor || CATEGORY_COLORS[0],
      proposed_by: currentUser,
      approved_by_partner: selectedQuest ? selectedQuest.approvedByPartner : false,
      date: new Date().toISOString().split('T')[0]
    };

    if (selectedQuest) {
      const { error } = await supabase
        .from('bucket_list')
        .update(questData)
        .eq('id', selectedQuest.id);
      
      if (error) console.error('Error updating quest:', error);
    } else {
      const { error } = await supabase
        .from('bucket_list')
        .insert([questData]);
      
      if (error) {
        console.error('Full Create Error:', error);
        console.error('Error detail:', error.message);
        alert(`Ошибка при создании квеста: ${error.message} (${error.details || 'нет деталей'})`);
      }
    }

    refreshQuests();
    setIsModalOpen(false);
  };

  const deleteQuest = async (id: string) => {
    if (!currentUser) return;
    
    const quest = quests.find(q => q.id === id);
    if (!quest) return;

    if (!quest.deleteRequestedBy) {
      // First request
      const { error } = await supabase
        .from('bucket_list')
        .update({ delete_requested_by: currentUser })
        .eq('id', id);
      
      if (error) console.error('Error requesting delete:', error);
    } else if (quest.deleteRequestedBy !== currentUser) {
      // Second request - actual delete
      const { error } = await supabase
        .from('bucket_list')
        .delete()
        .eq('id', id);
      
      if (error) console.error('Error deleting quest:', error);
    }
    
    refreshQuests();
    setIsModalOpen(false);
  };

  const unlockReward = async (reward: Reward) => {
    if (!currentUser) return;

    // 1. Double check current balance from DB (Anti-Cheat)
    const { data: latestQuests } = await supabase.from('bucket_list').select('points, is_completed');
    const { data: profile } = await supabase
      .from('profiles')
      .select('unlocked_rewards')
      .eq('id', currentUser === 'Grinch' ? 'me' : 'polina')
      .single();

    if (latestQuests && profile) {
      const totalPoints = latestQuests.filter((q: any) => q.is_completed).reduce((acc: number, q: any) => acc + q.points, 0);
      const unlockedIds = (profile.unlocked_rewards as string[]) || [];
      const spentPoints = rewards
        .filter(r => unlockedIds.includes(r.id))
        .reduce((acc, r) => acc + r.cost, 0);
      
      const realXP = totalPoints - spentPoints;

      if (realXP >= reward.cost && !unlockedIds.includes(reward.id)) {
        const newUnlockedIds = [...unlockedIds, reward.id];

        const { error } = await supabase
          .from('profiles')
          .update({ unlocked_rewards: newUnlockedIds })
          .eq('id', currentUser === 'Grinch' ? 'me' : 'polina');

        if (error) {
          console.error('Error unlocking reward:', error);
          alert('Ошибка при покупке. Попробуйте еще раз.');
        } else {
          setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, unlocked: true } : r));
          setPurchasedReward(reward);
          setTimeout(() => setPurchasedReward(null), 3000);
        }
      } else {
        alert('Недостаточно монет! Возможно, баланс изменился. Обновите страницу.');
      }
    }
  };

  const totalPoints = quests.filter(q => q.completed).reduce((acc, q) => acc + q.points, 0);
  const spentPoints = rewards.filter(r => r.unlocked).reduce((acc, r) => acc + r.cost, 0);
  const currentXP = totalPoints - spentPoints;
  const level = Math.floor(totalPoints / 1000) + 1;

  const pendingApprovals = quests.filter(q => !q.approvedByPartner && q.proposedBy !== currentUser);
  const activeQuests = quests.filter(q => q.approvedByPartner || q.proposedBy === currentUser);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-12 pb-32 space-y-16 relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-0" />

      <header className="text-center space-y-6 relative z-10">
        <div className="inline-block relative">
          <h1 className="text-6xl md:text-8xl font-serif font-black text-[#5c4a33] tracking-tighter relative z-10">Наши Квесты</h1>
          <div className="absolute -bottom-2 left-0 w-full h-4 bg-[#e6d5bc]/30 -rotate-1" />
        </div>
        <p className="text-[#8b7355] font-serif italic text-xl max-w-2xl mx-auto leading-relaxed">
          "Каждое приключение начинается с желания, а каждое обещание — с первого шага"
        </p>
      </header>

      {/* Pending Approvals Section */}
      <AnimatePresence>
        {pendingApprovals.length > 0 && (
          <section className="relative z-10 space-y-8">
            <div className="flex items-center gap-6 border-b-8 border-amber-200 pb-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 text-white flex items-center justify-center shadow-2xl border-4 border-amber-200">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-black text-[#5c4a33]">Запросы на одобрение</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Партнер хочет добавить новое приключение</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pendingApprovals.map((quest) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#fdfaf3] border-8 border-dashed border-amber-200 p-6 md:p-8 rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-amber-100/50 rounded-bl-[2rem] flex items-center justify-center text-amber-500">
                    <Clock size={20} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-serif font-black text-2xl text-[#5c4a33] leading-tight">{quest.title}</h3>
                    <p className="text-[#8b7355] italic font-serif leading-relaxed">{quest.description}</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={(e) => approveQuest(quest.id, e)}
                      className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      Одобрить
                    </button>
                    <button 
                      onClick={(e) => rejectQuest(quest.id, e)}
                      className="flex-1 py-4 rounded-2xl bg-red-400 text-white font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      Отклонить
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-16 relative z-10">
        {/* Full Width Quest Board */}
        <div className="space-y-10">
          <div className="flex items-center justify-between gap-4 border-b-8 border-[#e6d5bc] pb-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[#5c4a33] text-[#fdfaf3] flex items-center justify-center shadow-2xl border-4 border-[#e6d5bc]">
                <MapPin size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-black text-[#5c4a33]">Доска Объявлений</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Наши общие цели и мечты</p>
              </div>
            </div>
            <button 
              onClick={startCreate}
              className="px-8 py-4 rounded-2xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Новое дело
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {activeQuests.map((quest) => (
                <motion.div
                  key={quest.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => openQuest(quest)}
                  className="cursor-pointer group"
                >
                  <div className="relative p-1 bg-[#e6d5bc] rounded-[2.5rem] shadow-xl group-hover:shadow-2xl transition-all h-full">
                    <div className={cn(
                      "bg-[#fdfaf3] rounded-[2.3rem] p-6 md:p-8 border-4 border-[#e6d5bc] relative overflow-hidden space-y-6 h-full flex flex-col",
                      quest.completed && "opacity-60 grayscale-[0.5]"
                    )}>
                      {/* Paper pin effect */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#5c4a33] rounded-full shadow-lg border-4 border-[#e6d5bc] z-20" />
                      
                      <div className="flex justify-between items-start pt-4">
                        <div className="flex flex-col gap-2">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border-4 shadow-sm",
                            quest.categoryColor.bg,
                            quest.categoryColor.text,
                            quest.categoryColor.border
                          )}>
                            {quest.category}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                           <div className={cn(
                             "w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner border-2 transition-all",
                             quest.completedByGrinch ? "bg-[#5c4a33] border-[#5c4a33] text-amber-200 scale-110" : "bg-white border-[#e6d5bc] text-[#e6d5bc] opacity-40"
                           )} title="Гринч">
                             <Trees size={20} strokeWidth={2.5} />
                           </div>
                           <div className={cn(
                             "w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner border-2 transition-all",
                             quest.completedByCindy ? "bg-[#5c4a33] border-[#5c4a33] text-blue-100 scale-110" : "bg-white border-[#e6d5bc] text-[#e6d5bc] opacity-40"
                           )} title="Синди Лу">
                             <Moon size={20} strokeWidth={2.5} />
                           </div>
                        </div>
                      </div>

                      <div className="space-y-3 flex-1">
                        <h3 className={cn(
                          "text-2xl font-serif font-black leading-tight text-[#5c4a33]",
                          quest.completed && "line-through opacity-50"
                        )}>
                          {quest.title}
                        </h3>
                        <p className="text-[#8b7355] italic font-serif text-sm line-clamp-3 leading-relaxed">
                          {quest.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t-4 border-[#e6d5bc]/30 mt-auto">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#8b7355] uppercase tracking-widest">
                          <Coins size={16} className="text-amber-500" fill="currentColor" />
                          {quest.points} монет
                        </div>
                        <button 
                          onClick={(e) => toggleQuest(quest.id, e)}
                          className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl border-4",
                            quest.completed ? "bg-emerald-500 border-emerald-200 text-white" : "bg-white border-[#e6d5bc] text-[#e6d5bc] hover:border-[#5c4a33]"
                          )}
                        >
                          <Star size={24} fill={quest.completed ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {activeQuests.length === 0 && (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-8 bg-[#fdfaf3]/50 rounded-[4rem] border-8 border-dashed border-[#e6d5bc]/30">
                <div className="w-24 h-24 bg-white border-4 border-[#e6d5bc] rounded-[2rem] flex items-center justify-center text-[#e6d5bc] shadow-2xl">
                  <ListChecks size={48} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-serif font-black text-[#5c4a33]">Доска пока пуста</h3>
                  <p className="text-[#8b7355] italic font-serif max-w-sm mx-auto text-lg">
                    "Начните вашу общую историю с первого квеста. Вперед к приключениям!"
                  </p>
                </div>
                <button 
                  onClick={startCreate}
                  className="bg-[#5c4a33] text-[#fdfaf3] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-all"
                >
                  Создать первый квест
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Reward Shop at the bottom */}
        <section className="space-y-10 pt-16 border-t-8 border-[#e6d5bc]/30">
          <div className="flex items-center justify-between border-b-8 border-[#e6d5bc] pb-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-purple-500 text-white flex items-center justify-center shadow-2xl border-4 border-[#e6d5bc]">
                <Gift size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-black text-[#5c4a33]">Лавка Наград</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Трофеи наших странствий</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white border-4 border-[#e6d5bc] rounded-2xl px-6 py-3 shadow-xl">
               <Coins size={24} className="text-amber-500" fill="currentColor" />
               <span className="text-3xl font-serif font-black text-[#5c4a33]">{currentXP}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {rewards.map((reward) => (
              <motion.div 
                key={reward.id}
                whileHover={!reward.unlocked && currentXP >= reward.cost ? { y: -5 } : {}}
              >
                <div className={cn(
                  "relative p-1 bg-[#e6d5bc] rounded-[2rem] shadow-lg h-full transition-all",
                  reward.unlocked && "opacity-50 grayscale-[0.5]"
                )}>
                  <div className="bg-[#fdfaf3] p-4 sm:p-5 rounded-[1.8rem] border-2 border-[#e6d5bc] space-y-4 h-full flex flex-col items-center text-center bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border-2",
                      reward.unlocked ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-[#e6d5bc] text-[#5c4a33]"
                    )}>
                      {reward.icon === 'camera' && <Camera size={32} />}
                      {reward.icon === 'film' && <Film size={32} />}
                      {reward.icon === 'mic' && <Mic size={32} />}
                      {reward.icon === 'sparkles' && <Sparkles size={32} />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-serif font-black text-xs text-[#5c4a33] leading-tight line-clamp-2 px-1">
                        {reward.title}
                      </h4>
                      <div className="flex items-center justify-center gap-1 text-amber-600">
                        <Coins size={12} fill="currentColor" className="opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{reward.cost}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => unlockReward(reward)}
                      disabled={reward.unlocked || currentXP < reward.cost}
                      className={cn(
                        "w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md border-2 relative z-20",
                        reward.unlocked 
                          ? "bg-emerald-500 border-emerald-300 text-white cursor-default" 
                          : (currentXP >= reward.cost 
                              ? "bg-[#5c4a33] border-[#5c4a33] text-[#fdfaf3] hover:bg-[#4a3b29] hover:scale-105 active:scale-95 cursor-pointer" 
                              : "bg-[#e6d5bc]/30 border-[#e6d5bc] text-[#8b7355]/40 cursor-not-allowed")
                      )}
                    >
                      {reward.unlocked ? '✓ Куплено' : (currentXP >= reward.cost ? 'Забрать' : 'Мало монет')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Quest Modal - Palia Scroll Style */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#fdfaf3] rounded-[3rem] shadow-2xl border-8 border-[#e6d5bc] overflow-hidden"
            >
              <div className="p-6 md:p-10 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
                <div className="flex justify-between items-center border-b-4 border-[#e6d5bc] pb-6">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-serif font-black text-[#5c4a33]">
                      {isEditing ? (selectedQuest ? 'Свиток Изменений' : 'Новое Поручение') : 'Детали Квеста'}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#8b7355]">Летопись наших приключений</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-white border-4 border-[#e6d5bc] text-[#e6d5bc] flex items-center justify-center hover:border-[#5c4a33] transition-all">
                    <X size={24} />
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[#8b7355] px-4">Суть Задания</label>
                      <input 
                        value={editData.title}
                        onChange={e => setEditData({...editData, title: e.target.value})}
                        className="w-full bg-white border-4 border-[#e6d5bc] rounded-2xl px-6 py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-serif font-bold text-[#5c4a33] text-lg"
                        placeholder="Что предстоит совершить?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[#8b7355] px-4">Дневник Подробностей</label>
                      <textarea 
                        value={editData.description}
                        onChange={e => setEditData({...editData, description: e.target.value})}
                        className="w-full h-32 bg-white border-4 border-[#e6d5bc] rounded-[2rem] px-6 py-6 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none font-serif italic text-lg text-[#5c4a33]"
                        placeholder="Опиши ваше приключение..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-[#8b7355] px-4">Награда (Эликсир)</label>
                        <select 
                          value={editData.points}
                          onChange={e => setEditData({...editData, points: Number(e.target.value)})}
                          className="w-full bg-white border-4 border-[#e6d5bc] rounded-xl px-4 py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-black text-[#5c4a33] uppercase text-[10px] tracking-widest"
                        >
                          <option value={300}>300 (Пустяк)</option>
                          <option value={500}>500 (Обычное)</option>
                          <option value={1000}>1000 (Важное)</option>
                          <option value={5000}>5000 (Легендарное)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-[#8b7355] px-4">Тип Дела</label>
                        <input 
                          value={editData.category}
                          onChange={e => setEditData({...editData, category: e.target.value})}
                          className="w-full bg-white border-4 border-[#e6d5bc] rounded-xl px-4 py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-black text-[#5c4a33] uppercase text-[10px] tracking-widest"
                          placeholder="Кино, Дом, Трэвел..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[#8b7355] px-4">Цвет Печати</label>
                      <div className="flex flex-wrap gap-3 p-6 bg-white border-4 border-[#e6d5bc] rounded-[2rem]">
                        {CATEGORY_COLORS.map((color, idx) => (
                          <button
                            key={idx}
                            onClick={() => setEditData({ ...editData, categoryColor: color })}
                            className={cn(
                              "w-10 h-10 rounded-full border-4 transition-all hover:scale-110 shadow-sm",
                              color.bg,
                              editData.categoryColor === color ? "border-[#5c4a33] scale-125 shadow-xl" : "border-transparent"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : selectedQuest && (
                  <div className="space-y-8">
                    <div className="p-6 md:p-10 bg-white border-8 border-[#e6d5bc] rounded-[3rem] shadow-2xl relative overflow-hidden">
                       <div className="absolute top-4 right-4 opacity-5"><ListChecks size={60} /></div>
                       <p className="text-2xl font-serif italic leading-relaxed text-[#5c4a33]">"{selectedQuest.description}"</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-6 bg-white border-4 border-[#e6d5bc] rounded-[2rem] shadow-lg">
                        <Coins className="text-amber-500" size={32} fill="currentColor" />
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-[#8b7355]">Награда</span>
                          <span className="text-xl font-serif font-black text-[#5c4a33]">{selectedQuest.points} монет</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-6 bg-white border-4 border-[#e6d5bc] rounded-[2rem] shadow-lg">
                        <Target className="text-[#5c4a33]" size={32} />
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-[#8b7355]">Статус</span>
                          <span className={cn("text-xl font-serif font-black", selectedQuest.completed ? "text-emerald-600" : "text-amber-600")}>
                            {selectedQuest.completed ? 'Исполнено' : 'В Пути'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t-4 border-[#e6d5bc]/30 flex justify-between gap-6">
                  {isEditing ? (
                    <>
                      <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[#8b7355] font-black uppercase tracking-widest text-[10px] hover:text-[#5c4a33] transition-all">Отмена</button>
                      <button onClick={saveQuest} className="flex-1 py-4 bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                        {selectedQuest ? 'Записать в Свиток' : 'Провозгласить Квест'}
                      </button>
                    </>
                  ) : selectedQuest && (
                    <>
                      <button 
                        onClick={() => deleteQuest(selectedQuest.id)} 
                        className={cn(
                          "p-5 rounded-2xl transition-all flex items-center gap-4 border-4",
                          selectedQuest.deleteRequestedBy === currentUser 
                            ? "bg-[#e6d5bc]/20 border-[#e6d5bc] text-[#8b7355]/40 cursor-not-allowed" 
                            : "bg-red-50 border-red-100 text-red-500 hover:bg-red-100 shadow-xl"
                        )}
                        disabled={selectedQuest.deleteRequestedBy === currentUser}
                      >
                        <Trash2 size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                          {selectedQuest.deleteRequestedBy ? (selectedQuest.deleteRequestedBy === currentUser ? 'Ждем Клятвы' : 'Подтвердить') : 'Удалить'}
                        </span>
                      </button>
                      <div className="flex-1 flex gap-4">
                        <button onClick={() => setIsEditing(true)} className="flex-1 py-4 bg-white border-4 border-[#e6d5bc] text-[#5c4a33] font-black uppercase tracking-widest text-[10px] rounded-2xl hover:border-[#5c4a33] transition-all flex items-center justify-center gap-3">
                          <Edit3 size={20} /> Править
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
