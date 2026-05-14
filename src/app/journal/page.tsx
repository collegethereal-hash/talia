'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Card } from "@/components/Card";
import { BookOpen, PenTool, Calendar, Heart, MessageCircle, Send, User, Mail, Eraser, Trash2, Edit3, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSearchParams } from 'next/navigation';

interface Comment {
  id: number;
  author: 'Grinch' | 'Cindy';
  text: string;
  date: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  author: 'Grinch' | 'Cindy';
  mood?: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
}

const INITIAL_NOTES: Note[] = [];

function JournalContent() {
  const [currentUser, setCurrentUser] = useState<'Grinch' | 'Cindy' | null>(null);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [activeTab, setActiveTab] = useState<'all' | 'me' | 'partner'>('all');
  const [openCommentsId, setOpenCommentsId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem('lumina_auth');
    if (auth) {
      setCurrentUser(auth === 'grinch' ? 'Grinch' : 'Cindy');
    }
  }, []);
  
  // New Note State
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("🌿");
  
  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");
  
  const searchParams = useSearchParams();
  
  // Scratch-off state
  const [whisperText, setWhisperText] = useState("");
  const [isWhisperModalOpen, setIsWhisperModalOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const whisperSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openWhisper = searchParams.get('openWhisper');
    if (openWhisper === 'true') {
      const savedWhisper = localStorage.getItem('lastWhisper');
      if (savedWhisper) {
        setWhisperText(savedWhisper);
      } else {
        setWhisperText("Тут будет текст последнего письма... Напиши его в 'Отправить конверт'!");
      }
      setIsWhisperModalOpen(true);
    }
  }, [searchParams]);

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

  const sendWhisper = () => {
    if (!whisperText.trim()) return;
    localStorage.setItem('lastWhisper', whisperText);
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setWhisperText("");
    }, 3000);
  };

  const toggleLike = (id: number) => {
    setNotes(notes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          likes: n.isLiked ? n.likes - 1 : n.likes + 1,
          isLiked: !n.isLiked
        };
      }
      return n;
    }));
  };

  const addComment = (noteId: number) => {
    if (!commentText.trim() || !currentUser) return;
    
    setNotes(notes.map(n => {
      if (n.id === noteId) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const newComment: Comment = {
          id: Date.now(),
          author: currentUser,
          text: commentText,
          date: `${timeStr}`
        };
        return {
          ...n,
          comments: [...n.comments, newComment]
        };
      }
      return n;
    }));
    setCommentText("");
  };

  const addNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim() || !currentUser) return;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const newNote: Note = {
      id: Date.now(),
      title: newNoteTitle,
      content: newNoteContent,
      date: dateStr,
      author: currentUser,
      mood: selectedMood,
      likes: 0,
      isLiked: false,
      comments: []
    };
    
    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
    setSelectedMood(currentUser === 'Grinch' ? '🌿' : '🌸');
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
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

  const updateNote = () => {
    if (!editTitle.trim() || !editContent.trim()) return;
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
      <header className="text-center space-y-4 relative z-10">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#5c4a33] tracking-tight">Летопись Talia</h1>
        <div className="flex items-center justify-center gap-2 text-[#8b7355] italic font-medium">
          <span>Каждая строчка — это шаг навстречу друг другу</span>
        </div>
      </header>

      {/* Editor, Tabs & Timeline */}
      <div className="space-y-12 relative z-10">
        {/* Filter Tabs */}
        <div className="max-w-md mx-auto">
          <div className="flex p-2 bg-[#f5e6d3] rounded-[2rem] border-4 border-[#e6d5bc] shadow-lg">
            {(['all', 'Grinch', 'Cindy'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab 
                    ? "bg-[#5c4a33] text-white shadow-md scale-105" 
                    : "text-[#8b7355] hover:text-[#5c4a33]"
                )}
              >
                {tab === 'all' ? 'Все' : tab === 'Grinch' ? 'Гринч' : 'Синди'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid with Masonry-like columns */}
        <div className="columns-1 md:columns-2 gap-8 space-y-8 relative">
          {/* New Note Editor - always at the top of first column */}
          <div className="break-inside-avoid mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <Card className="p-0 overflow-hidden border-4 border-[#e6d5bc] shadow-2xl bg-[#fdfaf3] rounded-[2.5rem]">
                <div className="p-6 bg-[#f5e6d3] border-b-4 border-[#e6d5bc] flex flex-col items-start justify-between gap-4">
                  <h3 className="font-serif font-bold text-xl text-[#5c4a33] flex items-center gap-2">
                    <PenTool size={20} className="text-[#5c4a33]" />
                    Новое откровение
                  </h3>
                  <div className="flex gap-2">
                    {['🌿', '🌸', '🥧', '🧸', '❤️'].map(m => (
                      <button 
                        key={m} 
                        onClick={() => setSelectedMood(m)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all text-xl border-2 shadow-sm",
                          selectedMood === m ? "bg-[#5c4a33] border-[#5c4a33] text-white scale-110" : "bg-white border-[#e6d5bc] hover:bg-[#fdfaf3]"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <input 
                    type="text" 
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Заголовок..." 
                    className="w-full bg-white border-4 border-[#e6d5bc] rounded-2xl px-6 py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-bold placeholder:text-[#8b7355]/40 text-[#5c4a33]"
                  />
                  <textarea 
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Напиши что-то особенное..."
                    className="w-full h-40 bg-white border-4 border-[#e6d5bc] rounded-[2rem] px-6 py-6 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none text-sm leading-relaxed placeholder:text-[#8b7355]/40 text-[#5c4a33] font-medium"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={addNote}
                      disabled={!newNoteTitle.trim() || !newNoteContent.trim() || !currentUser}
                      className="bg-[#5c4a33] text-white px-10 py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
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
                  onDelete={() => deleteNote(note.id)}
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

          {/* Empty State */}
          {filteredNotes.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-[#fdfaf3] border-4 border-[#e6d5bc] rounded-[2rem] flex items-center justify-center text-[#8b7355] shadow-lg">
                <BookOpen size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-[#5c4a33]">Летопись пока чиста</h3>
                <p className="text-[#8b7355] italic max-w-xs mx-auto">
                  "Поделитесь своими мыслями или чувствами. Каждая запись — это частичка вашей общей истории."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Special Feature: "Отправить конверт" */}
      <motion.div 
        ref={whisperSectionRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="pt-20 text-center"
      >
        <div className="max-w-2xl mx-auto p-12 bg-[#fdfaf3] rounded-[3rem] border-4 border-[#e6d5bc] shadow-2xl space-y-8 relative overflow-hidden group">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-0" />
          
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 bg-[#f5e6d3] border-4 border-[#e6d5bc] rounded-3xl shadow-xl flex items-center justify-center mx-auto text-[#5c4a33] group-hover:scale-110 transition-transform duration-500">
              <Mail size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold text-[#5c4a33] tracking-tight">Отправить конверт</h2>
              <p className="text-[#8b7355] italic leading-relaxed max-w-sm mx-auto text-sm font-medium">
                "Создай мгновение магии. Твое письмо будет скрыто защитным слоем, пока партнер его не сотрет."
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <textarea 
                value={whisperText}
                onChange={(e) => setWhisperText(e.target.value)}
                placeholder="Напиши что-то, что заставит улыбнуться..."
                className="w-full max-w-md bg-white border-4 border-[#e6d5bc] rounded-[2rem] px-8 py-6 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none text-sm placeholder:text-[#8b7355]/40 shadow-inner font-medium h-32 text-[#5c4a33]"
              />
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={sendWhisper}
                  disabled={!whisperText.trim() || isSent}
                  className="px-12 py-5 rounded-[2rem] bg-[#5c4a33] text-white font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 group/btn"
                >
                  <AnimatePresence mode="wait">
                    {isSent ? (
                      <motion.div
                        key="sent"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                      >
                        Отправлено!
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Send size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        Запечатать магию
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
                
                {whisperText.trim() && !isSent && (
                  <button 
                    onClick={() => setIsWhisperModalOpen(true)}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]/40 hover:text-[#5c4a33] transition-colors"
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
        className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full bg-[#5c4a33] text-white shadow-2xl flex items-center justify-center group"
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
              className="relative w-full max-w-lg bg-[#fdfaf3] rounded-[3rem] border-4 border-[#e6d5bc] shadow-2xl overflow-hidden p-8 text-center space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-[#5c4a33]">Тайное послание</h3>
                <p className="text-xs text-[#8b7355] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <Eraser size={14} />
                  Стирай, чтобы прочитать
                </p>
              </div>

              <div className="relative w-full rounded-[2rem] overflow-hidden bg-white border-4 border-[#e6d5bc] shadow-inner group min-h-[300px]">
                {/* Hidden Text Container - Scrollable */}
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8 flex items-center justify-center">
                  <p className="text-xl font-serif italic text-[#5c4a33] leading-relaxed select-none text-center font-medium">
                    {whisperText}
                  </p>
                </div>

                {/* Scratch Canvas - Fixed on top */}
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={400}
                  onMouseMove={handleScratch}
                  onTouchMove={handleScratch}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                   onClick={() => {
                     setIsWhisperModalOpen(false);
                     if (searchParams.get('openWhisper') === 'true') {
                       localStorage.removeItem('lastWhisper');
                       setWhisperText("");
                       window.history.replaceState({}, '', window.location.pathname);
                     } else {
                       setWhisperText("");
                     }
                   }}
                   className="w-full py-4 rounded-2xl bg-[#f5e6d3] text-[#5c4a33] font-black uppercase tracking-widest text-[10px] hover:bg-[#e6d5bc] transition-all"
                 >
                   Закрыть письмо
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
        {/* Date & Author Header */}
        <div className={cn(
          "flex items-center gap-3 mb-3 px-4",
          isMe ? "flex-row" : "flex-row-reverse"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center text-2xl shadow-md border-2 border-[#e6d5bc]",
            note.author === 'Grinch' ? "bg-emerald-50" : "bg-pink-50"
          )}>
            {note.author === 'Grinch' ? '🍏' : '🎀'}
          </div>
          <div className={cn(
            "flex flex-col",
            isMe ? "items-start" : "items-end"
          )}>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5c4a33]">
              {note.author === 'Grinch' ? 'Гринч' : 'Синди Лу'}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-tighter text-[#8b7355] opacity-60">
              {note.date}
            </span>
          </div>
          {isMe && !isEditing && (
            <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit} className="p-2 rounded-xl bg-white border-2 border-[#e6d5bc] text-[#8b7355] hover:text-[#5c4a33] transition-colors">
                <Edit3 size={14} />
              </button>
              <button onClick={onDelete} className="p-2 rounded-xl bg-white border-2 border-red-100 text-red-300 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <Card className={cn(
          "relative transition-all duration-300 hover:shadow-2xl border-4 border-[#e6d5bc] overflow-hidden bg-[#fdfaf3] rounded-[2.5rem]",
        )}>
          {isEditing ? (
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  {['🌿', '🌸', '🥧', '🧸', '❤️'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => editState.setMood(m)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all text-xl border-2 shadow-sm",
                        editState.mood === m ? "bg-[#5c4a33] border-[#5c4a33] text-white scale-110" : "bg-white border-[#e6d5bc] hover:bg-[#fdfaf3]"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={editState.onCancel} className="p-3 rounded-xl bg-white border-2 border-[#e6d5bc] text-[#8b7355] hover:bg-zinc-50 transition-all">
                    <X size={20} />
                  </button>
                  <button onClick={editState.onSave} className="p-3 rounded-xl bg-[#5c4a33] text-white hover:scale-105 active:scale-95 transition-all shadow-lg">
                    <Save size={20} />
                  </button>
                </div>
              </div>
              <input 
                type="text" 
                value={editState.title}
                onChange={(e) => editState.setTitle(e.target.value)}
                className="w-full bg-white border-4 border-[#e6d5bc] rounded-2xl px-6 py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-bold text-[#5c4a33]"
              />
              <textarea 
                value={editState.content}
                onChange={(e) => editState.setContent(e.target.value)}
                className="w-full h-40 bg-white border-4 border-[#e6d5bc] rounded-[2rem] px-6 py-6 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none text-sm leading-relaxed font-medium text-[#5c4a33]"
              />
            </div>
          ) : (
            <>
              {/* Mood Icon */}
              <div className="absolute top-6 right-6 text-3xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                {note.mood}
              </div>

              <div className="p-8 space-y-4">
                <h4 className="text-2xl font-serif font-bold text-[#5c4a33] leading-tight">{note.title}</h4>
                <p className="text-[#8b7355] leading-relaxed whitespace-pre-wrap font-medium text-lg italic">
                  "{note.content}"
                </p>
                <div className="flex items-center gap-8 pt-6 border-t-2 border-[#f5e6d3]">
                  <button 
                    onClick={onToggleLike}
                    className={cn(
                      "flex items-center gap-2 transition-all active:scale-90",
                      note.isLiked ? "text-pink-500" : "text-[#8b7355]/40 hover:text-pink-400"
                    )}
                  >
                    <Heart size={22} fill={note.isLiked ? "currentColor" : "none"} />
                    <span className="text-sm font-black">{note.likes}</span>
                  </button>
                  <button 
                    onClick={onToggleComments}
                    className={cn(
                      "flex items-center gap-2 transition-all text-[#8b7355]/40 hover:text-[#5c4a33]",
                      isCommentsOpen && "text-[#5c4a33]"
                    )}
                  >
                    <MessageCircle size={22} />
                    <span className="text-sm font-black">{note.comments.length}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Comments Section */}
          <AnimatePresence>
            {isCommentsOpen && !isEditing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-[#f5e6d3]/50 rounded-b-[2.5rem] border-t-4 border-[#e6d5bc]"
              >
                <div className="p-8 space-y-8">
                  <div className="space-y-6">
                    {note.comments.map((comment) => {
                      const isCommentMe = comment.author === currentUser;
                      return (
                        <div 
                          key={comment.id}
                          className={cn(
                            "flex gap-4 items-end",
                            isCommentMe ? "flex-row" : "flex-row-reverse"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl shadow-md border-2 border-[#e6d5bc]",
                            comment.author === 'Grinch' ? "bg-emerald-50" : "bg-pink-50"
                          )}>
                            {comment.author === 'Grinch' ? '🍏' : '🎀'}
                          </div>
                          <div className={cn(
                            "max-w-[85%] p-5 rounded-[2rem] shadow-xl border-4 border-[#e6d5bc] relative group",
                            isCommentMe 
                              ? "bg-white text-[#5c4a33] rounded-bl-none" 
                              : "bg-white text-[#5c4a33] rounded-br-none"
                          )}>
                            <div className="flex justify-between items-center gap-8 mb-2">
                              <span className="font-serif font-bold text-sm tracking-wide text-[#5c4a33]">
                                {comment.author === 'Grinch' ? 'Гринч' : 'Синди Лу'}
                              </span>
                              <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">{comment.date}</span>
                            </div>
                            <p className="text-sm leading-relaxed font-bold italic text-[#8b7355]">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="relative flex gap-4 items-center bg-white p-3 rounded-[1.5rem] border-4 border-[#e6d5bc] shadow-lg">
                    <div className="w-10 h-10 rounded-xl bg-[#f5e6d3] flex items-center justify-center text-[#5c4a33]">
                      {currentUser === 'Grinch' ? '🍏' : '🎀'}
                    </div>
                    <input 
                      value={commentText}
                      onChange={(e) => onCommentChange(e.target.value)}
                      placeholder="Оставь теплое слово..."
                      className="flex-1 bg-transparent border-none py-2 text-sm focus:ring-0 outline-none transition-all placeholder:text-[#8b7355]/30 font-bold text-[#5c4a33]"
                      onKeyDown={(e) => e.key === 'Enter' && onAddComment()}
                    />
                    <button 
                      onClick={onAddComment}
                      className="p-4 rounded-xl bg-[#5c4a33] text-white hover:scale-105 active:scale-95 transition-all shadow-xl group"
                    >
                      <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
