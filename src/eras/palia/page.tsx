'use client';

import { RelationshipTimer } from "@/eras/palia/components/RelationshipTimer";
import { WeatherWidget } from "@/eras/palia/components/WeatherWidget";
import { PetHub } from "@/eras/palia/components/PetHub";
import { Card } from "@/components/Card";
import { AuthScreen, OnboardingScreen } from "@/eras/palia/components/AuthSystem";
import { Sparkles, MessageCircle, Heart, Cookie, Timer, RefreshCw, BrainCircuit, Sparkle, Anchor, Waves, X, HelpCircle, Settings } from "lucide-react";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from "@/components/DataProvider";
import { supabase } from '@/lib/supabase';

const FORTUNES = [
  "Сегодня вам суждено сделать то, на что вы долго не решались. Напиши прямо сейчас самое дерзкое сообщение из возможных. 🔥",
  "Звезды говорят, что сегодня отличная ночь для спонтанной поездки. Куда угодно, главное — вместе. 🗺️",
  "Секрет, который вы боялись рассказать друг другу, сегодня может стать вашей главной суперсилой. 🎭",
  "Разрешаю вам сегодня нарушить одно самое строгое правило. Какое? Решать только вам двоим. 🎲",
  "В ближайшие 24 часа скажи 'ДА' на любое, даже самое безумное предложение от своего партнера. 🌪️",
  "Случайный звонок посреди ночи сегодня не просто допустим, а строго рекомендован астрологами. 🌙",
  "Вы стоите на пороге приключения, которое начнется с одной невинной шутки. Будьте осторожны... или нет! 😉",
  "Сегодня ваш день непослушания. Закажите вредную еду, отмените планы и сделайте что-то исключительно для себя. 🍕",
  "Вам выпал шанс задать партнеру абсолютно любой вопрос, на который он будет обязан ответить максимально честно. 🗝️",
  "Скоро вам предстоит испытать адреналин вместе. Подготовьтесь к учащенному сердцебиению! 💓",
  "Ваша любовь сегодня похожа на искру у пороховой бочки. Достаточно одного горячего взгляда. 💥",
  "Отправьте партнеру песню, которая ассоциируется у вас с вашим самым секретным воспоминанием. 🎶",
  "Сегодня удача сопутствует смелым. Украдите поцелуй, даже если вы далеко друг от друга. Вы найдете способ. 💋",
  "Ожидайте внезапный всплеск страсти. Сегодняшний вечер пойдет совсем не по плану, и вам это очень понравится. 🍷",
  "Вас ждет сюрприз, от которого мурашки побегут по коже. Главное — не забудьте закрыть глаза, когда вас попросят. 🎁",
];

const INTERESTING_FACTS = [
  "Морские выдры держатся за лапки во сне, чтобы их не унесло течением. Это помогает им не терять друг друга в океане 🦦",
  "Пингвины Адели ищут по всему побережью самый идеальный и гладкий камешек, чтобы подарить его своей избраннице 🐧",
  "Слоны способны узнавать свое отражение в зеркале и проявлять сочувствие к другим членам стада 🐘",
  "Коровы заводят лучших друзей и испытывают сильный стресс, если их разлучают на долгое время 🐄",
  "Волки выбирают пару один раз и на всю жизнь. Они верны своему партнеру до самого конца 🐺",
  "Пчелы могут передавать друг другу информацию о лучших местах с цветами с помощью специального 'танца' 🐝",
  "Белки ежегодно сажают тысячи деревьев, просто забывая, куда они спрятали свои орехи 🐿️",
  "У дельфинов есть имена друг для друга — они используют уникальный свист, чтобы звать конкретного сородича 🐬",
  "Морские коньки плавают парами, сцепившись хвостами, чтобы их не разделило морское течение 🌊",
  "Сердца китов настолько огромны, что человек мог бы плавать по их артериям 🐋",
  "Вороны очень умны и могут запоминать лица людей на долгие годы, передавая эту информацию своим детям 🐦",
  "Кошки почти никогда не мяукают друг другу. Этот звук они используют специально для общения с людьми 🐱",
  "Свет далеких звезд, который мы видим ночью, часто принадлежит звездам, которые погасли миллионы лет назад ✨",
  "В Японии существует искусство Кинцуги — починка разбитой посуды золотом, что делает трещины частью красоты 🏺",
  "Некоторые виды медуз технически бессмертны — они могут возвращаться в стадию полипа и начинать жизнь заново 🪼",
  "Скорпионы светятся в темноте под ультрафиолетовым светом неоновым голубым цветом 🦂",
  "У осьминогов три сердца, а их кровь имеет голубой цвет из-за высокого содержания меди 🐙",
  "Тигры имеют полосатую не только шерсть, но и саму кожу под ней. Рисунок каждой особи уникален 🐅",
  "Ленивцы могут задерживать дыхание под водой до 40 минут — дольше, чем дельфины 🦥",
  "В космосе царит абсолютная тишина, так как там нет воздуха, чтобы проводить звуковые волны 🌌",
  "Самое старое дерево на Земле — сосна Мафусаил, которой более 4800 лет. Она видела рассвет цивилизаций 🌳",
  "Снег на самом деле не белый, он прозрачный. Мы видим его белым из-за отражения света кристаллами льда ❄️",
  "Улитки могут спать до трех лет, если условия окружающей среды становятся слишком суровыми 🐌",
  "Бабочки чувствуют вкус ногами — так они понимают, подходит ли лист для того, чтобы отложить на него яйца 🦋",
  "Гроза на Юпитере может длиться веками. Великое Красное Пятно — это шторм, который не утихает уже 350 лет 🌀",
];

const BOTTLE_MESSAGES = [
  "Полиночка, помни, что твоя семья и друзья безумно тебя любят и гордятся каждым твоим шагом. Ты — их главная радость! 🌸",
  "Где-то в мире сегодня проснулся маленький пушистик, чья жизнь станет лучше благодаря твоему доброму сердцу. Свети ярко! 🐾",
  "Даже если день кажется сложным, вспомни о тех, кто всегда готов подставить плечо. Мы все верим в тебя и твою невероятную силу! ✨",
  "Милая Полина, твоя улыбка делает этот мир теплее. Никогда не сомневайся в себе — ты вдохновляешь окружающих одним своим присутствием! ❤️",
  "В мире еще столько мокрых носиков, которые ждут твоей ласки. Набирайся сил и помни, что ты делаешь невероятно важное дело! 🐕",
  "Твои близкие всегда рядом, даже если физически далеко. Закрой глаза и почувствуй, как сильно тебя любят! 🌟",
  "Полина, твое сердце больше, чем океан. И пусть иногда бывает тяжело, знай: ты делаешь этот мир лучше для своей семьи, друзей и беззащитных малышей. 🌊",
  "Вдох-выдох... Ты справляешься лучше, чем думаешь! Позвони родителям или близкой подруге — они будут счастливы просто услышать твой голос. 📞",
  "Никогда не забывай, какая ты потрясающая! Твоя забота спасает, твоя любовь исцеляет. Продолжай сиять, Полиночка! ☀️",
  "Сегодня отличный день, чтобы поверить в свои силы так же сильно, как в тебя верят самые родные люди. Обнимаем крепко-крепко! 🫂",
];

export default function Home() {
  const router = useRouter();
  const { dailyFact } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [bottleMessage, setBottleMessage] = useState<string | null>(null);
  const [isBottleOpen, setIsBottleOpen] = useState(false);
  const [hasUnreadBottle, setHasUnreadBottle] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('lumina_auth');
    if (auth && !window.location.search.includes('reset')) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const checkBottle = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('global_state').select('value').eq('key', 'bottle_state').single();
      
      let currentMsg = BOTTLE_MESSAGES[Math.floor(Math.random() * BOTTLE_MESSAGES.length)];
      if (data && data.value) {
        const state = data.value;
        if (state.day === today) {
          currentMsg = state.message || currentMsg;
          setHasUnreadBottle(state.readDay !== today);
        } else {
          setHasUnreadBottle(true);
          await supabase.from('global_state').upsert({ key: 'bottle_state', value: { message: currentMsg, day: today, readDay: null } });
        }
      } else {
        setHasUnreadBottle(true);
        await supabase.from('global_state').upsert({ key: 'bottle_state', value: { message: currentMsg, day: today, readDay: null } });
      }
      setBottleMessage(currentMsg);
    };
    checkBottle();
  }, []);

  const handleAuthComplete = (user: string) => {
    localStorage.setItem('lumina_auth', user);
    setIsAuthenticated(true);
    
    const hasSeenOnboarding = localStorage.getItem('lumina_onboarding_seen');
    if (!hasSeenOnboarding) {
      localStorage.setItem('lumina_onboarding_seen', 'true');
      router.push('/about');
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('lumina_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const openBottle = async () => {
    setIsBottleOpen(true);
    setHasUnreadBottle(false);
    const today = new Date().toISOString().split('T')[0];

    await supabase.from('global_state').upsert({
      key: 'bottle_state',
      value: { message: bottleMessage, day: today, readDay: today }
    });
  };

  if (!isAuthenticated) {
    return <AuthScreen onComplete={handleAuthComplete} />;
  }

  return (
    <>
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 pt-12 pb-32 space-y-8">
        {/* Floating Bottle Section */}
        <div className="fixed bottom-28 right-6 z-[100] md:bottom-32 md:right-12">
          <motion.button
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.9 }}
            onClick={openBottle}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-cyan-200/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[2rem] shadow-xl border-4 border-cyan-100 flex items-center justify-center text-cyan-500 relative z-10">
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Waves size={32} className="absolute -bottom-1 -right-1 opacity-20" />
                <Anchor size={28} className="relative z-10" />
              </motion.div>
            </div>
            
            <AnimatePresence>
              {hasUnreadBottle && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-lg z-20"
                >
                  1
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {isBottleOpen && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBottleOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#fdfaf3] rounded-[3rem] border-8 border-[#e6d5bc] shadow-2xl overflow-hidden p-8 md:p-12 text-center space-y-8"
              >
                <div className="absolute top-0 left-0 right-0 h-32 bg-cyan-100/50 -z-10" />
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl border-4 border-cyan-100 flex items-center justify-center text-cyan-500 mx-auto">
                  <Waves size={48} />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif font-bold text-[#5c4a33]">Послание в бутылке</h3>
                  <div className="p-6 bg-white rounded-2xl border-2 border-[#e6d5bc] shadow-inner italic text-lg text-[#5c4a33] font-medium leading-relaxed">
                    "{bottleMessage}"
                  </div>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355] opacity-60">
                  Это послание приплыло к тебе сегодня и исчезнет на рассвете...
                </p>

                <button 
                  onClick={() => setIsBottleOpen(false)}
                  className="w-full py-4 rounded-2xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  Закрыть и сохранить в сердце
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <header className="text-center space-y-4 relative">
          <Link href="/admin" className="absolute -top-4 right-0 p-3 bg-[#e6d5bc]/20 rounded-2xl text-[#8b7355] hover:bg-[#e6d5bc]/40 transition-all group">
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </Link>
          <Link href="/about">
            <motion.h1 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-5xl font-serif font-bold text-[#5c4a33] tracking-tight cursor-pointer select-none inline-block"
            >
              Talia
            </motion.h1>
          </Link>
          <p className="text-[#8b7355] italic font-medium tracking-wide">
            "Наш уютный уголок магии и воспоминаний"
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RelationshipTimer />
          <WeatherWidget />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[minmax(180px,auto)]">
          {/* Pinterest-like layout */}
          <div className="md:col-span-2 md:row-span-1">
            <PetHub />
          </div>
          
          <div className="md:col-span-1">
            <FortuneCard />
          </div>

          <div className="md:col-span-3">
            <Card delay={0.1} className="relative flex flex-col md:flex-row items-center justify-between gap-6 py-10 px-6 md:px-12 bg-[#fdfaf3] border-4 border-[#e6d5bc] shadow-2xl rounded-[2.5rem] overflow-hidden group">
              <div className="flex items-center gap-8 z-10 w-full md:w-auto">
                <div className="p-5 rounded-3xl bg-[#f5e6d3] text-[#5c4a33] shadow-xl border-4 border-[#e6d5bc] group-hover:rotate-6 transition-transform duration-500 shrink-0">
                  <BrainCircuit size={40} />
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="font-black uppercase tracking-[0.3em] text-[10px] text-[#8b7355] flex items-center gap-2">
                    <Sparkle size={12} className="text-amber-500" />
                    Интересный факт
                  </h3>
                  <p className="text-xl md:text-2xl font-serif italic text-[#5c4a33] leading-relaxed max-w-2xl font-bold">
                    "{dailyFact || "Морские выдры держатся за лапки во сне, чтобы их не унесло течением... 🦦"}"
                  </p>
                </div>
              </div>
              
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function FortuneCard() {
  const [fortune, setFortune] = useState<string | null>(null);
  const [isBreaking, setIsBreaking] = useState(false);
  const [nextCookieTime, setNextCookieTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCookie = async () => {
      const { data } = await supabase.from('global_state').select('value').eq('key', 'fortune_state').single();
      if (data && data.value) {
        const state = data.value;
        const now = new Date().getTime();
        if (state.nextTime && state.nextTime > now) {
          setFortune(state.fortune);
          setNextCookieTime(state.nextTime);
        }
      }
      setIsLoading(false);
    };
    fetchCookie();
  }, []);

  useEffect(() => {
    if (!nextCookieTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextCookieTime - now;
      
      if (distance < 0) {
        setFortune(null);
        setNextCookieTime(null);
        setTimeLeft("");
      } else {
        const h = Math.floor(distance / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${h}ч ${m}м ${s}с`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextCookieTime]);

  const breakCookie = async () => {
    setIsBreaking(true);
    setTimeout(async () => {
      const randomFortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      const nextTime = new Date().getTime() + 24 * 60 * 60 * 1000;
      
      setFortune(randomFortune);
      setNextCookieTime(nextTime);
      setIsBreaking(false);

      await supabase.from('global_state').upsert({
        key: 'fortune_state',
        value: { fortune: randomFortune, nextTime: nextTime }
      });
    }, 800);
  };

  return (
    <Card delay={0.2} className="relative h-full flex flex-col items-center justify-between bg-[#fdfaf3] border-4 border-[#e6d5bc] shadow-2xl p-8 rounded-[2rem] overflow-hidden group">
      <div className="w-full flex justify-between items-start">
        <div className="text-left">
          <h3 className="text-2xl font-serif font-bold text-[#5c4a33]">Fortune</h3>
          <p className="text-[9px] font-black text-[#8b7355] uppercase tracking-widest">Печенье Talia</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#f5e6d3] flex items-center justify-center text-[#5c4a33] border-2 border-[#e6d5bc]">
          <Cookie size={20} />
        </div>
      </div>

      <div className="relative py-4 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <RefreshCw className="animate-spin text-[#e6d5bc]" size={40} />
              <p className="text-[10px] font-black uppercase text-[#8b7355] opacity-40">Загрузка судьбы...</p>
            </motion.div>
          ) : !fortune ? (
            <motion.div
              key="cookie-visual"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="relative"
            >
              <motion.div
                animate={isBreaking ? { 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 0.9, 1.1, 1]
                } : { y: [0, -5, 0] }}
                transition={isBreaking ? { duration: 0.8 } : { duration: 4, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-[2rem] flex items-center justify-center text-amber-700 shadow-xl border-4 border-[#e6d5bc]"
              >
                <Cookie size={48} />
              </motion.div>
              <div className="absolute -inset-2 border-2 border-dashed border-[#e6d5bc] rounded-[2.5rem] animate-[spin_20s_linear_infinite]" />
            </motion.div>
          ) : (
            <motion.div
              key="fortune-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border-4 border-[#e6d5bc] shadow-lg relative"
            >
              <Sparkles className="absolute -top-3 -right-3 text-amber-400" size={24} />
              <p className="text-sm text-[#5c4a33] italic leading-relaxed font-bold text-center">
                "{fortune}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="w-full py-4 rounded-2xl bg-[#e6d5bc]/30 border-2 border-dashed border-[#e6d5bc]" />
        ) : !fortune ? (
          <button 
            onClick={breakCookie}
            disabled={isBreaking}
            className="w-full py-4 rounded-2xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-[10px] hover:bg-[#4a3b29] transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isBreaking ? "Разламываю..." : "Разломить печенье"}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#f5e6d3] rounded-full border-2 border-[#e6d5bc]">
              <Timer size={12} className="text-[#8b7355]" />
              <span className="text-[9px] font-black text-[#8b7355] uppercase tracking-widest">{timeLeft}</span>
            </div>
            <p className="text-[8px] text-[#8b7355]/60 font-bold uppercase">До следующего предсказания</p>
          </div>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
    </Card>
  );
}

const FAQModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const categories = [
    {
      title: "🐾 Питомник Арчи",
      items: [
        { q: "Как Арчи растет?", a: "За каждое действие (кормление, вода, ласка) Арчи получает опыт (XP). Каждые 100 XP повышают его уровень. С каждым уровнем он становится мудрее!" },
        { q: "Что если я забуду его покормить?", a: "Арчи очень выносливый, но он начнет грустить и его показатели будут падать. Если показатели упадут до нуля, ваша серия заботы (Streak) может прерваться." },
        { q: "Почему Арчи парит?", a: "В мире Talia Арчи — звездное существо. Он принимает астральную форму, чтобы лучше чувствовать ваши мысли и связь." }
      ]
    },
    {
      title: "📸 Галерея Памяти",
      items: [
        { q: "Как добавить новое фото?", a: "Зайди в раздел 'Галерея' и нажми 'Снять'. Там ты сможешь загрузить любой момент и подписать его." },
        { q: "Что за кнопка 'Вспомнить'?", a: "Это магия Talia! Она выбирает случайное фото из вашего архива, чтобы напомнить о теплом моменте." }
      ]
    },
    {
      title: "✨ Магические Механики",
      items: [
        { q: "Послание в бутылке", a: "Каждый день в океан Talia приплывает новая записка. Это короткие послания, которые живут всего 24 часа." },
        { q: "Печенье Судьбы", a: "Разламывай его раз в сутки, чтобы получить смелое и вдохновляющее предсказание для вас двоих." },
        { q: "Таймер Связи", a: "Он считает каждую секунду с того момента, как вы решили быть вместе. Это ваше общее время." }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#fdfaf3] rounded-[3rem] border-8 border-[#e6d5bc] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-12 bg-[#f5e6d3] border-b-4 border-[#e6d5bc] relative shrink-0">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/20 transition-colors">
                <X size={32} className="text-[#5c4a33]" />
              </button>
              <div className="space-y-2">
                <div className="inline-flex px-4 py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[10px] font-black uppercase tracking-[0.2em]">
                  Путеводитель по миру
                </div>
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#5c4a33] tracking-tight">Библиотека Talia</h2>
                <p className="text-[#8b7355] italic text-lg max-w-xl">
                  "Здесь собраны все знания о нашем маленьком мире, чтобы ты всегда чувствовала себя как дома."
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 custom-scrollbar">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-[#5c4a33] flex items-center gap-3 border-b-2 border-[#e6d5bc] pb-2">
                    {cat.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cat.items.map((item, i) => (
                      <div key={i} className="bg-white p-6 rounded-[2rem] border-4 border-[#e6d5bc] shadow-sm space-y-3">
                        <p className="font-black uppercase text-[10px] tracking-widest text-[#8b7355] flex items-center gap-2">
                          <HelpCircle size={14} className="text-amber-500" />
                          {item.q}
                        </p>
                        <p className="text-[#5c4a33] text-sm leading-relaxed italic">
                          "{item.a}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-8 bg-[#fdfaf3] border-t-2 border-[#e6d5bc] text-center shrink-0">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b7355] opacity-60">
                С любовью для Полины • 2026
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
