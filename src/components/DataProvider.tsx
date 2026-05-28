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
  whispers: any[];
  isLoading: boolean;
  setNotes: React.Dispatch<React.SetStateAction<any[]>>;
  setMoments: React.Dispatch<React.SetStateAction<any[]>>;
  setQuests: React.Dispatch<React.SetStateAction<any[]>>;
  setCapsules: React.Dispatch<React.SetStateAction<any[]>>;
  setWhispers: React.Dispatch<React.SetStateAction<any[]>>;
  setArchiState: React.Dispatch<React.SetStateAction<any>>;
  refreshAll: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshNotes: () => Promise<void>;
  refreshMoments: () => Promise<void>;
  refreshQuests: () => Promise<void>;
  refreshCapsules: () => Promise<void>;
  refreshArchi: () => Promise<void>;
  refreshWhispers: () => Promise<void>;
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
  const [whispers, setWhispers] = useState<any[]>([]);
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
          categories: p.categories || [],
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
        location: q.location,
        createdAt: q.created_at
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

  const refreshWhispers = useCallback(async () => {
    const { data } = await supabase
      .from('whisper_history')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setWhispers(data);
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
    // Only show global loading on the very first load if we have no profile data
    if (Object.keys(profiles).length === 0) {
      setIsLoading(true);
    }

    const facts = [
      "В Швейцарии незаконно держать только одну морскую свинку. Эти животные так нуждаются в общении, что одиночество считается жестоким обращением. 🐹",
      "Коалы спят до 22 часов в сутки. Их рацион из эвкалипта настолько беден энергией, что на бодрствование просто не остается сил. 🐨",
      "Вороны умеют подшучивать друг над другом и даже над другими животными. Они часто дергают собак или кошек за хвосты просто ради забавы. 🐦",
      "Муравьеды не имеют зубов. Они сцеживают пищу своими мощными желудками, которые буквально перемалывают насекомых, как жернова. 🐜",
      "В Токио есть кафе, где можно погладить капибар. Эти гигантские грызуны настолько дружелюбны, что ладят абсолютно со всеми животными. 🦦",
      "Если выбрить тигру шерсть, его кожа все равно останется полосатой. Рисунок на коже полностью повторяет узор шерсти. 🐅",
      "Сердце синего кита весит около 600 килограммов. Оно настолько огромное, что человек мог бы пролезть через его аорту. 🐋",
      "Собаки умеют чувствовать запах человеческих эмоций. Они точно знают, когда вам страшно, а когда вы счастливы. 🐕",
      "У пингвинов есть специальная железа, которая позволяет им пить соленую морскую воду. Она отфильтровывает соль и выводит её через клюв. 🐧",
      "Пчелы умеют распознавать человеческие лица. Эксперименты показали, что они запоминают черты лица так же, как люди. 🐝",
      "Бабочки чувствуют вкус своими лапками. Так они проверяют, подходит ли лист растения для того, чтобы отложить на нем яйца. 🦋",
      "У осьминогов три сердца, а их кровь имеет голубой цвет из-за высокого содержания меди. 🐙",
      "В космосе нельзя плакать. Из-за отсутствия гравитации слезы не падают вниз, а собираются в маленькие шарики вокруг глаз. 🌌",
      "В Антарктиде есть водопад с водой красного цвета. Его называют 'Кровавый водопад' из-за большого количества оксида железа. 🩸",
      "Ленивцы могут задерживать дыхание под водой на 40 минут. Это дольше, чем дельфины! 🦥",
      "Самцы морских коньков — единственные животные на планете, которые вынашивают и рожают детенышей. 🌊",
      "Слоны — одни из немногих животных, способных узнавать свое отражение в зеркале, что говорит о высоком уровне их самосознания. 🐘",
      "Звук, который издает синий кит, громче звука реактивного двигателя. Они могут слышать друг друга на расстоянии до 16 000 километров. 🌊",
      "В Японии есть остров Окуносима, который полностью населен кроликами. Они совершенно не боятся людей и любят угощения. 🐇",
      "Кошки мяукают только для общения с людьми. Между собой взрослые кошки общаются звуками, запахами и языком тела. 🐱",
      "Дельфины дают друг другу имена. Каждый дельфин имеет свой уникальный свист, на который он откликается всю жизнь. 🐬",
      "Снежные барсы не умеют рычать. Вместо этого они мурлыкают, как домашние кошки, только намного громче. 🐆",
      "Самое большое живое существо на Земле — это грибница в штате Орегон. Она занимает площадь более 9 квадратных километров. 🍄",
      "Коровы заводят лучших друзей. Исследования показали, что у них снижается уровень стресса в компании своей 'подружки'. 🐄",
      "Морские выдры прячут свой любимый камешек в специальном кармашке из кожи под мышкой, чтобы разбивать им раковины. 🦦"
    ];
    const cookies = [
      "Сегодня идеальный день для совместного фильма.",
      "Твоему партнеру сейчас очень хочется услышать твой голос.",
      "Маленький подарок без повода — лучший способ сказать 'люблю'.",
      "Арчи предсказывает вам очень уютный вечер.",
      "Скоро случится что-то волшебное!"
    ];
    
    // Меняем факт каждый час
    const hour = new Date().getHours();
    setDailyFact(facts[hour % facts.length]);
    
    const day = new Date().getDate();
    setDailyCookie(cookies[day % cookies.length]);

    // Fetch essentials first
    await refreshProfiles();
    setIsLoading(false);

    // Fetch everything else in the background without blocking the UI
    refreshNotes();
    refreshMoments();
    refreshQuests();
    refreshCapsules();
    refreshArchi();
    refreshGalleryCategories();
    refreshWhispers();
  }, [refreshProfiles, refreshNotes, refreshMoments, refreshQuests, refreshCapsules, refreshArchi, refreshGalleryCategories, refreshWhispers]);

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
      currentUser, profiles, notes, moments, quests, archiState, capsules, whispers, isLoading,
      galleryCategories, setGalleryCategories, dailyFact, dailyCookie,
      setNotes, setMoments, setQuests, setArchiState, setCapsules, setWhispers,
      refreshAll, refreshNotes, refreshMoments, refreshQuests, refreshArchi, refreshProfiles, refreshCapsules, refreshWhispers
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
