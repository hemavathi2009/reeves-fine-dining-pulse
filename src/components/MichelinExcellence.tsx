import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, ChefHat, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MichelinExcellence: React.FC = () => {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 w-full h-full bg-fixed bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
        }}
      />
      
      {/* Multiple Overlay Layers for Better Readability */}
      <div className="absolute inset-0 bg-black/50 opacity-100"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="text-amber-400 drop-shadow-glow" 
                  size={20}
                  fill="currentColor" 
                />
              ))}
            </div>
            <span className="text-amber-400 font-medium tracking-wide">MICHELIN STARRED</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-serif font-bold text-white mb-6"
          >
            Recognized for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Culinary Excellence</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-cream/90 mb-8 leading-relaxed"
          >
            Our commitment to exceptional quality and innovation has earned us prestigious 
            Michelin recognition since 2018. Each dish represents our passion for perfection 
            and dedication to crafting memorable dining experiences.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              to="/about" 
              className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-black font-bold transition-all duration-300 rounded-md flex items-center justify-center gap-2 group"
            >
              Our Philosophy
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
            
            <Link 
              to="/reservations" 
              className="px-8 py-4 border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-bold transition-all duration-300 rounded-md flex items-center justify-center"
            >
              Reserve Your Table
            </Link>
          </motion.div>
        </div>
        
        {/* Michelin Award Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          viewport={{ once: true }}
          className="absolute bottom-[-30px] right-[10%] hidden lg:block"
        >
          <div className="relative">
            <div className="w-36 h-36 rounded-full bg-amber-600 flex items-center justify-center shadow-2xl shadow-amber-900/40">
              <div className="w-32 h-32 rounded-full bg-black/80 flex items-center justify-center border-2 border-amber-400">
                <div className="flex flex-col items-center">
                  <Award className="text-amber-400" size={36} />
                  <span className="text-amber-400 font-serif text-lg font-bold mt-1">MICHELIN</span>
                  <div className="flex">
                    <Star className="text-amber-400" size={14} fill="currentColor" />
                  </div>
                  <span className="text-cream text-xs mt-1">SINCE 2018</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MichelinExcellence;
