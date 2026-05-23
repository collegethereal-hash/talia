'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Plus, Play, Pause, Trash2, 
  Share2, ExternalLink, Mic, Disc,
  Volume2, Search, Filter, X, Heart,
  Sparkles, Waves, Anchor, Skull, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/components/DataProvider';
import { supabase } from '@/lib/supabase';

interface MusicMoment {
  id: string;
  title: string;
  url: string;
  type: 'yandex' | 'voice' | 'background';
  sender: string;
  date: string;
  category: string;
  duration?: string;
  bgVolume?: number;
  bgTrackId?: string;
}

export default function PirateMusicPage() {
  const { currentUser } = useData();
  const [songs, setSongs] = useState<MusicMoment[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Все');
  const [isUploading, setIsUploading] = useState(false);
  
  const [newSong, setNewSong] = useState({
    title: '',
    url: '',
    type: 'yandex' as 'yandex' | 'voice' | 'background',
    bgVolume: 50,
    selectedBgId: '',
    file: null as File | null
  });

  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewVoiceRef = useRef<HTMLAudioElement>(null);
  const previewBgRef = useRef<HTMLAudioElement>(null);

  const backgroundTracks = songs.filter(s => s.type === 'background');

  const togglePreview = () => {
    if (!newSong.file) return;

    if (isPreviewing) {
      previewVoiceRef.current?.pause();
      previewBgRef.current?.pause();
      setIsPreviewing(false);
    } else {
      const voiceUrl = URL.createObjectURL(newSong.file);
      if (previewVoiceRef.current) {
        previewVoiceRef.current.src = voiceUrl;
        previewVoiceRef.current.play();
      }

      if (newSong.selectedBgId && previewBgRef.current) {
        const bgTrack = songs.find(s => s.id === newSong.selectedBgId);
        if (bgTrack) {
          previewBgRef.current.src = bgTrack.url;
          previewBgRef.current.volume = newSong.bgVolume / 100;
          previewBgRef.current.play();
        }
      }
      setIsPreviewing(true);
    }
  };

  useEffect(() => {
    if (previewVoiceRef.current) {
      previewVoiceRef.current.onended = () => {
        previewBgRef.current?.pause();
        setIsPreviewing(false);
      };
    }
  }, [isPreviewing]);

  const categories = [
    { id: 'yandex', label: 'Яндекс Музыка', icon: Music, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'voice', label: 'Голосовое', icon: Mic, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'background', label: 'Фоновая музыка', icon: Waves, color: 'text-sky-500', bg: 'bg-sky-500/10' }
  ];

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setIsLoading(true);
    try {
      // For now, let's use localStorage to avoid database errors 
      // if the table doesn't support our specific needs.
      // But we'll try to sync it later.
      const saved = localStorage.getItem('pirate_music_songs');
      if (saved) {
        setSongs(JSON.parse(saved));
      } else {
        // Initial dummy data
        const initial: MusicMoment[] = [
          {
            id: '1',
            title: 'Веселый Роджер (Remix)',
            url: 'https://music.yandex.ru/album/22616212/track/104526017',
            type: 'yandex',
            sender: 'Grinch',
            date: new Date().toISOString(),
            category: 'Яндекс'
          },
          {
            id: '2',
            title: 'Голосовое из Бухты',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            type: 'voice',
            sender: 'Cindy',
            date: new Date().toISOString(),
            category: 'Голосовые',
            duration: '4:15'
          },
          {
            id: '3',
            title: 'Шум прибоя и чаек',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            type: 'background',
            sender: 'Архипелаг',
            date: new Date().toISOString(),
            category: 'Фон',
            duration: '7:05'
          }
        ];
        setSongs(initial);
        localStorage.setItem('pirate_music_songs', JSON.stringify(initial));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `music/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('moments') // Reusing moments bucket or you can create 'music'
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('moments')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ошибка при загрузке файла');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSong = async () => {
    if (!newSong.title) return;
    
    let finalUrl = newSong.url;
    let duration = "0:00";

    if (newSong.type !== 'yandex' && newSong.file) {
      const uploadedUrl = await handleFileUpload(newSong.file);
      if (!uploadedUrl) return;
      finalUrl = uploadedUrl;
      // In a real app, we'd get duration from the audio metadata
      duration = "2:45"; 
    } else if (newSong.type === 'yandex' && !newSong.url) {
      return;
    }

    const song: MusicMoment = {
      id: Date.now().toString(),
      title: newSong.title,
      url: finalUrl,
      type: newSong.type,
      sender: currentUser || 'Аноним',
      date: new Date().toISOString(),
      category: newSong.type === 'yandex' ? 'Яндекс' : (newSong.type === 'voice' ? 'Голосовые' : 'Фон'),
      duration: duration,
      bgVolume: newSong.type === 'voice' ? newSong.bgVolume : undefined,
      bgTrackId: newSong.type === 'voice' ? newSong.selectedBgId : undefined
    };

    const updated = [song, ...songs];
    setSongs(updated);
    localStorage.setItem('pirate_music_songs', JSON.stringify(updated));
    setIsAddModalOpen(false);
    setNewSong({ title: '', url: '', type: 'yandex', bgVolume: 50, selectedBgId: '', file: null });
  };

  const handleDelete = (id: string) => {
    const updated = songs.filter(s => s.id !== id);
    setSongs(updated);
    localStorage.setItem('pirate_music_songs', JSON.stringify(updated));
  };

  const getYandexEmbed = (url: string) => {
    try {
      const trackIdMatch = url.match(/track\/(\d+)/);
      const albumIdMatch = url.match(/album\/(\d+)/);
      
      const trackId = trackIdMatch ? trackIdMatch[1] : null;
      const albumId = albumIdMatch ? albumIdMatch[1] : null;
      
      if (trackId) {
        // Updated height to 180 for a better look in larger cards
        const embedUrl = albumId 
          ? `https://music.yandex.ru/iframe/#track/${trackId}/${albumId}`
          : `https://music.yandex.ru/iframe/#track/${trackId}`;
        return embedUrl;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const AudioPlayer = ({ url, bgTrackId, bgVolume }: { url: string, bgTrackId?: string, bgVolume?: number }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const bgAudioRef = useRef<HTMLAudioElement>(null);

    const bgTrack = bgTrackId ? songs.find(s => s.id === bgTrackId) : null;

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const updateProgress = () => {
        const p = (audio.currentTime / audio.duration) * 100;
        setProgress(p || 0);
      };

      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }, []);

    const toggle = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          bgAudioRef.current?.pause();
        } else {
          audioRef.current.play();
          if (bgAudioRef.current) {
            bgAudioRef.current.volume = (bgVolume || 50) / 100;
            bgAudioRef.current.play();
          }
        }
        setIsPlaying(!isPlaying);
      }
    };

    return (
      <div className="w-full p-5 flex flex-col items-center gap-5 bg-gradient-to-br from-[#1a120b] to-[#0d0806] backdrop-blur-md rounded-3xl border border-amber-500/10 shadow-[inset_0_0_30px_rgba(245,158,11,0.05)]">
        <audio ref={audioRef} src={url} onEnded={() => { setIsPlaying(false); bgAudioRef.current?.pause(); }} />
        {bgTrack && <audio ref={bgAudioRef} src={bgTrack.url} loop />}
        
        {/* Visualizer bars (Enhanced) */}
        <div className="flex items-end gap-1.5 h-14 w-full justify-center px-4 py-2 bg-black/20 rounded-2xl border border-amber-500/5">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: isPlaying ? [8, Math.random() * 45 + 15, 8] : 8,
                opacity: isPlaying ? [0.5, 1, 0.5] : 0.3
              }}
              transition={{ 
                duration: 0.3 + Math.random() * 0.3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-2 bg-gradient-to-t from-amber-600 via-amber-400 to-amber-200 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            />
          ))}
        </div>

        <div className="w-full space-y-2">
          <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-amber-900/20 relative">
             <motion.div 
               style={{ width: `${progress}%` }}
               className="h-full bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 shadow-[0_0_15px_rgba(251,191,36,0.4)] relative" 
             >
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
             </motion.div>
          </div>
          <div className="flex justify-between px-1">
             <span className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest">
               {bgTrack ? `С фоном: ${bgTrack.title}` : 'Музыка'}
             </span>
             <span className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest">Архипелага</span>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="relative p-6 rounded-full overflow-hidden group"
        >
          {/* Animated background rings */}
          <div className={cn(
            "absolute inset-0 rounded-full transition-all duration-500",
            isPlaying 
              ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 shadow-[0_0_40px_rgba(16,185,129,0.4)]" 
              : "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-[0_0_40px_rgba(245,158,11,0.4)]"
          )}>
            {/* Pulsing ring when playing */}
            {isPlaying && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-300/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-emerald-200/20 animate-pulse" />
              </>
            )}
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Icon */}
          <div className="relative z-10">
            {isPlaying ? (
              <Pause size={28} fill="white" className="text-white drop-shadow-lg" />
            ) : (
              <Play size={28} fill="white" className="text-white ml-1 drop-shadow-lg" />
            )}
          </div>
        </motion.button>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#0a0e1a] text-amber-100 font-serif overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep ocean gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0d1525] to-[#1a1025]" />
        
        {/* Animated stars/dust particles */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-amber-200 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-sky-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-0.5 h-0.5 bg-amber-100 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-sky-100 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-0.5 h-0.5 bg-amber-200 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-sky-200 rounded-full animate-pulse" style={{ animationDelay: '2.5s' }} />
        </div>
        
        {/* Wooden texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-5" />
        
        {/* Aurora-like light effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.06)_0%,transparent_50%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(ellipse,rgba(14,165,233,0.04)_0%,transparent_70%)]" />
        
        {/* Subtle wave pattern at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-sky-900/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-40">
        {/* Legendary Gramophone Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="pirate-card p-10 rounded-[3rem] border-2 border-amber-500/20 flex flex-col md:flex-row items-center gap-10 overflow-hidden">
            <div className="relative w-48 h-48 flex-shrink-0">
               <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-pulse" />
               <div className="absolute inset-4 bg-slate-950 rounded-full border-4 border-amber-500/40 flex items-center justify-center">
                  <Disc size={80} className="text-amber-500 animate-spin-slow" />
               </div>
               <div className="absolute -top-4 -right-4 bg-amber-500 text-slate-950 p-3 rounded-2xl shadow-xl transform rotate-12">
                  <Skull size={24} />
               </div>
            </div>
            
            <div className="space-y-6 text-center md:text-left">
               <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/60">Легенда Архипелага</span>
                  <h2 className="text-4xl font-black uppercase tracking-tight text-white mt-2">Граммофон Старого Джо</h2>
               </div>
               <p className="text-amber-100/40 italic text-lg leading-relaxed max-w-2xl">
                 "Говорят, эта пластинка была найдена в каюте капитана, чье имя стерло время. Она играет саму душу океана..."
               </p>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <button className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                     Слушать Историю
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                     <span className="text-[10px] font-black uppercase text-emerald-500">В эфире</span>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 text-amber-500"
            >
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <Music size={32} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.4em]">Музыкальная Таверна</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">
              Песни <span className="text-amber-500">Океана</span>
            </h1>
            <p className="text-amber-100/60 max-w-xl text-lg leading-relaxed">
              Здесь мы храним наши любимые шанти, голосовые послания из дальних странствий и треки, что согревают душу в холодные ночи.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-5 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] transition-all"
          >
            <Plus size={20} /> Поделиться Песней
          </motion.button>
        </div>

        {/* Categories / Filter */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {['Все', 'Шанти', 'Голосовые', 'Яндекс', 'Разное'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] whitespace-nowrap border-2 transition-all",
                filter === cat 
                  ? "bg-amber-500 border-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
                  : "bg-white/5 border-white/10 text-amber-100/40 hover:border-amber-500/40"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Music Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {songs
              .filter(s => filter === 'Все' || s.category === filter)
              .map((song, index) => {
                const isYandex = song.type === 'yandex';
                const isVoice = song.type === 'voice';
                const isBg = song.type === 'background';

                return (
                  <motion.div
                    key={song.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 30, rotateY: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotateY: 10 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                    className="group relative perspective-[1000px]"
                    style={{ perspective: '1000px' }}
                  >
                    {/* Артефакт-контейнер */}
                    <div className={cn(
                      "relative transition-all duration-700 transform group-hover:scale-[1.02] group-hover:-translate-y-3",
                      "rounded-[2rem] overflow-visible"
                    )}>
                      {/* Внешнее свечение (аура) */}
                      <div className={cn(
                        "absolute -inset-3 rounded-[2.5rem] opacity-0 group-hover:opacity-60 transition-opacity duration-700 blur-2xl pointer-events-none",
                        isYandex ? "bg-gradient-to-br from-red-600 via-orange-500 to-red-600" :
                        isVoice ? "bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-600" :
                        "bg-gradient-to-br from-sky-600 via-blue-500 to-sky-600"
                      )} />
                      
                      {/* Плавающие частицы вокруг карточки */}
                      <div className="absolute -inset-4 pointer-events-none">
                        <div className={cn(
                          "absolute top-0 left-1/4 w-2 h-2 rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-500",
                          "animate-bounce",
                          isYandex ? "bg-red-400" : isVoice ? "bg-emerald-400" : "bg-sky-400"
                        )} style={{ animationDuration: '2s' }} />
                        <div className={cn(
                          "absolute top-1/3 right-0 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700",
                          "animate-bounce",
                          isYandex ? "bg-orange-400" : isVoice ? "bg-teal-400" : "bg-blue-400"
                        )} style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
                        <div className={cn(
                          "absolute bottom-1/4 left-0 w-1 h-1 rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-600",
                          "animate-bounce",
                          isYandex ? "bg-yellow-400" : isVoice ? "bg-green-400" : "bg-indigo-400"
                        )} style={{ animationDuration: '1.8s', animationDelay: '0.6s' }} />
                      </div>

                      {/* Основная карточка-артефакт */}
                      <div className={cn(
                        "relative backdrop-blur-xl rounded-[2rem] p-5 transition-all duration-500",
                        "border-2 group-hover:border-opacity-60",
                        isYandex ? "bg-gradient-to-br from-red-950/80 via-red-900/60 to-orange-950/80 border-red-500/30" :
                        isVoice ? "bg-gradient-to-br from-emerald-950/80 via-emerald-900/60 to-teal-950/80 border-emerald-500/30" :
                        "bg-gradient-to-br from-sky-950/80 via-blue-900/60 to-indigo-950/80 border-sky-500/30"
                      )}>
                        {/* Внутренний светящийся контур */}
                        <div className={cn(
                          "absolute inset-[2px] rounded-[1.9rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
                          "bg-gradient-to-br from-white/5 via-transparent to-white/5"
                        )} />

                        {/* Заголовок с иконкой-печатью */}
                        <div className="relative flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {/* Иконка-печать в стиле сургучной печати */}
                            <div className={cn(
                              "relative w-12 h-12 rounded-full flex items-center justify-center",
                              "shadow-[0_0_20px_currentColor] animate-pulse",
                              isYandex ? "bg-red-600 text-red-200 shadow-red-500/50" :
                              isVoice ? "bg-emerald-600 text-emerald-200 shadow-emerald-500/50" :
                              "bg-sky-600 text-sky-200 shadow-sky-500/50"
                            )}>
                              <div className="absolute inset-1 rounded-full border-2 border-white/30" />
                              {isYandex ? <Music size={20} /> : isVoice ? <Mic size={20} /> : <Waves size={20} />}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-white leading-tight line-clamp-2 drop-shadow-lg">
                                {song.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider",
                                  isYandex ? "text-red-300/70" : isVoice ? "text-emerald-300/70" : "text-sky-300/70"
                                )}>
                                  {isYandex ? 'Яндекс' : isVoice ? 'Голос' : 'Фон'}
                                </span>
                                <span className="text-white/30 text-[8px]">•</span>
                                <span className="text-white/50 text-[10px]">{song.sender}</span>
                              </div>
                            </div>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.2, rotate: 90 }}
                            onClick={() => handleDelete(song.id)}
                            className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>

                        {/* Центральный элемент - "магический кристалл" с контентом */}
                        <div className={cn(
                          "relative rounded-[1.5rem] overflow-hidden mb-4",
                          "border border-white/10",
                          "shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]",
                          isYandex && getYandexEmbed(song.url) ? "h-[180px]" : "min-h-[140px]"
                        )}>
                          {/* Фоновый градиент внутри кристалла */}
                          <div className={cn(
                            "absolute inset-0 opacity-30",
                            isYandex ? "bg-gradient-to-br from-red-500/20 to-orange-500/20" :
                            isVoice ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20" :
                            "bg-gradient-to-br from-sky-500/20 to-indigo-500/20"
                          )} />

                          {/* Контент */}
                          {isYandex && getYandexEmbed(song.url) ? (
                            <iframe 
                              frameBorder="0" 
                              style={{ border: 'none', width: '100%', height: '180px' }} 
                              src={getYandexEmbed(song.url)!}
                              title={song.title}
                              className="relative z-10"
                            />
                          ) : (
                            <div className="relative z-10 h-full flex items-center justify-center p-4">
                              <AudioPlayer url={song.url} bgTrackId={song.bgTrackId} bgVolume={song.bgVolume} />
                            </div>
                          )}
                        </div>

                        {/* Нижняя панель с деталями */}
                        <div className="flex items-center justify-between px-1">
                          {/* Инфо о создателе */}
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg",
                              "ring-2 ring-white/20",
                              isYandex ? "bg-gradient-to-br from-red-500 to-orange-600" :
                              isVoice ? "bg-gradient-to-br from-emerald-500 to-teal-600" :
                              "bg-gradient-to-br from-sky-500 to-indigo-600"
                            )}>
                              {song.sender[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold uppercase text-white/30 tracking-wider">Длительность</span>
                              <span className="text-[11px] font-bold text-white/70">
                                {song.duration || '—:—'}
                              </span>
                            </div>
                          </div>

                          {/* Кнопка-ссылка */}
                          <motion.a 
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            href={song.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                              "backdrop-blur-sm border",
                              isYandex ? "bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500 hover:text-white" :
                              isVoice ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500 hover:text-white" :
                              "bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500 hover:text-white"
                            )}
                          >
                            {isYandex ? "Слушать" : isVoice ? "Слушать" : "Слушать"}
                            <ExternalLink size={12} />
                          </motion.a>
                        </div>

                        {/* Доп. индикатор для голосовых с фоном */}
                        {isVoice && song.bgVolume !== undefined && (
                          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <Volume2 size={10} className="text-emerald-400" />
                            <span className="text-[8px] font-bold uppercase text-emerald-300/80 tracking-wider">
                              Фон: {song.bgVolume}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg pirate-wood p-8 rounded-[40px] border-2 border-amber-500/30 shadow-[0_0_100px_rgba(245,158,11,0.2)]"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-all"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Добавить <span className="text-amber-500">Шанти</span></h2>
                <p className="text-amber-100/40 text-xs font-black uppercase tracking-widest">Поделись музыкой или голосовым сообщением</p>
              </div>

              <div className="space-y-6">
                {/* Category Selection */}
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNewSong({ ...newSong, type: cat.id as any })}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        newSong.type === cat.id 
                          ? `${cat.bg} border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]` 
                          : "bg-black/40 border-white/5 hover:border-white/10"
                      )}
                    >
                      <cat.icon size={20} className={newSong.type === cat.id ? 'text-amber-500' : 'text-white/40'} />
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest text-center",
                        newSong.type === cat.id ? 'text-amber-500' : 'text-white/40'
                      )}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-2">Название</label>
                  <input
                    type="text"
                    value={newSong.title}
                    onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                    placeholder="Название трека..."
                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>

                {newSong.type === 'yandex' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-2">Ссылка на Яндекс.Музыку</label>
                    <input
                      type="text"
                      value={newSong.url}
                      onChange={(e) => setNewSong({...newSong, url: e.target.value})}
                      placeholder="https://music.yandex.ru/..."
                      className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-2">Загрузить файл</label>
                      <label className="flex flex-col items-center justify-center w-full h-32 bg-black/40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-amber-500/40 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {newSong.file ? (
                            <>
                              <Disc size={32} className="text-amber-500 animate-spin-slow mb-2" />
                              <p className="text-[10px] font-black uppercase text-amber-500">{newSong.file.name}</p>
                            </>
                          ) : (
                            <>
                              <Upload size={32} className="text-white/20 group-hover:text-amber-500/60 mb-2" />
                              <p className="text-[10px] font-black uppercase text-white/40">Нажми для выбора аудио</p>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="audio/*"
                          onChange={(e) => setNewSong({ ...newSong, file: e.target.files?.[0] || null })}
                        />
                      </label>
                    </div>

                    {newSong.type === 'voice' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-2">Выбрать фоновую музыку</label>
                          <select 
                            value={newSong.selectedBgId}
                            onChange={(e) => setNewSong({ ...newSong, selectedBgId: e.target.value })}
                            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Без фона</option>
                            {backgroundTracks.map(track => (
                              <option key={track.id} value={track.id}>{track.title}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3 bg-black/40 p-5 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-500">Громкость фона</label>
                            <span className="text-[10px] font-black text-white/60">{newSong.bgVolume}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={newSong.bgVolume}
                            onChange={(e) => setNewSong({ ...newSong, bgVolume: parseInt(e.target.value) })}
                            className="w-full accent-amber-500"
                          />
                        </div>

                        {newSong.file && (
                          <div className="flex flex-col items-center gap-4 p-4 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                            <audio ref={previewVoiceRef} />
                            <audio ref={previewBgRef} loop />
                            <button 
                              onClick={togglePreview}
                              className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-500 transition-all"
                            >
                              {isPreviewing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                              {isPreviewing ? "Остановить превью" : "Прослушать с фоном"}
                            </button>
                            <p className="text-[8px] font-black uppercase text-emerald-500/40 tracking-widest">Прямой эфир: ГС + Выбранный фон</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleAddSong}
                  disabled={isUploading || !newSong.title || (newSong.type === 'yandex' ? !newSong.url : !newSong.file)}
                  className="w-full py-5 bg-amber-500 disabled:opacity-50 disabled:grayscale text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>Опубликовать в Таверне</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative Sea Equalizer at the bottom */}
      <div className="fixed bottom-0 left-0 w-full h-32 pointer-events-none z-0 overflow-hidden opacity-20">
         <div className="flex items-end justify-center gap-1 h-full w-full px-2">
            {[...Array(100)].map((_, i) => (
               <motion.div
                 key={`sea-eq-${i}`}
                 animate={{ 
                   height: [10, Math.random() * 100 + 10, 10],
                 }}
                 transition={{ 
                   duration: 1.5 + Math.random() * 2, 
                   repeat: Infinity,
                   ease: "easeInOut"
                 }}
                 className="w-1 bg-gradient-to-t from-sky-500/0 via-sky-500/50 to-sky-500 rounded-full"
               />
            ))}
         </div>
      </div>

      <style jsx global>{`
        .pirate-card {
          background: linear-gradient(135deg, #1c140e 0%, #0a0806 100%);
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 0 100px rgba(0,0,0,0.2);
        }
        .pirate-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid rgba(245, 158, 11, 0.05);
          pointer-events: none;
          border-radius: inherit;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        @keyframes float-3d {
          0%, 100% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0);
          }
          25% {
            transform: perspective(1000px) rotateX(2deg) rotateY(-1deg) translateY(-5px);
          }
          50% {
            transform: perspective(1000px) rotateX(0deg) rotateY(1deg) translateY(-8px);
          }
          75% {
            transform: perspective(1000px) rotateX(-2deg) rotateY(0deg) translateY(-5px);
          }
        }
        .group:hover .pirate-card {
          animation: float-3d 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
