'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/Card";
import { 
  CheckSquare, Star, Trophy, Target, Plus, X, Edit3, Save, Trash2, Gift, 
  Sparkles, ChevronRight, MapPin, Calendar, ListChecks, ShieldCheck, 
  Heart, User, Clock, CheckCircle2, FlaskRound as Flask
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';

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
  { id: 'r1', title: 'Селфи прямо сейчас', cost: 1000, unlocked: false, icon: '📸' },
  { id: 'r4', title: 'Выбор фильма для вечера', cost: 800, unlocked: false, icon: '🍿' },
  { id: 'r5', title: 'Длинное голосовое (5 мин+)', cost: 1500, unlocked: false, icon: '🎙️' },
  { id: 'r6', title: 'Любой каприз (в рамках LDR)', cost: 5000, unlocked: false, icon: '✨' },
];

export default function BucketListPage() {
  const [currentUser, setCurrentUser] = useState<'Grinch' | 'Cindy' | null>(null);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Quest>>({});
  const [purchasedReward, setPurchasedReward] = useState<Reward | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('lumina_auth');
    if (auth) {
      setCurrentUser(auth === 'grinch' ? 'Grinch' : 'Cindy');
    }
    fetchQuests();
    fetchRewards();
  }, []);

  const fetchQuests = async () => {
    const { data, error } = await supabase
      .from('bucket_list')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching quests:', error);
    } else if (data) {
      setQuests(data.map((q: any) => ({
        id: q.id,
        title: q.title,
        description: q.description || '',
        completed: q.is_completed,
        completedByGrinch: q.completed_by_grinch || false,
        completedByCindy: q.completed_by_cindy || false,
        points: q.points,
        category: q.category,
        categoryColor: q.category_color || CATEGORY_COLORS[0],
        proposedBy: q.proposed_by,
        approvedByPartner: q.approved_by_partner,
        deleteRequestedBy: q.delete_requested_by,
        location: q.location
      })));
    }
  };

  const fetchRewards = async () => {
    if (!currentUser) return;
    
    // Fetch individual rewards from the user's profile
    const profileId = currentUser === 'Grinch' ? 'me' : 'polina';
    const { data, error } = await supabase
      .from('profiles')
      .select('unlocked_rewards')
      .eq('id', profileId)
      .single();

    if (data && data.unlocked_rewards) {
      const unlockedIds = data.unlocked_rewards as string[];
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
      fetchQuests();
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
      fetchQuests();
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
      fetchQuests();
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

    fetchQuests();
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
    
    fetchQuests();
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
        alert('Недостаточно эликсира! Возможно, баланс изменился. Обновите страницу.');
        fetchQuests();
        fetchRewards();
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
    <div className="max-w-6xl mx-auto px-4 pt-12 pb-32 space-y-12 relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-0" />

      <header className="text-center space-y-6 relative z-10">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#5c4a33] tracking-tight">Наши Квесты</h1>
        
        <div className="flex flex-wrap justify-center gap-6">
          <div className="bg-white px-8 py-4 rounded-[2rem] border-4 border-[#e6d5bc] shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
              <Star size={24} fill="currentColor" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8b7355]">Общий Уровень</p>
              <p className="text-2xl font-serif font-bold text-[#5c4a33]">{level}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Pending Approvals Section */}
      <AnimatePresence>
        {pendingApprovals.length > 0 && (
          <section className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-amber-200 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg border-2 border-amber-200">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#5c4a33]">Запросы на одобрение</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Партнер хочет добавить новое приключение</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pendingApprovals.map((quest) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#fdfaf3] border-4 border-dashed border-amber-300 p-6 rounded-[2.5rem] space-y-4 shadow-xl"
                >
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-lg text-[#5c4a33]">{quest.title}</h3>
                    <p className="text-sm text-[#8b7355] italic leading-relaxed">{quest.description}</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={(e) => approveQuest(quest.id, e)}
                      className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      Одобрить
                    </button>
                    <button 
                      onClick={(e) => rejectQuest(quest.id, e)}
                      className="flex-1 py-3 rounded-xl bg-red-400 text-white font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* Left Column: Quests */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between gap-4 border-b-4 border-[#e6d5bc] pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5c4a33] flex items-center justify-center text-[#e6d5bc] shadow-lg border-2 border-[#e6d5bc]">
                <MapPin size={24} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#5c4a33]">Список приключений</h2>
            </div>
            <button 
              onClick={startCreate}
              className="px-6 py-3 rounded-2xl bg-[#5c4a33] text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Добавить
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {activeQuests.map((quest) => (
                <motion.div
                  key={quest.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  onClick={() => openQuest(quest)}
                  className="cursor-pointer"
                >
                  <Card className={cn(
                    "h-full transition-all duration-500 relative overflow-hidden bg-white border-4 border-[#e6d5bc] rounded-[2.5rem] shadow-xl p-6",
                    quest.completed && "bg-[#f0f9f0] border-emerald-200"
                  )}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-2 w-fit",
                            quest.categoryColor.bg,
                            quest.categoryColor.text,
                            quest.categoryColor.border
                          )}>
                            {quest.category}
                          </span>
                          {!quest.approvedByPartner && (
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 animate-pulse">
                              Ожидает одобрения
                            </span>
                          )}
                          {quest.deleteRequestedBy && (
                            <span className="text-[8px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                              Запрос на удаление
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Grinch Progress */}
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all border-2 shadow-sm text-xs",
                            quest.completedByGrinch ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-[#e6d5bc] text-[#e6d5bc]"
                          )} title="Гринч">
                            🍏
                          </div>
                          {/* Cindy Progress */}
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all border-2 shadow-sm text-xs",
                            quest.completedByCindy ? "bg-pink-500 border-pink-500 text-white" : "bg-white border-[#e6d5bc] text-[#e6d5bc]"
                          )} title="Синди Лу">
                            🎀
                          </div>
                          <button 
                            onClick={(e) => toggleQuest(quest.id, e)}
                            className={cn(
                              "ml-2 w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                              quest.completed ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-white text-[#e6d5bc] hover:text-emerald-400 border-2 border-[#fdfaf3]"
                            )}
                          >
                            <Star size={20} fill={quest.completed ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 className={cn(
                          "text-xl font-serif font-bold leading-tight text-[#5c4a33]",
                          quest.completed && "text-emerald-800/40 line-through"
                        )}>
                          {quest.title}
                        </h3>
                        <p className="text-sm text-[#8b7355] mt-2 line-clamp-3 leading-relaxed">{quest.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t-2 border-[#fdfaf3]">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#8b7355] uppercase tracking-widest">
                          <Flask size={14} className="text-purple-500" />
                          {quest.points} капель
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {activeQuests.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-[#fdfaf3] border-4 border-[#e6d5bc] rounded-[2rem] flex items-center justify-center text-[#8b7355] shadow-lg">
                  <ListChecks size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-[#5c4a33]">Список приключений пуст</h3>
                  <p className="text-[#8b7355] italic max-w-xs mx-auto">
                    "Начните вашу историю с первого совместного квеста. Каждое приключение сближает!"
                  </p>
                </div>
                <button 
                  onClick={startCreate}
                  className="bg-[#5c4a33] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
                >
                  Создать первый квест
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reward Shop */}
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center gap-4 border-b-4 border-[#e6d5bc] pb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-lg border-2 border-[#e6d5bc]">
              <Gift size={24} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#5c4a33]">Лавка Наград</h2>
          </div>
          
          <div className="bg-[#fdfaf3] p-6 md:p-8 rounded-[2.5rem] border-4 border-[#e6d5bc] shadow-xl space-y-8 relative overflow-hidden">
            {/* Paper texture overlay for the shop card itself */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-0" />

            <div className="relative z-10 flex flex-col items-center justify-center p-6 bg-white border-4 border-[#e6d5bc] rounded-[2.5rem] shadow-xl mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355] mb-2">Накопленный эликсир</span>
              <div className="flex items-center gap-2">
                <Flask size={28} className="text-purple-500 animate-pulse" fill="currentColor" />
                <span className="text-4xl font-serif font-bold text-[#5c4a33]">{currentXP}</span>
              </div>
            </div>

            <div className="relative z-10 space-y-6 pt-4">
              {rewards.map((reward) => (
                <motion.div 
                  key={reward.id}
                  whileHover={!reward.unlocked && currentXP >= reward.cost ? { scale: 1.02 } : {}}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className={cn(
                    "p-6 flex flex-col gap-5 transition-all border-4 rounded-[2rem] shadow-lg relative overflow-hidden",
                    reward.unlocked 
                      ? "bg-emerald-50/30 border-emerald-200 opacity-80" 
                      : "bg-white border-[#e6d5bc] hover:border-[#5c4a33]"
                  )}>
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner flex-shrink-0 border-2",
                        reward.unlocked ? "bg-emerald-100 border-emerald-200" : "bg-[#fdfaf3] border-[#e6d5bc]"
                      )}>
                        {reward.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-serif font-bold text-sm text-[#5c4a33] leading-tight">
                          {reward.title}
                        </h4>
                        <div className="flex items-center gap-2 text-purple-600">
                          <Flask size={14} className="fill-purple-500/20" />
                          <span className="text-[11px] font-black uppercase tracking-wider">{reward.cost} капель</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      disabled={reward.unlocked || currentXP < reward.cost}
                      onClick={() => unlockReward(reward)}
                      className={cn(
                        "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-md",
                        reward.unlocked 
                          ? "bg-emerald-500 text-white cursor-default" 
                          : (currentXP >= reward.cost 
                              ? "bg-[#5c4a33] text-white hover:bg-[#4a3b29] hover:shadow-xl active:scale-95" 
                              : "bg-[#f5e6d3] text-[#8b7355]/40 cursor-not-allowed shadow-none")
                      )}
                    >
                      {reward.unlocked ? '✓ Получено' : (currentXP >= reward.cost ? 'Приобрести' : 'Нужно больше эликсира')}
                    </button>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <p className="relative z-10 text-center text-[9px] font-medium text-[#8b7355] italic px-4">
              Награды — это наши общие радости. Разблокируй их, чтобы сделать день ярче!
            </p>
          </div>
        </div>
      </div>

      {/* Quest Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-2xl font-serif font-bold text-foreground/80">
                    {isEditing ? (selectedQuest ? 'Редактировать' : 'Новый квест') : 'Детали квеста'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-50 rounded-full transition-all">
                    <X size={20} className="text-foreground/30" />
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-foreground/30 px-2">Название</label>
                      <input 
                        value={editData.title}
                        onChange={e => setEditData({...editData, title: e.target.value})}
                        className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-lumina-lavender/30 transition-all font-bold"
                        placeholder="Что нужно сделать?"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-foreground/30 px-2">Описание</label>
                      <textarea 
                        value={editData.description}
                        onChange={e => setEditData({...editData, description: e.target.value})}
                        className="w-full h-32 bg-zinc-50 border-none rounded-2xl px-4 py-4 focus:ring-2 focus:ring-lumina-lavender/30 transition-all resize-none text-sm"
                        placeholder="Подробности вашего приключения..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-foreground/30 px-2 text-[#8b7355]">Награда (Капли)</label>
                        <select 
                          value={editData.points}
                          onChange={e => setEditData({...editData, points: Number(e.target.value)})}
                          className="w-full bg-[#fdfaf3] border-2 border-[#e6d5bc] rounded-xl px-4 py-3 focus:ring-0 focus:border-[#5c4a33] transition-all font-bold text-[#5c4a33]"
                        >
                          <option value={300}>300 капель (Легко)</option>
                          <option value={500}>500 капель (Средне)</option>
                          <option value={1000}>1000 капель (Сложно)</option>
                          <option value={5000}>5000 капель (Легендарно)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-foreground/30 px-2 text-[#8b7355]">Категория</label>
                        <input 
                          value={editData.category}
                          onChange={e => setEditData({...editData, category: e.target.value})}
                          className="w-full bg-[#fdfaf3] border-2 border-[#e6d5bc] rounded-xl px-4 py-3 focus:ring-0 focus:border-[#5c4a33] transition-all font-bold text-[#5c4a33]"
                          placeholder="Кино, Дом, Трэвел..."
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-foreground/30 px-2 text-[#8b7355]">Цвет категории</label>
                      <div className="flex flex-wrap gap-3 p-4 bg-[#fdfaf3] border-2 border-[#e6d5bc] rounded-2xl">
                        {CATEGORY_COLORS.map((color, idx) => (
                          <button
                            key={idx}
                            onClick={() => setEditData({ ...editData, categoryColor: color })}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                              color.bg,
                              editData.categoryColor === color ? "border-[#5c4a33] scale-125 shadow-lg" : "border-transparent"
                            )}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : selectedQuest && (
                  <div className="space-y-6">
                    <div className="p-6 bg-lumina-lavender/5 rounded-[2rem] border border-lumina-lavender/10">
                      <p className="text-lg leading-relaxed italic text-foreground/70">"{selectedQuest.description}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl">
                        <Flask className="text-purple-500" size={20} />
                        <div>
                          <span className="block text-[8px] uppercase font-bold text-foreground/30">Награда</span>
                          <span className="text-sm font-bold">{selectedQuest.points} капель</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl">
                        <Target className="text-lumina-lavender" size={20} />
                        <div>
                          <span className="block text-[8px] uppercase font-bold text-foreground/30">Статус</span>
                          <span className={cn("text-sm font-bold", selectedQuest.completed ? "text-green-500" : "text-amber-500")}>
                            {selectedQuest.completed ? 'Выполнено' : 'В процессе'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-black/5 flex justify-between gap-4">
                  {isEditing ? (
                    <>
                      <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[#8b7355] font-bold hover:text-[#5c4a33] transition-all">Отмена</button>
                      <button onClick={saveQuest} className="flex-1 py-3 bg-[#5c4a33] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                        {selectedQuest ? 'Сохранить' : 'Создать запрос'}
                      </button>
                    </>
                  ) : selectedQuest && (
                    <>
                      <button 
                        onClick={() => deleteQuest(selectedQuest.id)} 
                        className={cn(
                          "p-4 rounded-xl transition-all flex items-center gap-2",
                          selectedQuest.deleteRequestedBy === currentUser 
                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                            : "bg-red-50 text-red-500 hover:bg-red-100 shadow-sm"
                        )}
                        disabled={selectedQuest.deleteRequestedBy === currentUser}
                      >
                        <Trash2 size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {selectedQuest.deleteRequestedBy ? (selectedQuest.deleteRequestedBy === currentUser ? 'Ожидаем партнера' : 'Подтвердить удаление') : 'Удалить'}
                        </span>
                      </button>
                      <div className="flex-1 flex gap-4">
                        <button onClick={() => setIsEditing(true)} className="flex-1 py-3 bg-white border-2 border-[#e6d5bc] text-[#5c4a33] font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-[#fdfaf3] transition-all flex items-center justify-center gap-2">
                          <Edit3 size={18} /> Редактировать
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
