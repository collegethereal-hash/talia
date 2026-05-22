'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Users, Sword, Ship, Anchor, Shield, Navigation, 
  Beer, Crosshair, Wind, Flame, Skull, Hammer, Gem, Sparkles,
  Info, X, Crown, Feather, Cat, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PirateStats() {
  const [gold, setGold] = useState(1500);
  const [crew, setCrew] = useState(25);
  const [inventory, setInventory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'crew' | 'shipyard' | 'blacksmith' | 'pets' | 'relics'>('crew');
  const [notification, setNotification] = useState<string | null>(null);
  
  // State for detailed item viewing
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    const savedGold = localStorage.getItem('pirate_gold');
    const savedCrew = localStorage.getItem('pirate_crew');
    const savedInv = localStorage.getItem('pirate_inventory');
    if (savedGold) setGold(parseInt(savedGold, 10));
    if (savedCrew) setCrew(parseInt(savedCrew, 10));
    if (savedInv) setInventory(JSON.parse(savedInv));
  }, []);

  useEffect(() => {
    localStorage.setItem('pirate_gold', gold.toString());
    localStorage.setItem('pirate_crew', crew.toString());
    localStorage.setItem('pirate_inventory', JSON.stringify(inventory));
  }, [gold, crew, inventory]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBuyItem = (item: any) => {
    if (gold >= item.price) {
      setGold(prev => prev - item.price);
      if (item.type === 'crew') {
        setCrew(prev => prev + item.value);
        showNotification(`В команду прибыло: ${item.name} (+${item.value} матросов)`);
      } else {
        if (!inventory.includes(item.id)) {
          setInventory(prev => [...prev, item.id]);
          showNotification(`Приобретен легендарный предмет: ${item.name}`);
        } else {
          showNotification(`Капитан, у нас уже есть ${item.name}!`);
          setGold(prev => prev + item.price); // Refund
        }
      }
      setSelectedItem(null); // Close modal on buy
    } else {
      showNotification('Не хватает дублонов на эту роскошь!');
    }
  };

  const storeItems = {
    crew: [
      { 
        id: 'c1', name: 'Пьяный Матрос', desc: 'Еле стоит на ногах, но швабру держать может.', price: 10, value: 1, type: 'crew', 
        icon: <Beer size={32} className="text-amber-600" />,
        detailedDesc: 'Этот бродяга был найден спящим в портовой канаве. Утверждает, что когда-то служил на королевском флоте, но устойчивый запах дешевого рома говорит об обратном. В бою от него мало толку, но он отлично моет палубу и знает пару смешных морских баек.',
        benefits: ['Отлично драит палубу', 'Требует мало еды', 'Никогда не унывает']
      },
      { 
        id: 'c2', name: 'Отбросы Тортуги', desc: 'Грязные, злые и готовые на всё ради золота.', price: 45, value: 5, type: 'crew', 
        icon: <Users size={32} className="text-slate-500" />,
        detailedDesc: 'Группа свирепых головорезов, которых выгнали даже из самых злачных таверн Тортуги. Они не знают пощады, дисциплины и гигиены. Идеальное пушечное мясо для абордажа торговых судов.',
        benefits: ['Обожают драки', 'Внушают ужас одним своим запахом', 'Дешевая рабочая сила']
      },
      { 
        id: 'c3', name: 'Опытный Канонир', desc: 'Знает толк во взрывчатке. Редко промахивается.', price: 100, value: 12, type: 'crew', 
        icon: <Flame size={32} className="text-red-500" />,
        detailedDesc: 'Потерял глаз, половину уха и два пальца в пороховых инцидентах, но утверждает, что "оно того стоило". Этот мастер артиллерии может поразить муху на лету из корабельной пушки. Ваш шанс победить британский фрегат.',
        benefits: ['+40% к точности стрельбы', 'Может создать бомбу из гнилых яблок', 'Глуховат, поэтому не боится взрывов']
      },
      { 
        id: 'c4', name: 'Морской Дьявол', desc: 'Легендарный пират, чье имя боятся произносить.', price: 500, value: 50, type: 'crew', 
        icon: <Skull size={32} className="text-purple-500" />,
        detailedDesc: 'Никто не знает его настоящего имени. Говорят, он заключил сделку с самим Дэйви Джонсом. Одного его присутствия на палубе достаточно, чтобы вражеские матросы начали в панике прыгать за борт.',
        benefits: ['Враги сдаются без боя', 'Приносит невероятную удачу', 'Знает тайные морские пути']
      },
    ],
    shipyard: [
      { 
        id: 's1', name: 'Рыбацкая Лодка', desc: 'Лучше, чем плавать на бочке.', price: 200, type: 'item', 
        icon: <Anchor size={32} className="text-amber-700" />,
        detailedDesc: 'Дырявая посудина, пропахшая тухлой рыбой. Идеально подходит для скрытных ночных вылазок в порт, если вас не смущает необходимость постоянно вычерпывать воду шлемом.',
        benefits: ['Скрытность +100', 'Враги не воспринимают всерьез']
      },
      { 
        id: 's2', name: 'Шхуна "Морской Волк"', desc: 'Быстрая, маневренная и дерзкая.', price: 1500, type: 'item', 
        icon: <Ship size={32} className="text-emerald-500" />,
        detailedDesc: 'Быстроходное судно с косым парусным вооружением. Позволяет уйти от любого преследования. Идеальный выбор для дерзких налетов на торговые караваны и быстрого отступления.',
        benefits: ['Уклонение от ядра +50%', 'Скорость плавания увеличена вдвое']
      },
      { 
        id: 's3', name: 'Испанский Галеон', desc: 'Огромный трюм для сокровищ и мощная броня.', price: 5000, type: 'item', 
        icon: <Ship size={32} className="text-amber-400" />,
        detailedDesc: 'Массивный, неповоротливый, но невероятно мощный боевой корабль. Его борта пробить сложнее, чем гранитную стену, а огневая мощь способна стереть с лица земли небольшой форт.',
        benefits: ['Огромный трюм для золота', 'Броня игнорирует легкие орудия', 'Устрашающий внешний вид']
      },
      { 
        id: 's4', name: 'Летучий Голландец', desc: 'Корабль-призрак. Покупается лишь раз в жизни.', price: 25000, type: 'item', 
        icon: <Ship size={32} className="text-teal-400" />,
        detailedDesc: 'Окутанный зеленым туманом проклятый корабль. Способен плавать под водой и игнорировать законы физики. Команда, вступившая на борт, обретает бессмертие... и теряет часть души.',
        benefits: ['Бессмертие в бою', 'Ужасает врагов до потери пульса', 'Не требует ветра для плавания']
      },
    ],
    blacksmith: [
      { 
        id: 'b1', name: 'Клинки из Толедо', desc: 'Лучшие абордажные сабли в Карибском море.', price: 300, type: 'item', 
        icon: <Sword size={32} className="text-slate-300" />,
        detailedDesc: 'Выкованы лучшими мастерами Испании. Эти клинки никогда не тупятся и не ржавеют. Они настолько острые, что могут разрезать пушечное ядро в полете (хотя мы не рекомендуем это проверять).',
        benefits: ['Урон в абордаже +30%', 'Не ломаются']
      },
      { 
        id: 'b2', name: 'Укрепленный Корпус', desc: 'Ваш корабль сможет выдержать любой залп.', price: 800, type: 'item', 
        icon: <Shield size={32} className="text-amber-800" />,
        detailedDesc: 'Двойная обшивка из железного дерева, скрепленная стальными листами. Этот корпус тяжел, но позволяет кораблю выдерживать прямые попадания и таранить вражеские суда.',
        benefits: ['Прочность корабля х2', 'Таранный урон +100%']
      },
      { 
        id: 'b3', name: 'Бронзовые Пушки', desc: 'Разрывают врагов в щепки на огромном расстоянии.', price: 1200, type: 'item', 
        icon: <Crosshair size={32} className="text-red-700" />,
        detailedDesc: 'Новейшая разработка британских инженеров, украденная нашими шпионами. Бронзовые орудия не перегреваются, стреляют в полтора раза дальше и громче обычных.',
        benefits: ['Дальность стрельбы увеличена', 'Шанс поджечь врага ядрами']
      },
    ],
    pets: [
      { 
        id: 'p1', name: 'Ара "Сквернослов"', desc: 'Ругается на семи языках.', price: 400, type: 'item', 
        icon: <Feather size={32} className="text-red-400" />,
        detailedDesc: 'Ярко-красный попугай ара. Он пережил трех капитанов и выучил худшие ругательства каждого. В бою отвлекает врагов оскорблениями, снижая их мораль.',
        benefits: ['Мораль врагов падает', 'Сидит на плече', 'Иногда приносит золотые монеты']
      },
      { 
        id: 'p2', name: 'Корабельный Кот', desc: 'Ловит крыс и приносит удачу.', price: 600, type: 'item', 
        icon: <Cat size={32} className="text-amber-500" />,
        detailedDesc: 'Огромный рыжий кот по кличке "Порох". Спит в пороховой бочке, ненавидит воду, но феноменально ловит трюмных крыс. Моряки считают, что его наличие на борту спасает от штормов.',
        benefits: ['Провизия не портится', '+10 к Урначе', 'Спит на вашей шляпе']
      },
    ],
    relics: [
      { 
        id: 'r1', name: 'Компас Мертвеца', desc: 'Указывает на то, чего вы желаете больше всего.', price: 1500, type: 'item', 
        icon: <Navigation size={32} className="text-sky-400" />,
        detailedDesc: 'Странный компас без севера. Стрелка постоянно дергается, но если вы чего-то искренне желаете, она укажет точное направление к вашей цели, будь то сокровище или порт назначения.',
        benefits: ['Игнорирует шторма при навигации', 'Открывает скрытые локации на карте']
      },
      { 
        id: 'r2', name: 'Глаз Кракена', desc: 'Древний рубин, пульсирующий во тьме.', price: 3000, type: 'item', 
        icon: <Eye size={32} className="text-purple-600" />,
        detailedDesc: 'Огромный драгоценный камень, найденный в желудке левиафана. Он слегка теплый на ощупь и пульсирует в такт биению сердца. Притягивает богатства, но вызывает у владельца морские кошмары.',
        benefits: ['+50% к наградам за грабеж', 'Позволяет видеть подводные рифы']
      },
    ]
  };

  const tabs = [
    { id: 'crew', label: 'Таверна', icon: <Beer size={18} /> },
    { id: 'shipyard', label: 'Верфь', icon: <Anchor size={18} /> },
    { id: 'blacksmith', label: 'Кузня', icon: <Hammer size={18} /> },
    { id: 'pets', label: 'Питомцы', icon: <Feather size={18} /> },
    { id: 'relics', label: 'Артефакты', icon: <Sparkles size={18} /> },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-amber-100 font-serif overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-950/20 via-[#0a0a0a] to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.05)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-40 space-y-12">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-center md:text-left space-y-2">
              <h1 className="text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 drop-shadow-lg">
                Черный Рынок
              </h1>
              <p className="text-amber-500/50 italic tracking-widest text-lg">"Золото не имеет запаха, пока ты не купишь на него ром!"</p>
           </div>

           <div className="flex flex-wrap justify-center items-center gap-4 bg-slate-950/80 p-4 rounded-3xl border-2 border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)] backdrop-blur-md">
              <div className="flex items-center gap-4 px-6 border-r border-amber-500/20">
                 <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 shadow-inner">
                   <Coins size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/40">Казна</p>
                   <p className="text-3xl font-bold text-amber-400 leading-none">{gold}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 px-6">
                 <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20 shadow-inner">
                   <Users size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/40">Команда</p>
                   <p className="text-3xl font-bold text-blue-400 leading-none">{crew}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Store Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                 activeTab === tab.id 
                  ? "bg-amber-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-105" 
                  : "bg-slate-900/50 text-amber-500/50 border border-amber-500/10 hover:bg-slate-800 hover:text-amber-400"
               )}
             >
               {tab.icon} <span>{tab.label}</span>
             </button>
           ))}
        </div>

        {/* Store Grid */}
        <AnimatePresence mode="wait">
           <motion.div 
             key={activeTab}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             transition={{ duration: 0.3 }}
             className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
           >
              {(storeItems[activeTab as keyof typeof storeItems] || []).map((item) => {
                const isOwned = inventory.includes(item.id);

                return (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "relative p-6 rounded-[2.5rem] border-4 flex flex-col justify-between transition-all group overflow-hidden pirate-wood cursor-pointer shadow-xl",
                      isOwned ? "border-emerald-500/30 opacity-70" : "border-amber-900/40 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]"
                    )}
                  >
                     <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
                     
                     <div className="relative z-10 space-y-6">
                        <div className="w-24 h-24 bg-[#1a1a1a] rounded-full border-4 border-amber-900/50 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,0,0,0.8)] group-hover:scale-110 group-hover:border-amber-500/50 transition-all">
                          {item.icon}
                        </div>
                        
                        <div className="text-center space-y-2">
                           <h3 className="text-xl font-bold uppercase tracking-tight text-amber-100 leading-tight drop-shadow-md">{item.name}</h3>
                           <p className="text-xs text-amber-100/40 italic leading-relaxed h-12 line-clamp-2">"{item.desc}"</p>
                        </div>
                     </div>

                     <div className="relative z-10 mt-6 pt-6 border-t border-amber-500/10 flex items-center justify-between">
                        {isOwned ? (
                           <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl font-black uppercase tracking-widest text-xs text-center flex justify-center items-center gap-2">
                             <Sparkles size={14}/> В арсенале
                           </div>
                        ) : (
                           <>
                             <div className="flex items-center gap-2 text-amber-400 font-bold text-xl">
                               <Coins size={20} /> {item.price}
                             </div>
                             <div className="p-3 bg-slate-800 rounded-xl text-amber-500/50 group-hover:text-amber-400 group-hover:bg-slate-700 transition-colors">
                               <Info size={20} />
                             </div>
                           </>
                        )}
                     </div>
                  </div>
                );
              })}
           </motion.div>
        </AnimatePresence>
      </div>

      {/* DETAILED ITEM MODAL (LORE & BUY) */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setSelectedItem(null)} 
               className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
             />
             
             <motion.div 
               initial={{ scale: 0.9, y: 50, opacity: 0 }} 
               animate={{ scale: 1, y: 0, opacity: 1 }} 
               exit={{ scale: 0.9, y: 50, opacity: 0 }} 
               className="relative w-full max-w-3xl bg-[#0a0a0a] border-4 border-amber-500/30 rounded-[3rem] shadow-[0_0_100px_rgba(245,158,11,0.2)] p-8 md:p-12 overflow-hidden pirate-wood flex flex-col md:flex-row gap-8"
             >
                <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 text-amber-500/40 hover:text-amber-300 transition-colors z-20">
                  <X size={32} />
                </button>

                {/* Left: Icon & Price */}
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center space-y-6 relative z-10 border-r border-amber-500/10 pr-0 md:pr-8">
                   <div className="w-40 h-40 bg-[#1a1a1a] rounded-full border-4 border-amber-500 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.3)]">
                     <div className="scale-150">{selectedItem.icon}</div>
                   </div>
                   
                   <div className="text-center space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/50">Стоимость контракта</p>
                      <p className="text-4xl font-black text-amber-400 flex items-center justify-center gap-2">
                        <Coins size={28} /> {selectedItem.price}
                      </p>
                   </div>
                </div>

                {/* Right: Lore & Actions */}
                <div className="flex-1 relative z-10 space-y-8">
                   <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-2">
                          {selectedItem.type === 'crew' ? 'Пополнение команды' : 'Редкий Артефакт'}
                        </p>
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-amber-100">{selectedItem.name}</h2>
                      </div>
                      
                      <p className="text-amber-100/60 italic leading-relaxed text-sm bg-black/40 p-6 rounded-3xl border border-white/5">
                        "{selectedItem.detailedDesc}"
                      </p>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500/50 flex items-center gap-2">
                        <Crown size={14} /> Особенности и Навыки
                      </h4>
                      <ul className="space-y-2">
                        {selectedItem.benefits?.map((benefit: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-emerald-100/80 bg-emerald-900/10 p-3 rounded-xl border border-emerald-500/20">
                             <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                             {benefit}
                          </li>
                        ))}
                        {selectedItem.type === 'crew' && (
                          <li className="flex items-start gap-3 text-sm text-blue-100/80 bg-blue-900/10 p-3 rounded-xl border border-blue-500/20">
                             <Users size={16} className="text-blue-400 shrink-0 mt-0.5" />
                             Добавляет +{selectedItem.value} к численности матросов
                          </li>
                        )}
                      </ul>
                   </div>

                   <div className="pt-4 mt-auto">
                     {inventory.includes(selectedItem.id) ? (
                        <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-2xl font-black uppercase tracking-widest text-sm text-center flex items-center justify-center gap-2">
                          <CheckCircle size={20} /> УЖЕ ПРИОБРЕТЕНО
                        </div>
                     ) : (
                        <button 
                          onClick={() => handleBuyItem(selectedItem)}
                          disabled={gold < selectedItem.price}
                          className={cn(
                            "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3",
                            gold >= selectedItem.price 
                             ? "bg-amber-500 text-slate-950 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(245,158,11,0.3)]" 
                             : "bg-slate-800 text-slate-500 cursor-not-allowed border-2 border-slate-700"
                          )}
                        >
                          {gold >= selectedItem.price ? 'Подписать Контракт / Купить' : 'Не хватает золота'}
                        </button>
                     )}
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] px-8 py-4 bg-emerald-950/90 border-2 border-emerald-500/50 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)] backdrop-blur-xl flex items-center gap-4"
          >
             <Sparkles size={20} className="text-emerald-400" />
             <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dummy component for the 'CheckCircle' icon used in rendering
function CheckCircle({ size, className }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
