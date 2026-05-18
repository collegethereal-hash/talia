'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Anchor, Shield, Heart, Hammer, Package, Beer, Users,
  Telescope, CloudLightning, Scroll, Wind, Coins, CheckCircle2,
  Navigation, Compass, Trophy, Sword, Gem, Clock, Play,
  Lock, Unlock, ArrowRight, Flame, UserCheck, HeartHandshake, X,
  UserX, ShieldAlert, Award, ArrowDown, UserPlus, HelpCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useData } from "@/components/DataProvider";
import Link from 'next/link';
import BayScene from "@/eras/pirate/components/BayScene";

interface Officer {
  id: number;
  name: string;
  role: string;
  status: string;
  statusColor: string;
  loyalty: number;
  avatar: string;
  description: string;
  wantedReward: string;
  isDismissed?: boolean; // Fired/Dismissed status
}

interface IncidentChoice {
  text: string;
  actionText: string;
  effect: string;
  resolve: (stats: { gold: number; hull: number; morale: number; crew: number }) => {
    gold: number;
    hull: number;
    morale: number;
    crew: number;
    log: string;
  };
}

interface Incident {
  id: number;
  title: string;
  desc: string;
  icon: string;
  choices: IncidentChoice[];
}

interface ChestMerchant {
  id: string;
  name: string;
  pirateName: string;
  pirateAvatar: string;
  pirateTitle: string;
  cost: number;
  chestIcon: string;
  story: string;
  treasureName: string;
  treasureIcon: React.ReactNode;
  rarity: 'Редкое' | 'Эпическое' | 'Легендарное';
  glowColor: string;
  romanticMessage: string;
}

export default function PirateDashboard() {
  const { currentUser } = useData();
  const [activeTab, setActiveTab] = useState<'ship' | 'crew' | 'incidents' | 'chests'>('ship');
  const [notification, setNotification] = useState<string | null>(null);
  
  // Mounted check for Hydration-safe R3F Canvas
  const [isMounted, setIsMounted] = useState(false);

  // Ship stats
  const [hull, setHull] = useState(62);
  const [hold, setHold] = useState(85);
  const [morale, setMorale] = useState(94);

  // Economy & Crew
  const [gold, setGold] = useState(1500);
  const [crewCount, setCrewCount] = useState(25);

  // Officers State (Now expanded to 6 unique officers)
  const [officers, setOfficers] = useState<Officer[]>([
    { id: 1, name: "Билл 'Бочонок'", role: 'Штурман', status: 'Пьян', statusColor: 'text-red-400', loyalty: 45, avatar: "🧭", description: "Напивается быстрее, чем прокладывает курс, но имеет золотое сердце.", wantedReward: "50 дублонов" },
    { id: 2, name: "Джон 'Длинный'", role: 'Кок', status: 'Недоволен', statusColor: 'text-yellow-400', loyalty: 30, avatar: "🍳", description: "Его похлебка может свалить акулу, зато он знает все сплетни Тортуги.", wantedReward: "100 дублонов" },
    { id: 3, name: "Джек 'Громила'", role: 'Канонир', status: 'Готов к бою', statusColor: 'text-emerald-400', loyalty: 80, avatar: "💣", description: "Лучший стрелок Карибского моря. Любит взрывы и крепкие объятия.", wantedReward: "250 дублонов" },
    { id: 4, name: "Энн Бонни", role: 'Старпом', status: 'Безупречно', statusColor: 'text-emerald-400', loyalty: 90, avatar: "⚔️", description: "Гроза морей, держит команду в ежовых рукавицах. Безответно влюблена в море и порядок.", wantedReward: "500 дублонов" },
    { id: 5, name: "Слепой Пью", role: 'Казначей', status: 'Считает золото', statusColor: 'text-cyan-400', loyalty: 70, avatar: "🪙", description: "Подсчитывает дублоны по звуку их падения. Обмануть его невозможно, даже будучи капитаном.", wantedReward: "400 дублонов" },
    { id: 6, name: "Эдвард Тич мл.", role: 'Юнга', status: 'Чистит палубу', statusColor: 'text-amber-400', loyalty: 50, avatar: "🧹", description: "Мечтает стать великим пиратом. Пока только чистит палубу и ворует изюм у кока.", wantedReward: "150 дублонов" },
  ]);

  // Daily Incidents System State
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);
  const [resolvedLog, setResolvedLog] = useState<string | null>(null);

  // Treasures unlocked state
  const [unlockedTreasures, setUnlockedTreasures] = useState<Record<string, boolean>>({});

  // Mystery Chest Modal viewing state
  const [selectedMerchant, setSelectedMerchant] = useState<ChestMerchant | null>(null);
  const [isOpeningChest, setIsOpeningChest] = useState(false);
  const [chestOpenedEffect, setChestOpenedEffect] = useState(false);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Sync data on mount and focused screen
  useEffect(() => {
    setIsMounted(true);
    
    const loadStats = () => {
      const savedGold = localStorage.getItem('pirate_gold');
      const savedCrew = localStorage.getItem('pirate_crew');
      const savedHull = localStorage.getItem('pirate_hull');
      const savedHold = localStorage.getItem('pirate_hold');
      const savedMorale = localStorage.getItem('pirate_morale');
      
      if (savedGold) setGold(parseInt(savedGold, 10));
      if (savedCrew) setCrewCount(parseInt(savedCrew, 10));
      if (savedHull) setHull(parseInt(savedHull, 10));
      if (savedHold) setHold(parseInt(savedHold, 10));
      if (savedMorale) setMorale(parseInt(savedMorale, 10));

      // Load officers
      const savedOfficers = localStorage.getItem('pirate_officers');
      if (savedOfficers) {
        setOfficers(JSON.parse(savedOfficers));
      }

      // Load treasures
      const savedTreasures = localStorage.getItem('pirate_treasures');
      if (savedTreasures) {
        setUnlockedTreasures(JSON.parse(savedTreasures));
      }

      // Load current incident index
      const savedIncident = localStorage.getItem('pirate_incident_idx');
      if (savedIncident) {
        setCurrentIncidentIndex(parseInt(savedIncident, 10));
      }
    };

    loadStats();

    window.addEventListener('storage', loadStats);
    window.addEventListener('focus', loadStats);
    return () => {
      window.removeEventListener('storage', loadStats);
      window.removeEventListener('focus', loadStats);
    };
  }, []);

  // Sync back to localstorage when state changes
  const saveGold = (val: number) => {
    setGold(val);
    localStorage.setItem('pirate_gold', val.toString());
  };

  const saveCrew = (val: number) => {
    setCrewCount(val);
    localStorage.setItem('pirate_crew', val.toString());
  };

  const saveHull = (val: number) => {
    setHull(val);
    localStorage.setItem('pirate_hull', val.toString());
  };

  const saveHold = (val: number) => {
    setHold(val);
    localStorage.setItem('pirate_hold', val.toString());
  };

  const saveMorale = (val: number) => {
    setMorale(val);
    localStorage.setItem('pirate_morale', val.toString());
  };

  const saveOfficers = (newOfficers: Officer[]) => {
    setOfficers(newOfficers);
    localStorage.setItem('pirate_officers', JSON.stringify(newOfficers));
  };

  const saveTreasures = (treasures: Record<string, boolean>) => {
    setUnlockedTreasures(treasures);
    localStorage.setItem('pirate_treasures', JSON.stringify(treasures));
  };

  // Ship interaction actions
  const handleRepair = () => {
    if (hull >= 100) return showNotif('🛠️ Корпус уже в идеальном состоянии!');
    const newHull = Math.min(100, hull + 10);
    saveHull(newHull);
    showNotif('⚒️ Корпус подлатан! +10% прочности');
  };

  const handleLoad = () => {
    if (hold >= 100) return showNotif('📦 Трюмы забиты до отказа!');
    const newHold = Math.min(100, hold + 10);
    saveHold(newHold);
    showNotif('📦 Трюмы загружены! +10% припасов');
  };

  const handleRum = () => {
    if (morale >= 100) return showNotif('🍺 Команда поет песни, ром льется рекой!');
    const newMorale = Math.min(100, morale + 15);
    saveMorale(newMorale);
    showNotif('🍺 Бочки вскрыты! Боевой дух команды +15%');
  };

  // Officer interactions
  const rewardOfficer = (id: number) => {
    const cost = 30;
    if (gold < cost) return showNotif('❌ Недостаточно золота для премии!');

    const updated = officers.map(o => {
      if (o.id === id) {
        if (o.loyalty >= 100) {
          showNotif(`⚓ ${o.name} уже бесконечно предан вам!`);
          return o;
        }
        showNotif(`💰 Премия выдана! Преданность ${o.name} возросла!`);
        return { 
          ...o, 
          loyalty: Math.min(100, o.loyalty + 15), 
          status: 'Безупречно', 
          statusColor: 'text-emerald-400 font-bold',
          role: o.role === 'Юнга' ? 'Матрос' : o.role // Auto-promote minor ranks on reward
        };
      }
      return o;
    });

    saveGold(gold - cost);
    saveOfficers(updated);
  };

  // New demote action (Понизить)
  const demoteOfficer = (id: number) => {
    const updated = officers.map(o => {
      if (o.id === id) {
        if (o.role === 'Юнга' || o.role === 'Шваброносец') {
          showNotif(`🧹 ${o.name} уже занимает самое низкое звание!`);
          return o;
        }
        const oldRole = o.role;
        showNotif(`📉 ${o.name} разжалован из звания '${oldRole}'!`);
        return {
          ...o,
          role: 'Юнга',
          loyalty: Math.max(0, o.loyalty - 20),
          status: 'Чистит палубу',
          statusColor: 'text-red-400 font-bold'
        };
      }
      return o;
    });

    saveOfficers(updated);
  };

  // New dismiss action (Списать на берег / Уволить)
  const dismissOfficer = (id: number) => {
    const updated = officers.map(o => {
      if (o.id === id) {
        showNotif(`🚶 ${o.name} списан на берег в таверну!`);
        return {
          ...o,
          isDismissed: true,
          status: 'В таверне',
          statusColor: 'text-slate-500 font-bold'
        };
      }
      return o;
    });

    saveOfficers(updated);
  };

  // New rehire action (Вернуть на службу)
  const rehireOfficer = (id: number) => {
    const rehireCost = 50;
    if (gold < rehireCost) return showNotif('❌ Не хватает золота, чтобы нанять офицера обратно!');

    const updated = officers.map(o => {
      if (o.id === id) {
        showNotif(`⚓ ${o.name} вернулся в строй!`);
        return {
          ...o,
          isDismissed: false,
          status: 'В строю',
          statusColor: 'text-emerald-400 font-bold',
          loyalty: 40 // resets to baseline loyalty
        };
      }
      return o;
    });

    saveGold(gold - rehireCost);
    saveOfficers(updated);
  };

  // SHIP DAILY INCIDENTS LIST
  const shipIncidents: Incident[] = [
    {
      id: 1,
      title: 'Драка из-за рома в трюме!',
      icon: '🍺',
      desc: 'Боцман и кок подрались в трюме из-за последней бутылки элитного ямайского рома. Матросы делают ставки, в трюме крики и звон стали!',
      choices: [
        {
          text: 'Конфисковать бутылку себе',
          actionText: 'Забрать ром в каюту капитана',
          effect: 'Мораль -15%, Золото +50',
          resolve: (stats) => {
            return {
              gold: stats.gold + 50,
              hull: stats.hull,
              morale: Math.max(0, stats.morale - 15),
              crew: stats.crew,
              log: 'Вы забрали элитный ром себе! Матросы недовольно ворчат, но вы выгодно продали бутылку контрабандистам. Казна пополнена!'
            };
          }
        },
        {
          text: 'Устроить бой подушками',
          actionText: 'Пусть решат спор в честном поединке на подушках',
          effect: 'Мораль +20%, Прочность -5%',
          resolve: (stats) => {
            return {
              gold: stats.gold,
              hull: Math.max(0, stats.hull - 5),
              morale: Math.min(100, stats.morale + 20),
              crew: stats.crew,
              log: 'Матросы в восторге от комичного зрелища! Боевой дух взлетел, но в ходе драки они случайно вышибли перегородку в трюме.'
            };
          }
        },
        {
          text: 'Выкатить бочку пива',
          actionText: 'Угостить всех пивом из личных запасов капитана',
          effect: 'Мораль +10%, Золото -40',
          resolve: (stats) => {
            return {
              gold: Math.max(0, stats.gold - 40),
              hull: stats.hull,
              morale: Math.min(100, stats.morale + 10),
              crew: stats.crew,
              log: 'Все быстро помирились, обнялись и поют романтические пиратские баллады. Капитан — отец родной!'
            };
          }
        }
      ]
    },
    {
      id: 2,
      title: 'Случайный поджог камбуза!',
      icon: '🔥',
      desc: 'Наш кок Джон пытался приготовить романтический ужин при свечах для своей подруги и случайно поджег занавеску! Пламя стремительно подбирается к пороховому складу!',
      choices: [
        {
          text: 'Тушить элитным ромом',
          actionText: 'Залить пламя ромом (вода слишком далеко)',
          effect: 'Прочность +10%, Мораль -10%',
          resolve: (stats) => {
            return {
              gold: stats.gold,
              hull: Math.min(100, stats.hull + 10),
              morale: Math.max(0, stats.morale - 10),
              crew: stats.crew,
              log: 'Пламя потушено дорогим выдержанным ромом! Корпус спасен, но команда рыдает над пролитыми литрами драгоценного нектара.'
            };
          }
        },
        {
          text: 'Выстроить команду с ведрами',
          actionText: 'Организовать живую цепь матросов с водой',
          effect: 'Прочность -15%, Матросы -2 (в лазарете)',
          resolve: (stats) => {
            return {
              gold: stats.gold,
              hull: Math.max(0, stats.hull - 15),
              morale: stats.morale,
              crew: Math.max(5, stats.crew - 2),
              log: 'Камбуз сильно выгорел, а пара матросов получили ожоги и временно лежат в лазарете. Но порох спасен!'
            };
          }
        },
        {
          text: 'Резкий крен корабля',
          actionText: 'Гениальный маневр: зачерпнуть бортом волну!',
          effect: 'Прочность +5%, Трюмы промокли (Золото -50)',
          resolve: (stats) => {
            return {
              gold: Math.max(0, stats.gold - 50),
              hull: Math.min(100, stats.hull + 5),
              morale: stats.morale,
              crew: stats.crew,
              log: 'Гениальный капитанский маневр! Волна хлестнула в иллюминатор и мгновенно потушила огонь, но припасы в трюме промокли.'
            };
          }
        }
      ]
    },
    {
      id: 3,
      title: 'Матросы выловили русалку!',
      icon: '🧜‍♀️',
      desc: 'Рыбаки вытащили сетью говорящую русалку! Она обещает указать путь к сундуку испанского короля, если мы отпустим её, но коку она нужна для легендарной ухи...',
      choices: [
        {
          text: 'Отпустить русалку с миром',
          actionText: 'Даровать ей свободу',
          effect: 'Золото +200, Мораль +10%',
          resolve: (stats) => {
            return {
              gold: stats.gold + 200,
              hull: stats.hull,
              morale: Math.min(100, stats.morale + 10),
              crew: stats.crew,
              log: 'Русалка в благодарность скинула на палубу карту испанских сокровищ! Матросы поют песни о вашей доброте и благородстве.'
            };
          }
        },
        {
          text: 'Сварить праздничную уху',
          actionText: 'Устроить грандиозный пир для команды',
          effect: 'Мораль +30%, Золото -55',
          resolve: (stats) => {
            return {
              gold: Math.max(0, stats.gold - 55),
              hull: stats.hull,
              morale: Math.min(100, stats.morale + 30),
              crew: stats.crew,
              log: 'Легендарная уха получилась потрясающей! Сытая команда поет веселые частушки, дух на корабле на пике!'
            };
          }
        },
        {
          text: 'Продать русалку купцам',
          actionText: 'Сдать ее в зоопарк Тортуги',
          effect: 'Золото +500, Мораль -20%',
          resolve: (stats) => {
            return {
              gold: stats.gold + 500,
              hull: stats.hull,
              morale: Math.max(0, stats.morale - 20),
              crew: stats.crew,
              log: 'Вы выгодно продали диковинное создание купцам Тортуги! Но матросы боятся проклятия морского царя и крестятся при виде волн.'
            };
          }
        }
      ]
    },
    {
      id: 4,
      title: 'Утечка в каюте капитана!',
      icon: '💧',
      desc: 'В вашей каюте обнаружена подозрительная течь прямо под сундуком с судовыми дублонами! Вода медленно, но верно прибывает на ковер!',
      choices: [
        {
          text: 'Заткнуть любовным письмом',
          actionText: 'Использовать пачку нежных записок от Grinch',
          effect: 'Прочность +15%, Мораль +15%',
          resolve: (stats) => {
            return {
              gold: stats.gold,
              hull: Math.min(100, stats.hull + 15),
              morale: Math.min(100, stats.morale + 15),
              crew: stats.crew,
              log: 'Письма оказались невероятно плотными, теплыми и заряженными любовью — они буквально окаменели, намертво запечатав течь! Магия любви спасла каюту!'
            };
          }
        },
        {
          text: 'Нанять плотника с Тортуги',
          actionText: 'Вызвать мастера за плату',
          effect: 'Прочность +10%, Золото -30',
          resolve: (stats) => {
            return {
              gold: Math.max(0, stats.gold - 30),
              hull: Math.min(100, stats.hull + 10),
              morale: stats.morale,
              crew: stats.crew,
              log: 'Профессиональный плотник быстро заколотил брешь дубовой доской, хотя казна лишилась нескольких монет.'
            };
          }
        },
        {
          text: 'Игнорировать пробоину',
          actionText: 'Устроить домашний бассейн на ковре',
          effect: 'Прочность -25%, Золото -80',
          resolve: (stats) => {
            return {
              gold: Math.max(0, stats.gold - 80),
              hull: Math.max(0, stats.hull - 25),
              morale: stats.morale,
              crew: stats.crew,
              log: 'Бассейн не удался. Соленая вода залила каюту, размочила половину мебели, а часть золотых дублонов начала ржаветь!'
            };
          }
        }
      ]
    }
  ];

  // Resolve current active incident choice
  const handleResolveIncident = (choice: IncidentChoice) => {
    const active = shipIncidents[currentIncidentIndex];
    const results = choice.resolve({ gold, hull, morale, crew: crewCount });

    saveGold(results.gold);
    saveHull(results.hull);
    saveHold(results.hull); // Sync hold supply
    saveMorale(results.morale);
    saveCrew(results.crew);

    setResolvedLog(results.log);
  };

  // Roll to next incident
  const handleNextIncident = () => {
    const nextIdx = (currentIncidentIndex + 1) % shipIncidents.length;
    setCurrentIncidentIndex(nextIdx);
    localStorage.setItem('pirate_incident_idx', nextIdx.toString());
    setResolvedLog(null);
    showNotif('🎲 Новое происшествие добавлено в судовой журнал!');
  };

  // DYNAMIC MYSTERY CHESTS MERCHANT LOGIC CONFIGURATION
  const chestMerchants: ChestMerchant[] = [
    {
      id: 't_compass',
      name: 'Замшелый Сундук Рифов',
      pirateName: 'Одноглазый Барнаби',
      pirateAvatar: '🏴‍☠️',
      pirateTitle: 'Старый контрабандист и бродяга',
      cost: 300,
      chestIcon: '📦',
      story: '«Я наткнулся на этот сундук застрявшим между коралловыми рифами на Заливе Грез, когда отчаянно спасался от карательного испанского галеона. Замок старый, обросший морской солью и водорослями, но сквозь замочную скважину пробивается яркий бирюзовый свет, указывающий путь... Уступлю за 300 дублонов!»',
      treasureName: 'Компас Вечности',
      treasureIcon: <Compass size={40} className="text-cyan-400 animate-pulse" />,
      rarity: 'Редкое',
      glowColor: 'shadow-[0_0_30px_rgba(34,211,238,0.4)] text-cyan-400 border-cyan-500/30',
      romanticMessage: '«Этот компас всегда указывает на тебя, Полина. Мой единственный верный курс во всех бескрайних мирах и временах.»'
    },
    {
      id: 't_cup',
      name: 'Стальной Окованный Сундук',
      pirateName: 'Капитан Кровавая Мэри',
      pirateAvatar: '⚓',
      pirateTitle: 'Гроза испанских фортов',
      cost: 650,
      chestIcon: '🧰',
      story: '«Мы выловили этот чертов ящик прочной сетью в самом центре штормового водоворота возле Мыса Объятий. Местные чайки целыми часами кружили над ним, напевая странные песни. Мой кок клянется, что слышал тихий звон золотых бокалов изнутри. Отдам за 650 золотых!»',
      treasureName: 'Кубок Приключений',
      treasureIcon: <Trophy size={40} className="text-red-400 animate-bounce" />,
      rarity: 'Эпическое',
      glowColor: 'shadow-[0_0_30px_rgba(248,113,113,0.4)] text-red-400 border-red-500/30',
      romanticMessage: '«За каждую курьезную и безумную идею, которую мы разделили вместе, и за тысячи захватывающих путешествий, которые ждут нас впереди!»'
    },
    {
      id: 't_sabre',
      name: 'Золоченый Королевский Сундук',
      pirateName: 'Быстрый Сильвер',
      pirateAvatar: '☠️',
      pirateTitle: 'Квартирмейстер и авантюрист',
      cost: 1200,
      chestIcon: '🎁',
      story: '«Эту роскошную вещь вез личный фрегат испанского губернатора в подарок королеве. Но губернатор не умел ценить истинные богатства — преданность и бесконечное терпение своей леди. Я заграбастал его в честном абордаже. Сундук закрыт королевской печатью, но сталь клинка звенит внутри... Возьмешь за 1200 дублонов?»',
      treasureName: 'Шпага Терпения',
      treasureIcon: <Sword size={40} className="text-amber-400" />,
      rarity: 'Эпическое',
      glowColor: 'shadow-[0_0_30px_rgba(251,191,36,0.4)] text-amber-400 border-amber-500/30',
      romanticMessage: '«Выдается Полине за безграничную нежность и царское терпение во время моих капризов и штормов. Мой щит и опора!»'
    },
    {
      id: 't_heart',
      name: 'Древний Сундук Глубин',
      pirateName: 'Грозный Черная Борода',
      pirateAvatar: '🦜',
      pirateTitle: 'Легендарный Ужас Семи Морей',
      cost: 2500,
      chestIcon: '💎',
      story: '«Древние матросские легенды гласят, что это личный ларец самого Дэйви Джонса, укрытый на самом дне океанской бездны. Из его щелей исходит неописуемое сияние, способное согреть даже самое заледеневшее сердце. Я достал его из пасти левиафана! Уважь старика, цена вопроса — 2500 дублонов.»',
      treasureName: 'Сердце Океана',
      treasureIcon: <Gem size={40} className="text-purple-400" />,
      rarity: 'Легендарное',
      glowColor: 'shadow-[0_0_30px_rgba(192,132,252,0.4)] text-purple-400 border-purple-500/30',
      romanticMessage: '«Величайшее и самое сияющее сокровище во всех океанах мира — твое любящее сердце, которое освещает мне путь даже в самый лютый мрак.»'
    }
  ];

  // Chest purchase logic
  const handleOpenChest = (chest: ChestMerchant) => {
    if (gold < chest.cost) return showNotif('❌ В казне не хватает золотых дублонов!');
    if (unlockedTreasures[chest.id]) return;

    setIsOpeningChest(true);

    setTimeout(() => {
      setIsOpeningChest(false);
      setChestOpenedEffect(true);
      
      const newTreasures = { ...unlockedTreasures, [chest.id]: true };
      saveTreasures(newTreasures);
      saveGold(gold - chest.cost);
      showNotif(`🔓 ${chest.treasureName} успешно освобожден из сундука!`);
    }, 1800);
  };

  const handleCloseModal = () => {
    setSelectedMerchant(null);
    setChestOpenedEffect(false);
    setIsOpeningChest(false);
  };

  const activeIncident = shipIncidents[currentIncidentIndex];

  return (
    <div className="relative min-h-screen bg-[#000000] text-amber-100 font-serif overflow-x-hidden selection:bg-amber-500/30 pb-32">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-150px] left-[-150px] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[50px] right-[-150px] w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      
      {/* Wood pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-[0.05] pointer-events-none z-0" />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 px-10 py-5 rounded-full font-black text-sm sm:text-base shadow-[0_0_50px_rgba(245,158,11,0.6)] border border-amber-200/30 flex items-center gap-3.5 backdrop-blur-md"
          >
            <CheckCircle2 size={20} className="text-slate-950" />
            <span className="tracking-widest uppercase font-black">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED PIRATE DEAL SCROLL MODAL */}
      <AnimatePresence>
        {selectedMerchant && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={handleCloseModal} 
               className="absolute inset-0 bg-black/95 backdrop-blur-md" 
             />
             
             <motion.div 
               initial={{ scale: 0.9, y: 50, opacity: 0 }} 
               animate={{ scale: 1, y: 0, opacity: 1 }} 
               exit={{ scale: 0.9, y: 50, opacity: 0 }} 
               className="relative w-full max-w-lg bg-[#0c0c0c] border-4 border-amber-500/40 rounded-[3rem] shadow-[0_0_80px_rgba(245,158,11,0.4)] p-8 overflow-hidden flex flex-col justify-between z-10"
             >
                <button onClick={handleCloseModal} className="absolute top-6 right-6 text-amber-500/50 hover:text-amber-300 transition-colors z-20">
                  <X size={28} />
                </button>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 border-b border-amber-500/25 pb-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-[#111] border-2 border-amber-500/30 flex items-center justify-center text-4xl shadow-md">
                         {selectedMerchant.pirateAvatar}
                      </div>
                      <div className="text-left">
                         <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 block">Торговец сундуками</span>
                         <h3 className="text-2xl font-black text-amber-100 leading-none uppercase tracking-tight">{selectedMerchant.pirateName}</h3>
                         <p className="text-xs text-amber-200/50 font-bold italic mt-1 leading-tight">{selectedMerchant.pirateTitle}</p>
                      </div>
                   </div>

                   <div className="py-6 flex justify-center relative">
                      {isOpeningChest ? (
                         <motion.div 
                           animate={{ 
                             rotate: [-4, 4, -4, 4, -4, 4, 0],
                             y: [0, -5, 0, -5, 0]
                           }}
                           transition={{ repeat: Infinity, duration: 0.3 }}
                           className="text-8xl filter drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] select-none"
                         >
                            💼
                         </motion.div>
                      ) : chestOpenedEffect || unlockedTreasures[selectedMerchant.id] ? (
                         <motion.div 
                           initial={{ scale: 0.8, rotate: -10 }}
                           animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                           className={cn(
                             "w-28 h-28 rounded-full border-4 flex items-center justify-center bg-black/80 shadow-inner",
                             selectedMerchant.glowColor
                           )}
                         >
                            {selectedMerchant.treasureIcon}
                         </motion.div>
                      ) : (
                         <div className="text-8xl select-none filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
                            {selectedMerchant.chestIcon}
                         </div>
                      )}
                      
                      {isOpeningChest && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full font-black uppercase text-amber-400 text-sm tracking-[0.2em] animate-pulse">
                            Сбиваем замки...
                         </div>
                      )}
                   </div>

                   <div className="relative p-6 bg-gradient-to-br from-[#111] to-[#000] rounded-2xl border border-amber-500/20 text-left overflow-hidden shadow-inner">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-[0.03] pointer-events-none" />
                      <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em] mb-2.5">История находки от пирата:</h4>
                      <p className="text-sm text-amber-100 font-bold leading-relaxed italic">
                         {selectedMerchant.story}
                      </p>
                   </div>

                   {(chestOpenedEffect || unlockedTreasures[selectedMerchant.id]) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl text-left shadow-2xl relative overflow-hidden"
                      >
                         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-2 flex items-center gap-1">
                            💝 Любовное Послание внутри:
                         </h4>
                         <p className="text-sm sm:text-base text-amber-100 font-black leading-relaxed italic text-center w-full">
                            {selectedMerchant.romanticMessage}
                         </p>
                      </motion.div>
                   )}

                </div>

                <div className="mt-8 pt-4 border-t border-amber-500/20">
                   {unlockedTreasures[selectedMerchant.id] || chestOpenedEffect ? (
                      <div className="w-full py-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl font-black uppercase tracking-[0.15em] text-xs sm:text-sm text-center flex justify-center items-center gap-2 shadow-inner">
                        <CheckCircle2 size={18} /> Сундук открыт • Реликвия извлечена
                      </div>
                   ) : (
                      <button 
                        onClick={() => handleOpenChest(selectedMerchant)}
                        disabled={gold < selectedMerchant.cost || isOpeningChest}
                        className={cn(
                          "w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border-2 shadow-2xl cursor-pointer active:scale-95",
                          gold >= selectedMerchant.cost 
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 text-slate-950 hover:scale-[1.02] shadow-[0_0_30px_rgba(245,158,11,0.4)]" 
                            : "bg-[#111111] text-slate-500 border-slate-900 cursor-not-allowed"
                        )}
                      >
                         <Coins size={16} /> Выкупить и Сбить Замки ({selectedMerchant.cost} дублонов)
                      </button>
                   )}
                </div>

             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12">
        
        {/* HEADER BLOCK (Coco Parrot card removed) */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-2 border-amber-500/20 pb-8">
           <div className="text-center md:text-left space-y-2 w-full">
              <div className="flex items-center justify-center md:justify-start gap-2.5 text-amber-500/70 uppercase text-[11px] font-black tracking-[0.4em]">
                 <Anchor size={14} className="text-amber-500" />
                 <span>Капитанский Мостик · Тортуга</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-amber-700 drop-shadow-[0_2px_15px_rgba(245,158,11,0.35)]">
                 Бухта Тортуга
              </h1>
           </div>
        </header>

        {/* 3D INTERACTIVE SAFE PIRATE BAY SCENARIO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
           
           {/* Left Column: Huge 3D Interactive Haven Diorama */}
           <div className="lg:col-span-8 h-[380px] md:h-[450px] rounded-[3rem] border-4 border-amber-500/30 overflow-hidden relative shadow-[0_0_60px_rgba(245,158,11,0.35)] bg-black">
              {isMounted ? (
                <BayScene />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black gap-4">
                  <Anchor size={36} className="animate-spin text-amber-500" />
                  <span className="text-xs uppercase font-black text-amber-500/60 tracking-widest animate-pulse">Заряжаем пушки, строим бухту...</span>
                </div>
              )}
           </div>

           {/* Right Column: Immersive safe harbor status sheet */}
           <div className="lg:col-span-4 rounded-[3rem] p-8 bg-gradient-to-br from-[#0c0c0c] to-[#000000] border-2 border-amber-500/20 relative shadow-2xl overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

              <div className="space-y-6 text-left relative z-10">
                 <div className="border-b border-amber-500/20 pb-4">
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.25em] block">Ведомости бухты</span>
                    <h2 className="text-2xl font-black text-amber-100 uppercase tracking-tight mt-1">Мирная Гавань Тортуга</h2>
                 </div>

                 <p className="text-sm text-amber-100/90 leading-relaxed font-sans font-bold">
                    Капитан! Пришвартовывайся к тихой пристани. Это самое **безопасное и теплое место** во всем архипелаге. Здесь шторма бессильны, пушки молчат, а команда может спокойно отдохнуть в таверне, пока ты изучаешь сокровища и решаешь насущные корабельные дела.
                 </p>

                 <div className="p-5 bg-black border border-white/5 rounded-2xl space-y-4 shadow-inner">
                    <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Сводка по форпосту:</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-sans font-black">
                       <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-amber-100 font-black">Бухта безопасна</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span>🔥</span>
                          <span className="text-amber-100 font-black">Костер разожжен</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-amber-500/10 text-center relative z-10">
                 <p className="text-[10px] text-amber-500/50 uppercase tracking-[0.2em] font-black">
                    Коко вещает: «Любовь греет круче рома!»
                 </p>
              </div>
           </div>

        </section>

        {/* TABS SELECTOR (raids removed, incidents added) */}
        <div className="flex items-center justify-center bg-black/95 p-2.5 rounded-[2.5rem] border border-amber-500/20 backdrop-blur-sm shadow-2xl relative z-20 max-w-3xl mx-auto">
           <div className="flex items-center justify-between w-full gap-2.5">
             {[
               { id: 'ship', label: 'Борт фрегата', icon: <Anchor size={16} /> },
               { id: 'crew', label: 'Офицеры WANTED', icon: <Users size={16} /> },
               { id: 'incidents', label: 'Будни фрегата', icon: <ShieldAlert size={16} /> },
               { id: 'chests', label: 'Сундуки сделок', icon: <Trophy size={16} /> },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={cn(
                   "flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all cursor-pointer",
                   activeTab === tab.id 
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-105" 
                    : "text-amber-500/60 hover:text-amber-300 hover:bg-amber-950/20"
                 )}
               >
                 {tab.icon} <span>{tab.label}</span>
               </button>
             ))}
           </div>
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="relative min-h-[480px] z-10">
          <AnimatePresence mode="wait">
             
             {/* TAB 1: SHIP (БОРТ) — Unified Captain's Steering Console */}
             {activeTab === 'ship' && (
                <motion.div
                  key="ship"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                   <div className="bg-[#050505] rounded-[3.5rem] border-2 border-amber-500/20 p-8 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-8 items-center justify-between min-h-[380px]">
                      
                      {/* Rotating ship wheel background vector */}
                      <div className="absolute -left-16 -bottom-16 opacity-[0.04] text-amber-500 pointer-events-none animate-spin-slow">
                         <svg width="350" height="350" viewBox="0 0 100 100" fill="currentColor">
                           <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none"/>
                           <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                           {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                             <line key={deg} x1="50" y1="50" x2={50 + 48 * Math.cos(deg * Math.PI / 180)} y2={50 + 48 * Math.sin(deg * Math.PI / 180)} stroke="currentColor" strokeWidth="2"/>
                           ))}
                         </svg>
                      </div>

                      <div className="text-left space-y-4 max-w-sm z-10">
                         <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Система Навигации</span>
                         <h3 className="text-3xl font-black text-amber-100 uppercase tracking-tight leading-none">Приборная Панель</h3>
                         <p className="text-sm text-amber-100/70 font-bold leading-relaxed font-sans">
                            Эти приборы показывают текущее физическое и душевное состояние вашего корабля. Держите прочность высокой, а трюмы полными, чтобы экипаж оставался лояльным и готовым к плаваниям!
                         </p>
                         <div className="flex gap-2">
                           <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mt-0.5" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Системы функционируют нормально</span>
                         </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-8 items-center justify-center w-full lg:w-auto z-10">
                         
                         {/* Dial 1: Hull */}
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-36 h-36 rounded-full border-4 border-amber-500/20 bg-black flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] group hover:border-orange-500/40 transition-colors duration-500">
                               <div className="absolute inset-0 rounded-full bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                               
                               <Shield size={24} className="text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                               <span className="text-3xl font-black text-amber-100 mt-1">{hull}%</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-orange-400/80 mt-0.5">Корпус</span>
                               
                               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                                 <circle cx="50" cy="50" r="44" className="stroke-orange-500/10 fill-none" strokeWidth="4" />
                                 <circle cx="50" cy="50" r="44" className="stroke-orange-500 fill-none transition-all duration-700" strokeWidth="4" strokeDasharray="276.4" strokeDashoffset={276.4 - (276.4 * hull) / 100} strokeLinecap="round" />
                               </svg>
                            </div>
                            
                            <button 
                              onClick={handleRepair}
                              className="px-5 py-3 bg-gradient-to-r from-[#111] to-[#000] hover:from-orange-500 hover:to-orange-600 hover:text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs border border-amber-500/30 hover:border-orange-400 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg"
                            >
                               <Hammer size={14} /> Чинить (+10%)
                            </button>
                         </div>

                         {/* Dial 2: Hold Supplies */}
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-36 h-36 rounded-full border-4 border-amber-500/20 bg-black flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] group hover:border-sky-500/40 transition-colors duration-500">
                               <div className="absolute inset-0 rounded-full bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                               
                               <Package size={24} className="text-sky-400 group-hover:scale-110 transition-transform duration-300" />
                               <span className="text-3xl font-black text-amber-100 mt-1">{hold}%</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-sky-400/80 mt-0.5">Трюмы</span>
                               
                               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                                 <circle cx="50" cy="50" r="44" className="stroke-sky-500/10 fill-none" strokeWidth="4" />
                                 <circle cx="50" cy="50" r="44" className="stroke-sky-400 fill-none transition-all duration-700" strokeWidth="4" strokeDasharray="276.4" strokeDashoffset={276.4 - (276.4 * hold) / 100} strokeLinecap="round" />
                               </svg>
                            </div>
                            
                            <button 
                              onClick={handleLoad}
                              className="px-5 py-3 bg-gradient-to-r from-[#111] to-[#000] hover:from-sky-500 hover:to-sky-600 hover:text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs border border-amber-500/30 hover:border-sky-400 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg"
                            >
                               <Package size={14} /> Грузить (+10%)
                            </button>
                         </div>

                         {/* Dial 3: Morale */}
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-36 h-36 rounded-full border-4 border-amber-500/20 bg-black flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] group hover:border-red-500/40 transition-colors duration-500">
                               <div className="absolute inset-0 rounded-full bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                               
                               <Beer size={24} className="text-red-400 group-hover:scale-110 transition-transform duration-300" />
                               <span className="text-3xl font-black text-amber-100 mt-1">{morale}%</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-red-400/80 mt-0.5">Дух</span>
                               
                               <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                                 <circle cx="50" cy="50" r="44" className="stroke-red-500/10 fill-none" strokeWidth="4" />
                                 <circle cx="50" cy="50" r="44" className="stroke-red-500 fill-none transition-all duration-700" strokeWidth="4" strokeDasharray="276.4" strokeDashoffset={276.4 - (276.4 * morale) / 100} strokeLinecap="round" />
                               </svg>
                            </div>
                            
                            <button 
                              onClick={handleRum}
                              className="px-5 py-3 bg-gradient-to-r from-[#111] to-[#000] hover:from-red-500 hover:to-red-600 hover:text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs border border-amber-500/30 hover:border-red-400 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg"
                            >
                               <Beer size={14} /> Налить Рома (+15%)
                            </button>
                         </div>

                      </div>

                   </div>

                   {/* Gossip & Weather */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative p-6 rounded-[2.5rem] bg-black border-2 border-red-500/25 text-left shadow-lg overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
                         <div className="flex justify-between items-center border-b border-red-500/15 pb-3 mb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 flex items-center gap-1.5">
                               <Wind size={14} /> Штормовое предупреждение
                            </p>
                            <span className="text-[9px] font-black text-red-400 bg-red-950/20 px-2.5 py-0.5 rounded-full border border-red-500/25">Опасно</span>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="p-3.5 bg-red-500/10 rounded-2xl text-red-400 border border-red-500/20 shrink-0">
                               <CloudLightning size={24} className="animate-pulse" />
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-base font-black text-amber-100">Буря в Карибском море</h4>
                               <p className="text-xs text-amber-100 font-bold leading-relaxed">Волны высотой до 8 метров. Кораблям не рекомендуется покидать бухту Тортуга до полного отлива во избежание крушения.</p>
                            </div>
                         </div>
                      </div>

                      <div className="relative p-6 rounded-[2.5rem] bg-black border-2 border-amber-500/20 text-left shadow-lg overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
                         <div className="flex justify-between items-center border-b border-amber-500/15 pb-3 mb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60 flex items-center gap-1.5">
                               <Scroll size={14} /> Слухи из таверны «Кракен»
                            </p>
                            <span className="text-[9px] font-black text-amber-400 bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-500/20">Слухи</span>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 shrink-0">
                               <Coins size={24} />
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-base font-black text-amber-100">Испанский Золотой Галеон</h4>
                               <p className="text-xs text-amber-100 font-bold leading-relaxed">Матросы шепчутся, что груженый до краев галеон бросил якорь неподалеку. Это отличный шанс наполнить казну золотом!</p>
                            </div>
                         </div>
                      </div>
                   </div>

                </motion.div>
             )}

             {/* TAB 2: OFFICERS (ЭКИПАЖ) — WANTED posters layout (Dismiss & Demote actions added) */}
             {activeTab === 'crew' && (
                <motion.div
                  key="crew"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {officers.map(officer => {
                         const isFired = officer.isDismissed || false;

                         return (
                            <div 
                              key={officer.id}
                              className={cn(
                                "relative rounded-[2.5rem] p-6 border-4 flex flex-col justify-between overflow-hidden shadow-2xl group transition-all duration-300",
                                isFired 
                                  ? "border-slate-800 bg-[#070707] opacity-60" 
                                  : "border-amber-500/20 bg-gradient-to-b from-[#111111] to-[#050505]"
                              )}
                            >
                               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-0" />
                               
                               <div className="absolute inset-x-4 top-4 h-0.5 bg-amber-500/10 z-10" />
                               <div className="absolute inset-x-4 bottom-4 h-0.5 bg-amber-500/10 z-10" />
                               
                               <div className="relative z-10 space-y-6 flex flex-col items-center text-center">
                                  
                                  {/* Fired / Rehire indicator */}
                                  {isFired ? (
                                     <div className="px-4 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] shadow-md animate-pulse">
                                        Списан в таверну
                                     </div>
                                  ) : (
                                     <div className="px-4 py-1.5 bg-amber-500/15 border border-amber-500/35 rounded-lg text-amber-400 text-[10px] font-black uppercase tracking-[0.25em] shadow-md">
                                        WANTED • В СТРОЮ
                                     </div>
                                  )}

                                  {/* Portrait frame */}
                                  <div className={cn(
                                     "w-24 h-24 rounded-[2rem] bg-black border-4 flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(0,0,0,0.8)] relative group-hover:rotate-3 transition-transform duration-300",
                                     isFired ? "border-slate-800" : "border-amber-500/25"
                                  )}>
                                     {officer.avatar}
                                  </div>

                                  <div className="space-y-1">
                                     <h4 className="text-2xl font-black text-amber-100 tracking-tight leading-none uppercase">{officer.name}</h4>
                                     <p className="text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none mt-1">{officer.role}</p>
                                  </div>

                                  <p className="text-xs text-amber-100 font-bold leading-relaxed px-2 italic">"{officer.description}"</p>

                                  {/* Loyalty widget */}
                                  {!isFired && (
                                     <div className="w-full space-y-2 px-2 bg-black/60 p-4 rounded-2xl border border-white/5">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-500/50">
                                           <span className="flex items-center gap-1"><HeartHandshake size={12} /> Преданность</span>
                                           <span className={cn(officer.loyalty > 70 ? "text-emerald-400 font-black" : "text-yellow-400 font-black")}>{officer.loyalty}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-amber-950/20 p-0.5">
                                           <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700" style={{ width: `${officer.loyalty}%` }} />
                                        </div>
                                        <div className="flex justify-between items-center pt-1 text-[10px] text-amber-100/40 font-bold italic">
                                           <span>Статус: <strong className={officer.statusColor}>{officer.status}</strong></span>
                                           <span>Награда: <strong className="text-amber-400 font-black">{officer.wantedReward}</strong></span>
                                        </div>
                                     </div>
                                  )}
                               </div>

                               {/* Action buttons (Dismiss, demote, rehire) */}
                               <div className="relative z-10 mt-6 pt-4 border-t border-amber-500/10 space-y-2">
                                  {isFired ? (
                                     <button 
                                       onClick={() => rehireOfficer(officer.id)}
                                       className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                                     >
                                        <UserPlus size={14} /> Нанять обратно (50 золотых)
                                     </button>
                                  ) : (
                                     <>
                                        {/* Reward / Premium */}
                                        <button 
                                          onClick={() => rewardOfficer(officer.id)}
                                          className="w-full py-3 bg-gradient-to-r from-[#111] to-[#000] hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs border border-amber-500/20 hover:border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                                        >
                                           <Award size={14} /> Повысить / Одобрить (30 дублонов)
                                        </button>

                                        <div className="grid grid-cols-2 gap-2">
                                           {/* Demote */}
                                           <button 
                                             onClick={() => demoteOfficer(officer.id)}
                                             className="py-2.5 bg-black/40 hover:bg-orange-500/10 text-orange-400 hover:text-orange-300 rounded-xl font-black uppercase tracking-widest text-[9px] border border-orange-500/20 hover:border-orange-500/40 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                                           >
                                              <ArrowDown size={11} /> Разжаловать
                                           </button>
                                           
                                           {/* Dismiss */}
                                           <button 
                                             onClick={() => dismissOfficer(officer.id)}
                                             className="py-2.5 bg-black/40 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl font-black uppercase tracking-widest text-[9px] border border-red-500/20 hover:border-red-500/40 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                                           >
                                              <UserX size={11} /> Уволить
                                           </button>
                                        </div>
                                     </>
                                  )}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </motion.div>
             )}

             {/* TAB 3: DAILY INCIDENTS (БУДНИ ФРЕГАТА) — Interactive ship crisis game */}
             {activeTab === 'incidents' && (
                <motion.div
                  key="incidents"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto space-y-8"
                >
                   {/* Header description */}
                   <div className="text-center space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 flex items-center justify-center gap-1.5"><ShieldAlert size={14} /> Чрезвычайные дела</span>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-amber-100">Будни Фрегата</h2>
                      <p className="text-sm text-amber-500/70 font-bold leading-relaxed">
                         «Каждый день на пиратском корабле случаются форс-мажоры: драки, левиафаны, поджоги или пропажа провизии. Принимайте судьбоносные капитанские решения и управляйте кораблем!»
                      </p>
                   </div>

                   {/* Active Incident Logbook Scroll Plaque */}
                   <div className="bg-[#0c0c0c] border-4 border-amber-500/30 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5 pointer-events-none" />
                      <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

                      <AnimatePresence mode="wait">
                         {!resolvedLog ? (
                            <motion.div 
                              key="active_incident"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="space-y-6 text-left"
                            >
                               {/* Incident Icon & Name */}
                               <div className="flex items-center gap-4 border-b border-amber-500/20 pb-4">
                                  <div className="w-16 h-16 rounded-2xl bg-black border border-amber-500/20 flex items-center justify-center text-4xl shadow-md animate-pulse">
                                     {activeIncident.icon}
                                  </div>
                                  <div>
                                     <span className="text-[9px] font-black uppercase text-red-500 tracking-[0.2em] block">Судовое Происшествие</span>
                                     <h3 className="text-2xl font-black text-amber-100 uppercase tracking-tight leading-none mt-1">{activeIncident.title}</h3>
                                  </div>
                               </div>

                               {/* Scenario Description */}
                               <p className="text-base text-amber-100 font-bold leading-relaxed italic">
                                  "{activeIncident.desc}"
                               </p>

                               {/* Multi Choices buttons */}
                               <div className="space-y-3 pt-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/40 block mb-2">Варианты Капитанских приказов:</span>
                                  {activeIncident.choices.map((choice, idx) => (
                                     <button
                                       key={idx}
                                       onClick={() => handleResolveIncident(choice)}
                                       className="w-full text-left p-5 rounded-2xl border-2 border-amber-500/20 bg-black/60 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400 hover:scale-[1.01] transition-all cursor-pointer shadow-lg group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 active:scale-95"
                                     >
                                        <div>
                                           <span className="text-sm font-black group-hover:text-slate-950 text-amber-100 block">{choice.text}</span>
                                           <span className="text-[11px] font-bold text-amber-100/50 group-hover:text-slate-950/60 block mt-0.5 italic">Решение: {choice.actionText}</span>
                                        </div>
                                        <span className="px-3 py-1 bg-black/40 group-hover:bg-slate-950 group-hover:text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/10 shrink-0 self-start sm:self-center">
                                           {choice.effect}
                                        </span>
                                     </button>
                                  ))}
                               </div>
                            </motion.div>
                         ) : (
                            <motion.div 
                              key="resolved_incident"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-6 text-center py-8"
                            >
                               <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(16,185,129,0.3)] mx-auto animate-bounce">
                                  📜
                               </div>

                               <div className="space-y-2">
                                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-[0.25em] block">Происшествие Разрешено</span>
                                  <h3 className="text-3xl font-black text-amber-100 uppercase tracking-tight">Отчет Квартирмейстера</h3>
                               </div>

                               <div className="p-6 bg-gradient-to-br from-[#111] to-[#000] border border-amber-500/20 rounded-2xl max-w-lg mx-auto text-left shadow-inner">
                                  <p className="text-sm sm:text-base text-amber-100 font-bold leading-relaxed italic text-center w-full">
                                     {resolvedLog}
                                  </p>
                               </div>

                               {/* Next Incident Trigger Button */}
                               <button
                                 onClick={handleNextIncident}
                                 className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-amber-400 hover:scale-102 cursor-pointer active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                               >
                                  Зарегистрировать Новое Событие
                               </button>
                            </motion.div>
                         )}
                      </AnimatePresence>
                   </div>
                </motion.div>
             )}

             {/* TAB 4: MYSTERY CHESTS (СУНДУКИ СДЕЛКИ) */}
             {activeTab === 'chests' && (
                <motion.div
                  key="chests"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                   <div className="text-center space-y-2 max-w-xl mx-auto">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Сделки на причале</span>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-amber-100">Контрабандные Сундуки Пиратов</h2>
                      <p className="text-sm text-amber-500/70 font-bold leading-relaxed">
                         «Проезжие пираты постоянно завозят в гавань закрытые сундуки. Выкупайте их у купцов, слушайте их невероятные истории и взламывайте замки, чтобы добраться до истинных сокровищ любви!»
                      </p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {chestMerchants.map(merchant => {
                         const isUnlocked = unlockedTreasures[merchant.id] || false;
                         const canAfford = gold >= merchant.cost;

                         return (
                            <div 
                              key={merchant.id}
                              onClick={() => setSelectedMerchant(merchant)}
                              className={cn(
                                "relative rounded-[2.5rem] p-6 border-4 transition-all flex flex-col justify-between items-center text-center overflow-hidden group shadow-2xl min-h-[420px] cursor-pointer hover:scale-[1.02] bg-[#0c0c0c]",
                                isUnlocked 
                                  ? `border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]` 
                                  : "border-amber-900/40 hover:border-amber-500/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.2)]"
                              )}
                            >
                               <div className="absolute inset-0 bg-black/55 z-0 transition-colors group-hover:bg-black/45" />

                               <div className="relative z-10 w-full flex flex-col items-center space-y-3.5">
                                  <span className={cn(
                                     "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                                     isUnlocked 
                                       ? "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" 
                                       : "text-amber-500 border-amber-500/10 bg-amber-950/10"
                                  )}>
                                     {merchant.rarity}
                                  </span>

                                  <div className="flex items-center gap-1.5 bg-black/45 px-3 py-1 rounded-full border border-white/5">
                                     <span className="text-sm">{merchant.pirateAvatar}</span>
                                     <span className="text-[10px] font-black uppercase tracking-wider text-amber-100/60 truncate max-w-[100px]">{merchant.pirateName}</span>
                                  </div>
                               </div>

                               <div className="relative z-10 my-4 flex items-center justify-center">
                                  {isUnlocked ? (
                                     <div className={cn(
                                        "w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl shadow-xl transition-all bg-[#0e0703]",
                                        merchant.glowColor
                                     )}>
                                        {merchant.treasureIcon}
                                     </div>
                                  ) : (
                                     <div className="text-7xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] group-hover:scale-115 group-hover:-rotate-3 transition-transform duration-300 select-none">
                                        {merchant.chestIcon}
                                     </div>
                                  )}
                               </div>

                               <div className="relative z-10 w-full space-y-1">
                                  <h3 className="text-lg font-black text-amber-100 leading-tight uppercase tracking-tight">
                                     {isUnlocked ? merchant.treasureName : merchant.name}
                                  </h3>
                                  <p className="text-[10px] text-amber-100/40 font-black italic">
                                     {isUnlocked ? 'Сундук взломан' : 'Кликни, чтобы узнать историю'}
                                  </p>
                               </div>

                               <div className="relative z-10 w-full mt-6 pt-4 border-t border-amber-500/10">
                                  {isUnlocked ? (
                                     <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-black uppercase tracking-widest text-[9px] flex justify-center items-center gap-1.5 shadow-inner">
                                       <CheckCircle2 size={12} /> Открыт • Посмотреть
                                     </div>
                                  ) : (
                                     <div 
                                       className={cn(
                                         "w-full py-3 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 border transition-all",
                                         canAfford 
                                           ? "bg-[#111111] border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-400" 
                                           : "bg-[#050505] text-slate-500 border-slate-900"
                                       )}
                                     >
                                        <Coins size={12} /> {merchant.cost} дублонов
                                     </div>
                                  )}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </motion.div>
             )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
