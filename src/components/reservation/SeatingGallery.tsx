import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  label: string;
  description: string;
}

interface SeatingGalleryProps {
  images: GalleryImage[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const SeatingGallery: React.FC<SeatingGalleryProps> = ({ images, onSelect, selectedId }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  const handlePrevious = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const handleSelect = () => {
    onSelect(images[activeIndex].id);
  };

  const activeImage = images[activeIndex];

  return (
    <div className="w-full rounded-xl overflow-hidden bg-black/30 border border-amber-600/20">
      <div className="relative h-[400px] overflow-hidden">
        {/* Main image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage.id}
            src={activeImage.src}
            alt={activeImage.label}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>

        {/* Navigation arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-amber-700 transition-colors z-10"
          aria-label="Previous seating option"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-amber-700 transition-colors z-10"
          aria-label="Next seating option"
        >
          <ChevronRight size={20} />
        </button>

        {/* Caption */}
        <div className="absolute bottom-0 inset-x-0 p-6 text-white">
          <h3 className="text-2xl font-serif font-bold text-amber-400 mb-2">{activeImage.label}</h3>
          <p className="text-cream/90 max-w-2xl">{activeImage.description}</p>
        </div>

        {/* Selected indicator & selection button */}
        <div className="absolute top-4 right-4 z-10">
          <motion.button
            onClick={handleSelect}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedId === activeImage.id
                ? 'bg-amber-500 text-black'
                : 'bg-black/50 text-white hover:bg-amber-700/70'
            }`}
          >
            {selectedId === activeImage.id ? 'Selected' : 'Select this seating'}
          </motion.button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="bg-black/40 p-4 flex space-x-2 overflow-x-auto">
        {images.map((image, idx) => (
          <button
            key={image.id}
            onClick={() => setActiveIndex(idx)}
            className={`relative flex-shrink-0 h-16 w-24 rounded overflow-hidden ${
              idx === activeIndex ? 'ring-2 ring-amber-500' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={image.src}
              alt={image.label}
              className="h-full w-full object-cover"
            />
            {selectedId === image.id && (
              <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SeatingGallery;
