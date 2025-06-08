import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  featured?: boolean;
}

interface SignatureDishesCarouselProps {
  dishes: Dish[];
}

const SignatureDishesCarousel: React.FC<SignatureDishesCarouselProps> = ({ dishes = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Use placeholder content if no dishes are provided
  const displayDishes = dishes.length > 0 ? dishes : [
    {
      id: 'placeholder1',
      name: 'Truffle Risotto',
      description: 'Carnaroli rice slow cooked with seasonal truffles and aged parmesan',
      price: 38,
      image: 'https://images.unsplash.com/photo-1518133222459-6ab886fa5fa3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: true
    },
    {
      id: 'placeholder2',
      name: 'Lobster Thermidor',
      description: 'Maine lobster with a creamy brandy sauce, served with duchess potatoes',
      price: 65,
      image: 'https://images.unsplash.com/photo-1560684352-8497838a2229?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: true
    },
    {
      id: 'placeholder3',
      name: 'Beef Wellington',
      description: 'Prime beef fillet with wild mushroom duxelles, wrapped in puff pastry',
      price: 59,
      image: 'https://images.unsplash.com/photo-1544972917-3529b113a469?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: true
    },
    {
      id: 'placeholder4',
      name: 'Chocolate Soufflé',
      description: 'Warm chocolate soufflé with vanilla bean ice cream',
      price: 18,
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: true
    }
  ];

  // Handle mouse/touch events for manual carousel scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll speed multiplier
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Scroll to next/previous dish
  const scrollToNextDish = () => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.offsetWidth / 2; // Show 2 items on desktop
      carouselRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
      setActiveIndex(Math.min(activeIndex + 1, displayDishes.length - 1));
    }
  };

  const scrollToPrevDish = () => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.offsetWidth / 2; // Show 2 items on desktop
      carouselRef.current.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      setActiveIndex(Math.max(activeIndex - 1, 0));
    }
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-charcoal to-black/60 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-serif font-bold text-amber-400 mb-6">
            Signature Dishes
          </h2>
          <p className="text-xl text-cream max-w-3xl mx-auto">
            Our culinary team crafts unique dishes that blend tradition with innovation, 
            creating unforgettable dining experiences.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={scrollToPrevDish}
            className="absolute left-0 md:-left-12 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-cream rounded-full p-3 transition-colors"
            aria-label="Previous dish"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={scrollToNextDish}
            className="absolute right-0 md:-right-12 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-cream rounded-full p-3 transition-colors"
            aria-label="Next dish"
          >
            <ChevronRight size={24} />
          </button>
          
          {/* Carousel */}
          <div 
            className="overflow-x-auto scrollbar-hide"
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex py-8 px-4 space-x-8" style={{ minWidth: 'max-content' }}>
              {displayDishes.map((dish, index) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="relative w-80 sm:w-96 flex-shrink-0 group"
                >
                  <div className="bg-gradient-to-br from-black/80 to-charcoal/90 border border-amber-600/30 rounded-xl overflow-hidden shadow-xl hover:border-amber-500/50 transition-all duration-500">
                    {/* Dish Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={dish.image} 
                        alt={dish.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      {/* Featured Badge */}
                      {dish.featured && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-amber-600/90 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Star className="mr-1" size={14} /> Featured
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Dish Info */}
                    <div className="p-6">
                      <h3 className="text-2xl font-serif font-bold text-amber-400 mb-2">{dish.name}</h3>
                      <p className="text-cream/80 mb-4 line-clamp-2">{dish.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-400 font-bold text-xl">${dish.price.toFixed(2)}</span>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link 
                            to="/menu" 
                            className="text-black bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded transition-colors"
                          >
                            Order
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Indicator Dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {displayDishes.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (carouselRef.current) {
                    const itemWidth = carouselRef.current.offsetWidth / 2;
                    carouselRef.current.scrollLeft = index * itemWidth;
                    setActiveIndex(index);
                  }
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index 
                    ? 'bg-amber-400 w-6' 
                    : 'bg-amber-400/30 hover:bg-amber-400/50'
                }`}
                aria-label={`Go to dish ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link 
            to="/menu"
            className="inline-block border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-3 font-bold transition-all duration-300 hover:scale-105"
          >
            View Full Menu
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default SignatureDishesCarousel;
