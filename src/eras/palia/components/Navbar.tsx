'use client';

import { motion } from 'framer-motion';
import { Heart, Camera, Book, CheckSquare, BarChart2, User, Send } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Heart, label: 'Talia' },
  { href: '/gallery', icon: Camera, label: 'Галерея' },
  { href: '/journal', icon: Book, label: 'Журнал' },
  { href: '/bucket-list', icon: CheckSquare, label: 'Квесты' },
  { href: '/stats', icon: BarChart2, label: 'Архив' },
  { href: '/profile', icon: User, label: 'Мы' },
];

export const Navbar = () => {
  const pathname = usePathname();

  if (pathname === '/stats') return null;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl px-2 sm:px-4 md:px-10 py-4 rounded-[2.5rem] flex items-center justify-between shadow-2xl border-4 border-[#e6d5bc] relative overflow-hidden"
      >
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href} className="relative group">
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all duration-300",
                  isActive ? "text-[#5c4a33] scale-110" : "text-[#8b7355]/50 hover:text-[#5c4a33]"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  isActive ? "bg-[#f5e6d3] shadow-inner" : "bg-transparent"
                )}>
                  <Icon size={isActive ? 26 : 22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
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
