
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Star, Utensils } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      
      setMenuItems(items.sort((a, b) => a.name.localeCompare(b.name)));
      
      const uniqueCategories = ['all', ...new Set(items.map(item => item.category))];
      setCategories(uniqueCategories);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appetizers': return '🥗';
      case 'mains': return '🥩';
      case 'desserts': return '🍰';
      case 'beverages': return '🥂';
      default: return '🍽️';
    }
  };

  const categoryDisplayNames = {
    'appetizers': 'Appetizers',
    'mains': 'Main Courses',
    'desserts': 'Desserts',
    'beverages': 'Beverages',
    'all': 'All Items'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal pt-20 flex items-center justify-center">
        <div className="text-amber-400 text-2xl font-serif">Loading our exquisite menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal pt-20">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-serif font-bold text-amber-400 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            Our Menu
          </motion.h1>
          
          <motion.div
            className="w-24 h-0.5 bg-amber-400 mx-auto mb-8"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          
          <motion.p 
            className="text-xl text-cream max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Discover our carefully curated selection of dishes, each crafted with the finest ingredients 
            and presented with artistic precision.
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center justify-center mb-8">
            <Filter className="text-amber-400 mr-3" size={24} />
            <h2 className="text-2xl font-semibold text-amber-400">Filter by Category</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-2 flex items-center space-x-2 ${
                  selectedCategory === category
                    ? 'bg-amber-600 text-black border-amber-600'
                    : 'bg-transparent text-amber-400 border-amber-400 hover:bg-amber-400/10'
                }`}
              >
                <span className="text-lg">{getCategoryIcon(category)}</span>
                <span className="capitalize">
                  {categoryDisplayNames[category as keyof typeof categoryDisplayNames] || category}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Menu Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-black/40 backdrop-blur-sm border border-amber-600/20 overflow-hidden hover:border-amber-600/40 transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-charcoal/70 flex items-center justify-center">
                      <Utensils className="text-amber-400/50" size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-600 text-black px-3 py-1 text-sm font-semibold capitalize">
                      {getCategoryIcon(item.category)} {item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="text-amber-400 fill-current" size={16} />
                      <span className="text-amber-400 font-bold text-lg">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-cream/90 text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-cream/60 text-sm capitalize font-medium">
                      {categoryDisplayNames[item.category as keyof typeof categoryDisplayNames] || item.category}
                    </span>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-amber-400 hover:text-amber-300 text-sm font-semibold border border-amber-400/30 hover:border-amber-400 px-3 py-1 transition-all duration-200"
                    >
                      Order Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Utensils className="text-amber-400/50 mx-auto mb-6" size={64} />
            <h3 className="text-2xl font-semibold text-amber-400 mb-4">
              No items available
            </h3>
            <p className="text-cream/70 text-lg mb-8">
              {selectedCategory === 'all' 
                ? 'Our menu is being updated. Please check back soon.'
                : `No items found in the ${categoryDisplayNames[selectedCategory as keyof typeof categoryDisplayNames] || selectedCategory} category.`
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 font-semibold transition-colors"
              >
                View All Items
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Menu;
