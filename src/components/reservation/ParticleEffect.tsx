import React from 'react';
import { motion } from 'framer-motion';

const ParticleEffect: React.FC = () => {
  return (
    <div className="particles-container absolute inset-0 pointer-events-none overflow-hidden">
      {/* Ambient glow background */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
        <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-br from-amber-500/5 to-transparent opacity-80 blur-[100px]"></div>
      </div>
      
      {Array.from({ length: 30 }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1.5 h-1.5 rounded-full bg-amber-400/20 absolute"
          style={{ 
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5
          }}
          initial={{ 
            opacity: Math.random() * 0.5 + 0.2
          }}
          animate={{ 
            y: [null, Math.random() * -40 - 10],
            opacity: [null, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 8 + 8,
            delay: Math.random() * 5
          }}
        />
      ))}
      
      {/* Additional larger brighter particles */}
      {Array.from({ length: 10 }).map((_, index) => (
        <motion.div
          key={`bright-${index}`}
          className="w-3 h-3 rounded-full bg-amber-400/30 absolute filter blur-[1px]"
          style={{ 
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          initial={{ 
            opacity: Math.random() * 0.7 + 0.3
          }}
          animate={{ 
            y: [null, Math.random() * -60 - 20],
            opacity: [null, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 10 + 15,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;
