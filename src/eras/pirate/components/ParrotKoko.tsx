'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bird, Sparkles } from 'lucide-react';
import { chatWithKoko } from '@/app/actions/koko';
import { cn } from '@/lib/utils';

export function ParrotKoko() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'koko'; text: string }[]>([
    { role: 'koko', text: 'Каррр! Я Коко, твой личный пиратский психолог. Какая буря настигла твое сердце сегодня? 🦜' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMsg = message;
    setMessage('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const response = await chatWithKoko(userMsg);
    
    setChat(prev => [...prev, { role: 'koko', text: response }]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Parrot Bubble */}
      <motion.div 
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="relative cursor-pointer group"
      >
        <div className="w-24 h-24 rounded-[2rem] pirate-wood flex items-center justify-center border-4 border-amber-500/40 shadow-2xl overflow-hidden">
          <div className="text-6xl filter drop-shadow-2xl group-hover:rotate-6 transition-transform">🦜</div>
          <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        {/* Sparkle badge */}
        <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-xl shadow-lg border-2 border-amber-200">
           <Sparkles size={14} />
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#020617] border-4 border-amber-500/30 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden h-[600px]"
            >
              {/* Header */}
              <div className="p-6 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-3xl">🦜</div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-100 leading-none">Коко</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">Мудрый психолог</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-amber-500/40 hover:text-amber-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Chat area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {chat.map((msg, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i}
                    className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-amber-500 text-slate-950 ml-auto rounded-tr-none" 
                        : "bg-slate-900 text-amber-100 rounded-tl-none border border-amber-500/10"
                    )}
                  >
                    {msg.text}
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="bg-slate-900 text-amber-100 p-4 rounded-2xl rounded-tl-none border border-amber-500/10 w-16 flex gap-1 justify-center">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="p-6 bg-slate-900/50 border-t border-amber-500/20">
                <div className="relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Напиши Коко..."
                    className="w-full bg-slate-950 border-2 border-amber-500/20 rounded-2xl px-6 py-4 text-amber-100 placeholder:text-amber-500/30 focus:border-amber-500/50 outline-none transition-all pr-16"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-2 top-2 bottom-2 w-12 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
