
import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80')`
        }}
      />
      
      <div className="relative z-10 text-center text-white max-w-4xl px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold mb-6 text-amber-400"
        >
          Reeves Dining
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-xl md:text-2xl mb-8 text-cream leading-relaxed"
        >
          An extraordinary culinary journey where tradition meets innovation
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="space-x-4"
        >
          <button className="bg-amber-600 hover:bg-amber-700 text-black px-8 py-3 font-semibold transition-all duration-300 hover:scale-105">
            Make Reservation
          </button>
          <button className="border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-3 font-semibold transition-all duration-300">
            View Menu
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
