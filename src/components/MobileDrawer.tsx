import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { useSwipe } from '@/hooks/use-swipe';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'bottom';
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ 
  isOpen, 
  onClose, 
  position = 'right',
  children,
  title,
  showCloseButton = true,
  closeOnBackdropClick = true
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close drawer when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  // Handle swipe to close
  const { handlers: swipeHandlers } = useSwipe({
    threshold: 80,
    onSwipeRight: position === 'left' ? onClose : undefined,
    onSwipeLeft: position === 'right' ? onClose : undefined,
    onSwipeDown: position === 'bottom' ? onClose : undefined,
  });
  
  // Dynamic variants based on position
  const drawerVariants = {
    hidden: {
      x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
      y: position === 'bottom' ? '100%' : 0,
    },
    visible: {
      x: 0,
      y: 0,
    },
    exit: {
      x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
      y: position === 'bottom' ? '100%' : 0,
    }
  };
  
  // Handle drag to close
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (position === 'right' && info.offset.x > 100) {
      onClose();
    } else if (position === 'left' && info.offset.x < -100) {
      onClose();
    } else if (position === 'bottom' && info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={closeOnBackdropClick ? onClose : undefined}
          />

          {/* Drawer */}
          <motion.div
            ref={contentRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={drawerVariants}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag={position === 'bottom' ? 'y' : position === 'right' || position === 'left' ? 'x' : undefined}
            dragDirectionLock
            dragElastic={0.2}
            dragConstraints={{ 
              top: 0, 
              left: position === 'right' ? -15 : 0, 
              right: position === 'left' ? 15 : 0,
              bottom: position === 'bottom' ? 15 : 0
            }}
            onDragEnd={handleDragEnd}
            {...swipeHandlers}
            className={`fixed z-50 shadow-xl shadow-black/30 bg-charcoal ${
              position === 'bottom' 
                ? 'left-0 right-0 bottom-0 rounded-t-2xl max-h-[90vh] overflow-y-auto'
                : position === 'right'
                  ? 'top-0 right-0 h-full w-[85%] max-w-sm border-l border-amber-600/20'
                  : 'top-0 left-0 h-full w-[85%] max-w-sm border-r border-amber-600/20'
            } safe-area-bottom ios-momentum-scroll`}
          >
            {/* Drag indicator for bottom drawer */}
            {position === 'bottom' && (
              <div className="w-full flex justify-center py-2">
                <div className="w-12 h-1 bg-amber-400/30 rounded-full"></div>
              </div>
            )}
          
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-amber-600/20">
              <h2 className="text-xl font-serif font-bold text-amber-400">
                {title || 'Menu'}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-amber-600/10 text-amber-400 touch-target"
                  aria-label="Close drawer"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100%-70px)] p-4 mobile-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
