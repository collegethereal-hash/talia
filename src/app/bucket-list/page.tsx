'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/Card";
import { 
  CheckSquare, Star, Trophy, Target, Plus, X, Edit3, Save, Trash2, Gift, 
  Sparkles, ChevronRight, MapPin, Calendar, ListChecks, ShieldCheck, 
  Heart, User, Clock, CheckCircle2, Coins, Trees, Moon, Camera, Film, Mic,
  RefreshCw, Send, Tv, CupSoda, Smartphone, Candy, Clapperboard, HelpCircle, Settings2, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';
import { sendTelegramNotification, BASE_URL } from '@/lib/telegram';

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
  completedAt?: string | null;
  isSinglePlayer?: boolean;
}

interface Reward {
  id: string;
  title: string;
  cost: number;
  unlocked: boolean;
  icon: string;
  target: 'Grinch' | 'Cindy' | 'Both';
}

const INITIAL_QUESTS: Quest[] = [];

const INITIAL_REWARDS: Reward[] = [
  // Grinch's rewards (Target: Grinch)
  { id: 'rg1', title: 'Посмотреть 30 минут фильма/сериала', cost: 500, unlocked: false, icon: 'tv', target: 'Grinch' },
  { id: 'rg2', title: 'Зайти в телеграмм', cost: 1000, unlocked: false, icon: 'send', target: 'Grinch' },
  { id: 'rg3', title: 'Молочный коктейль', cost: 10000, unlocked: false, icon: 'cupsoda', target: 'Grinch' },
  
  // Cindy's rewards (Target: Cindy)
  { id: 'rc1', title: 'Тикток 30 мин', cost: 500, unlocked: false, icon: 'smartphone', target: 'Cindy' },
  { id: 'rc2', title: 'Ютуб час', cost: 1500, unlocked: false, icon: 'tv', target: 'Cindy' },
  { id: 'rc3', title: 'Киндер буэно', cost: 10000, unlocked: false, icon: 'candy', target: 'Cindy' },

  // Both
  { id: 'rb1', title: 'Посмотреть совместно фильм', cost: 3000, unlocked: false, icon: 'clapperboard', target: 'Both' },
];

function getRewardCostById(rewardId: string, customReward?: Reward | null): number {
  if (rewardId === 'custom_reward_id') {
    return customReward?.cost ?? 1000;
  }
  const reward = INITIAL_REWARDS.find(r => r.id === rewardId);
  return reward?.cost ?? 0;
}

function calculateSpentPoints(unlockedIds: string[], customReward?: Reward | null): number {
  return unlockedIds.reduce((acc, id) => acc + getRewardCostById(id, customReward), 0);
}

const OWNER_LABELS: Record<'Grinch' | 'Cindy', string> = {
  Grinch: 'Гринча',
  Cindy: 'Синди Лу',
};

export default function BucketListPage() {
  const { 
    currentUser, quests, setQuests, refreshQuests, profiles, 
    promocodes, setPromocodes, refreshPromocodes,
    unlockedRewards, setUnlockedRewards, refreshUnlockedRewards 
  } = useData();
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [customReward, setCustomReward] = useState<Reward | null>(null);
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customRewardEdit, setCustomRewardEdit] = useState({ title: '', cost: 1000 });
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Quest>>({});
  const [purchasedReward, setPurchasedReward] = useState<Reward | null>(null);
  const [completedFilter, setCompletedFilter] = useState<'today' | '7days' | '1month' | '6months'>('today');
  const [rewardTab, setRewardTab] = useState<'Grinch' | 'Cindy'>('Grinch');
  const [promoInput, setPromoInput] = useState('');
  const [promoModal, setPromoModal] = useState<{isOpen: boolean, promo: string | null, rewardTitle: string | null}>({isOpen: false, promo: null, rewardTitle: null});
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [partnerPromoModal, setPartnerPromoModal] = useState<'Grinch' | 'Cindy' | null>(null);
  const [showSingleQuestAlert, setShowSingleQuestAlert] = useState(false);
  const [, setForceRender] = useState({});

  useEffect(() => {
    fetchRewards();
    fetchCustomReward();
  }, [currentUser, unlockedRewards]);

  const fetchCustomReward = async () => {
    const { data } = await supabase.from('global_state').select('value').eq('key', 'custom_reward').single();
    if (data && data.value) {
      setCustomReward(data.value);
      setCustomRewardEdit({ title: data.value.title, cost: data.value.cost });
    }
  };

  const saveCustomReward = async () => {
    const newCustom = {
      id: 'custom_reward_id',
      title: customRewardEdit.title || 'Ваша награда',
      cost: customRewardEdit.cost,
      icon: '❓',
      target: 'Both' as const,
      unlocked: (unlockedRewards[currentUser || ''] || []).includes('custom_reward_id')
    };
    
    const { error } = await supabase.from('global_state').upsert({ key: 'custom_reward', value: newCustom });
    if (!error) {
      setCustomReward(newCustom);
      setIsEditingCustom(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setForceRender({});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchRewards = () => {
    if (!currentUser) return;
    const userUnlocked = unlockedRewards[currentUser] || [];
    setRewards(prev => prev.map(r => ({ ...r, unlocked: userUnlocked.includes(r.id) })));
  };

  const toggleQuest = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const quest = quests.find(q => q.id === id);
    if (!quest) return;

    // Check if it's past 30 minutes
    if (quest.completed && quest.completedAt) {
      const timeSince = new Date().getTime() - new Date(quest.completedAt).getTime();
      if (timeSince >= 30 * 60 * 1000) return; // Cannot toggle after 30 mins
    }

    const updated = { ...quest };

    if (updated.isSinglePlayer) {
      // Только автор может завершить свой одиночный квест
      if (quest.proposedBy !== currentUser) {
        setShowSingleQuestAlert(true);
        return;
      }
      updated.completed = !updated.completed;
      if (currentUser === 'Grinch') updated.completedByGrinch = updated.completed;
      if (currentUser === 'Cindy') updated.completedByCindy = updated.completed;
    } else {
      if (currentUser === 'Grinch') updated.completedByGrinch = !updated.completedByGrinch;
      if (currentUser === 'Cindy') updated.completedByCindy = !updated.completedByCindy;
      updated.completed = updated.completedByGrinch && updated.completedByCindy;
    }

    updated.completedAt = updated.completed ? new Date().toISOString() : null;

    // Optimistic update
    setQuests(quests.map(q => q.id === id ? updated : q));

    const { error } = await supabase
      .from('bucket_list')
      .update({
        completed_by_grinch: updated.completedByGrinch,
        completed_by_cindy: updated.completedByCindy,
        is_completed: updated.completed,
        completed_at: updated.completedAt
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
      categoryColor: CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)],
      isSinglePlayer: false
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const saveQuest = async () => {
    if (!currentUser) return;

    const questData = {
      title: editData.title || 'Новый квест',
      description: editData.description || '',
      points: Math.min(100000, Math.max(0, editData.points || 500)),
      category: editData.category || 'Общее',
      category_color: editData.categoryColor || CATEGORY_COLORS[0],
      proposed_by: currentUser,
      approved_by_partner: selectedQuest ? selectedQuest.approvedByPartner : (editData.isSinglePlayer || false),
      date: new Date().toISOString().split('T')[0],
      is_single_player: editData.isSinglePlayer || false
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
      } else {
        // Уведомление о новом квесте
        const partner = currentUser === 'Grinch' ? 'Cindy' : 'Grinch';
        const partnerName = currentUser === 'Grinch' ? 'Синди Лу' : 'Гринч';
        const myName = currentUser === 'Grinch' ? 'Гринч' : 'Синди Лу';
        
        await sendTelegramNotification(
          `📜 *У нас новое приключение!*\n\n` +
          `${myName} добавил(а) новый квест. Зайди на сайт, чтобы узнать, что это! 😉\n\n` +
          `🔗 [Открыть Квесты](${BASE_URL}/bucket-list)`,
          partner
        );
      }
    }

    refreshQuests();
    setIsModalOpen(false);
  };

  const deleteQuest = async (id: string) => {
    if (!currentUser) return;
    
    const quest = quests.find(q => q.id === id);
    if (!quest) return;

    // Single player quests OR quests I proposed myself — instant delete, no partner needed
    if (quest.isSinglePlayer || quest.proposedBy === currentUser) {
      const { error } = await supabase
        .from('bucket_list')
        .delete()
        .eq('id', id);
      
      if (error) console.error('Error deleting quest:', error);
      refreshQuests();
      setIsModalOpen(false);
      return;
    }

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

    const profile = profiles[currentUser];
    if (!profile) {
      setPromoError('Профиль не загружен. Попробуйте обновить страницу.');
      return;
    }

    const totalPoints = quests.filter(q => q.completed).reduce((acc, q) => acc + (q.points || 0), 0);
    const unlockedIds = unlockedRewards[currentUser] || [];
    const spentPoints = calculateSpentPoints(unlockedIds, customReward);
    const realXP = Math.max(0, totalPoints - spentPoints);

    if (realXP >= reward.cost) {
      const newUnlockedIds = [...unlockedIds, reward.id];
      const newGlobalUnlockedRewards = { ...unlockedRewards, [currentUser]: newUnlockedIds };

      const { error } = await supabase
        .from('global_state')
        .upsert({ key: 'unlocked_rewards', value: newGlobalUnlockedRewards });

      if (error) {
        console.error('Error unlocking reward:', error);
        setPromoError(`Ошибка при покупке: ${error.message || 'неизвестная ошибка'}`);
      } else {
        setUnlockedRewards(newGlobalUnlockedRewards);
        
        // Уведомление о покупке награды
        const myName = currentUser === 'Grinch' ? 'Гринч' : 'Синди Лу';
        await sendTelegramNotification(
          `🎁 *${myName} купил(а) награду!*\n\n` +
          `Интересно, что там? Зайди в Лавку, чтобы посмотреть! 🛍\n\n` +
          `🔗 [Открыть Лавку](${BASE_URL}/bucket-list)`,
          'Both'
        );

        // Мы не устанавливаем unlocked: true локально в состоянии rewards, 
        // так как теперь можно покупать многократно. 
        // Но fetchRewards обновит состояние наград на основе unlockedRewards.
        
        const generateCode = () => {
           const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
           let result = '';
           for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
           return result;
        };
        const code = generateCode();
        const newPromocodes = { ...promocodes, [code]: { rewardId: reward.id, title: reward.title, owner: currentUser, date: new Date().toISOString() } };
        
        const { error: promoError } = await supabase.from('global_state').upsert({ key: 'promocodes', value: newPromocodes });
        if (promoError) {
          console.error('Error saving promocode:', promoError);
        }
        refreshPromocodes();
        
        setPromoModal({ isOpen: true, promo: code, rewardTitle: reward.title });
      }
    } else {
      setPromoError(`Недостаточно монет! У вас ${realXP}, нужно ${reward.cost}.`);
    }
  };

  const applyPromocode = async () => {
    const code = promoInput.trim().toUpperCase();
    if (code.length === 0) {
      setPromoError('Промокод не может быть пустым!');
      return;
    }

    const promo = promocodes[code];
    if (!promo) {
      setPromoError('Неверный промокод или он уже использован!');
      return;
    }

    if (promo.owner !== currentUser) {
      setPartnerPromoModal(promo.owner);
      return;
    }

    setPromoSuccess(promo.title);

    const myName = currentUser === 'Grinch' ? 'Гринч' : 'Синди Лу';
    const partner = currentUser === 'Grinch' ? 'Cindy' : 'Grinch';
    await sendTelegramNotification(
      `✨ *Промокод активирован!*\n\n` +
      `👤 *${myName}* использовал(а) промокод на награду:\n` +
      `🎁 *${promo.title}*\n\n` +
      `Пора выполнять обещание! 😉`,
      partner
    );

    const newPromocodes = { ...promocodes };
    delete newPromocodes[code];
    await supabase.from('global_state').upsert({ key: 'promocodes', value: newPromocodes });
    setPromocodes(newPromocodes);
    setPromoInput('');
  };

  const totalPoints = quests.filter(q => q.completed).reduce((acc, q) => acc + q.points, 0);
  const userUnlockedIds = unlockedRewards[currentUser || ''] || [];
  const spentPoints = calculateSpentPoints(userUnlockedIds, customReward);
  const currentXP = Math.max(0, totalPoints - spentPoints);
  const level = Math.floor(totalPoints / 1000) + 1;

  const pendingApprovals = quests.filter(q => !q.approvedByPartner && q.proposedBy !== currentUser && !q.isSinglePlayer);
  const myQuests = quests.filter(q => q.approvedByPartner || q.proposedBy === currentUser || q.isSinglePlayer);

  const now = new Date().getTime();

  const activeQuests = myQuests.filter(q => {
     if (!q.completed) return true;
     if (!q.completedAt) return true; 
     const timeSince = now - new Date(q.completedAt).getTime();
     return timeSince < 30 * 60 * 1000;
  });

  const completedQuestsRaw = myQuests.filter(q => {
     if (!q.completed || !q.completedAt) return false;
     const timeSince = now - new Date(q.completedAt).getTime();
     return timeSince >= 30 * 60 * 1000;
  });

  const completedQuests = completedQuestsRaw.filter(q => {
    if (!q.completedAt) return false;
    const timeSince = now - new Date(q.completedAt).getTime();
    const daysSince = timeSince / (1000 * 60 * 60 * 24);
    if (completedFilter === 'today') return daysSince < 1;
    if (completedFilter === '7days') return daysSince <= 7;
    if (completedFilter === '1month') return daysSince <= 30;
    if (completedFilter === '6months') return daysSince <= 180;
    return true;
  });

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

      {/* Promo Success Popup */}
      <AnimatePresence>
        {promoSuccess && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-[#fdfaf3] p-8 rounded-[3rem] border-8 border-emerald-200 shadow-2xl max-w-sm text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Gift size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black text-[#5c4a33]">Поздравляем!</h3>
                <p className="text-[#8b7355] mt-2 font-medium">Теперь у вас есть право использовать награду:</p>
                <p className="text-xl font-black text-emerald-600 mt-4 px-4 py-3 bg-emerald-50 rounded-2xl border-2 border-emerald-100">{promoSuccess}</p>
              </div>
              <button onClick={() => setPromoSuccess(null)} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-emerald-600 transition-colors">
                Супер!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Partner promo blocked popup */}
      <AnimatePresence>
        {partnerPromoModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPartnerPromoModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-[#fdfaf3] p-8 rounded-[3rem] border-8 border-amber-200 shadow-2xl max-w-sm text-center space-y-6">
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Lock size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black text-[#5c4a33]">Чужой промокод</h3>
                <p className="text-[#8b7355] mt-2 font-medium">
                  Этот промокод принадлежит <span className="font-bold text-[#5c4a33]">{OWNER_LABELS[partnerPromoModal]}</span>. Только владелец может его активировать!
                </p>
              </div>
              <button onClick={() => setPartnerPromoModal(null)} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-amber-600 transition-colors">
                Понятно
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single Player Quest Warning Popup */}
      <AnimatePresence>
        {showSingleQuestAlert && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSingleQuestAlert(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-[#fdfaf3] p-8 rounded-[3rem] border-8 border-amber-200 shadow-2xl max-w-sm text-center space-y-6">
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black text-[#5c4a33]">Одиночный квест</h3>
                <p className="text-[#8b7355] mt-2 font-medium">Это задание предназначено только для автора. Его нельзя выполнить за другого! ✨</p>
              </div>
              <button onClick={() => setShowSingleQuestAlert(false)} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-amber-600 transition-colors">
                Понятно
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promo Error Popup */}
      <AnimatePresence>
        {promoError && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-[#fdfaf3] p-8 rounded-[3rem] border-8 border-red-200 shadow-2xl max-w-sm text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <X size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black text-[#5c4a33]">Упс...</h3>
                <p className="text-[#8b7355] mt-2 font-medium">{promoError}</p>
              </div>
              <button onClick={() => setPromoError(null)} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-red-600 transition-colors">
                Попробовать снова
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promo Success (From Purchase) Popup */}
      <AnimatePresence>
        {promoModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-[#fdfaf3] p-8 rounded-[3rem] border-8 border-purple-200 shadow-2xl max-w-sm text-center space-y-6">
              <div className="w-20 h-20 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black text-[#5c4a33]">Награда получена!</h3>
                <p className="text-[#8b7355] mt-2 font-medium">Ваш промокод на <span className="font-bold text-purple-600">{promoModal.rewardTitle}</span>:</p>
                <div className="mt-4 p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
                  <p className="text-4xl font-black text-purple-600 tracking-widest">{promoModal.promo}</p>
                </div>
                <p className="text-xs text-[#8b7355] mt-4 opacity-70">Сохраните его и используйте на сайте, когда захотите активировать награду.</p>
              </div>
              <button onClick={() => setPromoModal({isOpen: false, promo: null, rewardTitle: null})} className="w-full py-4 bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-purple-600 transition-colors">
                Отлично!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                        {quest.completed && quest.completedAt && (
                          <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-red-100/50 rounded-xl border border-red-200">
                             <Clock size={14} className="text-red-400" />
                             <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">До завершения: {Math.max(0, Math.floor((30 * 60 * 1000 - (new Date().getTime() - new Date(quest.completedAt).getTime())) / 60000))} мин</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t-4 border-[#e6d5bc]/30 mt-auto">
                        <div className="flex -space-x-3">
                          {quest.isSinglePlayer ? (
                            <button
                              onClick={(e) => toggleQuest(quest.id, e)}
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all border-4 shadow-md relative z-10 hover:scale-110",
                                quest.completed ? "bg-[#84cc16] border-white text-white" : "bg-[#fdfaf3] border-[#e6d5bc] text-[#e6d5bc]"
                              )}
                            >
                              <span className="font-black text-xs">{quest.proposedBy.charAt(0)}</span>
                              {quest.completed && <CheckCircle2 size={16} className="absolute -bottom-1 -right-1 text-white bg-[#84cc16] rounded-full" />}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => toggleQuest(quest.id, e)}
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center transition-all border-4 shadow-md relative z-10 hover:scale-110",
                                  quest.completedByGrinch ? "bg-[#84cc16] border-white text-white" : "bg-[#fdfaf3] border-[#e6d5bc] text-[#e6d5bc]"
                                )}
                              >
                                <span className="font-black text-xs">G</span>
                                {quest.completedByGrinch && <CheckCircle2 size={16} className="absolute -bottom-1 -right-1 text-white bg-[#84cc16] rounded-full" />}
                              </button>
                              <button
                                onClick={(e) => toggleQuest(quest.id, e)}
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center transition-all border-4 shadow-md relative z-0 hover:scale-110",
                                  quest.completedByCindy ? "bg-[#ec4899] border-white text-white" : "bg-[#fdfaf3] border-[#e6d5bc] text-[#e6d5bc]"
                                )}
                              >
                                <span className="font-black text-xs">C</span>
                                {quest.completedByCindy && <CheckCircle2 size={16} className="absolute -bottom-1 -right-1 text-white bg-[#ec4899] rounded-full" />}
                              </button>
                            </>
                          )}
                        </div>
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

          {/* Completed Quests Section */}
          {completedQuestsRaw.length > 0 && (
            <div className="space-y-8 pt-12 border-t-8 border-[#e6d5bc]/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#e6d5bc] pb-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl border-4 border-[#e6d5bc]">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-black text-[#5c4a33]">Выполненные квесты</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Наши пройденные пути</p>
                  </div>
                </div>
                
                <div className="flex gap-2 p-1.5 bg-white border-4 border-[#e6d5bc] rounded-2xl shadow-inner overflow-x-auto">
                  {(['today', '7days', '1month', '6months'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setCompletedFilter(filter)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                        completedFilter === filter ? "bg-[#5c4a33] text-[#fdfaf3] shadow-lg" : "text-[#8b7355] hover:bg-[#e6d5bc]/30"
                      )}
                    >
                      {filter === 'today' && 'Сегодня'}
                      {filter === '7days' && '7 дней'}
                      {filter === '1month' && 'Месяц'}
                      {filter === '6months' && 'Полгода'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 opacity-70">
                <AnimatePresence mode="popLayout">
                  {completedQuests.map((quest) => (
                    <motion.div
                      key={quest.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => openQuest(quest)}
                      className="cursor-pointer group"
                    >
                      <div className="relative p-1 bg-[#e6d5bc] rounded-[2.5rem] shadow-sm h-full">
                        <div className="bg-[#fdfaf3] rounded-[2.3rem] p-6 md:p-8 border-4 border-[#e6d5bc] relative overflow-hidden space-y-6 h-full flex flex-col grayscale-[0.3]">
                          <div className="flex justify-between items-start pt-4">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border-4 shadow-sm",
                              quest.categoryColor.bg,
                              quest.categoryColor.text,
                              quest.categoryColor.border
                            )}>
                              {quest.category}
                            </span>
                            <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner border-2 border-emerald-200">
                              <CheckCircle2 size={20} strokeWidth={2.5} />
                            </div>
                          </div>

                          <div className="space-y-3 flex-1">
                            <h3 className="text-2xl font-serif font-black leading-tight text-[#5c4a33] line-through opacity-70">
                              {quest.title}
                            </h3>
                            <p className="text-[#8b7355] italic font-serif text-sm line-clamp-2 leading-relaxed opacity-70">
                              {quest.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {completedQuests.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-[#8b7355] italic font-serif">За выбранный период квестов не найдено...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Reward Shop at the bottom */}
        <section className="space-y-10 pt-16 border-t-8 border-[#e6d5bc]/30">
          <div className="flex flex-col items-center gap-6 border-b-8 border-[#e6d5bc] pb-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-purple-500 text-white flex items-center justify-center shadow-2xl border-4 border-[#e6d5bc]">
                <Gift size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-black text-[#5c4a33]">Лавка Наград</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Трофеи наших странствий</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex gap-2 p-1.5 bg-white border-4 border-[#e6d5bc] rounded-2xl shadow-inner">
                <button
                  onClick={() => setRewardTab('Grinch')}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    rewardTab === 'Grinch' ? "bg-purple-500 text-white shadow-lg" : "text-[#8b7355] hover:bg-purple-50"
                  )}
                >
                  Для Гринча
                </button>
                <button
                  onClick={() => setRewardTab('Cindy')}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    rewardTab === 'Cindy' ? "bg-purple-500 text-white shadow-lg" : "text-[#8b7355] hover:bg-purple-50"
                  )}
                >
                  Для Синди
                </button>
              </div>
              
              <div className="flex items-center gap-4 bg-white border-4 border-[#e6d5bc] rounded-2xl px-6 py-3 shadow-xl">
                 <Coins size={24} className="text-amber-500" fill="currentColor" />
                 <span className="text-3xl font-serif font-black text-[#5c4a33]">{currentXP}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-full mx-auto">
            {(() => {
              const displayRewards = rewards.filter(r => r.target === 'Both' || r.target === rewardTab);
              const middleIndex = Math.floor(displayRewards.length / 2);
              
              const allCards = [...displayRewards];
              // We'll use a special marker to know where to render the custom card
              allCards.splice(middleIndex, 0, { id: 'custom_marker' } as any);
              
              return allCards.map((reward, idx) => {
                if (reward.id === 'custom_marker') {
                  return (
                    <motion.div
                      key="custom_reward_card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div                       className={cn(
                        "relative p-1 bg-purple-200 rounded-[2rem] shadow-lg h-full transition-all hover:scale-105"
                      )}>
                        <div className="bg-[#fdfaf3] p-4 sm:p-5 rounded-[1.8rem] border-2 border-purple-200 space-y-4 h-full flex flex-col items-center text-center bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] relative overflow-hidden">
                          
                          {/* Settings Button */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsEditingCustom(true); }}
                            className="absolute top-2 right-2 p-2 rounded-full bg-white border-2 border-purple-200 text-purple-400 hover:text-purple-600 z-30 transition-colors"
                          >
                            <Settings2 size={16} />
                          </button>

                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border-2 bg-white border-purple-200 text-purple-600 relative z-10">
                            <HelpCircle size={32} />
                          </div>
                          
                          <div className="flex-1 space-y-2 relative z-10 w-full">
                            {isEditingCustom ? (
                              <div className="space-y-2">
                                <input 
                                  value={customRewardEdit.title}
                                  onChange={e => setCustomRewardEdit({ ...customRewardEdit, title: e.target.value })}
                                  className="w-full bg-white border-2 border-purple-200 rounded-lg px-2 py-1 text-xs font-serif text-[#5c4a33] focus:outline-none"
                                  placeholder="Название..."
                                  autoFocus
                                />
                                <div className="flex items-center gap-2">
                                  <Coins size={10} className="text-amber-500" />
                                  <input 
                                    type="number"
                                    value={customRewardEdit.cost}
                                    onChange={e => setCustomRewardEdit({ ...customRewardEdit, cost: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white border-2 border-purple-200 rounded-lg px-2 py-1 text-[10px] font-black text-[#5c4a33] focus:outline-none"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={saveCustomReward} className="flex-1 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase rounded-md">Ок</button>
                                  <button onClick={() => setIsEditingCustom(false)} className="flex-1 py-1 bg-gray-400 text-white text-[8px] font-black uppercase rounded-md">X</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h4 className="font-serif font-black text-sm text-[#5c4a33] leading-tight px-1">
                                  {customReward?.title || 'Сюрприз'}
                                </h4>
                                <div className="flex items-center justify-center gap-1 text-amber-600">
                                  <Coins size={12} fill="currentColor" className="opacity-40" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{customReward?.cost || 1000}</span>
                                </div>
                              </>
                            )}
                          </div>

                          {!isEditingCustom && (
                            <button 
                              onClick={() => unlockReward(customReward || { id: 'custom_reward_id', title: 'Сюрприз', cost: 1000, icon: '❓', target: 'Both', unlocked: false })}
                              disabled={currentXP < (customReward?.cost || 1000)}
                              className={cn(
                                "w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md border-2 relative z-20",
                                currentXP >= (customReward?.cost || 1000)
                                  ? "bg-purple-600 border-purple-600 text-white hover:bg-purple-700 hover:scale-105 active:scale-95 cursor-pointer" 
                                  : "bg-purple-100 border-purple-200 text-purple-300 cursor-not-allowed"
                              )}
                            >
                              {currentXP >= (customReward?.cost || 1000) ? 'Купить' : 'Мало монет'}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div 
                    key={reward.id}
                    whileHover={!reward.unlocked && currentXP >= reward.cost && (reward.target === 'Both' || reward.target === currentUser) ? { y: -5 } : {}}
                  >
                    <div className="relative p-1 bg-[#e6d5bc] rounded-[2rem] shadow-lg h-full transition-all">
                      <div className="bg-[#fdfaf3] p-4 sm:p-5 rounded-[1.8rem] border-2 border-[#e6d5bc] space-y-4 h-full flex flex-col items-center text-center bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#e6d5bc]/40 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[#e6d5bc]/40 to-transparent rounded-tr-full pointer-events-none" />
                        
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border-2 relative z-10",
                          "bg-white border-[#e6d5bc] text-[#5c4a33]"
                        )}>
                          {reward.icon === 'tv' && <Tv size={32} />}
                          {reward.icon === 'send' && <Send size={32} />}
                          {reward.icon === 'cupsoda' && <CupSoda size={32} />}
                          {reward.icon === 'smartphone' && <Smartphone size={32} />}
                          {reward.icon === 'candy' && <Candy size={32} />}
                          {reward.icon === 'clapperboard' && <Clapperboard size={32} />}
                          {reward.icon === 'sparkles' && <Sparkles size={32} />}
                          {reward.icon === '❓' && <HelpCircle size={32} />}
                        </div>
                        <div className="flex-1 space-y-2 relative z-10 w-full">
                          <h4 className="font-serif font-black text-sm text-[#5c4a33] leading-tight px-1">
                            {reward.title}
                          </h4>
                          <div className="flex items-center justify-center gap-1 text-amber-600">
                            <Coins size={12} fill="currentColor" className="opacity-40" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{reward.cost}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => unlockReward(reward)}
                          disabled={currentXP < reward.cost || (reward.target !== 'Both' && reward.target !== currentUser)}
                          className={cn(
                            "w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md border-2 relative z-20",
                            (reward.target !== 'Both' && reward.target !== currentUser) 
                                ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed" 
                                : (currentXP >= reward.cost 
                                    ? "bg-[#5c4a33] border-[#5c4a33] text-[#fdfaf3] hover:bg-[#4a3b29] hover:scale-105 active:scale-95 cursor-pointer" 
                                    : "bg-[#e6d5bc]/30 border-[#e6d5bc] text-[#8b7355]/40 cursor-not-allowed")
                          )}
                        >
                          {(reward.target !== 'Both' && reward.target !== currentUser) ? 'Не для вас' : (currentXP >= reward.cost ? 'Купить' : 'Мало монет')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              });
            })()}
          </div>
        </section>

        {/* Promocode input — below rewards */}
        <section className="relative z-10 flex justify-center pt-8">
          <div className="bg-[#fdfaf3] p-4 rounded-3xl border-4 border-[#e6d5bc] flex items-center gap-4 shadow-xl max-w-md w-full">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Введите промокод"
              className="flex-1 bg-transparent border-none text-[#5c4a33] font-black uppercase tracking-widest px-4 outline-none placeholder:text-[#8b7355]/50"
              maxLength={4}
            />
            <button
              onClick={applyPromocode}
              className="bg-[#5c4a33] text-[#fdfaf3] px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-md"
            >
              Применить
            </button>
          </div>
        </section>

        {/* Promocodes list — own + partner's */}
        <section className="relative z-10 pt-8 border-t-8 border-[#e6d5bc]/30">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl border-4 border-emerald-200">
              <Gift size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black text-[#5c4a33]">Промокоды</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Твои награды и промокоды партнёра</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(promocodes)
              .sort(([_, a]: [string, any], [__, b]: [string, any]) => {
                const aOwn = a.owner === currentUser ? 0 : 1;
                const bOwn = b.owner === currentUser ? 0 : 1;
                return aOwn - bOwn;
              })
              .map(([code, data]: [string, any]) => {
                const isOwn = data.owner === currentUser;
                const ownerLabel = OWNER_LABELS[data.owner as 'Grinch' | 'Cindy'] || data.owner;

                return (
                  <motion.div
                    key={code}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-8 rounded-[3rem] border-4 shadow-xl relative overflow-hidden group",
                      isOwn
                        ? "bg-[#fdfaf3] border-[#e6d5bc]"
                        : data.owner === 'Cindy'
                          ? "bg-pink-50/80 border-pink-200 border-dashed opacity-90"
                          : "bg-emerald-50/80 border-emerald-200 border-dashed opacity-90"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-all group-hover:scale-110",
                      isOwn ? "bg-emerald-50" : data.owner === 'Cindy' ? "bg-pink-100/50" : "bg-emerald-100/50"
                    )} />
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                            isOwn
                              ? "text-emerald-600 bg-emerald-50"
                              : data.owner === 'Cindy'
                                ? "text-pink-600 bg-pink-100"
                                : "text-emerald-700 bg-emerald-100"
                          )}>
                            {isOwn ? 'Твой' : `Промокод ${ownerLabel}`}
                          </span>
                          <h4 className="text-xl font-serif font-black text-[#5c4a33]">{data.title}</h4>
                        </div>
                        <div className={isOwn ? "text-emerald-500" : "text-[#8b7355]/50"}>
                          {isOwn ? <Trophy size={24} /> : <Lock size={24} />}
                        </div>
                      </div>

                      <div className={cn(
                        "bg-white border-4 rounded-2xl p-6 text-center transition-colors",
                        isOwn
                          ? "border-dashed border-[#e6d5bc] group-hover:border-emerald-300"
                          : "border-dotted border-[#e6d5bc]/60"
                      )}>
                        <span className={cn(
                          "text-3xl font-mono font-black tracking-[0.3em]",
                          isOwn ? "text-[#5c4a33]" : "text-[#8b7355]/70"
                        )}>{code}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#8b7355]/40">
                        <span>{data.date ? new Date(data.date).toLocaleDateString('ru-RU') : 'Недавно'}</span>
                        {isOwn ? (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(code);
                              alert('Промокод скопирован!');
                            }}
                            className="text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            Копировать
                          </button>
                        ) : (
                          <span className="text-[#8b7355]/50 italic normal-case tracking-normal text-[11px]">Только для {ownerLabel}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

            {Object.entries(promocodes).length === 0 && (
              <div className="col-span-full py-20 text-center bg-white/30 rounded-[3rem] border-4 border-dashed border-[#e6d5bc]">
                <div className="w-20 h-20 bg-[#e6d5bc]/20 text-[#8b7355]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gift size={40} />
                </div>
                <p className="text-[#8b7355] font-serif italic text-xl">Промокодов пока нет... Пора за покупками! 😉</p>
              </div>
            )}
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
                        <label className="text-[10px] uppercase font-black text-[#8b7355] px-4">Награда (Монеты)</label>
                        <input 
                          type="number"
                          value={editData.points}
                          onChange={e => {
                            const val = Math.min(100000, Math.max(0, parseInt(e.target.value) || 0));
                            setEditData({...editData, points: val});
                          }}
                          className="w-full bg-white border-4 border-[#e6d5bc] rounded-xl px-4 py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-black text-[#5c4a33] text-sm tracking-widest"
                          placeholder="До 100 000"
                        />
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

                    {!selectedQuest && (
                      <div className="flex items-center gap-3 px-4 pt-4">
                        <input 
                          type="checkbox" 
                          id="singlePlayer"
                          checked={editData.isSinglePlayer || false} 
                          onChange={e => setEditData({...editData, isSinglePlayer: e.target.checked})}
                          className="w-6 h-6 rounded-lg text-[#5c4a33] focus:ring-[#5c4a33] border-2 border-[#e6d5bc]"
                        />
                        <label htmlFor="singlePlayer" className="text-sm font-black text-[#5c4a33] cursor-pointer">
                          Одиночный квест (выполняю только я)
                        </label>
                      </div>
                    )}
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
                  ) : selectedQuest && (() => {
                    const isCompletedAndLocked = selectedQuest.completed && selectedQuest.completedAt && 
                      (new Date().getTime() - new Date(selectedQuest.completedAt).getTime()) >= 30 * 60 * 1000;
                    const canInstantDelete = selectedQuest.isSinglePlayer || selectedQuest.proposedBy === currentUser;
                    const isAuthor = selectedQuest.proposedBy === currentUser;
                    
                    return (
                    <>
                      {!isCompletedAndLocked && (isAuthor || !selectedQuest.isSinglePlayer) && (
                        <button 
                          onClick={() => deleteQuest(selectedQuest.id)} 
                          className={cn(
                            "p-5 rounded-2xl transition-all flex items-center gap-4 border-4",
                            !canInstantDelete && selectedQuest.deleteRequestedBy === currentUser 
                              ? "bg-[#e6d5bc]/20 border-[#e6d5bc] text-[#8b7355]/40 cursor-not-allowed" 
                              : "bg-red-50 border-red-100 text-red-500 hover:bg-red-100 shadow-xl"
                          )}
                          disabled={!canInstantDelete && selectedQuest.deleteRequestedBy === currentUser}
                        >
                          <Trash2 size={24} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {canInstantDelete ? 'Удалить' : (selectedQuest.deleteRequestedBy ? (selectedQuest.deleteRequestedBy === currentUser ? 'Ждем Клятвы' : 'Подтвердить') : 'Удалить')}
                          </span>
                        </button>
                      )}
                      {!isCompletedAndLocked && isAuthor && (
                        <div className="flex-1 flex gap-4">
                          <button onClick={() => setIsEditing(true)} className="flex-1 py-4 bg-white border-4 border-[#e6d5bc] text-[#5c4a33] font-black uppercase tracking-widest text-[10px] rounded-2xl hover:border-[#5c4a33] transition-all flex items-center justify-center gap-3">
                            <Edit3 size={20} /> Править
                          </button>
                        </div>
                      )}
                      {isCompletedAndLocked && (
                        <div className="flex-1 flex items-center justify-center py-4 px-6 bg-emerald-50 border-4 border-emerald-200 rounded-2xl">
                          <CheckCircle2 size={20} className="text-emerald-500 mr-3" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Квест завершён навсегда</span>
                        </div>
                      )}
                    </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
