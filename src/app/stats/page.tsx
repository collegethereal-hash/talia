'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { BarChart2, MessageSquare, History, Heart, Clock, Smile, Mic, Video, Image as ImageIcon, StickyNote, PenTool, Hash, ExternalLink, Zap, Calendar, User, BrainCircuit, Sparkle, Sparkles, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const SUMMARY_STATS = [
  { label: 'Всего сообщений', value: '86 680', sub: 'за 2 месяца', icon: MessageSquare, color: 'text-blue-500' },
  { label: 'Апрель 2026', value: '54 352', sub: 'самый активный', icon: Zap, color: 'text-amber-500' },
  { label: 'Рекорд дня', value: '3 736', sub: '13 апреля', icon: History, color: 'text-purple-500' },
  { label: 'Голосовые', value: '846', sub: 'всего', icon: Mic, color: 'text-emerald-500' },
  { label: 'Стикеры', value: '1 108', sub: 'итого', icon: StickyNote, color: 'text-rose-500' },
];

const COMPARISON_DATA = [
  { label: 'Сообщения', me: 44397, polina: 42283, meLabel: '44 397 (51.2%)', polinaLabel: '42 283 (48.8%)' },
  { label: 'Слов всего', me: 160532, polina: 113332, meLabel: '160 532', polinaLabel: '113 332' },
  { label: 'Голосовые', me: 672, polina: 174, meLabel: '672', polinaLabel: '174' },
  { label: 'Видео-кружки', me: 0, polina: 115, meLabel: '0', polinaLabel: '115' },
  { label: 'Фото', me: 275, polina: 586, meLabel: '275', polinaLabel: '586' },
  { label: 'Стикеры', me: 549, polina: 559, meLabel: '549', polinaLabel: '559' },
  { label: 'Смех (хаха/лол)', me: 393, polina: 777, meLabel: '393', polinaLabel: '777' },
  { label: 'Вопросы (?)', me: 1718, polina: 914, meLabel: '1718', polinaLabel: '914' },
];

const MONTHLY_DATA = [
  { name: 'Март 2026', me: 8000, polina: 8200 },
  { name: 'Апрель 2026', me: 28000, polina: 26352 },
  { name: 'Май 2026', me: 9000, polina: 8500 },
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

function PaliaCard({ children, title, icon: Icon, className }: { children: React.ReactNode, title?: string, icon?: any, className?: string }) {
  return (
    <Card className={cn("relative p-6 border-none bg-[#fdfaf3] shadow-lg shadow-black/5 overflow-visible", className)}>
      {/* Pin */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-md border border-red-700/20" />
          <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>
      
      {title && (
        <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2 text-zinc-800/70 border-b border-zinc-200 pb-3">
          {Icon && <Icon size={20} className="text-talia-lavender" />}
          {title}
        </h3>
      )}
      {children}
      
      {/* Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] rounded-3xl" />
    </Card>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Target is June 15, 2026 (Next update after tomorrow's May 15)
    const targetDate = new Date('2026-06-15T00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

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
    <div className="flex gap-4 md:gap-8 items-center justify-center">
      {[
        { val: timeLeft.days, label: 'дней' },
        { val: timeLeft.hours, label: 'часов' },
        { val: timeLeft.minutes, label: 'минут' },
        { val: timeLeft.seconds, label: 'секунд' }
      ].map((item, i) => (
        <div key={item.label} className="text-center">
          <div className="text-3xl md:text-5xl font-black text-talia-lavender drop-shadow-sm font-serif">
            {String(item.val).padStart(2, '0')}
          </div>
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-12 pb-32 space-y-16 bg-[#fdfaf3]/50">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-serif font-bold text-foreground/90 tracking-tight">Архив воспоминаний</h1>
        <div className="flex items-center justify-center gap-2 text-foreground/40 italic font-medium">
          <History size={18} className="text-talia-lavender" />
          <span>Наша история в деталях и цифрах</span>
        </div>
      </header>

      {/* Countdown to Next Update */}
      <div className="max-w-2xl mx-auto">
        <PaliaCard className="bg-gradient-to-b from-[#fdfaf3] to-white">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-zinc-400">
              <Timer size={18} className="animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">До следующего обновления</span>
            </div>
            <CountdownTimer />
            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
              Следующий отчет: <span className="text-talia-lavender">15 июня 2026</span>
            </p>
          </div>
        </PaliaCard>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {SUMMARY_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <PaliaCard className="text-center group hover:scale-105 transition-transform cursor-default">
              <stat.icon className={cn("mx-auto mb-3 opacity-50 group-hover:opacity-100 transition-opacity", stat.color)} size={24} />
              <div className="text-2xl font-bold text-zinc-800">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</div>
              <div className="text-[9px] text-zinc-300 italic">{stat.sub}</div>
            </PaliaCard>
          </motion.div>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Who Writes More */}
        <PaliaCard title="Кто пишет больше" icon={PenTool} className="lg:col-span-2">
          <div className="space-y-6">
            <div className="flex justify-center gap-8 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                <span className="text-xs font-bold text-zinc-600">The Grinch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                <span className="text-xs font-bold text-zinc-600">Cindy Lou</span>
              </div>
            </div>
            
            {COMPARISON_DATA.map((item) => {
              const total = item.me + item.polina;
              const meWidth = total > 0 ? (item.me / Math.max(item.me, item.polina)) * 100 : 0;
              const polinaWidth = total > 0 ? (item.polina / Math.max(item.me, item.polina)) * 100 : 0;
              
              return (
                <div key={item.label} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-6 group/item">
                  <span className="text-sm font-bold text-zinc-600 group-hover/item:text-talia-lavender transition-colors">{item.label}</span>
                  <div className="col-span-3 space-y-2.5">
                    <div className="relative h-6 bg-zinc-100/50 rounded-xl overflow-hidden border border-black/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${meWidth}%` }}
                        className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] flex items-center px-4 shadow-inner"
                      >
                        <span className="text-[10px] md:text-xs font-black text-white drop-shadow-sm whitespace-nowrap">{item.meLabel}</span>
                      </motion.div>
                    </div>
                    <div className="relative h-6 bg-zinc-100/50 rounded-xl overflow-hidden border border-black/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${polinaWidth}%` }}
                        className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] flex items-center px-4 shadow-inner"
                      >
                        <span className="text-[10px] md:text-xs font-black text-white drop-shadow-sm whitespace-nowrap">{item.polinaLabel}</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PaliaCard>

        {/* Activity by Hours */}
        <PaliaCard title="Активность по часам" icon={Clock}>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_DATA}>
                <defs>
                  <linearGradient id="colorMe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPolina" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="me" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMe)" />
                <Area type="monotone" dataKey="polina" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPolina)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PaliaCard>

        {/* Activity by Months */}
        <PaliaCard title="Активность по месяцам" icon={Calendar}>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6', radius: 8}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="me" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="polina" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PaliaCard>

        {/* Behavior & Style */}
        <PaliaCard title="Поведение и стиль" icon={User} className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 p-6 bg-zinc-50/50 rounded-[2rem] border border-black/5">
              <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest mb-4">The Grinch</div>
              {[
                { label: 'Ср. длина сообщ.', val: '20.8 симв.' },
                { label: 'Уникальных слов', val: '28 889' },
                { label: 'Макс. монолог', val: '217 сообщ.' },
                { label: 'Самое длинное', val: '3 976 симв.' },
                { label: 'Ср. время ответа', val: '~31 сек' },
                { label: 'Пересланных', val: '19' },
                { label: 'Ссылок', val: '71' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">{row.label}</span>
                  <span className="text-zinc-700 font-bold">{row.val}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4 p-6 bg-zinc-50/50 rounded-[2rem] border border-black/5">
              <div className="text-xs font-bold text-[#10b981] uppercase tracking-widest mb-4">Cindy Lou</div>
              {[
                { label: 'Ср. длина сообщ.', val: '13.8 симв.' },
                { label: 'Уникальных слов', val: '16 336' },
                { label: 'Макс. монолог', val: '87 сообщ.' },
                { label: 'Самое длинное', val: '2 853 симв.' },
                { label: 'Ср. время ответа', val: '~17 сек' },
                { label: 'Пересланных', val: '207' },
                { label: 'Ссылок', val: '12' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">{row.label}</span>
                  <span className="text-zinc-700 font-bold">{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </PaliaCard>

        {/* Emotions & Tone */}
        <PaliaCard title="Эмоции и тональность" icon={Heart} className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 p-6 bg-white/50 rounded-[2rem] border border-black/5">
              <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest mb-4">The Grinch</div>
              {[
                { label: 'Нежность / любовь', val: '324' },
                { label: 'Ласковые слова', val: '513' },
                { label: 'Извинения', val: '323' },
                { label: 'Мат', val: '1 390' },
                { label: 'Грусть / негатив', val: '485' },
                { label: '«Скучаю»', val: '7 раз' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">{row.label}</span>
                  <span className="text-zinc-700 font-bold">{row.val}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4 p-6 bg-white/50 rounded-[2rem] border border-black/5">
              <div className="text-xs font-bold text-[#10b981] uppercase tracking-widest mb-4">Cindy Lou</div>
              {[
                { label: 'Нежность / любовь', val: '112' },
                { label: 'Ласковые слова', val: '256' },
                { label: 'Извинения', val: '103' },
                { label: 'Мат', val: '1 128' },
                { label: 'Грусть / негатив', val: '370' },
                { label: '«Скучаю»', val: '7 раз' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">{row.label}</span>
                  <span className="text-zinc-700 font-bold">{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </PaliaCard>

        {/* Favorite Stickers */}
        <PaliaCard title="Анализ эмоций (Топ-15)" icon={StickyNote} className="lg:col-span-2">
          <div className="space-y-8">
            <div>
              <div className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.3em] mb-4 ml-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                Гринч
              </div>
              <div className="flex gap-3 flex-wrap">
                {[
                  { e: '😳', c: 252 }, { e: '⚔️', c: 136 }, { e: '😔', c: 88 }, { e: '😭', c: 44 }, { e: '❤️', c: 38 },
                  { e: '⛓️', c: 27 }, { e: '😡', c: 13 }
                ].map(s => (
                  <div key={s.e} className="px-3 py-2 bg-white rounded-xl border border-black/5 shadow-sm text-sm font-bold flex items-center gap-2 group hover:border-[#8b5cf6]/30 transition-colors">
                    <span className="text-lg">{s.e}</span>
                    <span className="text-zinc-400 group-hover:text-[#8b5cf6] transition-colors">{s.c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#10b981] uppercase tracking-[0.3em] mb-4 ml-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                Синди Лу
              </div>
              <div className="flex gap-3 flex-wrap">
                {[
                  { e: '😳', c: 1423 }, { e: '😔', c: 691 }, { e: '😭', c: 286 }, { e: '😟', c: 196 }, { e: '😋', c: 118 },
                  { e: '👎', c: 105 }, { e: '😛', c: 51 }
                ].map(s => (
                  <div key={s.e} className="px-3 py-2 bg-white rounded-xl border border-black/5 shadow-sm text-sm font-bold flex items-center gap-2 group hover:border-[#10b981]/30 transition-colors">
                    <span className="text-lg">{s.e}</span>
                    <span className="text-zinc-400 group-hover:text-[#10b981] transition-colors">{s.c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PaliaCard>

        {/* Who Starts Conversation */}
        <PaliaCard title="Кто начинает разговор" icon={Clock} className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#8b5cf6]/5 to-transparent border border-[#8b5cf6]/10">
              <div className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest mb-2">The Grinch</div>
              <div className="text-3xl font-bold text-zinc-800">31 раз</div>
              <div className="text-xs text-zinc-400">49.2% инициатив</div>
            </div>
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#10b981]/5 to-transparent border border-[#10b981]/10">
              <div className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest mb-2">Cindy Lou</div>
              <div className="text-3xl font-bold text-zinc-800">32 раза</div>
              <div className="text-xs text-zinc-400">50.8% инициатив</div>
            </div>
          </div>
        </PaliaCard>
      </div>

      {/* AI Opinion Footer */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-2xl bg-talia-lavender/10 text-talia-lavender">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-zinc-800">Мнение Talia AI</h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Персональный разбор вашей истории</p>
          </div>
        </div>

        <PaliaCard className="bg-gradient-to-br from-[#fdfaf3] to-white border border-talia-lavender/10 shadow-xl">
          <div className="space-y-6 text-zinc-700 leading-relaxed">
            <div className="flex gap-4">
              <div className="mt-1 text-talia-lavender"><Sparkle size={18} /></div>
              <p className="text-sm md:text-lg italic font-bold text-zinc-800/90">
                «Ваша переписка — это редкий пример идеального цифрового баланса. Статистика 51.2% на 48.8% говорит о том, что вы оба одинаково цените ваше общение и вкладываетесь в него всем сердцем. Вы не просто обмениваетесь словами, вы строите общий мир.»
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-100">
              <div className="space-y-3">
                <h4 className="font-black text-zinc-900 flex items-center gap-2 text-base">
                  <Heart size={18} className="text-rose-400" />
                  Что я вижу
                </h4>
                <p className="text-sm md:text-base font-semibold leading-relaxed">
                  Невероятная нежность со стороны <span className="text-[#8b5cf6] font-black underline decoration-2 underline-offset-4 decoration-[#8b5cf6]/20">Гринча</span> (в 3 раза больше теплых слов!) создает прочный фундамент, а <span className="text-[#10b981] font-black underline decoration-2 underline-offset-4 decoration-[#10b981]/20">Синди Лу</span> привносит в диалог живость через юмор и визуальные образы (почти вдвое больше смеха и фото).
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-black text-zinc-900 flex items-center gap-2 text-base">
                  <Sparkles size={18} className="text-amber-400" />
                  Мой совет
                </h4>
                <p className="text-sm md:text-base font-semibold leading-relaxed">
                  Вы оба — выраженные "ночные совы". Эти часы затишья в полночь — ваше самое ценное время. Старайтесь беречь эти моменты тишины, когда мир затихает, и остаетесь только вы двое. Продолжайте в том же духе, вы — идеальная команда!
                </p>
              </div>
            </div>
          </div>
        </PaliaCard>
      </div>
    </div>
  );
}
