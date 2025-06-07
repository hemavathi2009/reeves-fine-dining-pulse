
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      
      setMenuItems(items);
      
      const uniqueCategories = ['all', ...new Set(items.map(item => item.category))];
      setCategories(uniqueCategories);
    });

    return unsubscribe;
  }, []);

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-charcoal pt-20">
      <div className="container mx-auto px-6 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center text-amber-400 mb-8"
        >
          Our Menu
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-cream text-lg mb-12 max-w-2xl mx-auto"
        >
          Discover our carefully curated selection of dishes, each crafted with the finest ingredients
        </motion.p>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 font-semibold transition-all duration-300 capitalize ${
                selectedCategory === category
                  ? 'bg-amber-600 text-black'
                  : 'bg-transparent text-amber-400 border border-amber-400 hover:bg-amber-400 hover:text-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/30 backdrop-blur-sm border border-amber-600/20 p-6 hover:border-amber-600/40 transition-all duration-300"
            >
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-48 object-cover mb-4"
                />
              )}
              <h3 className="text-xl font-semibold text-amber-400 mb-2">{item.name}</h3>
              <p className="text-cream mb-4">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold text-lg">${item.price}</span>
                <span className="text-sm text-cream/70 capitalize">{item.category}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center text-cream py-12">
            <p className="text-lg">No menu items available for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
