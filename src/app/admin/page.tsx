'use client';

import { useState } from 'react';
import { useEra } from '@/context/EraContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, RefreshCw, Ship, Trees, Sparkles, 
  Save, Bell, Volume2, Lock, Languages, Heart, Coffee, 
  ChevronRight, CheckCircle2, Moon, Sun, Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const { currentEra, setEra } = useEra();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'eras' | 'settings'>('eras');
  
  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ru');

  const handleEraSwitch = async (era: 'palia' | 'pirate') => {
    if (era === currentEra) return;
    setIsUpdating(true);
    await setEra(era);
    setTimeout(() => setIsUpdating(false), 800);
  };

  return (
    <div className={cn(
      "min-h-screen p-4 md:p-8 pb-40 font-sans selection:bg-purple-200 transition-colors duration-500",
      darkMode ? "bg-[#1a1510] text-[#fef3c7]" : "bg-[#fdfaf3] text-[#4a3728]"
    )}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header - Talia Style */}
        <header className={cn(
          "flex flex-col md:flex-row items-center justify-between backdrop-blur-xl border p-6 md:p-8 rounded-[3rem] shadow-sm relative overflow-hidden transition-colors duration-500",
          darkMode ? "bg-black/40 border-white/10" : "bg-white/60 border-white/40"
        )}>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Heart size={120} className="text-purple-500 rotate-12" />
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className={cn(
              "p-4 rounded-3xl shadow-inner border transition-colors",
              darkMode ? "bg-white/10 border-white/20 text-purple-300" : "bg-gradient-to-br from-purple-100 to-amber-100 text-purple-600 border-white/50"
            )}>
              <Settings size={36} className={cn(isUpdating && "animate-spin")} />
            </div>
            <div className="text-center md:text-left">
              <h1 className={cn(
                "text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r",
                darkMode ? "from-purple-300 to-amber-300" : "from-purple-600 to-amber-600"
              )}>
                Talia Control
              </h1>
              <p className={cn(
                "font-medium flex items-center justify-center md:justify-start gap-2",
                darkMode ? "text-[#fef3c7]/60" : "text-[#4a3728]/60"
              )}>
                <Coffee size={14} /> Настройка нашей уютной реальности
              </p>
            </div>
          </div>

          <nav className={cn(
            "flex rounded-2xl border mt-6 md:mt-0 shadow-sm relative z-10 transition-colors overflow-hidden",
            darkMode ? "bg-white/5 border-white/10" : "bg-white/50 border-white/50"
          )}>
            <button 
              onClick={() => setActiveTab('eras')}
              className={cn(
                "px-8 py-4 text-sm font-bold transition-all duration-300 flex items-center gap-2",
                activeTab === 'eras' 
                  ? (darkMode ? "bg-white/20 text-white" : "bg-white text-purple-600") 
                  : (darkMode ? "text-white/40 hover:text-white hover:bg-white/5" : "text-[#4a3728]/50 hover:text-[#4a3728] hover:bg-black/5")
              )}
            >
              <Sparkles size={18} /> Эпохи
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "px-8 py-4 text-sm font-bold transition-all duration-300 flex items-center gap-2 border-l",
                darkMode ? "border-white/10" : "border-white/50",
                activeTab === 'settings' 
                  ? (darkMode ? "bg-white/20 text-white" : "bg-white text-purple-600") 
                  : (darkMode ? "text-white/40 hover:text-white hover:bg-white/5" : "text-[#4a3728]/50 hover:text-[#4a3728] hover:bg-black/5")
              )}
            >
              <Settings size={18} /> Настройки
            </button>
          </nav>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'eras' ? (
            <motion.div
              key="eras-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <section className="space-y-8 pt-8">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-colors",
                    darkMode ? "bg-purple-900/40 text-purple-300 border-purple-800" : "bg-purple-100 text-purple-600 border-purple-200"
                  )}>
                    Переключатель настроения
                  </div>
                  <h2 className="text-3xl font-black">Выберите текущую эпоху</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Palia Option */}
                  <EraOption 
                    id="palia"
                    name="Palia Era"
                    desc="Самый уютный вариант. Котеджкор, цветы, пастельные тона и тепло."
                    icon={<Trees size={48} />}
                    isActive={currentEra === 'palia'}
                    onClick={() => handleEraSwitch('palia')}
                    color={darkMode ? "bg-emerald-950/20 border-white/5 hover:border-white/10" : "bg-emerald-50/40 border-emerald-100 hover:border-emerald-200"}
                    accentColor="emerald"
                    darkMode={darkMode}
                  />

                  {/* Pirate Option */}
                  <EraOption 
                    id="pirate"
                    name="Pirate Era"
                    desc="Для искателей приключений! Ром, золото, бушующее море и ночные огни."
                    icon={<Ship size={48} />}
                    isActive={currentEra === 'pirate'}
                    onClick={() => handleEraSwitch('pirate')}
                    color={darkMode ? "bg-amber-950/20 border-white/5 hover:border-white/10" : "bg-amber-50/40 border-amber-100 hover:border-amber-200"}
                    accentColor="amber"
                    darkMode={darkMode}
                  />
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="settings-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Notifications & Sound */}
              <div className={cn(
                "backdrop-blur-xl border p-12 rounded-[3rem] shadow-sm space-y-10 transition-colors duration-500",
                darkMode ? "bg-black/40 border-white/10" : "bg-white/60 border-white/50"
              )}>
                <div className="flex items-center gap-4">
                  <Bell className="text-purple-500" size={32} />
                  <h3 className="text-2xl font-black">Уведомления и звук</h3>
                </div>
                
                <div className="space-y-6">
                  <SettingsToggle 
                    label="Уведомления" 
                    description="Всплывающие сообщения о новых событиях"
                    icon={<Bell size={28} />}
                    isActive={notifications}
                    onToggle={() => setNotifications(!notifications)}
                    darkMode={darkMode}
                  />
                  <SettingsToggle 
                    label="Звуковые эффекты" 
                    description="Приятные звуки при кликах и действиях"
                    icon={<Volume2 size={28} />}
                    isActive={soundEffects}
                    onToggle={() => setSoundEffects(!soundEffects)}
                    darkMode={darkMode}
                  />
                </div>
              </div>

              {/* Appearance & System */}
              <div className={cn(
                "backdrop-blur-xl border p-12 rounded-[3rem] shadow-sm space-y-10 transition-colors duration-500",
                darkMode ? "bg-black/40 border-white/10" : "bg-white/60 border-white/50"
              )}>
                <div className="flex items-center gap-4">
                  <Palette className="text-amber-500" size={32} />
                  <h3 className="text-2xl font-black">Внешний вид и система</h3>
                </div>

                <div className="space-y-6">
                  <SettingsToggle 
                    label="Тёмная тема" 
                    description="Включить уютный ночной режим"
                    icon={<Moon size={28} />}
                    isActive={darkMode}
                    onToggle={() => setDarkMode(!darkMode)}
                    darkMode={darkMode}
                  />
                  
                  <div className={cn(
                    "flex items-center justify-between p-6 rounded-2xl border group transition-all",
                    darkMode ? "bg-white/5 border-white/10 hover:border-amber-400/50" : "bg-white/40 border-white/40 hover:border-amber-200"
                  )}>
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "p-3.5 rounded-xl shadow-sm text-amber-500 transition-colors",
                        darkMode ? "bg-white/10" : "bg-white"
                      )}>
                        <Languages size={28} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Язык</p>
                        <p className={cn(
                          "text-sm transition-colors",
                          darkMode ? "text-white/40" : "text-[#4a3728]/50"
                        )}>Выберите язык интерфейса</p>
                      </div>
                    </div>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className={cn(
                        "border rounded-xl px-4 py-3 text-base font-bold focus:outline-none focus:ring-2 focus:ring-amber-200 transition-colors",
                        darkMode ? "bg-slate-900 border-white/20 text-white" : "bg-white border-white/50 text-[#4a3728]"
                      )}
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save All Settings Button */}
              <div className="md:col-span-2 flex justify-center pt-12">
                <button className={cn(
                  "flex items-center gap-4 px-16 py-7 text-white rounded-[2.5rem] font-black uppercase tracking-widest transition-all active:scale-95 text-lg shadow-lg",
                  darkMode ? "bg-gradient-to-r from-purple-700 to-amber-700 hover:shadow-purple-900/20" : "bg-gradient-to-r from-purple-500 to-amber-500 hover:shadow-purple-200"
                )}>
                  <Save size={24} /> Сохранить настройки
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EraOption({ id, name, desc, icon, isActive, onClick, color, accentColor, darkMode }: any) {
  const isPalia = id === 'palia';
  
  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative p-8 rounded-[3.5rem] border-4 cursor-pointer transition-all duration-500 flex flex-col items-center text-center space-y-6 overflow-hidden group shadow-sm",
        color,
        isActive 
          ? "border-white shadow-xl ring-8 ring-white/20 scale-[1.02] z-20" 
          : "border-transparent"
      )}
    >
      {isActive && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="absolute top-6 right-6 z-30"
        >
          <div className={cn(
            "p-2 rounded-full shadow-lg border-2 border-white",
            isPalia ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
          )}>
            <CheckCircle2 size={24} />
          </div>
        </motion.div>
      )}
      
      <div className={cn(
        "w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl relative z-10",
        isActive 
          ? (isPalia ? "bg-emerald-500 text-white rotate-6" : "bg-amber-500 text-white -rotate-6") 
          : (darkMode ? "bg-white/5 text-white/20 group-hover:text-white/40" : "bg-white text-slate-300 group-hover:text-slate-500 group-hover:scale-110")
      )}>
        {icon}
      </div>

      <div className="space-y-3 relative z-10">
        <h4 className={cn(
          "text-3xl font-black uppercase tracking-tight transition-colors",
          isActive 
            ? (isPalia ? (darkMode ? "text-emerald-400" : "text-emerald-700") : (darkMode ? "text-amber-400" : "text-amber-700")) 
            : (darkMode ? "text-white/80" : "text-slate-700")
        )}>{name}</h4>
        <p className={cn(
          "text-sm font-medium leading-relaxed px-4 italic transition-colors",
          darkMode ? "text-white/50" : "text-[#4a3728]/60"
        )}>"{desc}"</p>
      </div>

      <div className={cn(
        "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10",
        isActive 
          ? (isPalia ? "bg-emerald-500 text-white" : "bg-amber-500 text-white") 
          : (darkMode ? "bg-white/10 text-white/40 border border-white/10 group-hover:bg-white/20 group-hover:text-white" : "bg-white text-[#4a3728]/40 border border-[#4a3728]/10 group-hover:bg-[#4a3728]/5 group-hover:text-[#4a3728]")
      )}>
        {isActive ? 'Активна' : 'Активировать'}
      </div>

      {/* Decorative blobs */}
      <div className={cn(
        "absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-20 transition-all duration-700 group-hover:opacity-40",
        isPalia ? "bg-emerald-400" : "bg-amber-400"
      )} />
    </motion.div>
  );
}

function SettingsToggle({ label, description, icon, isActive, onToggle, darkMode }: any) {
  return (
    <div className={cn(
      "flex items-center justify-between p-6 rounded-2xl border group transition-all",
      darkMode ? "bg-white/5 border-white/10 hover:border-purple-400/50" : "bg-white/40 border-white/40 hover:border-purple-200"
    )}>
      <div className="flex items-center gap-5">
        <div className={cn(
          "p-3.5 rounded-xl shadow-sm transition-all",
          isActive 
            ? (darkMode ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-600") 
            : (darkMode ? "bg-white/10 text-white/20" : "bg-white text-slate-300")
        )}>
          {icon}
        </div>
        <div>
          <p className="font-bold text-lg">{label}</p>
          <p className={cn(
            "text-sm transition-colors",
            darkMode ? "text-white/40" : "text-[#4a3728]/50"
          )}>{description}</p>
        </div>
      </div>
      
      <button 
        onClick={onToggle}
        className={cn(
          "w-16 h-8 rounded-full relative transition-all duration-300 outline-none",
          isActive 
            ? (darkMode ? "bg-purple-600 shadow-lg shadow-purple-900/40" : "bg-purple-500 shadow-lg shadow-purple-100") 
            : (darkMode ? "bg-slate-800" : "bg-slate-200")
        )}
      >
        <motion.div 
          animate={{ x: isActive ? 34 : 4 }}
          className="absolute top-1.5 w-5 h-5 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}

