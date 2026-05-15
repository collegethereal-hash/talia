'use client';

import { useState, useEffect } from 'react';
import { PolaroidCard } from "@/components/PolaroidCard";
import { Plus, Search, Filter, Sparkles, Heart, Calendar, Image as ImageIcon, X, Camera, Tag, Link as LinkIcon, Upload, Trash2, Settings2, Download, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';

interface Moment {
  id: string;
  src: string;
  caption: string;
  date: string;
  rotate: number;
  category: string;
}

const INITIAL_MOMENTS: Moment[] = [];

const INITIAL_CATEGORIES = ['Все', 'Свидания', 'Прогулки', 'Дом', 'Путешествия'];

export default function GalleryPage() {
  const { currentUser, moments, setMoments, refreshMoments, galleryCategories, setGalleryCategories } = useData();
  const [filter, setFilter] = useState('Все');
  const [search, setSearch] = useState('');
  const [randomMoment, setRandomMoment] = useState<Moment | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Moment | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Moment | null>(null);

  // Add Moment State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMoment, setNewMoment] = useState({
    src: '',
    caption: '',
    category: 'Свидания'
  });

  // Category Management State
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const saveCategories = async (newCats: string[]) => {
    setGalleryCategories(newCats); // Optimistic update
    await supabase
      .from('global_state')
      .upsert({
        key: 'gallery_categories',
        value: newCats
      });
  };

  // Body scroll lock
  useEffect(() => {
    const isAnyModalOpen = isAddModalOpen || selectedPhoto || randomMoment || isManagingCategories || photoToDelete || categoryToDelete;
    if (isAnyModalOpen) {
      document.body.classList.add('lock-scroll');
    } else {
      document.body.classList.remove('lock-scroll');
    }
    return () => document.body.classList.remove('lock-scroll');
  }, [isAddModalOpen, selectedPhoto, randomMoment, isManagingCategories, photoToDelete, categoryToDelete]);

  const filteredMoments = moments.filter(m => 
    (filter === 'Все' || m.category === filter) &&
    (m.caption.toLowerCase().includes(search.toLowerCase()))
  );

  const getNewThisWeekCount = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return moments.filter(m => new Date(m.date) >= sevenDaysAgo).length;
  };

  const showRandomMemory = () => {
    const random = moments[Math.floor(Math.random() * moments.length)];
    setRandomMoment(random);
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to Blob (JPEG 0.7 quality)
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas to Blob failed'));
          }, 'image/jpeg', 0.7);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMoment({ ...newMoment, src: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addMoment = async () => {
    if (!newMoment.src || !newMoment.caption) return;
    setIsUploading(true);
    
    try {
      let finalImageUrl = newMoment.src;

      // If it's a base64 from file upload, we should compress and upload it to Supabase Storage
      if (newMoment.src.startsWith('data:')) {
        // Convert base64 to File object first
        const originalBlob = await fetch(newMoment.src).then(res => res.blob());
        const originalFile = new File([originalBlob], "upload.jpg", { type: "image/jpeg" });
        
        // Compress the image!
        const compressedBlob = await compressImage(originalFile);
        
        const fileName = `${Math.random()}.jpeg`;
        const filePath = `moments/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('gallery')
          .upload(filePath, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);
        
        finalImageUrl = publicUrl;
      }

      const moment = {
        title: newMoment.caption.slice(0, 50),
        image_url: finalImageUrl,
        caption: newMoment.caption,
        category: newMoment.category,
        date: new Date().toISOString().split('T')[0],
        rotate: Math.floor(Math.random() * 10) - 5,
        author: currentUser
      };
      
      const { data, error } = await supabase
        .from('gallery_moments')
        .insert([moment])
        .select()
        .single();

      if (error) throw error;

      setMoments([{ ...data, src: data.image_url }, ...moments]);
      setNewMoment({ src: '', caption: '', category: galleryCategories[1] || 'Все' });
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Full Error Object:', err);
      const errorMessage = err.message || JSON.stringify(err);
      console.error('Error detail:', errorMessage);
      alert(`Ошибка при загрузке фото: ${errorMessage}. Проверьте права доступа (INSERT) для бакета "gallery" в Storage Policies.`);
    } finally {
      setIsUploading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim() || galleryCategories.includes(newCategoryName.trim())) return;
    const updated = [...galleryCategories, newCategoryName.trim()];
    await saveCategories(updated);
    setNewCategoryName('');
  };

  const deleteCategory = async (catToDelete: string) => {
    if (catToDelete === 'Все') return;
    const updated = galleryCategories.filter(c => c !== catToDelete);
    await saveCategories(updated);
    if (filter === catToDelete) setFilter('Все');
    setCategoryToDelete(null);
  };

  const confirmDeletePhoto = async (moment: Moment) => {
    try {
      // 1. Delete from Database
      const { error: dbError } = await supabase
        .from('gallery_moments')
        .delete()
        .eq('id', moment.id);

      if (dbError) throw dbError;

      // 2. Delete from Storage if it's a Supabase URL
      if (moment.src.includes('.supabase.co/storage/v1/object/public/gallery/')) {
        const filePath = moment.src.split('/gallery/')[1];
        await supabase.storage
          .from('gallery')
          .remove([filePath]);
      }

      setMoments(moments.filter(m => m.id !== moment.id));
      setPhotoToDelete(null);
      if (selectedPhoto?.id === moment.id) setSelectedPhoto(null);
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Ошибка при удалении фотографии.');
    }
  };

  const downloadPhoto = (src: string, filename: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-12 pb-32 space-y-12">
      {/* Header with Stats & Gamification */}
      <header className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
        <div className="lg:col-span-2 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[10px] font-bold uppercase tracking-widest shadow-md">
            <Camera size={12} />
            Хранители воспоминаний: Lvl {Math.floor(moments.length / 5) + 1}
          </div>
          <h1 className="text-6xl font-serif font-bold text-[#5c4a33] tracking-tight">Слепки моментов</h1>
          <p className="text-[#8b7355] italic text-xl leading-relaxed max-w-2xl">
            "Каждый кадр — это живой кусочек нашей истории, приколотый к доске вечности."
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-[#f5e6d3] p-4 rounded-3xl border-2 border-[#e6d5bc] shadow-inner flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#5c4a33] shadow-sm">
                <ImageIcon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-[#8b7355]">В архиве</p>
                <p className="text-xl font-bold text-[#5c4a33]">{moments.length} фото</p>
              </div>
            </div>
            <div className="h-10 w-px bg-[#e6d5bc]" />
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-[#8b7355]">Новых за неделю</p>
              <p className="text-xl font-bold text-[#5c4a33]">+{getNewThisWeekCount()}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={showRandomMemory}
              className="flex-1 flex items-center justify-center gap-2 bg-[#fdfaf3] border-4 border-[#e6d5bc] px-6 py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all text-[#5c4a33] group active:scale-95"
            >
              <Sparkles size={18} className="text-amber-500 group-hover:rotate-12 transition-transform" />
              Вспомнить
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#5c4a33] px-6 py-4 rounded-[2rem] text-[#fdfaf3] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all text-sm active:scale-95"
            >
              <Plus size={20} />
              Снять
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar - Palia Style */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-[#fdfaf3] p-6 rounded-[2.5rem] border-4 border-[#e6d5bc] shadow-xl relative overflow-hidden">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        
        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <div className="flex items-center gap-2 p-1 bg-[#f5e6d3] rounded-2xl overflow-x-auto no-scrollbar touch-pan-x max-w-[85vw] md:max-w-md">
            {galleryCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  filter === cat 
                    ? "bg-[#5c4a33] text-[#fdfaf3] shadow-md" 
                    : "text-[#8b7355] hover:bg-white/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsManagingCategories(true)}
            className="p-3 rounded-2xl bg-[#f5e6d3] text-[#5c4a33] border-2 border-[#e6d5bc] hover:bg-white transition-all shadow-sm shrink-0"
          >
            <Settings2 size={18} />
          </button>
        </div>
        
        <div className="relative w-full md:w-80 group relative z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7355] group-focus-within:text-[#5c4a33] transition-colors" size={18} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск момента..."
            className="w-full bg-white border-4 border-[#e6d5bc] rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-0 focus:border-[#5c4a33] transition-all placeholder:text-[#8b7355]/40 font-bold text-[#5c4a33]"
          />
        </div>
      </div>

      {/* Grid - Cozy Board Style */}
      <div className="relative p-12 bg-[#f5e6d3] rounded-[3rem] border-8 border-[#e6d5bc] shadow-inner min-h-[600px]">
        {/* Grid pattern for the board */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#5c4a33_1px,transparent_1px)] [background-size:40px_40px]" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-16 gap-x-12 justify-items-center relative z-10">
          <AnimatePresence mode="popLayout">
            {filteredMoments.map((moment, idx) => (
              <motion.div
                key={moment.src + idx}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedPhoto(moment)}
                className="cursor-pointer group relative"
              >
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="p-4 rounded-full bg-[#5c4a33]/80 backdrop-blur-md text-[#fdfaf3] shadow-2xl">
                    <Maximize2 size={24} />
                  </div>
                </div>
                <PolaroidCard {...moment} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredMoments.length === 0 && (
          <div className="text-center py-32 space-y-6 relative z-10">
            <div className="w-24 h-24 bg-[#e6d5bc] rounded-full flex items-center justify-center mx-auto text-[#8b7355] shadow-inner">
              <Camera size={48} />
            </div>
            <div className="space-y-2">
              <p className="text-[#5c4a33] font-serif italic text-2xl">Альбом пока пуст...</p>
              <p className="text-[#8b7355] font-bold uppercase text-[10px] tracking-widest">Добавьте первый кадр вашей истории</p>
            </div>
          </div>
        )}
      </div>


      {/* Empty State */}
      {filteredMoments.length === 0 && (
        <div className="text-center py-32 space-y-4">
          <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200">
            <ImageIcon size={40} />
          </div>
          <p className="text-foreground/30 font-serif italic text-xl">Ничего не найдено в архивах памяти...</p>
        </div>
      )}

      {/* Random Memory Modal */}
      <AnimatePresence>
        {randomMoment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRandomMoment(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="relative w-full max-w-lg"
            >
              <button 
                onClick={() => setRandomMoment(null)}
                className="absolute -top-16 right-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
              >
                <X size={24} />
              </button>
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest mb-8 border border-white/20">
                  <Sparkles size={14} className="text-amber-300" />
                  Случайное воспоминание
                </div>
                <div className="scale-125 md:scale-150 transform-gpu">
                  <PolaroidCard {...randomMoment} rotate={0} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Moment Modal - Palia Style */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#fdfaf3] rounded-[3rem] shadow-2xl overflow-hidden p-8 space-y-8 border-8 border-[#e6d5bc]"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-[#5c4a33] flex items-center gap-3">
                  <Camera className="text-[#8b7355]" />
                  Новый момент
                </h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-full bg-[#f5e6d3] text-[#5c4a33] hover:bg-[#e6d5bc] transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8b7355] ml-2">Фотография</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label 
                      htmlFor="photo-upload"
                      className="flex flex-col items-center justify-center gap-4 w-full h-48 bg-white border-4 border-dashed border-[#e6d5bc] rounded-3xl cursor-pointer hover:bg-[#f5e6d3] hover:border-[#5c4a33]/30 transition-all overflow-hidden"
                    >
                      {newMoment.src ? (
                        <img src={newMoment.src} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="p-4 rounded-2xl bg-[#f5e6d3] shadow-sm text-[#5c4a33]">
                            <Upload size={24} />
                          </div>
                          <span className="text-xs font-black text-[#8b7355] uppercase tracking-widest">Выбрать файл</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8b7355] ml-2">Что на фото?</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7355]/40" size={18} />
                    <input 
                      type="text" 
                      value={newMoment.caption}
                      onChange={(e) => setNewMoment({...newMoment, caption: e.target.value})}
                      placeholder="Напиши краткое описание..."
                      className="w-full bg-white border-4 border-[#e6d5bc] rounded-2xl pl-12 pr-4 py-4 focus:ring-0 focus:border-[#5c4a33] transition-all text-sm font-bold text-[#5c4a33]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8b7355] ml-2">Категория</label>
                  <div className="flex flex-wrap gap-2">
                    {galleryCategories.filter(c => c !== 'Все').map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNewMoment({...newMoment, category: cat})}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          newMoment.category === cat 
                            ? "bg-[#5c4a33] text-[#fdfaf3] shadow-md" 
                            : "bg-[#f5e6d3] text-[#8b7355] hover:bg-[#e6d5bc]"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={addMoment}
                disabled={!newMoment.src || !newMoment.caption}
                className="w-full py-5 rounded-[2rem] bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Запечатлеть
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Detail View Modal - Palia Style */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-[#fdfaf3] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border-8 border-[#e6d5bc]"
            >
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-white/10 hover:bg-white/20 text-[#5c4a33] rounded-full transition-all"
              >
                <X size={24} />
              </button>

              {/* Photo Area */}
              <div className="flex-1 bg-[#f5e6d3] flex items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#5c4a33_1px,transparent_1px)] [background-size:20px_20px]" />
                <img 
                  src={selectedPhoto.src} 
                  alt={selectedPhoto.caption}
                  className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border-4 border-white relative z-10"
                />
              </div>

              {/* Details Area */}
              <div className="w-full md:w-80 p-8 flex flex-col justify-between bg-[#fdfaf3] border-l-4 border-[#e6d5bc]">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="inline-flex px-3 py-1 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {selectedPhoto.category}
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-[#5c4a33] leading-tight">
                      {selectedPhoto.caption}
                    </h3>
                  </div>

                  <div className="space-y-4 pt-6 border-t-2 border-[#e6d5bc]">
                    <div className="flex items-center gap-3 text-[#8b7355]">
                      <Calendar size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">{selectedPhoto.date}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 space-y-3">
                  <button 
                    onClick={() => downloadPhoto(selectedPhoto.src, `moment-${selectedPhoto.date}.png`)}
                    className="w-full py-5 rounded-[2rem] bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Сохранить
                  </button>
                  <button 
                    onClick={() => setPhotoToDelete(selectedPhoto)}
                    className="w-full py-4 rounded-2xl bg-[#f5e6d3] text-red-500 font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 border-2 border-transparent hover:border-red-100"
                  >
                    <Trash2 size={18} />
                    Стереть
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {photoToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPhotoToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground/80">Удалить это фото?</h3>
                <p className="text-sm text-foreground/40 leading-relaxed">
                  Это действие нельзя будет отменить. Вы уверены, что хотите стереть это воспоминание?
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPhotoToDelete(null)}
                  className="flex-1 py-4 rounded-2xl bg-zinc-100 text-foreground/40 font-bold hover:bg-zinc-200 transition-all"
                >
                  Отмена
                </button>
                <button 
                  onClick={() => confirmDeletePhoto(photoToDelete)}
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Да, удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Categories Modal */}
      <AnimatePresence>
        {isManagingCategories && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManagingCategories(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden p-8 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-foreground/80 flex items-center gap-3">
                  <Tag className="text-talia-lavender" />
                  Категории
                </h3>
                <button 
                  onClick={() => setIsManagingCategories(false)}
                  className="p-2 rounded-full bg-zinc-100 text-foreground/40 hover:bg-zinc-200 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Новая категория..."
                    className="flex-1 bg-zinc-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-talia-lavender/20 transition-all text-sm font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <button 
                    onClick={addCategory}
                    disabled={!newCategoryName.trim()}
                    className="p-4 rounded-2xl bg-talia-lavender text-white shadow-lg shadow-talia-lavender/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {galleryCategories.map(cat => (
                    <div 
                      key={cat}
                      className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-black/5 group"
                    >
                      <span className="text-sm font-bold text-foreground/70 uppercase tracking-widest">{cat}</span>
                      {cat !== 'Все' && (
                        <button 
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-2 text-foreground/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsManagingCategories(false)}
                className="w-full py-4 rounded-2xl bg-zinc-100 text-foreground/40 font-bold hover:bg-zinc-200 transition-all"
              >
                Готово
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Delete Confirmation Modal */}
      <AnimatePresence>
        {categoryToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCategoryToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground/80">Удалить категорию?</h3>
                <p className="text-sm text-foreground/40 leading-relaxed">
                  Вы уверены, что хотите удалить категорию <span className="font-bold text-foreground/60">«{categoryToDelete}»</span>? 
                  {moments.filter(m => m.category === categoryToDelete).length > 0 ? (
                    <> В ней находится <span className="text-red-400 font-bold">{moments.filter(m => m.category === categoryToDelete).length}</span> фото.</>
                  ) : (
                    <> В ней пока нет фотографий.</>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setCategoryToDelete(null)}
                  className="flex-1 py-4 rounded-2xl bg-zinc-100 text-foreground/40 font-bold hover:bg-zinc-200 transition-all"
                >
                  Отмена
                </button>
                <button 
                  onClick={() => deleteCategory(categoryToDelete)}
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Да, удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
