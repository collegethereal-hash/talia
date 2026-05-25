'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Card } from "@/components/Card";
import { BookOpen, PenTool, Calendar, Heart, MessageCircle, Send, User, Mail, Eraser, Trash2, Edit3, Save, X, Sparkles, Trees, Moon, Flower } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';

interface Comment {
  id: number;
  author: 'Grinch' | 'Cindy';
  text: string;
  date: string;
}

interface Note {
  id: string; 
  title: string;
  content: string;
  date: string;
  author: 'Grinch' | 'Cindy';
  mood?: string;
  likes: number;
  isLiked: boolean;
  liked_by?: string[];
  comments: Comment[];
}

const INITIAL_NOTES: Note[] = [];

function JournalContent() {
  const { currentUser, notes, setNotes, refreshNotes, refreshWhispers } = useData();
  const [activeTab, setActiveTab] = useState<'all' | 'Grinch' | 'Cindy'>('all');
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  
  // New Note State
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("🌿");
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");
  
  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  
  // Scratch-off state
  const [whisperText, setWhisperText] = useState("");
  const [receivedWhisper, setReceivedWhisper] = useState("");
  const [isWhisperPreview, setIsWhisperPreview] = useState(false);
  const [isWhisperModalOpen, setIsWhisperModalOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (isWhisperModalOpen) {
      document.body.classList.add('lock-scroll');
    } else {
      document.body.classList.remove('lock-scroll');
    }
    return () => document.body.classList.remove('lock-scroll');
  }, [isWhisperModalOpen]);
  const whisperSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openWhisper = searchParams.get('openWhisper');
    if (openWhisper === 'true' && currentUser) {
      setIsWhisperPreview(false);
      fetchIncomingWhisper();
    }
  }, [searchParams, currentUser]);

  const fetchIncomingWhisper = async () => {
    if (!currentUser) return;
    const key = currentUser === 'Grinch' ? 'whisper_for_grinch' : 'whisper_for_cindy';
    console.log('DEBUG Whisper: Fetching for', currentUser, 'using key', key);
    
    const { data, error } = await supabase
      .from('global_state')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.log('DEBUG Whisper: Fetch error or empty', error);
    } else if (data && data.value) {
      console.log('DEBUG Whisper: Received data', data.value);
      const content = typeof data.value === 'object' ? (data.value as any).text : data.value;
      if (content) {
        setReceivedWhisper(content);
        setIsWhisperModalOpen(true);
      }
    }
  };

  useEffect(() => {
    if (isWhisperModalOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas first
        ctx.globalCompositeOperation = 'source-over';
        // Fill with scratch-off layer
        ctx.fillStyle = '#e6d5bc'; // Palia beige/brown
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some texture/pattern
        ctx.strokeStyle = '#d4c2a8';
        ctx.lineWidth = 2;
        for (let i = 0; i < 60; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.stroke();
        }
      }
    }
  }, [isWhisperModalOpen]);

  const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = ('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = ('touches' in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2); // Slightly larger brush
    ctx.fill();
  };

  const autoErase = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    
    let radius = 0;
    const maxRadius = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    
    const animate = () => {
      if (radius < maxRadius) {
        ctx.beginPath();
        // Create multiple random points for a more organic "magic" feel
        for (let i = 0; i < 20; i++) {
          const rx = Math.random() * canvas.width;
          const ry = Math.random() * canvas.height;
          ctx.arc(rx, ry, radius / 5, 0, Math.PI * 2);
        }
        ctx.fill();
        radius += 40;
        requestAnimationFrame(animate);
      } else {
        // Final clear
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    animate();
  };

  const sendWhisper = async () => {
    if (!whisperText.trim() || !currentUser) return;
    
    // Target is the partner
    const targetKey = currentUser === 'Grinch' ? 'whisper_for_cindy' : 'whisper_for_grinch';
    const targetName = currentUser === 'Grinch' ? 'Cindy' : 'Grinch';
    console.log('DEBUG Whisper: Sending from', currentUser, 'to', targetKey);
    
    // 1. Send active whisper (for scratch-off)
    const { error: activeError } = await supabase
      .from('global_state')
      .upsert({
        key: targetKey,
        value: { text: whisperText }
      });

    if (activeError) {
      console.error('DEBUG Whisper: Send error', activeError);
      alert('Ошибка при отправке письма.');
    } else {
      console.log('DEBUG Whisper: Send SUCCESS');
      // We no longer save to history here. It will be saved when read.
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setWhisperText("");
      }, 3000);
    }
  };

  const toggleLike = async (id: string) => {
    if (!currentUser) return;
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const likedBy = note.liked_by || [];
    const isLiked = likedBy.includes(currentUser);
    
    let newLikedBy;
    if (isLiked) {
      newLikedBy = likedBy.filter((u: string) => u !== currentUser);
    } else {
      newLikedBy = [...likedBy, currentUser];
    }

    const newLikes = newLikedBy.length;
    const newIsLiked = !isLiked;

    // Optimistic update
    setNotes(notes.map(n => n.id === id ? { 
      ...n, 
      liked_by: newLikedBy, 
      isLiked: newIsLiked, 
      likes: newLikes 
    } : n));

    const { error } = await supabase
      .from('journal_notes')
      .update({ liked_by: newLikedBy, likes: newLikes })
      .eq('id', id);

    if (error) {
      console.error('Error toggling like:', error);
      refreshNotes();
    }
  };

  const addComment = async (noteId: string) => {
    if (!commentText.trim() || !currentUser) return;
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const newComment: Comment = {
      id: Date.now(),
      author: currentUser,
      text: commentText,
      date: `${timeStr}`
    };

    const newComments = [...note.comments, newComment];

    // Optimistic update
    setNotes(notes.map(n => n.id === noteId ? { ...n, comments: newComments } : n));

    const { error } = await supabase
      .from('journal_notes')
      .update({ comments: newComments })
      .eq('id', noteId);

    if (error) {
      console.error('Error adding comment:', error);
      // Revert on error
      refreshNotes();
    }
    setCommentText("");
  };

  const addNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim() || !currentUser) return;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const newNote = {
      title: newNoteTitle,
      content: newNoteContent,
      date: dateStr,
      author: currentUser,
      mood: selectedMood,
      likes: 0,
      liked_by: [],
      comments: []
    };
    
    const { data, error } = await supabase
      .from('journal_notes')
      .insert([newNote])
      .select()
      .single();

    if (error) {
      console.error('Error adding note:', error);
    } else if (data) {
      const mappedNote = {
        ...data,
        isLiked: (data.liked_by || []).includes(currentUser)
      };
      setNotes([mappedNote, ...notes]);
      setNewNoteTitle("");
      setNewNoteContent("");
      setSelectedMood(currentUser === 'Grinch' ? '🌿' : '🌸');
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('journal_notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
    } else {
      setNotes(notes.filter(n => n.id !== id));
      setDeleteConfirmId(null);
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditMood(note.mood || (note.author === 'Grinch' ? "🌿" : "🌸"));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditMood("");
  };

  const updateNote = async () => {
    if (!editTitle.trim() || !editContent.trim() || !editingId) return;
    
    const { error } = await supabase
      .from('journal_notes')
      .update({
        title: editTitle,
        content: editContent,
        mood: editMood
      })
      .eq('id', editingId);

    if (error) {
      console.error('Error updating note:', error);
    } else {
      setNotes(notes.map(n => {
        if (n.id === editingId) {
          return {
            ...n,
            title: editTitle,
            content: editContent,
            mood: editMood
          };
        }
        return n;
      }));
      cancelEditing();
    }
  };

  const scrollToWhisper = () => {
    whisperSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredNotes = notes.filter(n => {
    if (activeTab === 'Grinch') return n.author === 'Grinch';
    if (activeTab === 'Cindy') return n.author === 'Cindy';
    return true;
  });

  const leftNotes = filteredNotes.filter((_, idx) => idx % 2 === 0);
  const rightNotes = filteredNotes.filter((_, idx) => idx % 2 !== 0);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-12 pb-32 space-y-12 relative">
      {/* Paper texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-0" />

      {/* Magic Header */}
      <header className="text-center space-y-6 relative z-10">
        <div className="flex items-center justify-center gap-6 mb-2">
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#e6d5bc]" />
          <div className="text-[#e6d5bc]">
            <Sparkles size={24} />
          </div>
          <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#e6d5bc]" />
        </div>
        <h1 className="text-5xl md:text-8xl font-serif font-black text-[#5c4a33] tracking-tight drop-shadow-sm">Походный Дневник</h1>
        <div className="flex items-center justify-center gap-4 text-[#8b7355] italic font-serif text-xl font-medium">
          <Flower size={18} />
          <span>Каждая страница — это шаг нашей общей истории</span>
          <Flower size={18} />
        </div>
      </header>

      {/* Editor, Tabs & Timeline */}
      <div className="space-y-16 relative z-10">
        {/* Filter Tabs - Wooden Panel Style */}
        <div className="max-w-md mx-auto">
          <div className="flex p-3 bg-[#e6d5bc] rounded-[2.5rem] border-4 border-[#c4a484] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none" />
            {(['all', 'Grinch', 'Cindy'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "flex-1 py-4 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all relative z-10",
                  activeTab === tab 
                    ? "bg-[#5c4a33] text-white shadow-xl scale-105" 
                    : "text-[#5c4a33]/60 hover:text-[#5c4a33] hover:bg-white/20"
                )}
              >
                {tab === 'all' ? 'Все Свитки' : tab === 'Grinch' ? 'Гринч' : 'Синди Лу'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="columns-1 md:columns-2 gap-10 space-y-10 relative">
          {/* New Note Editor - Writing Desk Style */}
          <div className="break-inside-avoid mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <Card className="p-0 overflow-hidden border-4 border-[#e6d5bc] shadow-2xl bg-[#fdfaf3] rounded-[3rem] relative">
                {/* Desk Texture */}
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
                
                <div className="p-8 bg-[#f5e6d3] border-b-4 border-[#e6d5bc] flex flex-col items-start justify-between gap-6 relative z-10">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-serif font-black text-2xl text-[#5c4a33] flex items-center gap-3">
                      <PenTool size={24} className="text-[#5c4a33]" />
                      Новая Запись
                    </h3>
                    <div className="text-[#8b7355]/40">
                      <Sparkles size={20} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {['🌿', '🌸', '🥧', '🧸', '❤️'].map(m => (
                      <button 
                        key={m} 
                        onClick={() => setSelectedMood(m)}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all text-2xl border-4 shadow-md",
                          selectedMood === m 
                            ? "bg-[#5c4a33] border-[#5c4a33] text-white scale-110 -rotate-3" 
                            : "bg-white border-[#e6d5bc] hover:bg-[#fdfaf3] hover:-translate-y-1"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-10 space-y-8 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355] ml-4">Заголовок Свитка</label>
                    <input 
                      type="text" 
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="О чем ты думаешь?.." 
                      className="w-full bg-white border-4 border-[#e6d5bc] rounded-2xl px-8 py-5 focus:ring-0 focus:border-[#5c4a33] transition-all font-serif font-black text-xl placeholder:text-[#8b7355]/30 text-[#5c4a33] shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355] ml-4">Ваши Мысли</label>
                    <textarea 
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Напиши что-то особенное для истории..."
                      className="w-full h-48 bg-white border-4 border-[#e6d5bc] rounded-[2.5rem] px-8 py-8 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none text-lg leading-relaxed placeholder:text-[#8b7355]/30 text-[#5c4a33] font-serif italic shadow-inner"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={addNote}
                      disabled={!newNoteTitle.trim() || !newNoteContent.trim() || !currentUser}
                      className="bg-[#5c4a33] text-white px-12 py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 border-2 border-[#e6d5bc]"
                    >
                      <PenTool size={16} />
                      Запечатлеть
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Notes */}
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <div key={note.id} className="break-inside-avoid mb-8">
                <JournalNoteCard 
                  note={note}
                  currentUser={currentUser}
                  isEditing={editingId === note.id}
                  onEdit={() => startEditing(note)}
                  onDelete={() => setDeleteConfirmId(note.id)}
                  onToggleLike={() => toggleLike(note.id)}
                  onToggleComments={() => setOpenCommentsId(openCommentsId === note.id ? null : note.id)}
                  isCommentsOpen={openCommentsId === note.id}
                  commentText={commentText}
                  onCommentChange={setCommentText}
                  onAddComment={() => addComment(note.id)}
                  editState={{
                    title: editTitle,
                    setTitle: setEditTitle,
                    content: editContent,
                    setContent: setEditContent,
                    mood: editMood,
                    setMood: setEditMood,
                    onSave: updateNote,
                    onCancel: cancelEditing
                  }}
                />
              </div>
            ))}
          </AnimatePresence>


        </div>
      </div>

      {/* Special Feature: "Тайный Конверт" */}
      <motion.div 
        ref={whisperSectionRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="pt-24 text-center"
      >
        <div className="max-w-3xl mx-auto p-16 bg-[#fdfaf3] rounded-[4rem] border-8 border-[#e6d5bc] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] space-y-10 relative overflow-hidden group">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-0" />
          
          <div className="relative z-10 space-y-8">
            <div className="w-24 h-24 bg-[#5c4a33] border-4 border-amber-100 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] flex items-center justify-center mx-auto text-amber-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 relative">
              <Mail size={48} />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-sm" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl font-serif font-black text-[#5c4a33] tracking-tight">Тайный Конверт</h2>
              <p className="text-[#8b7355] italic leading-relaxed max-w-md mx-auto text-lg font-serif">
                "Создай мгновение магии. Твое письмо будет скрыто защитным слоем, пока партнер его не сотрет."
              </p>
            </div>

            <div className="flex flex-col items-center gap-8">
              <div className="w-full max-w-lg relative">
                <textarea 
                  value={whisperText}
                  onChange={(e) => setWhisperText(e.target.value)}
                  placeholder="Напиши что-то сокровенное..."
                  className="w-full bg-white border-4 border-[#e6d5bc] rounded-[2.5rem] px-10 py-8 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none text-xl placeholder:text-[#8b7355]/20 shadow-inner font-serif italic h-40 text-[#5c4a33]"
                />
                <div className="absolute -bottom-4 -right-4 text-[#e6d5bc]">
                  <Sparkles size={40} />
                </div>
              </div>
              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={sendWhisper}
                  disabled={!whisperText.trim() || isSent}
                  className="px-16 py-6 rounded-[2.5rem] bg-[#5c4a33] text-white font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-4 group/btn border-2 border-[#e6d5bc]"
                >
                  <AnimatePresence mode="wait">
                    {isSent ? (
                      <motion.div
                        key="sent"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                      >
                        Запечатано!
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <Send size={20} className="group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-transform" />
                        Отправить письмо
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
                
                {whisperText.trim() && !isSent && (
                  <button 
                    onClick={() => {
                      setIsWhisperPreview(true);
                      setIsWhisperModalOpen(true);
                    }}
                    className="text-xs font-black uppercase tracking-[0.2em] text-[#8b7355]/40 hover:text-[#5c4a33] transition-colors border-b-2 border-transparent hover:border-[#5c4a33]"
                  >
                    Посмотреть предпросмотр
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Action Button for quick scroll to Whisper */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToWhisper}
        className="fixed bottom-36 right-6 z-[100] md:bottom-44 md:right-12 w-16 h-16 rounded-full bg-[#5c4a33] text-white shadow-2xl flex items-center justify-center group"
      >
        <Mail size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute right-full mr-4 px-4 py-2 bg-[#5c4a33] text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Написать письмо
        </span>
      </motion.button>

      {/* Scratch-off Modal */}
      <AnimatePresence>
        {isWhisperModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWhisperModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#fdfaf3] rounded-[3rem] border-4 border-[#e6d5bc] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10 space-y-6 max-h-[85vh] flex flex-col">
                <div className="space-y-2 flex justify-between items-start border-b-2 border-[#e6d5bc] pb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-[#5c4a33]">Тайное послание</h3>
                    <p className="text-[10px] text-[#8b7355] font-black uppercase tracking-widest flex items-center gap-2">
                      <Eraser size={14} />
                      Стирай, чтобы прочитать
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsWhisperModalOpen(false)}
                    className="p-2 hover:bg-[#f5e6d3] rounded-full transition-all text-[#8b7355]"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="relative flex-1 overflow-y-auto custom-scrollbar rounded-[2rem] bg-white border-4 border-[#e6d5bc] shadow-inner min-h-[400px]">
                  <div className="relative p-10 min-h-full">
                    {/* The Text */}
                    <p className="text-xl md:text-2xl font-serif italic text-[#5c4a33] leading-relaxed whitespace-pre-wrap text-left align-top font-medium pt-2">
                      {isWhisperPreview ? whisperText : receivedWhisper}
                    </p>
                    
                    {/* Scratch Canvas */}
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={1200}
                      className="absolute inset-0 w-full h-full cursor-crosshair z-30 touch-none"
                      onMouseMove={handleScratch}
                      onTouchMove={handleScratch}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={autoErase}
                    className="w-full py-4 rounded-2xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-[10px] hover:bg-[#4a3b29] transition-all flex items-center justify-center gap-2 shadow-lg group"
                  >
                    <Sparkles size={14} className="group-hover:animate-spin" />
                    Магическое проявление
                  </button>
                  
                  <button 
                    onClick={async () => {
                      setIsWhisperModalOpen(false);
                      if (!isWhisperPreview && currentUser && receivedWhisper) {
                        const key = currentUser === 'Grinch' ? 'whisper_for_grinch' : 'whisper_for_cindy';
                        
                        // Save to history only now, when it's being closed/read
                        await supabase
                          .from('whisper_history')
                          .insert({
                            sender: currentUser === 'Grinch' ? 'Cindy' : 'Grinch',
                            receiver: currentUser,
                            content: receivedWhisper,
                            created_at: new Date().toISOString()
                          });

                        await supabase
                          .from('global_state')
                          .delete()
                          .eq('key', key);
                        
                        setReceivedWhisper("");
                        refreshWhispers();
                        window.history.replaceState({}, '', window.location.pathname);
                      } else {
                        setIsWhisperPreview(false);
                      }
                    }}
                    className="w-full py-4 rounded-2xl bg-[#f5e6d3] text-[#5c4a33] font-black uppercase tracking-widest text-[10px] hover:bg-[#e6d5bc] transition-all"
                  >
                    Закрыть и сохранить в историю
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal - Palia Style */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#fdfaf3] rounded-[3rem] border-4 border-[#e6d5bc] shadow-2xl overflow-hidden p-8 md:p-10 text-center space-y-8"
            >
              <div className="mx-auto w-20 h-20 bg-[#f5e6d3] rounded-[2rem] flex items-center justify-center text-[#5c4a33] shadow-inner border-2 border-[#e6d5bc] rotate-12 group-hover:rotate-0 transition-transform">
                <Trash2 size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-serif font-black text-[#5c4a33]">Вы уверены?</h3>
                <p className="text-[#8b7355] italic text-lg leading-relaxed font-serif">
                  Эта страница навсегда исчезнет из нашего дневника воспоминаний.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => deleteNote(deleteConfirmId)}
                  className="w-full py-4 rounded-2xl bg-red-400 text-white font-black uppercase tracking-widest text-xs shadow-lg hover:bg-red-500 hover:scale-105 active:scale-95 transition-all border-2 border-red-500"
                >
                  Да, сжечь страницу
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-full py-4 rounded-2xl bg-[#f5e6d3] text-[#5c4a33] font-black uppercase tracking-widest text-xs hover:bg-[#e6d5bc] transition-all border-2 border-[#e6d5bc]"
                >
                  Оставить воспоминание
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function JournalNoteCard({ 
  note, 
  currentUser,
  isEditing, 
  onEdit, 
  onDelete, 
  onToggleLike, 
  onToggleComments, 
  isCommentsOpen, 
  commentText, 
  onCommentChange, 
  onAddComment,
  editState
}: { 
  note: Note; 
  currentUser: 'Grinch' | 'Cindy' | null;
  isEditing: boolean; 
  onEdit: () => void; 
  onDelete: () => void; 
  onToggleLike: () => void; 
  onToggleComments: () => void; 
  isCommentsOpen: boolean; 
  commentText: string; 
  onCommentChange: (val: string) => void; 
  onAddComment: () => void;
  editState: {
    title: string;
    setTitle: (val: string) => void;
    content: string;
    setContent: (val: string) => void;
    mood: string;
    setMood: (val: string) => void;
    onSave: () => void;
    onCancel: () => void;
  };
}) {
  const isMe = note.author === currentUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full"
    >
      <div className="group relative">
        {/* Date & Author Header - Wax Seal Style */}
        <div className={cn(
          "flex items-center gap-4 mb-4 px-6",
          isMe ? "flex-row" : "flex-row-reverse"
        )}>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-4 border-[#e6d5bc] relative z-20 transition-transform group-hover:rotate-12",
            note.author === 'Grinch' ? "bg-[#5c4a33] text-amber-200" : "bg-[#5c4a33] text-blue-100"
          )}>
            {note.author === 'Grinch' ? <Trees size={24} /> : <Moon size={24} />}
            {/* Wax drips */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-inherit rounded-full" />
            <div className="absolute -bottom-2 right-2 w-2 h-2 bg-inherit rounded-full" />
          </div>
          <div className={cn(
            "flex flex-col",
            isMe ? "items-start" : "items-end"
          )}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5c4a33]">
              {note.author === 'Grinch' ? 'Гринч' : 'Синди Лу'}
            </span>
            <div className="flex items-center gap-2 text-[9px] font-black text-[#8b7355]/60 uppercase tracking-widest">
              <Calendar size={10} />
              {note.date}
            </div>
          </div>
          {isMe && !isEditing && (
            <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit} className="p-2.5 rounded-xl bg-white border-2 border-[#e6d5bc] text-[#8b7355] hover:text-[#5c4a33] transition-all shadow-sm">
                <Edit3 size={14} />
              </button>
              <button onClick={onDelete} className="p-2.5 rounded-xl bg-white border-2 border-red-100 text-red-300 hover:text-red-500 transition-all shadow-sm">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <Card className={cn(
          "relative transition-all duration-300 hover:shadow-2xl border-4 border-[#e6d5bc] overflow-hidden bg-[#fdfaf3] rounded-[2.5rem] shadow-lg",
        )}>
          {/* Decorative Leaf Sketch */}
          <div className="absolute -bottom-4 -right-4 opacity-[0.05] pointer-events-none rotate-12">
            <Trees size={160} />
          </div>

          {isEditing ? (
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  {['🌿', '🌸', '🥧', '🧸', '❤️'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => editState.setMood(m)}
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all text-xl border-2 shadow-sm",
                        editState.mood === m ? "bg-[#5c4a33] border-[#5c4a33] text-white scale-110" : "bg-white border-[#e6d5bc] hover:bg-[#fdfaf3]"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={editState.onCancel} className="p-4 rounded-2xl bg-white border-2 border-[#e6d5bc] text-[#8b7355] hover:bg-[#f5e6d3] transition-all">
                    <X size={20} />
                  </button>
                  <button onClick={editState.onSave} className="p-4 rounded-2xl bg-[#5c4a33] text-white hover:scale-105 active:scale-95 transition-all shadow-xl border-2 border-[#e6d5bc]">
                    <Save size={20} />
                  </button>
                </div>
              </div>
              <input 
                type="text" 
                value={editState.title}
                onChange={(e) => editState.setTitle(e.target.value)}
                className="w-full bg-white border-4 border-[#e6d5bc] rounded-2xl px-8 py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-serif font-black text-2xl text-[#5c4a33]"
              />
              <textarea 
                value={editState.content}
                onChange={(e) => editState.setContent(e.target.value)}
                className="w-full h-56 bg-white border-4 border-[#e6d5bc] rounded-[2.5rem] px-8 py-8 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none text-xl leading-relaxed font-serif italic text-[#5c4a33]"
              />
            </div>
          ) : (
            <>
              {/* Mood Badge - Notebook Sticker Style */}
              <div className="absolute top-8 right-8 w-14 h-14 bg-white rounded-2xl border-4 border-[#e6d5bc] flex items-center justify-center text-3xl shadow-xl rotate-6 group-hover:rotate-12 transition-all duration-500 z-10">
                {note.mood}
              </div>

              <div className="p-10 space-y-6">
                <h4 className="text-3xl font-serif font-black text-[#5c4a33] leading-tight pr-16">{note.title}</h4>
                <p className="text-[#8b7355] leading-relaxed whitespace-pre-wrap font-serif font-medium text-xl italic border-l-4 border-[#e6d5bc]/30 pl-8">
                  "{note.content}"
                </p>
                
                <div className="flex items-center justify-between pt-10 border-t-4 border-[#f5e6d3] mt-10">
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={onToggleLike}
                      className={cn(
                        "flex items-center gap-3 transition-all active:scale-90 group/heart",
                        note.isLiked ? "text-red-500" : "text-[#8b7355]/30 hover:text-red-400"
                      )}
                    >
                      <Heart size={28} fill={note.isLiked ? "currentColor" : "none"} className={cn(note.isLiked && "animate-pulse")} />
                      <span className="text-sm font-black tracking-[0.2em]">{note.likes}</span>
                    </button>
                    <button 
                      onClick={onToggleComments}
                      className={cn(
                        "flex items-center gap-3 transition-all group/comment",
                        isCommentsOpen ? "text-[#5c4a33]" : "text-[#8b7355]/30 hover:text-[#5c4a33]"
                      )}
                    >
                      <MessageCircle size={28} />
                      <span className="text-sm font-black tracking-[0.2em]">{note.comments.length}</span>
                    </button>
                  </div>
                  
                  {/* Small Botanical Accent */}
                  <div className="text-[#e6d5bc] opacity-50">
                    <Sparkles size={24} />
                  </div>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {isCommentsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pt-10 space-y-8"
                    >
                      <div className="space-y-6">
                        {note.comments.map((comment) => (
                          <div 
                            key={comment.id} 
                            className={cn(
                              "flex gap-4",
                              comment.author === currentUser ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-xl border-4 border-[#e6d5bc] shrink-0 transition-transform hover:scale-110",
                              comment.author === 'Grinch' ? "bg-[#5c4a33] text-amber-100" : "bg-[#5c4a33] text-blue-50"
                            )}>
                              {comment.author === 'Grinch' ? <Trees size={18} /> : <Moon size={18} />}
                            </div>
                            <div className={cn(
                              "p-5 rounded-[2rem] text-lg font-serif italic max-w-[85%] shadow-xl border-2 border-[#e6d5bc]",
                              comment.author === currentUser ? "bg-[#5c4a33] text-[#fdfaf3]" : "bg-white text-[#8b7355]"
                            )}>
                              {comment.text}
                              <div className="text-[9px] opacity-40 mt-2 uppercase font-black tracking-[0.2em]">{comment.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {currentUser && (
                        <div className="relative flex gap-4 items-center bg-white p-4 rounded-[2rem] border-4 border-[#e6d5bc] shadow-inner mt-6">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            currentUser === 'Grinch' ? "bg-emerald-50 text-emerald-600" : "bg-pink-50 text-pink-600"
                          )}>
                            {currentUser === 'Grinch' ? <Trees size={20} /> : <Moon size={20} />}
                          </div>
                          <input 
                            value={commentText}
                            onChange={(e) => onCommentChange(e.target.value)}
                            placeholder="Оставь весточку..."
                            className="flex-1 bg-transparent border-none py-2 text-base focus:ring-0 outline-none transition-all placeholder:text-[#8b7355]/30 font-serif italic text-[#5c4a33]"
                            onKeyDown={(e) => e.key === 'Enter' && onAddComment()}
                          />
                          <button 
                            onClick={onAddComment}
                            disabled={!commentText.trim()}
                            className="p-4 rounded-2xl bg-[#5c4a33] text-[#fdfaf3] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl border-2 border-[#e6d5bc] group"
                          >
                            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </Card>
      </div>
    </motion.div>
  );
}

export default function JournalPage() {
  return (
    <Suspense fallback={null}>
      <JournalContent />
    </Suspense>
  );
}
