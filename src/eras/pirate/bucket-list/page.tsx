'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Anchor, Sword, Scroll, Skull, Bomb, Shield, Crown, Feather, Coins, MapPin, Clock, Target, Eye, Gem, X, Check, Map
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PirateBucketList() {
  const [activeTab, setActiveTab] = useState<'code' | 'quests'>('quests');
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [signed, setSigned] = useState(false);
  const [dice, setDice] = useState({ d1: 1, d2: 1, rolling: false });

  const rollDice = () => {
    setDice({ ...dice, rolling: true });
    setTimeout(() => {
      setDice({
        d1: Math.floor(Math.random() * 6) + 1,
        d2: Math.floor(Math.random() * 6) + 1,
        rolling: false
      });
    }, 1000);
  };

  const laws = [
    { id: 1, title: "О праве на добычу", desc: "Всякий найденный на кухне десерт делится поровну между Капитаном и Квартирмейстером. Тайные заначки караются щекоткой." },
    { id: 2, title: "О тишине в каюте", desc: "После полуночи на борту объявляется режим тишины. Нарушитель обязан принести кофе в постель на следующее утро." },
    { id: 3, title: "О выборе курса", desc: "Направление для вечернего просмотра выбирается по очереди. Споры решаются дуэлью на подушках или в камень-ножницы-бумага." },
    { id: 4, title: "О заботе о команде", desc: "Грустный пират — плохой пират. Если один из командиров не в духе, второй обязан применить 'экстренные обнимашки'." },
  ];

  const [quests, setQuests] = useState([
    {
      id: 'q1',
      title: "Охота за Головой",
      subtitle: "Найти интенданта Смита",
      description: "Этот проныра скрывается на торговом фрегате 'Золотая Антилопа'. Найдите его и заберите судовой журнал.",
      points: 500,
      current: 0,
      target: 1,
      type: 'bounty',
      icon: <Target size={24} />,
      lore: "Интендант Смит украл чертежи нового флагмана. Его видели в порту Тортуги 3 дня назад. Он труслив, но хитер."
    },
    {
      id: 'q2',
      title: "Абордаж",
      subtitle: "Захватить 3 испанских галеона",
      description: "Для пополнения казны нам нужны тяжелые корабли. Отправьтесь в южные воды и возьмите на абордаж 3 галеона.",
      points: 1200,
      current: 0,
      target: 3,
      type: 'combat',
      icon: <Sword size={24} />,
      lore: "Испанцы везут золото из Нового Света. Их галеоны медлительны, но хорошо вооружены. Нужен внезапный удар."
    },
    {
      id: 'q3',
      title: "Поиск Сокровищ",
      subtitle: "Карта Черной Бороды",
      description: "Соберите 3 фрагмента карты, чтобы узнать координаты зарытого клада на Острове Погибших Кораблей.",
      points: 800,
      current: 1,
      target: 3,
      type: 'treasure',
      icon: <Gem size={24} />,
      lore: "Первый фрагмент мы нашли в бочке с ромом. Остальные два находятся у губернаторов Ямайки и Тортуги."
    },
    {
      id: 'q4',
      title: "Тайная Операция",
      subtitle: "Внедрение в Тортугу",
      description: "Оденьтесь как простые торговцы и разведайте планы губернатора в таверне 'Пьяный Осьминог'.",
      points: 600,
      current: 0,
      target: 1,
      type: 'spy',
      icon: <Eye size={24} />,
      lore: "Губернатор готовит облаву на пиратов. Нам нужно знать точное время и количество кораблей."
    },
    {
      id: 'q5',
      title: "Проклятие Морей",
      subtitle: "Одолеть Кракена",
      description: "Чудовище терроризирует наши торговые пути. Соберите флот и дайте бой морскому дьяволу.",
      points: 2500,
      current: 0,
      target: 1,
      type: 'boss',
      icon: <Skull size={24} />,
      lore: "Старинные легенды говорят, что Кракен боится огня. Нужно снарядить брандеры."
    },
    {
      id: 'q6',
      title: "Контрабанда",
      subtitle: "Доставить 5 бочек рома",
      description: "Наш связной в Королевской Гавани ждет груз. Доставьте ром в целости и сохранности.",
      points: 400,
      current: 2,
      target: 5,
      type: 'smuggle',
      icon: <Bomb size={24} />,
      lore: "Патрульные корабли шарят повсюду. Придется идти через Рифы Скелетов."
    },
    {
      id: 'q7',
      title: "Картография",
      subtitle: "Исследовать 3 острова",
      description: "Нанесите на карту неизведанные острова к западу от Бермуд. Там могут быть тайные гавани.",
      points: 700,
      current: 1,
      target: 3,
      type: 'explore',
      icon: <Map size={24} />,
      lore: "Течения там коварные, а рифы острые. Но эти гавани спасут нас в случае погони."
    }
  ]);

  const totalPoints = quests.filter(q => q.current === q.target).reduce((acc, q) => acc + q.points, 0);

  return (
    <div className="relative min-h-screen bg-[#1c120c] text-stone-800 font-serif overflow-hidden selection:bg-amber-800/30">
      
      {/* Background Decor: Wooden Table / Map Vibe */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d1b10]/80 to-[#1c120c]/95" />
        {/* Giant compass or map element in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[20px] border-stone-800/5 rounded-full flex items-center justify-center">
          <div className="w-[700px] h-[700px] border-[2px] border-stone-800/5 rounded-full border-dashed" />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-40 space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4 relative">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="inline-block"
          >
             <div className="p-4 bg-amber-900/20 rounded-full border-2 border-amber-900/30 shadow-2xl">
                <Scroll size={64} className="text-amber-600" />
             </div>
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-lg">
            Доска Поручений
          </h1>
          <p className="text-amber-200/40 font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4">
             <Sword size={14} /> Капитанский стол <Sword size={14} />
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="flex bg-[#2d1b10] p-1.5 rounded-2xl border border-stone-800 shadow-inner">
            <button
              onClick={() => setActiveTab('code')}
              className={cn(
                "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'code' 
                  ? "bg-amber-600 text-stone-900 shadow-lg" 
                  : "text-amber-200/30 hover:text-amber-200"
              )}
            >
              <Shield size={14} /> Кодекс
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={cn(
                "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'quests' 
                  ? "bg-amber-600 text-stone-900 shadow-lg" 
                  : "text-amber-200/30 hover:text-amber-200"
              )}
            >
              <MapPin size={14} /> Экспедиции
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'code' ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left: The Laws */}
              <div className="lg:col-span-8 space-y-6">
                <div className="p-8 md:p-12 bg-[#f4ebd0] text-stone-800 rounded-3xl shadow-2xl border-[16px] border-[#3e2723]/20 relative overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 opacity-[0.08] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="relative z-10 space-y-8">
                    <div className="text-center border-b-2 border-stone-800/10 pb-4">
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-stone-800">Действующие Статьи</h2>
                      <p className="text-xs font-bold text-stone-600 uppercase tracking-widest">Обязательны к исполнению</p>
                    </div>

                    <div className="space-y-6">
                      {laws.map((law, index) => (
                        <div key={law.id} className="flex gap-4 items-start border-b border-stone-800/5 pb-4 last:border-0">
                          <span className="font-black text-amber-800 text-xl">{index + 1}.</span>
                          <div>
                            <h4 className="text-lg font-bold text-stone-800">{law.title}</h4>
                            <p className="text-stone-600 text-sm italic leading-relaxed">"{law.desc}"</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-end pt-6 border-top border-stone-800/10 opacity-70">
                      <div>
                        <p className="font-serif italic text-xs text-stone-600">Подписано кровью и клятвами,</p>
                        <p className="font-bold text-stone-800">Капитаны Гринч и Синди Лу</p>
                      </div>
                      <div className="w-16 h-16 rounded-full border-2 border-red-800 flex items-center justify-center text-red-800 rotate-12 font-bold text-xs uppercase">
                        Печать
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Interactive element */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-[#2d1b10] border-2 border-stone-800 text-center space-y-6 shadow-2xl">
                  <div className="w-20 h-20 bg-amber-900/20 rounded-full flex items-center justify-center text-amber-500 mx-auto border-2 border-amber-900/30">
                    <Feather size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-amber-100">Подписать Кодекс</h3>
                    <p className="text-xs text-amber-100/40 leading-relaxed">Подтвердите, что вы обязуетесь следовать законам Тортуги.</p>
                  </div>
                  <button
                    onClick={() => setSigned(true)}
                    className={cn(
                      "w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                      signed 
                        ? "bg-emerald-600 text-white shadow-lg cursor-default" 
                        : "bg-amber-600 text-stone-900 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    )}
                  >
                    {signed ? "Кодекс Подписан! 📜" : "Скрепить Клятвой"}
                  </button>
                </div>

                {/* Pirate Dice Box */}
                <div className="p-8 rounded-[2.5rem] bg-[#2d1b10] border-2 border-stone-800 text-center space-y-6 shadow-2xl">
                  <div className="w-16 h-16 bg-stone-800/20 rounded-full flex items-center justify-center text-amber-500 mx-auto border border-stone-700">
                    <Crown size={28} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-amber-100">Пиратские Кости</h3>
                    <p className="text-xs text-amber-100/40 leading-relaxed">Для решения споров. У кого больше — тот и прав!</p>
                  </div>
                  
                  <div className="flex justify-center gap-4 py-2">
                    <motion.div 
                      animate={dice.rolling ? { rotate: [0, 360, 0], scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5 }}
                      className="w-14 h-14 bg-[#f4ebd0] text-stone-800 rounded-xl flex items-center justify-center text-2xl font-black shadow-lg border-2 border-stone-800"
                    >
                      {dice.d1}
                    </motion.div>
                    <motion.div 
                      animate={dice.rolling ? { rotate: [0, -360, 0], scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5 }}
                      className="w-14 h-14 bg-[#f4ebd0] text-stone-800 rounded-xl flex items-center justify-center text-2xl font-black shadow-lg border-2 border-stone-800"
                    >
                      {dice.d2}
                    </motion.div>
                  </div>

                  <button
                    onClick={rollDice}
                    disabled={dice.rolling}
                    className="w-full py-3 bg-amber-600 text-stone-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-700 transition-colors shadow-lg disabled:opacity-50"
                  >
                    {dice.rolling ? "Бросаем..." : "Бросить Кости"}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quests"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Quest Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {quests.map((quest) => (
                  <motion.div
                    key={quest.id}
                    whileHover={{ y: -5, rotate: Math.random() > 0.5 ? 0.5 : -0.5 }}
                    onClick={() => setSelectedQuest(quest)}
                    className="cursor-pointer"
                  >
                    <div className="p-6 bg-[#f4ebd0] text-stone-800 rounded-2xl shadow-xl border-2 border-[#dcd0b3] relative overflow-hidden flex flex-col justify-between h-full min-h-[220px]">
                      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                      
                      {/* Pin effect */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-700 rounded-full shadow-lg border-2 border-[#ebdcb9] flex items-center justify-center text-white text-xs font-bold">
                        <Skull size={12} />
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            quest.type === 'bounty' && "bg-red-900/10 text-red-900",
                            quest.type === 'combat' && "bg-orange-900/10 text-orange-900",
                            quest.type === 'treasure' && "bg-emerald-900/10 text-emerald-900",
                            quest.type === 'spy' && "bg-purple-900/10 text-purple-900",
                            quest.type === 'boss' && "bg-teal-900/10 text-teal-900",
                            quest.type === 'smuggle' && "bg-amber-900/10 text-amber-900",
                            quest.type === 'explore' && "bg-blue-900/10 text-blue-900"
                          )}>
                            {quest.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-black uppercase tracking-tighter text-stone-800">{quest.title}</h3>
                            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">{quest.subtitle}</p>
                          </div>
                        </div>
                        
                        <p className="text-stone-600 text-xs italic leading-relaxed line-clamp-2">
                          "{quest.description}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-stone-800/10 relative z-10 mt-auto">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                          <Coins size={14} />
                          <span className="text-sm">{quest.points}</span>
                        </div>
                        
                        {/* Progress Counter */}
                        <div className="px-3 py-1 bg-stone-800/5 rounded-lg text-xs font-black font-mono text-stone-700">
                          {quest.current}/{quest.target}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quest Modal */}
        <AnimatePresence>
          {selectedQuest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedQuest(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-[#f4ebd0] text-stone-800 max-w-lg w-full rounded-3xl shadow-2xl border-[10px] border-[#3e2723]/20 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-[0.08] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                
                <button 
                  onClick={() => setSelectedQuest(null)}
                  className="absolute top-4 right-4 text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="p-8 space-y-6 relative z-10">
                  {/* Header */}
                  <div className="text-center space-y-2 border-b-2 border-stone-800/10 pb-4">
                    <div className="mx-auto w-16 h-16 bg-stone-800/5 rounded-full flex items-center justify-center text-stone-800 mb-2">
                      {selectedQuest.icon}
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-stone-800">{selectedQuest.title}</h2>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">{selectedQuest.subtitle}</p>
                  </div>

                  {/* Lore */}
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-800">Предыстория</p>
                    <p className="text-stone-600 text-sm italic leading-relaxed">
                      "{selectedQuest.lore}"
                    </p>
                  </div>

                  {/* Objective */}
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-800">Цель Задания</p>
                    <p className="text-stone-700 text-sm font-bold leading-relaxed">
                      {selectedQuest.description}
                    </p>
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-stone-800/10">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-widest text-stone-500">Награда:</p>
                      <div className="flex items-center gap-1 text-amber-800 font-bold">
                        <Coins size={16} />
                        <span>{selectedQuest.points}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-widest text-stone-500">Прогресс:</p>
                      <div className="px-3 py-1 bg-stone-800/10 rounded-lg text-sm font-black font-mono text-stone-800">
                        {selectedQuest.current}/{selectedQuest.target}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedQuest(null)}
                    className="w-full py-4 bg-amber-600 text-stone-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-amber-700 transition-colors shadow-lg"
                  >
                    Принять к исполнению
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
