import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import LuxuryReservationModal from '../reservation/LuxuryReservationModal';

interface ReservationButtonProps {
  variant?: 'default' | 'outline' | 'icon';
  size?: 'default' | 'large' | 'small';
  className?: string;
}

const ReservationButton: React.FC<ReservationButtonProps> = ({ 
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => {
    // Play click sound when opening modal
    const clickSound = new Audio('/sounds/button-click.mp3');
    clickSound.volume = 0.2;
    clickSound.play().catch(err => console.log('Audio play failed:', err));
    
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Button styles based on variant and size
  const getButtonStyles = () => {
    let styles = '';
    
    // Variant styles
    if (variant === 'default') {
      styles += 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black shadow-lg shadow-amber-900/20 ';
    } else if (variant === 'outline') {
      styles += 'border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black ';
    } else if (variant === 'icon') {
      styles += 'bg-black/50 backdrop-blur-sm border border-amber-600/30 text-amber-400 hover:bg-amber-600/20 hover:border-amber-400 ';
    }
    
    // Size styles
    if (size === 'default') {
      styles += 'px-6 py-3 text-base ';
    } else if (size === 'large') {
      styles += 'px-8 py-4 text-lg ';
    } else if (size === 'small') {
      styles += 'px-4 py-2 text-sm ';
    }
    
    // Common styles
    styles += 'rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ';
    
    return styles + className;
  };
  
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={openModal}
        className={getButtonStyles()}
      >
        <Calendar size={variant === 'icon' ? 20 : 16} />
        {variant !== 'icon' && <span>Reserve a Table</span>}
      </motion.button>
      
      <LuxuryReservationModal 
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default ReservationButton;
