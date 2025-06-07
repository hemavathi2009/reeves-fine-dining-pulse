
import React from 'react';
import Hero from '../components/Hero';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="min-h-screen bg-charcoal">
      <Hero />
      
      {/* About Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl font-bold text-amber-400 mb-6">Our Story</h2>
              <p className="text-cream text-lg leading-relaxed mb-6">
                For over two decades, Reeves Dining has been a beacon of culinary excellence, 
                crafting unforgettable experiences through innovative cuisine and impeccable service.
              </p>
              <p className="text-cream text-lg leading-relaxed">
                Our award-winning chefs source the finest ingredients to create dishes that 
                celebrate both tradition and creativity, ensuring every meal is a masterpiece.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Restaurant interior"
                className="w-full h-96 object-cover shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-black/30">
        <div className="container mx-auto max-w-6xl">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center text-amber-400 mb-16"
          >
            Experience Excellence
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Michelin Standards",
                description: "Every dish crafted with precision and passion",
                icon: "⭐"
              },
              {
                title: "Seasonal Menu",
                description: "Fresh ingredients sourced from local farms",
                icon: "🌱"
              },
              {
                title: "Wine Pairing",
                description: "Curated selection of world-class wines",
                icon: "🍷"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center p-8 bg-charcoal/50 backdrop-blur-sm border border-amber-600/20 hover:border-amber-600/40 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-amber-400 mb-4">{feature.title}</h3>
                <p className="text-cream">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
