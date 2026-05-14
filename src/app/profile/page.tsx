'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/Card";
import { User, Heart, Lock, Calendar, Smile, Edit3, Save, X, Sparkles, Gift, Info, Plus, Trash2, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
}

const INITIAL_PROFILES: Record<string, ProfileData> = {
  me: { 
    id: 'me',
    name: 'The Grinch', 
    status: 'В сети', 
    mood: '😊', 
    pref: 'Люблю кофе и магию кодинга',
    avatarColor: 'bg-lumina-lavender',
    categories: [
      {
        id: 'basic',
        title: 'Базовое',
        emoji: '🎁',
        fields: [
          { id: '1', label: 'День рождения', value: '15.06.2000' },
          { id: '2', label: 'Дата знакомства', value: '17.03.2026' },
        ]
      },
      {
        id: 'favs',
        title: 'Любимое',
        emoji: '✨',
        fields: [
          { id: '3', label: 'Еда', value: 'Пицца, Паста' },
          { id: '4', label: 'Музыка', value: 'Lo-fi, Rock' },
        ]
      }
    ]
  },
  polina: { 
    id: 'polina',
    name: 'Cindy Lou', 
    status: 'Отдыхает', 
    mood: '✨', 
    pref: 'Обожаю весенние цветы',
    avatarColor: 'bg-lumina-peach',
    categories: [
      {
        id: 'basic',
        title: 'Базовое',
        emoji: '🎁',
        fields: [
          { id: '1', label: 'День рождения', value: '20.08.2001' },
          { id: '2', label: 'Дата знакомства', value: '17.03.2026' },
        ]
      },
      {
        id: 'favs',
        title: 'Любимое',
        emoji: '🌸',
        fields: [
          { id: '3', label: 'Еда', value: 'Суши, Лазанья' },
          { id: '4', label: 'Музыка', value: 'Pop, Jazz' },
        ]
      }
    ]
  },
};

const EMOJI_LIST = ['🎁', '✨', '🌸', '🐱', '🐶', '🎵', '🍕', '✈️', '🏠', '📚', '🎬', '🎨', '🧸', '🌙'];

const INITIAL_CAPSULES: TimeCapsule[] = [
  { 
    id: '1', 
    title: 'Прочитать через год', 
    description: 'Наше послание в будущее...', 
    unlockDate: '2027-03-17', 
    isLocked: true,
    content: 'Привет из прошлого! Надеюсь, у нас все так же замечательно.'
  },
  { 
    id: '2', 
    title: 'Наше будущее', 
    description: 'Мечты, которые обязательно сбудутся', 
    unlockDate: '2028-01-01', 
    isLocked: true,
    content: 'Мы мечтали о домике у озера...'
  },
];

export default function ProfilePage() {
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [capsules, setCapsules] = useState<TimeCapsule[]>(INITIAL_CAPSULES);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState(false);
  const [isEditingCapsule, setIsEditingCapsule] = useState(false);
  const [capsuleEditData, setCapsuleEditData] = useState<Partial<TimeCapsule>>({});

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileData | null>(null);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

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

  const saveDetails = () => {
    if (selectedProfileId && editData) {
      setProfiles(prev => ({
        ...prev,
        [selectedProfileId]: editData
      }));
      setIsEditing(false);
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

  const saveCapsule = () => {
    if (capsuleEditData.id) {
      // Edit existing
      setCapsules(capsules.map(c => c.id === capsuleEditData.id ? { ...c, ...capsuleEditData } as TimeCapsule : c));
    } else {
      // Create new
      const newCapsule: TimeCapsule = {
        id: Date.now().toString(),
        title: capsuleEditData.title || 'Новая капсула',
        description: capsuleEditData.description || '',
        unlockDate: capsuleEditData.unlockDate || new Date().toISOString().split('T')[0],
        content: capsuleEditData.content || '',
        isLocked: true
      };
      setCapsules([...capsules, newCapsule]);
    }
    setIsCapsuleModalOpen(false);
    setIsEditingCapsule(false);
  };

  const deleteCapsule = (id: string) => {
    setCapsules(capsules.filter(c => c.id !== id));
    setIsCapsuleModalOpen(false);
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
    const checkMail = () => {
      const savedWhisper = localStorage.getItem('lastWhisper');
      setHasMail(!!savedWhisper);
    };
    checkMail();
    // Проверяем каждые пару секунд на случай, если письмо пришло
    const interval = setInterval(checkMail, 2000);
    return () => clearInterval(interval);
  }, []);

  const claimMail = () => {
    if (!hasMail) return;
    setIsMailClaimed(true);
    setTimeout(() => {
      window.location.href = '/journal?openWhisper=true';
    }, 1500);
  };

  const selectedProfile = selectedProfileId ? profiles[selectedProfileId] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-12 pb-32 space-y-16 relative min-h-screen">
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ y: '100vh', opacity: 1, scale: 0.5 }}
            animate={{ y: '-10vh', opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute text-lumina-peach pointer-events-none z-[60]"
            style={{ left: `${heart.x}%` }}
          >
            <Heart fill="currentColor" size={48} />
          </motion.div>
        ))}
      </AnimatePresence>

      <header className="text-center space-y-4">
        <h1 className="text-5xl font-serif font-bold text-foreground/90 tracking-tight">Наши Отражения</h1>
        <p className="text-foreground/40 italic">"Мы видим друг друга лучше, чем самих себя"</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.values(profiles).map((profile) => (
          <motion.div
            key={profile.id}
            whileHover={{ y: -5 }}
            onClick={() => openDetails(profile.id)}
            className="cursor-pointer"
          >
            <Card className="relative overflow-hidden p-8 border-none bg-white/60 hover:bg-white transition-all duration-500 shadow-xl group">
              <div className={cn(
                "absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity",
                profile.id === 'me' ? "bg-lumina-lavender" : "bg-lumina-peach"
              )} />
              
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6",
                  profile.avatarColor
                )}>
                  <User size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-serif font-bold text-foreground/80">{profile.name}</h3>
                    <span className="text-2xl">{profile.mood}</span>
                  </div>
                  <p className="text-sm text-foreground/40 font-medium">{profile.status}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-black/5">
                <p className="text-sm italic text-foreground/60 line-clamp-1">"{profile.pref}"</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-lumina-lavender">
                  <Info size={12} />
                  Нажми, чтобы узнать больше
                </div>
              </div>
            </Card>
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
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden"
            >
              <div className={cn(
                "p-8 flex items-center justify-between text-white",
                selectedProfile.avatarColor
              )}>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                    <User size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold">{selectedProfile.name}</h2>
                    <p className="text-sm opacity-80 font-medium">Подробная анкета</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProfileId(null)}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-10">
                {(isEditing ? editData!.categories : selectedProfile.categories).map((category) => (
                  <div key={category.id} className="space-y-4 group/cat">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
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
                              className="bg-white/50 rounded-lg p-1 text-xl border-none focus:ring-0"
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
                              className="bg-transparent border-none font-bold uppercase tracking-[0.2em] text-foreground/40 focus:ring-0 w-40"
                            />
                          </div>
                        ) : (
                          <>
                            <span className="text-xl">{category.emoji}</span>
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/30">
                              {category.title}
                            </h4>
                          </>
                        )}
                      </div>
                      {isEditing && (
                        <button 
                          onClick={() => removeCategory(category.id)}
                          className="text-red-400 opacity-0 group-hover/cat:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.fields.map((field) => (
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
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/field:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button 
                          onClick={() => addField(category.id)}
                          className="p-4 border-2 border-dashed border-black/5 rounded-2xl flex items-center justify-center text-foreground/20 hover:text-lumina-lavender hover:border-lumina-lavender/30 transition-all"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isEditing && (
                  <button 
                    onClick={addCategory}
                    className="w-full py-6 border-2 border-dashed border-black/5 rounded-[2rem] flex flex-col items-center gap-2 text-foreground/20 hover:text-lumina-lavender hover:border-lumina-lavender/30 transition-all"
                  >
                    <Plus size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest">Добавить категорию</span>
                  </button>
                )}

                <div className="pt-6 border-t border-black/5 flex justify-end gap-4">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 rounded-2xl bg-zinc-100 text-foreground/40 font-bold hover:bg-zinc-200 transition-all"
                      >
                        Отмена
                      </button>
                      <button 
                        onClick={saveDetails}
                        className="px-8 py-3 rounded-2xl bg-lumina-lavender text-white font-bold shadow-lg shadow-lumina-lavender/20 flex items-center gap-2"
                      >
                        <Save size={18} />
                        Сохранить
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={startEditing}
                      className="px-8 py-3 rounded-2xl bg-white border border-black/5 text-foreground/60 hover:text-lumina-lavender hover:border-lumina-lavender transition-all font-bold flex items-center gap-2"
                    >
                      <Edit3 size={18} />
                      Редактировать анкету
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="space-y-8 pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-serif font-bold flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-zinc-900 text-white shadow-xl">
              <Lock size={24} />
            </div>
            Капсулы времени
          </h2>
          <button 
            onClick={startCreateCapsule}
            className="flex items-center gap-2 bg-lumina-lavender/10 text-lumina-lavender px-4 py-2 rounded-xl font-bold hover:bg-lumina-lavender/20 transition-all"
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
                whileHover={{ scale: 1.02 }}
                onClick={() => openCapsule(capsule)}
                className="cursor-pointer"
              >
                <Card className="group border-none bg-white/40 hover:bg-white transition-all p-6 relative overflow-hidden shadow-lg">
                  <div className={cn(
                    "absolute top-0 right-0 w-2 h-full transition-all group-hover:w-3",
                    isUnlocked ? "bg-green-400" : "bg-zinc-200"
                  )} />
                  
                  <div className="flex gap-6 items-center">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                      isUnlocked ? "bg-green-50 text-green-500" : "bg-zinc-50 text-zinc-300"
                    )}>
                      {isUnlocked ? <Sparkles size={28} /> : <Lock size={28} />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-bold text-foreground/80 text-lg">{capsule.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                        <Calendar size={12} />
                        Откроется: {capsule.unlockDate}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Time Capsule Modal */}
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
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {isEditingCapsule ? (
                <div className="p-8 space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-foreground/80 border-b pb-4">
                    {capsuleEditData.id ? 'Редактировать капсулу' : 'Создать капсулу'}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-foreground/30 px-2">Заголовок</label>
                      <input 
                        value={capsuleEditData.title}
                        onChange={e => setCapsuleEditData({...capsuleEditData, title: e.target.value})}
                        className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-lumina-lavender/30 transition-all"
                        placeholder="Назови капсулу..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-foreground/30 px-2">Описание (кратко)</label>
                      <input 
                        value={capsuleEditData.description}
                        onChange={e => setCapsuleEditData({...capsuleEditData, description: e.target.value})}
                        className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-lumina-lavender/30 transition-all"
                        placeholder="О чем это послание?"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-foreground/30 px-2">Дата открытия</label>
                      <input 
                        type="date"
                        value={capsuleEditData.unlockDate}
                        onChange={e => setCapsuleEditData({...capsuleEditData, unlockDate: e.target.value})}
                        className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-lumina-lavender/30 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-end px-2">
                        <label className="text-[10px] uppercase font-bold text-foreground/30">Тайное послание</label>
                        <span className={cn(
                          "text-[10px] font-bold",
                          (capsuleEditData.content?.length || 0) > 2800 ? "text-red-400" : "text-foreground/20"
                        )}>
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
                        className="w-full h-48 bg-zinc-50 border-none rounded-2xl px-4 py-4 focus:ring-2 focus:ring-lumina-lavender/30 transition-all resize-none custom-scrollbar"
                        placeholder="Напиши то, что вы прочтете в будущем..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setIsCapsuleModalOpen(false)}
                      className="flex-1 py-3 rounded-xl bg-zinc-100 text-foreground/40 font-bold hover:bg-zinc-200 transition-all"
                    >
                      Отмена
                    </button>
                    <button 
                      onClick={saveCapsule}
                      className="flex-1 py-3 rounded-xl bg-lumina-lavender text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      Запечатать
                    </button>
                  </div>
                </div>
              ) : selectedCapsule && (
                <div className="p-10 text-center space-y-8">
                  {selectedCapsule.isLocked ? (
                    <>
                      <div className="w-24 h-24 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto animate-bounce">
                        <Lock size={48} />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-3xl font-serif font-bold text-foreground/80">{selectedCapsule.title}</h3>
                        <p className="text-foreground/50 italic">"{selectedCapsule.description}"</p>
                      </div>
                      <div className="p-6 bg-lumina-peach/10 rounded-2xl border border-lumina-peach/20">
                        <p className="text-sm font-medium text-lumina-peach">
                          Эта капсула еще заперта. Она откроется через {
                            Math.ceil((new Date(selectedCapsule.unlockDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          } дней.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => startEditCapsule(selectedCapsule)}
                          className="flex-1 py-3 rounded-xl bg-white border border-zinc-100 text-zinc-400 font-bold hover:text-lumina-lavender transition-all flex items-center justify-center gap-2"
                        >
                          <Edit3 size={18} />
                          Изменить
                        </button>
                        <button 
                          onClick={() => deleteCapsule(selectedCapsule.id)}
                          className="p-3 rounded-xl bg-red-50 text-red-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 rounded-3xl bg-green-50 flex items-center justify-center text-green-500 mx-auto">
                        <Sparkles size={48} />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-3xl font-serif font-bold text-foreground/80">{selectedCapsule.title}</h3>
                        <p className="text-[10px] uppercase font-bold text-green-500 tracking-widest">Капсула времени открыта!</p>
                      </div>
                      <div className="p-8 bg-white shadow-inner rounded-[2rem] border border-black/5 text-left italic font-serif text-lg leading-relaxed text-foreground/70 max-h-[300px] overflow-y-auto custom-scrollbar">
                        "{selectedCapsule.content}"
                      </div>
                      <button 
                        onClick={() => deleteCapsule(selectedCapsule.id)}
                        className="text-red-300 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Удалить из архива
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="pt-10 flex flex-col items-center gap-6">
        <button 
          onClick={claimMail}
          disabled={isMailClaimed || !hasMail}
          className="group relative px-16 py-8 rounded-[2.5rem] bg-lumina-lavender text-white font-bold text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden flex items-center gap-6"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <AnimatePresence mode="wait">
            {isMailClaimed ? (
              <motion.div
                key="claimed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex items-center gap-6"
              >
                <Sparkles size={36} className="animate-spin-slow" />
                Забираю письмо...
              </motion.div>
            ) : (
              <motion.div
                key="unclaimed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex items-center gap-6"
              >
                {hasMail ? (
                  <>
                    <Mail fill="white" size={36} className="animate-bounce" />
                    Забрать письмо
                  </>
                ) : (
                  <>
                    <Mail size={36} className="opacity-20" />
                    <span className="opacity-40">Писем пока нет</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
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
    <div className="p-4 bg-white/50 rounded-2xl border border-white/60 group">
      <div className="flex-1">
        {isEditing ? (
          <input 
            value={label}
            onChange={(e) => onLabelChange?.(e.target.value)}
            className="block text-[10px] uppercase font-bold text-foreground/30 bg-transparent border-none focus:ring-0 w-full mb-1"
            placeholder="Название поля"
          />
        ) : (
          <span className="block text-[10px] uppercase font-bold text-foreground/30">{label}</span>
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
