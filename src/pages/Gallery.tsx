
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface GalleryItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryItem[];
      setGalleryItems(items);
    });

    return unsubscribe;
  }, []);

  // Fallback images if no gallery items
  const fallbackImages = [
    {
      id: 'fallback1',
      url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Elegant Dining Room',
      description: 'Our sophisticated main dining area'
    },
    {
      id: 'fallback2',
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Culinary Excellence',
      description: 'Artfully crafted dishes'
    },
    {
      id: 'fallback3',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Intimate Atmosphere',
      description: 'Perfect for special occasions'
    },
    {
      id: 'fallback4',
      url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Wine Selection',
      description: 'Curated from around the world'
    },
    {
      id: 'fallback5',
      url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Chef\'s Presentation',
      description: 'Artistry on every plate'
    },
    {
      id: 'fallback6',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Private Dining',
      description: 'Exclusive experiences'
    }
  ];

  const displayItems = galleryItems.length > 0 ? galleryItems : fallbackImages;

  return (
    <div className="min-h-screen bg-charcoal pt-20">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-serif font-bold text-amber-400 mb-6">
            Gallery
          </h1>
          <p className="text-xl text-cream max-w-3xl mx-auto leading-relaxed">
            Step into our world of culinary artistry and elegant ambiance. 
            Each image tells a story of passion, precision, and the pursuit of perfection.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative overflow-hidden bg-black/20 backdrop-blur-sm border border-amber-600/20 hover:border-amber-600/60 transition-all duration-500">
                <img
                  src={item.url}
                  alt={item.title || 'Gallery image'}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 text-white">
                    {item.title && (
                      <h3 className="text-xl font-semibold text-amber-400 mb-2">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-cream/90">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="relative max-w-4xl max-h-[90vh] bg-charcoal border border-amber-600/30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-amber-400 hover:text-amber-300 z-10 bg-black/50 p-2 rounded-full"
              >
                <X size={24} />
              </button>
              <img
                src={selectedImage.url}
                alt={selectedImage.title || 'Gallery image'}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              {(selectedImage.title || selectedImage.description) && (
                <div className="p-6 border-t border-amber-600/20">
                  {selectedImage.title && (
                    <h3 className="text-2xl font-semibold text-amber-400 mb-2">
                      {selectedImage.title}
                    </h3>
                  )}
                  {selectedImage.description && (
                    <p className="text-cream">{selectedImage.description}</p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
