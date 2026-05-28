'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/Card";
import { User, Heart, Lock, Calendar, Smile, Edit3, Save, X, Sparkles, Gift, Info, Plus, Trash2, Mail, Trees, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';

interface ProfileField {
  id: string;
  label: string;
  value: string;
}

interface ProfileCategory {
  id: string;
  title: string;
  emoji: string;
  fields: ProfileField[];
}

interface ProfileData {
  id: string;
  name: string;
  status: string;
  mood: string;
  pref: string;
  avatarColor: string;
  categories: ProfileCategory[];
}

interface TimeCapsule {
  id: string;
  title: string;
  description: string;
  unlockDate: string;
  isLocked: boolean;
  content: string;
  author: 'Grinch' | 'Cindy';
}

const INITIAL_PROFILES: Record<string, ProfileData> = {
  me: { 
    id: 'me',
    name: 'Гринч', 
    status: 'В сети', 
    mood: '😊', 
    pref: 'Твое описание...',
    avatarColor: 'bg-talia-lavender',
    categories: []
  },
  polina: { 
    id: 'polina',
    name: 'Синди Лу', 
    status: 'Отдыхает', 
    mood: '✨', 
    pref: 'Её описание...',
    avatarColor: 'bg-talia-peach',
    categories: []
  },
};

const EMOJI_LIST = ['🎁', '✨', '🌸', '🐱', '🐶', '🎵', '🍕', '✈️', '🏠', '📚', '🎬', '🎨', '🧸', '🌙'];

const INITIAL_CAPSULES: TimeCapsule[] = [];

export default function ProfilePage() {
  const { currentUser, profiles, capsules, whispers, setCapsules, setWhispers, refreshProfiles, refreshCapsules, refreshWhispers } = useData();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState(false);
  const [isEditingCapsule, setIsEditingCapsule] = useState(false);
  const [capsuleEditData, setCapsuleEditData] = useState<Partial<TimeCapsule>>({});

  const [editData, setEditData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasNewWhisper, setHasNewWhisper] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

  useEffect(() => {
    if (currentUser) {
      checkWhisper();
    }
  }, [currentUser]);

  const checkWhisper = async () => {
    if (!currentUser) return;
    const key = currentUser === 'Grinch' ? 'whisper_for_grinch' : 'whisper_for_cindy';
    const { data } = await supabase
      .from('global_state')
      .select('value')
      .eq('key', key)
      .single();

    if (data && data.value) {
      setHasNewWhisper(true);
    }
  };


  const getPresenceStatus = (profile: any) => {
    // Local override for current user to ensure they see themselves as online
    const isMe = (currentUser?.toLowerCase() === 'grinch' && (profile.id === 'Grinch' || profile.id === 'me')) || 
                 (currentUser?.toLowerCase() === 'cindy' && (profile.id === 'Cindy' || profile.id === 'polina'));
    
    if (isMe) return { text: "В сети", online: true };
    
    const lastActive = profile.lastActive;
    if (!lastActive) return { text: "Давно не заглядывал(а)", online: false };
    
    const now = new Date();
    const last = new Date(lastActive);
    const diffInSeconds = Math.floor((now.getTime() - last.getTime()) / 1000);

    if (diffInSeconds < 90) return { text: "В сети", online: true };
    
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return { text: `Был(а) ${mins} мин. назад`, online: false };
    }
    
    if (diffInSeconds < 86400) {
      const hours = last.getHours().toString().padStart(2, '0');
      const mins = last.getMinutes().toString().padStart(2, '0');
      return { text: `Заходил(а) в ${hours}:${mins}`, online: false };
    }

    const day = last.getDate().toString().padStart(2, '0');
    const month = (last.getMonth() + 1).toString().padStart(2, '0');
    return { text: `Был(а) ${day}.${month}`, online: false };
  };

  const openDetails = (id: string) => {
    setSelectedProfileId(id);
    setIsEditing(false);
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedProfileId) {
      setEditData(JSON.parse(JSON.stringify(profiles[selectedProfileId])));
      setIsEditing(true);
    }
  };

  const saveDetails = async () => {
    if (selectedProfileId && editData) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: selectedProfileId,
          name: editData.name,
          status: editData.status,
          mood: editData.mood,
          pref: editData.pref,
          avatar_color: editData.avatarColor,
          categories: editData.categories || []
        });

      if (error) {
        console.error('Error saving profile:', error);
      } else {
        await refreshProfiles();
        setIsEditing(false);
      }
    }
  };

  const addCategory = () => {
    if (editData) {
      const newCategory: ProfileCategory = {
        id: Date.now().toString(),
        title: 'Новая категория',
        emoji: '✨',
        fields: [{ id: Date.now().toString() + '-f', label: 'Новое поле', value: '' }]
      };
      setEditData({ ...editData, categories: [...editData.categories, newCategory] });
    }
  };

  const addField = (categoryId: string) => {
    if (editData) {
      const updatedCategories = editData.categories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            fields: [...cat.fields, { id: Date.now().toString(), label: 'Новое поле', value: '' }]
          };
        }
        return cat;
      });
      setEditData({ ...editData, categories: updatedCategories });
    }
  };

  const removeField = (categoryId: string, fieldId: string) => {
    if (editData) {
      const updatedCategories = editData.categories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            fields: cat.fields.filter(f => f.id !== fieldId)
          };
        }
        return cat;
      });
      setEditData({ ...editData, categories: updatedCategories });
    }
  };

  const removeCategory = (categoryId: string) => {
    if (editData) {
      setEditData({
        ...editData,
        categories: editData.categories.filter(cat => cat.id !== categoryId)
      });
    }
  };

  // Time Capsule Functions
  const openCapsule = (capsule: TimeCapsule) => {
    const isUnlocked = new Date(capsule.unlockDate) <= new Date();
    setSelectedCapsule({ ...capsule, isLocked: !isUnlocked });
    setIsCapsuleModalOpen(true);
    setIsEditingCapsule(false);
  };

  const startCreateCapsule = () => {
    setCapsuleEditData({
      title: '',
      description: '',
      unlockDate: new Date().toISOString().split('T')[0],
      content: ''
    });
    setIsEditingCapsule(true);
    setIsCapsuleModalOpen(true);
    setSelectedCapsule(null);
  };

  const startEditCapsule = (capsule: TimeCapsule) => {
    setCapsuleEditData(capsule);
    setIsEditingCapsule(true);
  };

  const saveCapsule = async () => {
    try {
      const capsuleData = {
        title: capsuleEditData.title || 'Новая капсула',
        description: capsuleEditData.description || '',
        unlock_date: capsuleEditData.unlockDate || new Date().toISOString().split('T')[0],
        content: capsuleEditData.content || '',
        is_sealed: true,
        author: currentUser
      };

      if (capsuleEditData.id) {
        // Edit existing
        const { error } = await supabase
          .from('time_capsules')
          .update(capsuleData)
          .eq('id', capsuleEditData.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('time_capsules')
          .insert([capsuleData]);

        if (error) throw error;
      }

      await refreshCapsules();
      setIsCapsuleModalOpen(false);
      setIsEditingCapsule(false);
    } catch (err: any) {
      console.error('Detailed Error saving capsule:', err);
      // Better error message
      const msg = err?.message || JSON.stringify(err) || 'Неизвестная ошибка';
      alert(`Ошибка при сохранении капсулы: ${msg}`);
    }
  };

  const deleteCapsule = async (id: string) => {
    const { error } = await supabase
      .from('time_capsules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting capsule:', error);
      alert('Ошибка при удалении капсулы.');
    } else {
      await refreshCapsules();
      setIsCapsuleModalOpen(false);
    }
  };

  const deleteWhisper = async (id: string) => {
    const { error } = await supabase
      .from('whisper_history')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting whisper:', error);
      alert('Ошибка при удалении письма.');
    } else {
      await refreshWhispers();
    }
  };

  const sendHearts = () => {
    const id = Date.now();
    const x = Math.random() * 80 + 10;
    setHearts(prev => [...prev, { id, x }]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 3000);
  };

  const [hasMail, setHasMail] = useState(false);
  const [isMailClaimed, setIsMailClaimed] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    

    const checkMail = async () => {
      const key = currentUser === 'Grinch' ? 'whisper_for_grinch' : 'whisper_for_cindy';
      const { data } = await supabase
        .from('global_state')
        .select('value')
        .eq('key', key)
        .single();
        
      setHasMail(!!(data && data.value));
    };

    checkMail();
    const interval = setInterval(checkMail, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const claimMail = () => {
    if (!hasMail) return;
    setIsMailClaimed(true);
    setTimeout(() => {
      window.location.href = '/journal?openWhisper=true';
    }, 1500);
  };

  const selectedProfile = selectedProfileId ? profiles[selectedProfileId] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-12 pb-32 space-y-20 relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-0" />
      
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ y: '100vh', opacity: 1, scale: 0.5 }}
            animate={{ y: '-10vh', opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute text-[#e6d5bc] pointer-events-none z-[60]"
            style={{ left: `${heart.x}%` }}
          >
            <Heart fill="currentColor" size={48} />
          </motion.div>
        ))}
      </AnimatePresence>

      <header className="text-center space-y-6 relative z-10">
        <div className="inline-block relative">
          <h1 className="text-6xl md:text-8xl font-serif font-black text-[#5c4a33] tracking-tighter relative z-10">Наши Отражения</h1>
          <div className="absolute -bottom-2 left-0 w-full h-4 bg-[#e6d5bc]/30 -rotate-1" />
        </div>
        <p className="text-[#8b7355] font-serif italic text-xl">"Мы видим друг друга лучше, чем самих себя"</p>
      </header>

      {/* Incoming Mail - moved to the top */}
      <div className="flex flex-col items-center gap-6 relative z-10">
        <button 
          onClick={claimMail}
          disabled={isMailClaimed || !hasMail}
          className="group relative px-20 py-10 rounded-[3rem] bg-[#5c4a33] text-[#fdfaf3] font-serif font-black text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden border-8 border-[#e6d5bc] flex items-center gap-8 disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <AnimatePresence mode="wait">
            {isMailClaimed ? (
              <motion.div
                key="claimed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex items-center gap-6"
              >
                <Sparkles size={40} className="animate-spin-slow text-[#e6d5bc]" />
                Забираю письмо...
              </motion.div>
            ) : !hasMail ? (
              <motion.div
                key="nomail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex items-center gap-6 opacity-60"
              >
                <Mail size={40} className="text-[#e6d5bc]" />
                Нет новых посланий
              </motion.div>
            ) : (
              <motion.div
                key="unclaimed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex items-center gap-6"
              >
                <Mail fill="currentColor" size={40} className="animate-bounce text-[#e6d5bc]" />
                Послание прибыло!
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        {Object.values(profiles).map((profile: any) => (
          <motion.div
            key={profile.id}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => openDetails(profile.id)}
            className="cursor-pointer group"
          >
            <div className="relative p-1 bg-[#e6d5bc] rounded-[3rem] shadow-2xl">
              <div className="bg-[#fdfaf3] rounded-[2.8rem] p-10 border-4 border-[#e6d5bc] relative overflow-hidden">
                {/* Wood Grain Overlay */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#5c4a33_1px,transparent_1px)] [background-size:20px_20px]" />
                
                <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                  <div className={cn(
                    "w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl border-8 border-white transition-transform duration-500 group-hover:rotate-6 relative overflow-hidden",
                    profile.avatarColor
                  )}>
                    <div className="absolute inset-0 bg-black/10 opacity-50" />
                    <div className="relative z-10 filter drop-shadow-lg">
                      {profile.id === 'Grinch' || profile.id === 'me' ? (
                        <div className="text-amber-200"><Trees size={64} strokeWidth={1.5} /></div>
                      ) : (
                        <div className="text-blue-100"><Moon size={64} strokeWidth={1.5} /></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-4xl font-serif font-black text-[#5c4a33]">{profile.name}</h2>
                    <div className="flex items-center justify-center gap-3">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        getPresenceStatus(profile).online ? "bg-green-400 animate-pulse shadow-[0_0_12px_rgba(74,222,128,0.8)]" : "bg-zinc-300"
                      )} />
                      <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#8b7355]">
                        {getPresenceStatus(profile).text}
                      </p>
                    </div>
                  </div>

                  <div className="w-full pt-8 border-t-2 border-[#e6d5bc]/40">
                    <p className="text-[#8b7355] italic font-serif text-lg leading-relaxed line-clamp-2">
                      "{profile.pref}"
                    </p>
                  </div>

                  <div className="pt-4">
                    <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[10px] font-black uppercase tracking-widest shadow-lg transform group-hover:translate-y-[-2px] transition-transform">
                      Заглянуть в анкету
                      <Sparkles size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProfileId && selectedProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfileId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#fdfaf3] rounded-[3rem] shadow-2xl border-8 border-[#e6d5bc] overflow-hidden"
            >
              {/* Wooden Header Bar */}
              <div className={cn(
                "p-8 flex items-center justify-between text-white border-b-8 border-[#e6d5bc]",
                selectedProfile.avatarColor
              )}>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border-4 border-white/40 overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="relative z-10">
                      {selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? (
                        <div className="text-amber-200"><Trees size={48} strokeWidth={1.5} /></div>
                      ) : (
                        <div className="text-blue-100"><Moon size={48} strokeWidth={1.5} /></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-4xl font-serif font-black tracking-tight">{selectedProfile.name}</h2>
                    <p className="text-sm opacity-80 font-bold uppercase tracking-widest">Дневник приключений</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProfileId(null)}
                  className="w-12 h-12 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all border-2 border-white/20"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-12 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
                {(isEditing ? editData!.categories : selectedProfile.categories).map((category: any) => (
                  <div key={category.id} className="space-y-6 group/cat relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#e6d5bc]/30 flex items-center justify-center text-2xl shadow-inner">
                          {category.emoji}
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <select 
                              value={category.emoji}
                              onChange={(e) => {
                                const updated = editData!.categories.map(c => 
                                  c.id === category.id ? { ...c, emoji: e.target.value } : c
                                );
                                setEditData({ ...editData!, categories: updated });
                              }}
                              className="bg-white border-4 border-[#e6d5bc] rounded-xl p-1 text-xl focus:ring-0"
                            >
                              {EMOJI_LIST.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                            <input 
                              value={category.title}
                              onChange={(e) => {
                                const updated = editData!.categories.map(c => 
                                  c.id === category.id ? { ...c, title: e.target.value } : c
                                );
                                setEditData({ ...editData!, categories: updated });
                              }}
                              className="bg-transparent border-b-2 border-[#e6d5bc] font-serif font-black text-2xl text-[#5c4a33] focus:ring-0 focus:border-[#5c4a33] w-full"
                            />
                          </div>
                        ) : (
                          <h4 className="text-2xl font-serif font-black text-[#5c4a33]">
                            {category.title}
                          </h4>
                        )}
                      </div>
                      {isEditing && (
                        <button 
                          onClick={() => removeCategory(category.id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {category.fields.map((field: any) => (
                        <div key={field.id} className="relative group/field">
                          <DetailItem 
                            label={field.label}
                            value={field.value}
                            isEditing={isEditing}
                            onLabelChange={(val) => {
                              const updated = editData!.categories.map(c => {
                                if (c.id === category.id) {
                                  return {
                                    ...c,
                                    fields: c.fields.map(f => f.id === field.id ? { ...f, label: val } : f)
                                  };
                                }
                                return c;
                              });
                              setEditData({ ...editData!, categories: updated });
                            }}
                            onValueChange={(val) => {
                              const updated = editData!.categories.map(c => {
                                if (c.id === category.id) {
                                  return {
                                    ...c,
                                    fields: c.fields.map(f => f.id === field.id ? { ...f, value: val } : f)
                                  };
                                }
                                return c;
                              });
                              setEditData({ ...editData!, categories: updated });
                            }}
                          />
                          {isEditing && (
                            <button 
                              onClick={() => removeField(category.id, field.id)}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-[#e6d5bc] text-red-400 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all z-10"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button 
                          onClick={() => addField(category.id)}
                          className="p-4 border-4 border-dashed border-[#e6d5bc] rounded-3xl flex items-center justify-center text-[#8b7355]/40 hover:text-[#5c4a33] hover:border-[#5c4a33]/30 transition-all bg-white/50"
                        >
                          <Plus size={24} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isEditing && (
                  <button 
                    onClick={addCategory}
                    className="w-full py-8 border-4 border-dashed border-[#e6d5bc] rounded-[2.5rem] flex flex-col items-center gap-3 text-[#8b7355]/40 hover:text-[#5c4a33] hover:bg-white/50 transition-all"
                  >
                    <Plus size={40} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Добавить главу дневника</span>
                  </button>
                )}

                <div className="pt-8 border-t-4 border-[#e6d5bc] flex justify-end gap-4">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-8 py-4 rounded-2xl bg-[#e6d5bc]/20 text-[#8b7355] font-black uppercase tracking-widest text-[10px] hover:bg-[#e6d5bc]/40 transition-all"
                      >
                        Отмена
                      </button>
                      <button 
                        onClick={saveDetails}
                        className="px-10 py-4 rounded-2xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Save size={16} />
                        Записать
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={startEditing}
                      className="px-10 py-4 rounded-2xl bg-white border-4 border-[#e6d5bc] text-[#5c4a33] font-black uppercase tracking-widest text-[10px] shadow-lg hover:border-[#5c4a33] transition-all flex items-center gap-2"
                    >
                      <Edit3 size={16} />
                      Редактировать
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="space-y-10 pt-16 relative z-10">
        <div className="flex items-center justify-between border-b-8 border-[#e6d5bc] pb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-[#5c4a33] text-[#fdfaf3] flex items-center justify-center shadow-2xl border-4 border-[#e6d5bc]">
              <Lock size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-serif font-black text-[#5c4a33]">Капсулы времени</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Тайные послания в будущее</p>
            </div>
          </div>
          <button 
            onClick={startCreateCapsule}
            className="flex items-center gap-2 bg-[#5c4a33] text-[#fdfaf3] px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            Создать
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {capsules.map(capsule => {
            const isUnlocked = new Date(capsule.unlockDate) <= new Date();
            return (
              <motion.div
                key={capsule.id}
                whileHover={{ y: -5 }}
                onClick={() => openCapsule(capsule)}
                className="cursor-pointer group"
              >
                <div className="p-1 bg-[#e6d5bc] rounded-[2.5rem] shadow-xl">
                  <div className="bg-[#fdfaf3] rounded-[2.2rem] p-8 border-4 border-[#e6d5bc] relative overflow-hidden flex items-center gap-6">
                    <div className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-inner border-4",
                      isUnlocked ? "bg-emerald-50 border-emerald-200 text-emerald-500" : "bg-white border-[#e6d5bc] text-[#e6d5bc]"
                    )}>
                      {isUnlocked ? <Sparkles size={32} /> : <Lock size={32} />}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-serif font-black text-[#5c4a33]">{capsule.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#8b7355]">
                        <Calendar size={12} />
                        Откроется: {capsule.unlockDate}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {capsules.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-6 bg-[#fdfaf3]/50 rounded-[3rem] border-8 border-dashed border-[#e6d5bc]/30">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#e6d5bc] shadow-inner border-4 border-[#e6d5bc]">
                <Lock size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-serif font-black text-[#5c4a33]">Архив пока пуст</p>
                <p className="text-sm text-[#8b7355] italic max-w-xs mx-auto">"Оставьте послание себе в будущее, которое откроется в особый день."</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Whisper History Section */}
      <section className="space-y-10 pt-16 relative z-10">
        <div className="flex items-center justify-between border-b-8 border-[#e6d5bc] pb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-[#5c4a33] text-amber-100 flex items-center justify-center shadow-2xl border-4 border-[#e6d5bc]">
              <Mail size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-serif font-black text-[#5c4a33]">Архив шепотов</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Наши тайные весточки сквозь время</p>
            </div>
          </div>
        </div>

        <div className="columns-1 md:columns-2 gap-8 space-y-8 relative">
          {whispers.map((whisper) => (
            <motion.div
              key={whisper.id}
              whileHover={{ y: -5, rotate: [-1, 1, 0] }}
              className="relative group break-inside-avoid mb-8"
            >
              <div className="p-1 bg-[#e6d5bc] rounded-[2.5rem] shadow-xl">
                <div className="bg-[#fdfaf3] rounded-[2.2rem] p-8 border-4 border-[#e6d5bc] relative overflow-hidden flex flex-col gap-4">
                  {/* Parchment texture */}
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border-2 border-[#e6d5bc] shadow-sm",
                        whisper.sender === 'Grinch' ? "bg-[#5c4a33] text-amber-100" : "bg-[#5c4a33] text-blue-50"
                      )}>
                        {whisper.sender === 'Grinch' ? <Trees size={18} /> : <Moon size={18} />}
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#8b7355]">От кого: {whisper.sender === 'Grinch' ? 'Гринч' : 'Синди Лу'}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#8b7355]/40">{new Date(whisper.created_at).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>
                    
                    {whisper.sender === currentUser && (
                      <button 
                        onClick={() => deleteWhisper(whisper.id)}
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="relative z-10 py-2">
                    <p className="text-xl font-serif italic text-[#5c4a33] leading-relaxed pl-4 border-l-4 border-[#e6d5bc]/50">
                      "{whisper.content}"
                    </p>
                  </div>
                  
                  <div className="absolute top-4 right-4 opacity-10 rotate-12">
                    <Sparkles size={40} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}


        </div>
      </section>

      {/* Time Capsule Modal - Palia Scroll Style */}
      <AnimatePresence>
        {isCapsuleModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCapsuleModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#fdfaf3] rounded-[3rem] shadow-2xl border-8 border-[#e6d5bc] overflow-hidden"
            >
              {isEditingCapsule ? (
                <div className="p-8 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
                  <div className="text-center space-y-2">
                    <h3 className="text-3xl font-serif font-black text-[#5c4a33]">
                      {capsuleEditData.id ? 'Свиток Изменений' : 'Новое Послание'}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Запечатайте свои мысли во времени</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[#8b7355] px-4">Заголовок Свитка</label>
                      <input 
                        value={capsuleEditData.title}
                        onChange={e => setCapsuleEditData({...capsuleEditData, title: e.target.value})}
                        className="w-full bg-white border-4 border-[#e6d5bc] rounded-2xl px-6 py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-serif font-bold text-[#5c4a33]"
                        placeholder="Как назовем это чудо?"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-[#8b7355] px-4">Дата Пробуждения</label>
                        <input 
                          type="date"
                          value={capsuleEditData.unlockDate}
                          onChange={e => setCapsuleEditData({...capsuleEditData, unlockDate: e.target.value})}
                          className="w-full bg-white border-4 border-[#e6d5bc] rounded-2xl px-4 py-3 focus:ring-0 focus:border-[#5c4a33] transition-all font-bold text-[#5c4a33]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-[#8b7355] px-4">Суть (кратко)</label>
                        <input 
                          value={capsuleEditData.description}
                          onChange={e => setCapsuleEditData({...capsuleEditData, description: e.target.value})}
                          className="w-full bg-white border-4 border-[#e6d5bc] rounded-2xl px-4 py-3 focus:ring-0 focus:border-[#5c4a33] transition-all font-bold text-[#5c4a33]"
                          placeholder="О чем память?"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-end px-4">
                        <label className="text-[10px] uppercase font-black text-[#8b7355]">Тайное Письмо</label>
                        <span className="text-[10px] font-black text-[#8b7355]/30 tracking-widest">
                          {capsuleEditData.content?.length || 0} / 3000
                        </span>
                      </div>
                      <textarea 
                        value={capsuleEditData.content}
                        onChange={e => {
                          if (e.target.value.length <= 3000) {
                            setCapsuleEditData({...capsuleEditData, content: e.target.value})
                          }
                        }}
                        className="w-full h-48 bg-white border-4 border-[#e6d5bc] rounded-[2rem] px-6 py-6 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none custom-scrollbar font-serif italic text-lg text-[#5c4a33]"
                        placeholder="Начни писать свою историю..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setIsCapsuleModalOpen(false)}
                      className="flex-1 py-4 rounded-2xl bg-[#e6d5bc]/20 text-[#8b7355] font-black uppercase tracking-widest text-[10px] hover:bg-[#e6d5bc]/40 transition-all"
                    >
                      Сжечь черновик
                    </button>
                    <button 
                      onClick={saveCapsule}
                      className="flex-1 py-4 rounded-2xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock size={14} />
                      Запечатать Свиток
                    </button>
                  </div>
                </div>
              ) : selectedCapsule && (
                <div className="p-10 text-center space-y-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
                  {selectedCapsule.isLocked ? (
                    <>
                      <div className="w-28 h-28 rounded-[2rem] bg-[#e6d5bc]/30 flex items-center justify-center text-[#5c4a33] mx-auto shadow-inner border-4 border-[#e6d5bc] animate-pulse">
                        <Lock size={56} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-4xl font-serif font-black text-[#5c4a33]">{selectedCapsule.title}</h3>
                        <p className="text-[#8b7355] font-serif italic text-xl">"{selectedCapsule.description}"</p>
                      </div>
                      <div className="p-8 bg-white border-4 border-[#e6d5bc] rounded-[2rem] shadow-xl">
                        <p className="text-sm font-black uppercase tracking-widest text-[#5c4a33]">
                          Этот свиток защищен магией времени. Пробуждение через:
                        </p>
                        <p className="text-3xl font-serif font-black text-[#5c4a33] mt-2">
                          {Math.ceil((new Date(selectedCapsule.unlockDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} дн.
                        </p>
                      </div>
                      {selectedCapsule.author === currentUser && (
                        <div className="flex gap-4">
                          <button 
                            onClick={() => startEditCapsule(selectedCapsule)}
                            className="flex-1 py-4 rounded-2xl bg-white border-4 border-[#e6d5bc] text-[#5c4a33] font-black uppercase tracking-widest text-[10px] hover:border-[#5c4a33] transition-all flex items-center justify-center gap-2"
                          >
                            <Edit3 size={16} />
                            Править
                          </button>
                          <button 
                            onClick={() => deleteCapsule(selectedCapsule.id)}
                            className="p-4 rounded-2xl bg-red-50 text-red-400 border-4 border-red-100 hover:bg-red-100 transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-28 h-28 rounded-[2rem] bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto shadow-inner border-4 border-emerald-100">
                        <Sparkles size={56} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-4xl font-serif font-black text-[#5c4a33]">{selectedCapsule.title}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Древний свиток пробужден</p>
                      </div>
                      <div className="p-10 bg-white shadow-2xl rounded-[3rem] border-8 border-[#e6d5bc] text-left italic font-serif text-2xl leading-relaxed text-[#5c4a33] max-h-[400px] overflow-y-auto custom-scrollbar relative">
                         <div className="absolute top-4 right-4 opacity-10"><Mail size={40} /></div>
                         "{selectedCapsule.content}"
                      </div>
                      
                      {selectedCapsule.author === currentUser && (
                        <button 
                          onClick={() => deleteCapsule(selectedCapsule.id)}
                          className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-[0.3em] transition-all pt-4"
                        >
                          Предать забвению (удалить)
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function DetailItem({ label, value, isEditing, onLabelChange, onValueChange }: { 
  label: string, 
  value: string, 
  isEditing: boolean,
  onLabelChange?: (val: string) => void,
  onValueChange?: (val: string) => void
}) {
  return (
    <div className="p-6 bg-white border-4 border-[#e6d5bc] rounded-[2rem] shadow-lg transition-all hover:border-[#5c4a33]/30 group">
      <div className="flex-1">
        {isEditing ? (
          <input 
            value={label}
            onChange={(e) => onLabelChange?.(e.target.value)}
            className="block text-[10px] font-black uppercase tracking-widest text-[#8b7355]/50 bg-transparent border-none focus:ring-0 w-full mb-1"
            placeholder="Название поля"
          />
        ) : (
          <span className="block text-[10px] font-black uppercase tracking-widest text-[#8b7355]/50">{label}</span>
        )}
        
        {isEditing ? (
          <input 
            value={value}
            onChange={(e) => onValueChange?.(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-foreground/80 p-0"
            placeholder="Значение"
          />
        ) : (
          <span className="text-sm font-bold text-foreground/80">{value}</span>
        )}
      </div>
    </div>
  );
}
