'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PolaroidProps {
  src: string;
  caption: string;
  date: string;
  rotate?: number;
}

export function PolaroidCard({ src, caption, date, rotate = 0 }: PolaroidProps) {
  return (
    <div 
      className="bg-[#fdfaf3] p-4 pb-10 shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:-translate-y-3 relative group inline-block w-72 border-4 border-[#e6d5bc] rounded-sm"
      style={{ 
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {/* Palia Style Pin */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="relative">
          {/* Pin Head */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg border border-red-900/20" />
          {/* Pin Reflection */}
          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/30" />
          {/* Pin Shadow on Card */}
          <div className="absolute top-5 left-2 w-1.5 h-4 bg-black/20 blur-[2px] -rotate-12" />
        </div>
      </div>

      {/* Photo Frame */}
      <div className="aspect-[4/5] overflow-hidden mb-6 bg-[#f5e6d3] relative border-2 border-[#e6d5bc] rounded-sm shadow-inner">
        <Image 
          src={src} 
          alt={caption}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105 sepia-[0.2] contrast-[1.1]"
        />
        {/* Vignette & Grain */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p6-mini.png')] opacity-10 pointer-events-none" />
      </div>

      {/* Caption Area */}
      <div className="space-y-2 px-1 text-center relative z-10">
        <div className="h-px w-12 bg-[#e6d5bc] mx-auto mb-3" />
        <p className="font-serif text-lg font-bold text-[#5c4a33] leading-tight tracking-tight italic">
          {caption}
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="h-[1px] w-4 bg-[#e6d5bc]" />
          <p className="text-[10px] font-black text-[#8b7355] uppercase tracking-[0.2em]">
            {date}
          </p>
          <div className="h-[1px] w-4 bg-[#e6d5bc]" />
        </div>
      </div>
      
      {/* Texture & Material Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(139,115,85,0.1)]" />
    </div>
  );
}
