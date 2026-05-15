'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORY_COLORS = [
  { bg: 'bg-[#ff7e7e]', text: 'text-white', border: 'border-[#ff7e7e]', name: 'Красный' },
  { bg: 'bg-[#7eafff]', text: 'text-white', border: 'border-[#7eafff]', name: 'Синий' },
  { bg: 'bg-[#7eff9e]', text: 'text-[#2d5a3a]', border: 'border-[#7eff9e]', name: 'Зеленый' },
  { bg: 'bg-[#ffde7e]', text: 'text-[#5a4a2d]', border: 'border-[#ffde7e]', name: 'Желтый' },
  { bg: 'bg-[#ff7eb6]', text: 'text-white', border: 'border-[#ff7eb6]', name: 'Розовый' },
  { bg: 'bg-[#bc7eff]', text: 'text-white', border: 'border-[#bc7eff]', name: 'Фиолетовый' },
];

interface DataContextType {
  currentUser: 'Grinch' | 'Cindy' | null;
  profiles: any;
  notes: any[];
  moments: any[];
  quests: any[];
  archiState: any;
  capsules: any[];
  isLoading: boolean;
  setNotes: React.Dispatch<React.SetStateAction<any[]>>;
  setMoments: React.Dispatch<React.SetStateAction<any[]>>;
  setQuests: React.Dispatch<React.SetStateAction<any[]>>;
  setCapsules: React.Dispatch<React.SetStateAction<any[]>>;
  setArchiState: React.Dispatch<React.SetStateAction<any>>;
  refreshAll: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshNotes: () => Promise<void>;
  refreshMoments: () => Promise<void>;
  refreshQuests: () => Promise<void>;
  refreshCapsules: () => Promise<void>;
  refreshArchi: () => Promise<void>;
  galleryCategories: string[];
  setGalleryCategories: React.Dispatch<React.SetStateAction<string[]>>;
  dailyFact: string;
  dailyCookie: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<'Grinch' | 'Cindy' | null>(null);
  const [profiles, setProfiles] = useState<any>({});
  const [notes, setNotes] = useState<any[]>([]);
  const [moments, setMoments] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [capsules, setCapsules] = useState<any[]>([]);
  const [archiState, setArchiState] = useState<any>(null);
  const [galleryCategories, setGalleryCategories] = useState<string[]>(['Все', 'Свидания', 'Прогулки', 'Дом', 'Путешествия']);
  const [dailyFact, setDailyFact] = useState("");
  const [dailyCookie, setDailyCookie] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth
  useEffect(() => {
    const auth = localStorage.getItem('lumina_auth');
    if (auth) {
      setCurrentUser(auth === 'grinch' ? 'Grinch' : 'Cindy');
    }
  }, []);

  const refreshProfiles = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*');
    
    // Default fallback profiles
    const defaultProfiles: any = {
      Grinch: { id: 'Grinch', name: 'Гринч', status: 'В сети', mood: '🌿', pref: 'Твое описание...', avatarColor: 'bg-talia-lavender', categories: [] },
      Cindy: { id: 'Cindy', name: 'Синди Лу', status: 'Отдыхает', mood: '✨', pref: 'Её описание...', avatarColor: 'bg-talia-peach', categories: [] }
    };

    if (data) {
      data.forEach((p: any) => { 
        // Map any existing ID to either Grinch or Cindy
        const isGrinch = p.id === 'me' || p.id === 'Grinch' || p.id?.toLowerCase() === 'grinch' || p.name === 'Гринч';
        const id = isGrinch ? 'Grinch' : 'Cindy';
        
        defaultProfiles[id] = {
          ...p,
          id,
          lastActive: p.last_active,
          avatarColor: p.avatar_color || (id === 'Grinch' ? 'bg-talia-lavender' : 'bg-talia-peach')
        }; 
      });
    }
    setProfiles(defaultProfiles);
  }, []);

  const refreshNotes = useCallback(async () => {
    const { data } = await supabase
      .from('journal_notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setNotes(data.map((n: any) => ({
        ...n,
        isLiked: n.is_liked
      })));
    }
  }, []);

  const refreshMoments = useCallback(async () => {
    const { data } = await supabase
      .from('gallery_moments')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setMoments(data.map((m: any) => ({
        ...m,
        src: m.image_url
      })));
    }
  }, []);

  const refreshQuests = useCallback(async () => {
    const { data } = await supabase
      .from('bucket_list')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
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
  }, []);

  const refreshArchi = useCallback(async () => {
    const { data } = await supabase
      .from('global_state')
      .select('value')
      .eq('key', 'archi_state')
      .single();
    if (data) setArchiState(data.value);
  }, []);

  const refreshCapsules = useCallback(async () => {
    const { data } = await supabase
      .from('time_capsules')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setCapsules(data.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        unlockDate: c.unlock_date,
        isLocked: c.is_sealed,
        content: c.content,
        author: c.author
      })));
    }
  }, []);

  const refreshGalleryCategories = useCallback(async () => {
    const { data } = await supabase
      .from('global_state')
      .select('value')
      .eq('key', 'gallery_categories')
      .single();
    if (data && data.value) {
      setGalleryCategories(data.value as string[]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);

    const facts = [
      "Вы уже провели вместе более 500 часов в видеозвонках!",
      "Ваш первый совместный квест был выполнен 3 месяца назад.",
      "Арчи больше всего любит, когда вы оба в сети одновременно.",
      "Синди Лу отправила уже 15 шепотов Гринчу!",
      "Гринч чаще всего выбирает настроение '🌿'."
    ];
    const cookies = [
      "Сегодня идеальный день для совместного фильма.",
      "Твоему партнеру сейчас очень хочется услышать твой голос.",
      "Маленький подарок без повода — лучший способ сказать 'люблю'.",
      "Арчи предсказывает вам очень уютный вечер.",
      "Скоро случится что-то волшебное!"
    ];
    
    const day = new Date().getDate();
    setDailyFact(facts[day % facts.length]);
    setDailyCookie(cookies[day % cookies.length]);

    await Promise.all([
      refreshProfiles(),
      refreshNotes(),
      refreshMoments(),
      refreshQuests(),
      refreshCapsules(),
      refreshArchi(),
      refreshGalleryCategories()
    ]);
    setIsLoading(false);
  }, [refreshProfiles, refreshNotes, refreshMoments, refreshQuests, refreshCapsules, refreshArchi, refreshGalleryCategories]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!currentUser) return;

    const updatePresence = async () => {
      const isGrinch = currentUser.toLowerCase() === 'grinch';
      const id = isGrinch ? 'Grinch' : 'Cindy';
      const legacyId = isGrinch ? 'me' : 'polina';
      
      // Update with upsert for the main ID
      await supabase
        .from('profiles')
        .upsert({ 
          id: id, 
          last_active: new Date().toISOString(),
          name: isGrinch ? 'Гринч' : 'Синди Лу' 
        }, { onConflict: 'id' });
        
      // Also update legacy ID just in case
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', legacyId);
    };

    updatePresence();
    const presenceInterval = setInterval(updatePresence, 30000); 
    const refreshInterval = setInterval(refreshProfiles, 30000); 
    
    return () => {
      clearInterval(presenceInterval);
      clearInterval(refreshInterval);
    };
  }, [currentUser, refreshProfiles]);

  return (
    <DataContext.Provider value={{ 
      currentUser, profiles, notes, moments, quests, archiState, capsules, isLoading,
      galleryCategories, setGalleryCategories, dailyFact, dailyCookie,
      setNotes, setMoments, setQuests, setArchiState, setCapsules,
      refreshAll, refreshNotes, refreshMoments, refreshQuests, refreshArchi, refreshProfiles, refreshCapsules
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
