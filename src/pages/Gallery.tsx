import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Image, Video, Film, X, PlayCircle, Eye, Calendar, Tag,
  ChevronLeft, ChevronRight, Play, Pause, Download, ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';
import { useDebouncedCallback } from 'use-debounce';
import { collection, onSnapshot, query, orderBy, where, limit, getDocs, startAfter, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GalleryItem, MediaCategory, GalleryFilter, CATEGORY_LABELS } from '../types/gallery';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Define the missing MediaType enum
enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video'
}

const ITEMS_PER_PAGE = 12;

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView: isLoadMoreVisible } = useInView();
  
  // Use the ref callback to connect both refs
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      // Set the loadMoreRef manually
      loadMoreRef.current = node;
      // Set the inViewRef
      inViewRef(node);
    },
    [inViewRef]
  );
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Filters
  const [filters, setFilters] = useState<GalleryFilter>({
    category: 'all',
    searchQuery: '',
    sortBy: 'recent',
    sortDirection: 'desc'
  });

  // Skeleton placeholder items
  const skeletonItems = Array(ITEMS_PER_PAGE).fill(0);

  // Handle search with debounce
  const handleSearch = useDebouncedCallback((value: string) => {
    setFilters({...filters, searchQuery: value});
    resetGallery();
  }, 500);

  // Reset gallery for new filters
  const resetGallery = () => {
    setGalleryItems([]);
    setLastVisible(null);
    setHasMore(true);
    setIsLoading(true);
  };

  // Change category
  const changeCategory = (category: MediaCategory) => {
    setFilters({...filters, category});
    resetGallery();
  };

  // Change sort method
  const changeSortMethod = (sortBy: 'recent' | 'views' | 'type') => {
    const sortDirection = 
      sortBy === filters.sortBy && filters.sortDirection === 'desc' 
        ? 'asc' 
        : 'desc';
    
    setFilters({...filters, sortBy, sortDirection});
    resetGallery();
  };

  // Load gallery items
  useEffect(() => {
    if (isLoading || isLoadingMore) {
      let galleryQuery = query(
        collection(db, 'gallery'),
        orderBy(getOrderByField(), filters.sortDirection === 'desc' ? 'desc' : 'asc'),
        limit(ITEMS_PER_PAGE)
      );
      
      // Apply category filter
      if (filters.category !== 'all') {
        galleryQuery = query(
          galleryQuery,
          where('category', '==', filters.category)
        );
      }
      
      // Apply search if provided
      if (filters.searchQuery) {
        // This is a simple implementation - for more advanced search
        // you might want to use Algolia or a similar service
        galleryQuery = query(
          galleryQuery,
          where('tags', 'array-contains', filters.searchQuery.toLowerCase())
        );
      }
      
      // Apply pagination
      if (lastVisible && isLoadingMore) {
        galleryQuery = query(
          galleryQuery,
          startAfter(lastVisible)
        );
      }
      
      // Get data
      getDocs(galleryQuery).then((snapshot) => {
        if (snapshot.empty) {
          setHasMore(false);
        } else {
          // Get the last visible document
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          
          // Get the items
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as GalleryItem[];
          
          // Update state based on whether we're loading more or initial load
          setGalleryItems(prev => isLoadingMore ? [...prev, ...items] : items);
        }
        
        setIsLoading(false);
        setIsLoadingMore(false);
      }).catch(error => {
        console.error("Error fetching gallery items:", error);
        setIsLoading(false);
        setIsLoadingMore(false);
      });
    }
  }, [isLoading, isLoadingMore, filters]);

  // Intersection observer for infinite loading
  useEffect(() => {
    if (isLoadMoreVisible && !isLoading && !isLoadingMore && hasMore) {
      setIsLoadingMore(true);
    }
  }, [isLoadMoreVisible, isLoading, isLoadingMore, hasMore]);

  // Auto-slideshow for lightbox
  useEffect(() => {
    if (isPlaying && selectedImage && galleryItems.length > 1) {
      const interval = setInterval(() => {
        handleNext();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, selectedImage, activeImageIndex]);

  // Helper to get the field to order by based on sort selection
  function getOrderByField() {
    switch (filters.sortBy) {
      case 'recent': return 'uploadedAt';
      case 'views': return 'views';
      case 'type': return 'type';
      default: return 'uploadedAt';
    }
  }

  // Open lightbox for an image
  const openLightbox = async (item: GalleryItem, index: number) => {
    setSelectedImage(item);
    setActiveImageIndex(index);
    
    // Increment view count
    try {
      await updateDoc(doc(db, 'gallery', item.id), {
        views: increment(1)
      });
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  // Handle next image in lightbox
  const handleNext = () => {
    if (galleryItems.length > 1) {
      const nextIndex = (activeImageIndex + 1) % galleryItems.length;
      setActiveImageIndex(nextIndex);
      setSelectedImage(galleryItems[nextIndex]);
    }
  };

  // Handle previous image in lightbox
  const handlePrev = () => {
    if (galleryItems.length > 1) {
      const prevIndex = (activeImageIndex - 1 + galleryItems.length) % galleryItems.length;
      setActiveImageIndex(prevIndex);
      setSelectedImage(galleryItems[prevIndex]);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'Escape':
          setSelectedImage(null);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, activeImageIndex, galleryItems]);

  // Toggle play/pause for videos and slideshow
  const togglePlayPause = () => {
    if (selectedImage?.type === 'video' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Share the current image
  const shareImage = () => {
    if (selectedImage && navigator.share) {
      navigator.share({
        title: selectedImage.title || 'Reeves Fine Dining Gallery',
        text: selectedImage.description || 'Check out this amazing image from Reeves Fine Dining!',
        url: selectedImage.url
      }).catch(error => console.log('Error sharing', error));
    }
  };

  // Download the current image
  const downloadImage = () => {
    if (selectedImage) {
      const link = document.createElement('a');
      link.href = selectedImage.url;
      link.download = selectedImage.title || 'reeves-dining-image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Fallback images if no gallery items
  const fallbackImages = [
    {
      id: 'fallback1',
      url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Elegant Dining Room',
      description: 'Our sophisticated main dining area',
      type: 'image' as MediaType,
      category: 'interior' as MediaCategory,
      tags: ['dining', 'interior', 'elegant'],
      uploadedAt: new Date(),
      views: 0
    },
    {
      id: 'fallback2',
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Culinary Excellence',
      description: 'Artfully crafted dishes',
      type: 'image' as MediaType,
      category: 'food' as MediaCategory,
      tags: ['food', 'gourmet', 'culinary'],
      uploadedAt: new Date(),
      views: 0
    },
    {
      id: 'fallback3',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Intimate Atmosphere',
      description: 'Perfect for special occasions',
      type: 'image' as MediaType,
      category: 'interior' as MediaCategory,
      tags: ['ambiance', 'interior', 'romantic'],
      uploadedAt: new Date(),
      views: 0
    },
    {
      id: 'fallback4',
      url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Wine Selection',
      description: 'Curated from around the world',
      type: 'image' as MediaType,
      category: 'food' as MediaCategory,
      tags: ['wine', 'beverages', 'gourmet'],
      uploadedAt: new Date(),
      views: 0
    },
    {
      id: 'fallback5',
      url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Chef\'s Presentation',
      description: 'Artistry on every plate',
      type: 'image' as MediaType,
      category: 'food' as MediaCategory,
      tags: ['chef', 'food', 'gourmet'],
      uploadedAt: new Date(),
      views: 0
    },
    {
      id: 'fallback6',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'Private Dining',
      description: 'Exclusive experiences',
      type: 'image' as MediaType,
      category: 'events' as MediaCategory,
      tags: ['events', 'private', 'exclusive'],
      uploadedAt: new Date(),
      views: 0
    }
  ];

  const displayItems = (galleryItems.length > 0 || isLoading) ? galleryItems : fallbackImages;

  return (
    <div className="min-h-screen bg-charcoal pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl font-serif font-bold text-amber-400 mb-6">
            Gallery
          </h1>
          <p className="text-xl text-cream max-w-3xl mx-auto leading-relaxed">
            Step into our world of culinary artistry and elegant ambiance. 
            Each image tells a story of passion, precision, and the pursuit of perfection.
          </p>
        </motion.div>

        {/* Filter Controls */}
        <div className="bg-black/30 backdrop-blur-sm border border-amber-600/20 rounded-lg p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
              <Input
                placeholder="Search by tags..."
                className="pl-10 bg-charcoal border-amber-600/30 text-cream"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {/* Sort Controls */}
            <div className="flex gap-2">
              <Button
                variant={filters.sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                className={filters.sortBy === 'recent' ? 'bg-amber-600 text-black' : 'border-amber-600/30 text-amber-400'}
                onClick={() => changeSortMethod('recent')}
              >
                <Calendar size={16} className="mr-2" />
                {filters.sortBy === 'recent' && (
                  filters.sortDirection === 'desc' ? 'Newest' : 'Oldest'
                )}
                {filters.sortBy !== 'recent' && 'Date'}
              </Button>
              
              <Button
                variant={filters.sortBy === 'views' ? 'default' : 'outline'}
                size="sm"
                className={filters.sortBy === 'views' ? 'bg-amber-600 text-black' : 'border-amber-600/30 text-amber-400'}
                onClick={() => changeSortMethod('views')}
              >
                <Eye size={16} className="mr-2" />
                {filters.sortBy === 'views' && (
                  filters.sortDirection === 'desc' ? 'Most Viewed' : 'Least Viewed'
                )}
                {filters.sortBy !== 'views' && 'Views'}
              </Button>
              
              <Button
                variant={filters.sortBy === 'type' ? 'default' : 'outline'}
                size="sm"
                className={filters.sortBy === 'type' ? 'bg-amber-600 text-black' : 'border-amber-600/30 text-amber-400'}
                onClick={() => changeSortMethod('type')}
              >
                {filters.sortBy === 'type' && filters.sortDirection === 'desc' ? (
                  <Film size={16} className="mr-2" />
                ) : (
                  <Image size={16} className="mr-2" />
                )}
                Type
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-amber-600/30 text-amber-400"
                onClick={() => setFilters({
                  category: 'all',
                  searchQuery: '',
                  sortBy: 'recent',
                  sortDirection: 'desc'
                })}
              >
                Reset
              </Button>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Badge
                key={key}
                variant={filters.category === key ? 'default' : 'outline'}
                className={`cursor-pointer text-sm py-1.5 px-3 ${
                  filters.category === key 
                    ? 'bg-amber-600 text-black hover:bg-amber-700' 
                    : 'border-amber-600/30 text-amber-400 hover:border-amber-400'
                }`}
                onClick={() => changeCategory(key as MediaCategory)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {isLoading && skeletonItems.map((_, index) => (
            <div key={`skeleton-${index}`} className="relative aspect-[4/3] group">
              <Skeleton className="w-full h-full rounded-lg bg-charcoal/70" />
            </div>
          ))}
          
          <AnimatePresence mode="popLayout">
            {!isLoading && displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 % 0.5 }}
                layout
                className="relative aspect-[4/3] group"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div 
                  className="w-full h-full overflow-hidden rounded-lg border border-amber-600/20 group-hover:border-amber-400/40 transition-all duration-300 cursor-pointer bg-black/30 backdrop-blur-sm"
                  onClick={() => openLightbox(item, index)}
                >
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video 
                        src={item.url} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        muted
                        loop
                        playsInline
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => e.currentTarget.pause()}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-amber-600/80 flex items-center justify-center text-black">
                          <Play size={32} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.title || 'Gallery image'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>
                
                {/* Overlay with Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  {item.title && (
                    <h3 className="text-lg font-semibold text-amber-400 mb-1">
                      {item.title}
                    </h3>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="bg-black/40 text-amber-400 border-amber-400/30">
                      {CATEGORY_LABELS[item.category as MediaCategory]}
                    </Badge>
                    
                    {item.type === 'video' && (
                      <Badge variant="outline" className="bg-black/40 text-blue-400 border-blue-400/30">
                        Video
                      </Badge>
                    )}
                    
                    {item.featured && (
                      <Badge variant="outline" className="bg-black/40 text-purple-400 border-purple-400/30">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-1 text-cream/70 text-xs">
                      <Tag size={12} className="text-cream/50" />
                      {item.tags.slice(0, 3).join(', ')}
                      {item.tags.length > 3 && ' ...'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Load More */}
        <div ref={setRefs} className="flex justify-center mt-12">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
              Loading more...
            </div>
          )}
          
          {!isLoading && !isLoadingMore && !hasMore && galleryItems.length > 0 && (
            <p className="text-cream/70">You've reached the end of the gallery</p>
          )}
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative max-w-6xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Navigation Controls */}
                {galleryItems.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-cream rounded-full p-3 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-cream rounded-full p-3 transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-cream rounded-full p-2 transition-colors"
                >
                  <X size={24} />
                </button>
                
                {/* Media Container */}
                <div className="flex justify-center items-center h-full max-h-[calc(90vh-8rem)] overflow-hidden">
                  {selectedImage.type === 'video' ? (
                    <video
                      ref={videoRef}
                      src={selectedImage.url}
                      className="max-w-full max-h-full object-contain"
                      controls
                      autoPlay
                    />
                  ) : (
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.title || 'Gallery image'}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
                
                {/* Info Panel */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <Badge className="bg-amber-600 text-black">
                        {CATEGORY_LABELS[selectedImage.category as MediaCategory]}
                      </Badge>
                      
                      {selectedImage.type === 'video' && (
                        <Badge className="bg-blue-600 text-white">
                          Video
                        </Badge>
                      )}
                      
                      {selectedImage.featured && (
                        <Badge className="bg-purple-600 text-white">
                          Featured
                        </Badge>
                      )}
                      
                      <div className="text-cream/60 text-sm flex items-center gap-1 ml-auto">
                        <Eye size={14} />
                        {selectedImage.views || 0} views
                      </div>
                    </div>
                    
                    {selectedImage.title && (
                      <h3 className="text-2xl font-semibold text-amber-400 mb-2">
                        {selectedImage.title}
                      </h3>
                    )}
                    
                    {selectedImage.description && (
                      <p className="text-cream mb-4">
                        {selectedImage.description}
                      </p>
                    )}
                    
                    {/* Tags */}
                    {selectedImage.tags && selectedImage.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                        <Tag size={14} className="text-cream/70" />
                        {selectedImage.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-cream/70 border-cream/30">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Action Controls */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-600/30 text-amber-400"
                          onClick={togglePlayPause}
                        >
                          {selectedImage.type === 'video' ? (
                            videoRef.current?.paused ? <Play size={16} className="mr-2" /> : <Pause size={16} className="mr-2" />
                          ) : (
                            isPlaying ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />
                          )}
                          {selectedImage.type === 'video' ? 'Play/Pause' : (isPlaying ? 'Pause Slideshow' : 'Start Slideshow')}
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-600/30 text-amber-400"
                          onClick={downloadImage}
                        >
                          <Download size={16} className="mr-2" /> Download
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-600/30 text-amber-400"
                          onClick={() => window.open(selectedImage.url, '_blank')}
                        >
                          <ExternalLink size={16} className="mr-2" /> Open Original
                        </Button>
                        
                        {navigator.share && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-600/30 text-amber-400"
                            onClick={shareImage}
                          >
                            Share
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Gallery;
