'use client';

import { motion } from 'framer-motion';
import { Heart, Camera, Book, CheckSquare, BarChart2, User, Send } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useData } from '@/components/DataProvider';
import { useEffect, useMemo } from 'react';

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
  const { currentUser, moments, quests, notes, whispers } = useData();

  const badgeKeyPrefix = useMemo(() => {
    if (!currentUser) return null;
    return `lumina_last_seen:${currentUser}`;
  }, [currentUser]);

  const getLastSeen = (section: string) => {
    if (!badgeKeyPrefix) return 0;
    const raw = localStorage.getItem(`${badgeKeyPrefix}:${section}`);
    const num = raw ? Number(raw) : 0;
    return Number.isFinite(num) ? num : 0;
  };

  const setLastSeen = (section: string, ts: number) => {
    if (!badgeKeyPrefix) return;
    localStorage.setItem(`${badgeKeyPrefix}:${section}`, String(ts));
  };

  useEffect(() => {
    if (!currentUser) return;
    const now = Date.now();
    if (pathname === '/gallery') setLastSeen('gallery', now);
    if (pathname === '/journal') setLastSeen('journal', now);
    if (pathname === '/bucket-list') setLastSeen('quests', now);
    if (pathname === '/profile') setLastSeen('we', now);
  }, [pathname, currentUser, badgeKeyPrefix]);

  const badgeCounts = useMemo(() => {
    if (!currentUser) {
      return { gallery: 0, journal: 0, quests: 0, we: 0 };
    }

    const galleryLast = getLastSeen('gallery');
    const journalLast = getLastSeen('journal');
    const questsLast = getLastSeen('quests');
    const weLast = getLastSeen('we');

    const gallery = (moments || []).filter((m: any) => {
      if (m?.author === currentUser) return false;
      const ts = m?.created_at ? new Date(m.created_at).getTime() : 0;
      return ts > galleryLast;
    }).length;

    const questsCount = (quests || []).filter((q: any) => {
      if (q?.proposedBy === currentUser) return false;
      const ts = q?.createdAt ? new Date(q.createdAt).getTime() : 0;
      // Count anything new, and also keep unapproved partner proposals visible
      return ts > questsLast || q?.approvedByPartner === false;
    }).length;

    const journalNotes = (notes || []).filter((n: any) => {
      if (n?.author === currentUser) return false;
      const ts = n?.created_at ? new Date(n.created_at).getTime() : 0;
      return ts > journalLast;
    }).length;

    const journalComments = (notes || []).reduce((acc: number, n: any) => {
      const cs = Array.isArray(n?.comments) ? n.comments : [];
      const newFromPartner = cs.filter((c: any) => {
        if (c?.author === currentUser) return false;
        const ts = typeof c?.id === 'number' ? c.id : 0; // Date.now() based
        return ts > journalLast;
      }).length;
      return acc + newFromPartner;
    }, 0);

    const journal = journalNotes + journalComments;

    const weWhispers = (whispers || []).filter((w: any) => {
      // Count whispers received since last visit
      if (w?.receiver !== currentUser) return false;
      const ts = w?.created_at ? new Date(w.created_at).getTime() : 0;
      return ts > weLast;
    }).length;

    return { gallery, journal, quests: questsCount, we: weWhispers };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, moments, quests, notes, whispers]);

  const formatBadge = (n: number) => {
    if (n <= 0) return null;
    if (n > 99) return '99+';
    return String(n);
  };

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
          const badgeValue =
            item.href === '/gallery' ? formatBadge(badgeCounts.gallery) :
            item.href === '/journal' ? formatBadge(badgeCounts.journal) :
            item.href === '/bucket-list' ? formatBadge(badgeCounts.quests) :
            item.href === '/profile' ? formatBadge(badgeCounts.we) :
            null;
          
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
                {badgeValue && !isActive && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg border-2 border-white">
                    {badgeValue}
                  </span>
                )}
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
