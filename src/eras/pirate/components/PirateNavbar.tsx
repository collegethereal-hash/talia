'use client';

import { motion } from 'framer-motion';
import { Anchor, Map, Sword, Scroll, Coins, Users, Compass, Bomb } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Anchor, label: 'Бухта' },
  { href: '/gallery', icon: Map, label: 'Карты' },
  { href: '/lair', icon: Bomb, label: 'Логово' },
  { href: '/bucket-list', icon: Scroll, label: 'Кодекс' },
  { href: '/stats', icon: Coins, label: 'Казна' },
  { href: '/profile', icon: Users, label: 'Команда' },
];

export const PirateNavbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pirate-wood px-2 sm:px-4 md:px-10 py-4 rounded-3xl flex items-center justify-between shadow-2xl relative overflow-hidden"
      >
        {/* Wood grain texture effect via SVG or CSS could go here */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
        
        {/* Decorative corner nails */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-zinc-600 shadow-inner" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-600 shadow-inner" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-zinc-600 shadow-inner" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-zinc-600 shadow-inner" />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href} className="relative group">
              <motion.div
                whileHover={{ y: -4, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all duration-300",
                  isActive ? "text-amber-400 scale-110" : "text-amber-100/50 hover:text-amber-400"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-500",
                  isActive ? "bg-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.3)] border border-amber-400/30" : "bg-transparent"
                )}>
                  <Icon size={isActive ? 26 : 22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em]",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
};
