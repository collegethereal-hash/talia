'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Archi2DProps {
  customization: {
    hatType: string;
    accessoryType: string;
    furColor?: string;
  };
  isHappy?: boolean;
}

export const Archi2D: React.FC<Archi2DProps> = ({ customization, isHappy }) => {
  // Базовые пути к изображениям (пользователь добавит их в public/pets/)
  const baseDir = '/pets/archi';
  
  // Функция для создания фильтра на основе цвета (упрощенная версия)
  // В идеале здесь можно использовать SVG фильтры для более точного наложения цвета
  const furStyle = customization.furColor ? {
    filter: `sepia(1) saturate(2) hue-rotate(${getHueRotation(customization.furColor)}deg) brightness(0.9)`,
  } : {};

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible rounded-[2.5rem] shadow-inner bg-[#fdfaf3] pointer-events-none">
      {/* Пользовательский фон */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center rounded-[2.5rem] opacity-100"
        style={{ 
          backgroundImage: `url('/pets/backhround/Gemini_Generated_Image_d8b1p9d8b1p9d8b1.png')`,
        }} 
      />
      
      {/* Candy Crush Style Background Pattern - Overlay to blend */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-[1]" 
           style={{ 
             backgroundImage: `radial-gradient(#ff69b4 1.5px, transparent 1.5px), radial-gradient(#ffffff 1.5px, transparent 1.5px)`,
             backgroundSize: '30px 30px',
             backgroundPosition: '0 0, 15px 15px'
           }} 
      />
      
      {/* Dynamic Floating Elements removed as requested */}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${customization.hatType}-${customization.accessoryType}`}
          initial={{ opacity: 0, scale: 1.5 }}
          animate={{ opacity: 1, scale: 2.3 }} 
          exit={{ opacity: 0, scale: 1.5 }}
          className="relative w-full h-full flex items-center justify-center translate-x-8 z-10" 
        >
          {/* 1. Тело (Основа) - Самый нижний слой */}
          <img 
            src={`${baseDir}/base.png`} 
            alt="Archi Base"
            style={furStyle}
            className="absolute inset-0 w-full h-full object-contain z-10 select-none pointer-events-none transition-all duration-500"
          />

          {/* 2. Шляпа (Слой посередине) */}
          {customization.hatType === 'chef' && (
            <motion.img 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              src={`${baseDir}/hat_chef.png`} 
              alt="Chef Hat"
              className="absolute inset-0 w-full h-full object-contain z-20 select-none pointer-events-none"
            />
          )}

          {/* 3. Одежда (Самый верхний слой, поверх шляпы) */}
          {customization.accessoryType === 'chef_outfit' && (
            <motion.img 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={`${baseDir}/outfit_chef.png`} 
              alt="Chef Outfit"
              className="absolute inset-0 w-full h-full object-contain z-30 select-none pointer-events-none"
            />
          )}

          {/* Анимация радости (сердечки и т.д.) */}
          {isHappy && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center"
            >
              <span className="text-4xl">❤️</span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Индикатор отсутствия файлов */}
      <div className="absolute bottom-2 right-2 text-[10px] text-[#8b7355] opacity-50 font-mono">
        Layered 2D Engine v1.0 (Beta)
      </div>
    </div>
  );
};

// Вспомогательная функция для вычисления поворота цвета
function getHueRotation(hex: string): number {
  // Очень грубая конвертация HEX в Hue для демонстрации
  // В реальности лучше использовать полноценную библиотеку для работы с цветом
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Упрощенная логика: если преобладает красный - 0, зеленый - 120, синий - 240
  if (r > g && r > b) return 0;
  if (g > r && g > b) return 100;
  if (b > r && b > g) return 220;
  return 0;
}
