'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  BarChart2, MessageSquare, History, Heart, Clock, Mic, StickyNote, 
  PenTool, Zap, Calendar, User, BrainCircuit, Sparkle, Sparkles, Timer,
  Trees, Moon, BookOpen, ScrollText, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

const SUMMARY_STATS = [
  { label: 'Письма в Свитках', value: '86 680', sub: 'летопись за 2 месяца', icon: MessageSquare, color: 'text-blue-600' },
  { label: 'Пик Пробуждения', value: '54 352', sub: 'апрельское цветение', icon: Zap, color: 'text-amber-500' },
  { label: 'Великий Рекорд', value: '3 736', sub: '13 апреля', icon: History, color: 'text-purple-600' },
  { label: 'Песни Ветра', value: '846', sub: 'голосовые послания', icon: Mic, color: 'text-emerald-600' },
  { label: 'Магические Печати', value: '1 108', sub: 'стикеры и знаки', icon: StickyNote, color: 'text-rose-500' },
];

const COMPARISON_DATA = [
  { label: 'Послания', me: 44397, polina: 42283, meLabel: '44 397', polinaLabel: '42 283' },
  { label: 'Слова Силы', me: 160532, polina: 113332, meLabel: '160 532', polinaLabel: '113 332' },
  { label: 'Голос Сердца', me: 672, polina: 174, meLabel: '672', polinaLabel: '174' },
  { label: 'Зеркальные Сферы', me: 0, polina: 115, meLabel: '0', polinaLabel: '115' },
  { label: 'Отражения (Фото)', me: 275, polina: 586, meLabel: '275', polinaLabel: '586' },
  { label: 'Тайные Знаки', me: 549, polina: 559, meLabel: '549', polinaLabel: '559' },
  { label: 'Искры Смеха', me: 393, polina: 777, meLabel: '393', polinaLabel: '777' },
  { label: 'Поиск Истины (?)', me: 1718, polina: 914, meLabel: '1718', polinaLabel: '914' },
];

const STAT_EXPLANATIONS: Record<string, { title: string; desc: string; icon: any }> = {
  'Послания': { 
    title: 'Древние Послания', 
    desc: 'Суммарное количество отправленных сообщений за все время нашего общения. Каждое слово — это кирпичик в фундаменте нашего маленького мира Talia.',
    icon: MessageSquare 
  },
  'Слова Силы': { 
    title: 'Слова Силы', 
    desc: 'Общий объем текста и символов, которыми мы обменялись. Это масштаб нашей общей истории, написанной буква за буквой.',
    icon: PenTool 
  },
  'Голос Сердца': { 
    title: 'Голос Сердца', 
    desc: 'Количество голосовых сообщений. Те драгоценные моменты, когда текст был бессилен передать всю глубину твоих интонаций и чувств.',
    icon: Mic 
  },
  'Зеркальные Сферы': { 
    title: 'Зеркальные Сферы', 
    desc: 'Общие ссылки, видео и музыка, которыми мы делились. Отражение наших общих интересов, открытий и того, что нас вдохновляет.',
    icon: Sparkle 
  },
  'Отражения (Фото)': { 
    title: 'Отражения Души', 
    desc: 'Все фотографии и картинки в нашей галерее. Застывшие мгновения счастья, которые мы сохранили навсегда как самые важные артефакты.',
    icon: Sparkles 
  },
  'Тайные Знаки': { 
    title: 'Тайные Знаки', 
    desc: 'Реакции, эмодзи и стикеры. Наш уникальный язык жестов и эмоций, понятный только нам двоим без лишних слов.',
    icon: ScrollText 
  },
  'Искры Смеха': { 
    title: 'Искры Смеха', 
    desc: 'Количество моментов, заставивших нас улыбнуться: мемы, шутки и смешные заметки. Самая яркая и чистая энергия нашей связи.',
    icon: Zap 
  },
  'Поиск Истины (?)': { 
    title: 'Поиск Истины', 
    desc: 'Количество раз, когда мы возвращались к старым записям и фотографиям. Наше стремление не забывать самое важное и беречь прошлое.',
    icon: BrainCircuit 
  },
};

const MONTHLY_DATA = [
  { name: 'Март', me: 8000, polina: 8200 },
  { name: 'Апрель', me: 28000, polina: 26352 },
  { name: 'Май', me: 9000, polina: 8500 },
];

const HOURLY_DATA = [
  { hour: '0:00', me: 3500, polina: 3700 },
  { hour: '3:00', me: 1200, polina: 1100 },
  { hour: '6:00', me: 200, polina: 300 },
  { hour: '9:00', me: 800, polina: 900 },
  { hour: '12:00', me: 1800, polina: 1700 },
  { hour: '15:00', me: 2500, polina: 2600 },
  { hour: '18:00', me: 3000, polina: 2800 },
  { hour: '21:00', me: 3600, polina: 3500 },
];

function PaliaPaper({ children, title, icon: Icon, className }: { children: React.ReactNode, title?: string, icon?: any, className?: string }) {
  return (
    <div className={cn("relative p-1 bg-[#e6d5bc] rounded-[2.5rem] shadow-xl", className)}>
      <div className="bg-[#fdfaf3] rounded-[2.3rem] p-6 md:p-8 border-4 border-[#e6d5bc] relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
        {/* Paper pin effect */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#5c4a33] rounded-full shadow-lg border-4 border-[#e6d5bc] z-20" />
        
        {title && (
          <div className="flex items-center gap-4 border-b-4 border-[#e6d5bc]/30 pb-6 mb-8 mt-4">
            <div className="p-3 bg-[#5c4a33] text-[#fdfaf3] rounded-2xl shadow-lg border-2 border-[#e6d5bc]">
              {Icon && <Icon size={24} />}
            </div>
            <div>
              <h3 className="text-2xl font-serif font-black text-[#5c4a33]">{title}</h3>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Архивные записи</p>
            </div>
          </div>
        )}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-06-15T00:00:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) { clearInterval(interval); return; }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 md:gap-10 items-center justify-center">
      {[
        { val: timeLeft.days, label: 'дней' },
        { val: timeLeft.hours, label: 'часов' },
        { val: timeLeft.minutes, label: 'минут' },
        { val: timeLeft.seconds, label: 'секунд' }
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-4xl md:text-6xl font-black text-[#5c4a33] font-serif drop-shadow-sm">
            {String(item.val).padStart(2, '0')}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b7355] mt-1">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-12 pb-40 space-y-20">
      <header className="text-center space-y-6">
        <div className="inline-flex items-center gap-4 px-8 py-3 bg-[#5c4a33] text-[#fdfaf3] rounded-full border-4 border-[#e6d5bc] shadow-2xl">
          <ScrollText size={24} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Великая Летопись</span>
        </div>
        <h1 className="text-6xl font-serif font-black text-[#5c4a33] tracking-tight">Архив Наших Воспоминаний</h1>
        <p className="text-[#8b7355] italic font-serif text-lg max-w-2xl mx-auto">
          "Каждое слово — это след в истории, каждый день — новая глава нашей общей сказки."
        </p>
      </header>

      {/* Countdown - Wooden Tablet Style */}
      <div className="max-w-3xl mx-auto">
        <div className="p-1.5 bg-[#5c4a33] rounded-[3rem] shadow-2xl border-4 border-[#e6d5bc]">
          <div className="bg-[#fdfaf3] p-6 md:p-10 rounded-[2.8rem] border-4 border-[#e6d5bc] space-y-8 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4 text-[#8b7355]">
                <Timer size={24} className="animate-spin-slow" />
                <span className="text-[12px] font-black uppercase tracking-[0.4em]">До Нового Свитка</span>
              </div>
              <CountdownTimer />
              <div className="pt-6 border-t-4 border-[#e6d5bc]/30">
                <p className="text-[10px] font-black text-[#8b7355] uppercase tracking-widest">
                  Следующее подведение итогов: <span className="text-[#5c4a33] border-b-2 border-[#5c4a33]">15 июня 2026</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {SUMMARY_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="h-full p-1 bg-[#e6d5bc] rounded-[2rem] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="bg-[#fdfaf3] h-full p-8 rounded-[1.8rem] border-2 border-[#e6d5bc] text-center space-y-4">
                <div className="w-14 h-14 bg-white border-4 border-[#e6d5bc] rounded-2xl flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform">
                  <stat.icon className={cn("opacity-70", stat.color)} size={28} />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-serif font-black text-[#5c4a33] tracking-tighter">{stat.value}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-[#8b7355] leading-tight">{stat.label}</div>
                </div>
                <div className="text-[8px] text-[#8b7355]/60 italic font-serif pt-2 border-t border-[#e6d5bc]/30">{stat.sub}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Comparison Board */}
        <PaliaPaper title="Летопись Первенства" icon={PenTool} className="lg:col-span-2">
          <div className="space-y-8">
            <div className="flex justify-center gap-12 mb-8 bg-white/50 p-6 rounded-[2rem] border-4 border-[#e6d5bc]/30 shadow-inner">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#5c4a33] text-amber-200 flex items-center justify-center shadow-lg border-2 border-[#e6d5bc]">
                  <Trees size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="block text-[8px] font-black uppercase text-[#8b7355] tracking-widest">Хранитель Леса</span>
                  <span className="text-lg font-serif font-black text-[#5c4a33]">Гринч</span>
                </div>
              </div>
              <div className="w-px h-12 bg-[#e6d5bc]" />
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#5c4a33] text-blue-100 flex items-center justify-center shadow-lg border-2 border-[#e6d5bc]">
                  <Moon size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="block text-[8px] font-black uppercase text-[#8b7355] tracking-widest">Дитя Луны</span>
                  <span className="text-lg font-serif font-black text-[#5c4a33]">Синди Лу</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              {COMPARISON_DATA.map((item) => {
                const total = item.me + item.polina;
                const meWidth = total > 0 ? (item.me / Math.max(item.me, item.polina)) * 100 : 0;
                const polinaWidth = total > 0 ? (item.polina / Math.max(item.me, item.polina)) * 100 : 0;
                
                return (
                  <div key={item.label} className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 md:gap-10 group/item">
                    <button 
                      onClick={() => setSelectedStat(item.label)}
                      className="text-left group/label flex items-center gap-2"
                    >
                      <span className="text-sm font-black uppercase tracking-[0.2em] text-[#8b7355] group-hover/label:text-[#5c4a33] transition-colors border-b-2 border-transparent group-hover/label:border-[#5c4a33] pb-1">
                        {item.label}
                      </span>
                      <Info size={12} className="text-[#e6d5bc] group-hover/label:text-[#5c4a33] transition-colors" />
                    </button>
                    <div className="col-span-4 space-y-4">
                      <div className="relative h-8 bg-white/50 rounded-2xl overflow-hidden border-2 border-[#e6d5bc] shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${meWidth}%` }}
                          className="h-full bg-gradient-to-r from-[#5c4a33] to-[#8b7355] flex items-center px-6"
                        >
                          <span className="text-[10px] font-black text-amber-100 uppercase tracking-widest">{item.meLabel}</span>
                        </motion.div>
                      </div>
                      <div className="relative h-8 bg-white/50 rounded-2xl overflow-hidden border-2 border-[#e6d5bc] shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${polinaWidth}%` }}
                          className="h-full bg-gradient-to-r from-[#8b7355] to-[#5c4a33] flex items-center px-6"
                        >
                          <span className="text-[10px] font-black text-blue-50 uppercase tracking-widest">{item.polinaLabel}</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PaliaPaper>

        {/* Activity Charts */}
        <PaliaPaper title="Ритмы Пробуждения" icon={Clock}>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_DATA}>
                <defs>
                  <linearGradient id="colorMe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5c4a33" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5c4a33" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPolina" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b7355" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b7355" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6d5bc" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#8b7355', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#8b7355', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fdfaf3', 
                    borderRadius: '1.5rem', 
                    border: '4px solid #e6d5bc', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    fontFamily: 'serif'
                  }}
                />
                <Area type="monotone" dataKey="me" stroke="#5c4a33" strokeWidth={4} fillOpacity={1} fill="url(#colorMe)" />
                <Area type="monotone" dataKey="polina" stroke="#8b7355" strokeWidth={4} fillOpacity={1} fill="url(#colorPolina)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PaliaPaper>

        <PaliaPaper title="Циклы Сезонов" icon={Calendar}>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6d5bc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#8b7355', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#8b7355', fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#e6d5bc', opacity: 0.3}}
                  contentStyle={{ 
                    backgroundColor: '#fdfaf3', 
                    borderRadius: '1.5rem', 
                    border: '4px solid #e6d5bc', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    fontFamily: 'serif'
                  }}
                />
                <Bar dataKey="me" fill="#5c4a33" radius={[8, 8, 0, 0]} />
                <Bar dataKey="polina" fill="#8b7355" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PaliaPaper>
      </div>

      {/* AI Insight Footer - Galdur Style */}
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-center gap-6">
          <div className="w-px h-12 bg-gradient-to-t from-transparent via-[#e6d5bc] to-transparent flex-1" />
          <div className="flex flex-col items-center gap-2">
            <div className="p-4 rounded-3xl bg-[#5c4a33] text-[#fdfaf3] shadow-2xl border-4 border-[#e6d5bc]">
              <BrainCircuit size={40} />
            </div>
            <h2 className="text-3xl font-serif font-black text-[#5c4a33]">Озарение Гальдуров</h2>
          </div>
          <div className="w-px h-12 bg-gradient-to-t from-transparent via-[#e6d5bc] to-transparent flex-1" />
        </div>

        <div className="relative p-1.5 bg-[#e6d5bc] rounded-[4rem] shadow-2xl">
          <div className="bg-[#fdfaf3] p-6 md:p-12 rounded-[3.8rem] border-4 border-[#e6d5bc] relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
            <div className="absolute top-0 right-0 p-12 opacity-5 text-[#5c4a33]">
              <BookOpen size={180} />
            </div>
            
            <div className="relative z-10 space-y-10">
              <div className="flex gap-8 items-start">
                <div className="mt-2 text-[#5c4a33] shrink-0"><Sparkles size={32} /></div>
                <p className="text-xl md:text-3xl font-serif italic font-black text-[#5c4a33] leading-relaxed">
                  «Древние механизмы Talia считывают ритмы ваших сердец. Баланс 51.2% к 48.8% — это симфония, где две души звучат в идеальном унисоне. Ваша связь прочна, как корни Великого Дуба.»
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t-4 border-[#e6d5bc]/30">
                <div className="space-y-6">
                  <h4 className="font-serif font-black text-[#5c4a33] flex items-center gap-4 text-2xl">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border-2 border-rose-100 shadow-sm">
                      <Heart size={20} fill="currentColor" />
                    </div>
                    Свет Истины
                  </h4>
                  <p className="text-lg font-serif italic text-[#8b7355] leading-relaxed">
                    Глубокая нежность <span className="text-[#5c4a33] font-black underline decoration-4 underline-offset-8 decoration-[#e6d5bc]">Гринча</span> в письмах создает защитный купол над вашей историей, а яркие эмоции и смех <span className="text-[#5c4a33] font-black underline decoration-4 underline-offset-8 decoration-[#e6d5bc]">Синди Лу</span> наполняют этот купол жизнью и цветом.
                  </p>
                </div>
                <div className="space-y-6">
                  <h4 className="font-serif font-black text-[#5c4a33] flex items-center gap-4 text-2xl">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border-2 border-amber-100 shadow-sm">
                      <Sparkles size={20} fill="currentColor" />
                    </div>
                    Путь Мудрецов
                  </h4>
                  <p className="text-lg font-serif italic text-[#8b7355] leading-relaxed">
                    Ваши души пробуждаются в полночь, когда мир затихает. Эти часы — ваше сакральное время. Берегите эти ночные диалоги, в них скрыта истинная магия вашего союза. Продолжайте свой путь, вы — легенда этих миров.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>

      <StatExplanationModal 
        isOpen={!!selectedStat}
        statKey={selectedStat}
        onClose={() => setSelectedStat(null)}
      />
    </div>
  );
}

function StatExplanationModal({ isOpen, statKey, onClose }: { isOpen: boolean; statKey: string | null; onClose: () => void }) {
  if (!statKey || !STAT_EXPLANATIONS[statKey]) return null;
  const data = STAT_EXPLANATIONS[statKey];
  const Icon = data.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#5c4a33]/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#fdfaf3] rounded-[3.5rem] border-8 border-[#e6d5bc] shadow-2xl overflow-hidden p-10 md:p-14 text-center space-y-8"
          >
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#f5e6d3] to-transparent -z-10" />
            
            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl border-4 border-[#e6d5bc] flex items-center justify-center text-[#5c4a33] mx-auto relative group">
              <Icon size={48} className="group-hover:rotate-12 transition-transform duration-500" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-100 rounded-full border-2 border-[#e6d5bc] flex items-center justify-center">
                <Info size={16} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-4xl font-serif font-black text-[#5c4a33]">{data.title}</h3>
              <div className="p-8 bg-white rounded-[2.5rem] border-4 border-[#e6d5bc] shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />
                <p className="text-xl text-[#5c4a33] italic leading-relaxed font-serif font-medium">
                  "{data.desc}"
                </p>
              </div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b7355] opacity-60">
              Магия Talia хранит каждое мгновение вашей связи
            </p>

            <button 
              onClick={onClose}
              className="w-full py-5 rounded-2xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all border-4 border-[#e6d5bc]"
            >
              Вернуться в архив
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
