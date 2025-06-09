import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, X, Phone, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import LuxuryReservationModal from './reservation/LuxuryReservationModal';

const MobileReservationFAB = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const location = useLocation();
  
  // Don't render on desktop or on the reservations page
  if (!isMobile || location.pathname === '/reservations') return null;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle opening the reservation modal
  const openReservationModal = () => {
    setIsModalOpen(true);
    setIsExpanded(false);
  };

  // Add scrollToTop behavior
  const handleNavigation = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setIsExpanded(false);
  };

  const fabActions = [
    { 
      icon: CalendarCheck, 
      label: 'Reserve Table', 
      color: 'bg-amber-600',
      action: openReservationModal
    },
    { 
      icon: Clock, 
      label: 'Pre-Order', 
      color: 'bg-amber-700',
      path: '/preorders' 
    },
    { 
      icon: Phone, 
      label: 'Call Us', 
      color: 'bg-amber-800',
      path: 'tel:+15551234567',
      isExternal: true
    }
  ];

  return (
    <>
      <div className="fixed right-6 bottom-20 z-50">
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="flex flex-col-reverse gap-3 mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ staggerChildren: 0.1, staggerDirection: -1 }}
            >
              {fabActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  className="flex items-center gap-3"
                >
                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-black/90 backdrop-blur-sm text-cream text-sm font-medium py-2 px-4 rounded-full shadow-lg"
                  >
                    {action.label}
                  </motion.div>
                  
                  {/* Button */}
                  {action.isExternal ? (
                    <a
                      href={action.path}
                      className={`${action.color} rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-amber-900/30 text-black`}
                    >
                      <action.icon size={20} />
                    </a>
                  ) : action.action ? (
                    <button
                      onClick={action.action}
                      className={`${action.color} rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-amber-900/30 text-black`}
                    >
                      <action.icon size={20} />
                    </button>
                  ) : (
                    <Link
                      to={action.path as string}
                      className={`${action.color} rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-amber-900/30 text-black`}
                      onClick={handleNavigation}
                    >
                      <action.icon size={20} />
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleExpand}
          className="bg-amber-500 hover:bg-amber-600 text-black rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-amber-900/30"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isExpanded ? <X size={24} /> : <CalendarCheck size={24} />}
          </motion.div>
        </motion.button>
      </div>

      {/* Reservation Modal */}
      <LuxuryReservationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default MobileReservationFAB;
