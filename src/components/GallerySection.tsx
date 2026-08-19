import React, { useState, useEffect } from 'react';
import { Camera, X, ZoomIn, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  items?: GalleryItem[];
  gallery?: GalleryItem[];
  onBookTable?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ items, gallery, onBookTable }) => {
  const safeItems = items || gallery || [];
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Photos', count: safeItems.length },
    { id: 'food', label: 'Food & Dishes', count: safeItems.filter(i => i.category === 'food').length },
    { id: 'restaurant', label: 'Restaurant & Kitchen', count: safeItems.filter(i => i.category === 'restaurant').length },
    { id: 'chef_specials', label: 'Chef Specials', count: safeItems.filter(i => i.category === 'chef_specials').length },
    { id: 'ambience', label: 'Ambience & Dining', count: safeItems.filter(i => i.category === 'ambience').length },
  ];

  const filteredItems = activeCategory === 'all'
    ? safeItems
    : safeItems.filter(item => item.category === activeCategory);

  // Lightbox keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, filteredItems]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = filteredItems.findIndex(i => i.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedImage(filteredItems[prevIndex]);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = filteredItems.findIndex(i => i.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedImage(filteredItems[nextIndex]);
  };

  return (
    <section id="gallery" className="py-20 bg-slate-50 text-slate-800 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase mb-3">
            <Camera className="w-3.5 h-3.5" />
            <span>VISUAL ATMOSPHERE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-serif tracking-tight">
            RESTAURANT <span className="text-red-600">GALLERY</span>
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Explore our fiery wok stations, sizzling Indo-Chinese presentations, and cozy dining atmosphere in Hounslow.
          </p>
        </div>

        {/* Category Tabs with Counts */}
        <div className="flex justify-center items-center gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                activeCategory === cat.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeCategory === cat.id ? 'bg-red-700/80 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative h-64 rounded-2xl overflow-hidden border border-slate-200 bg-white cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  {item.category.replace('_', ' ')}
                </span>
                <h3 className="text-base font-bold text-white font-serif">{item.title}</h3>
                {item.caption && <p className="text-xs text-slate-200 mt-0.5 line-clamp-2">{item.caption}</p>}
                
                <div className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-slate-900 shadow-sm">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/90 text-slate-900 hover:bg-white shadow-lg z-10 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-slate-900 hover:bg-white shadow-lg z-10 transition-colors"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-slate-900 hover:bg-white shadow-lg z-10 transition-colors"
              aria-label="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Content Container */}
            <div
              className="max-w-4xl w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[70vh]">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full max-h-[70vh] object-contain"
                />
              </div>
              <div className="p-6 bg-white border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">
                    {selectedImage.category.replace('_', ' ')}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif mt-0.5">{selectedImage.title}</h3>
                  {selectedImage.caption && (
                    <p className="text-sm text-slate-600 mt-1">{selectedImage.caption}</p>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-400 whitespace-nowrap pl-4">
                  {filteredItems.findIndex(i => i.id === selectedImage.id) + 1} of {filteredItems.length}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
