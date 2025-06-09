import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, UtensilsCrossed, ImageIcon, Calendar, Info, Phone, ShoppingBag, Sparkles } from 'lucide-react';
import { useScrollTop } from '@/hooks/use-scroll-top';
import LuxuryReservationModal from './reservation/LuxuryReservationModal';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const location = useLocation();
  
  // Apply scroll to top hook
  useScrollTop();
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle opening reservation modal
  const handleReservation = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsReservationModalOpen(true);
    setIsOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/menu', label: 'Menu', icon: <UtensilsCrossed size={20} /> },
    { path: '/gallery', label: 'Gallery', icon: <ImageIcon size={20} /> },
    { path: '/reservations', label: 'Reservations', icon: <Calendar size={20} />, onClick: handleReservation },
    { path: '/preorders', label: 'Pre-Orders', icon: <ShoppingBag size={20} /> },
    { path: '/about', label: 'About', icon: <Info size={20} /> },
    { path: '/contact', label: 'Contact', icon: <Phone size={20} /> },
  ];

  return (
    <>
      {/* Desktop Navigation - hidden on mobile */}
      <nav className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 
        ${scrolled ? 'border-b border-amber-600/20 shadow-lg shadow-amber-900/10' : 'border-b border-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="relative flex flex-col items-start">
              <Link to="/" className="flex items-center gap-2 text-3xl font-serif font-bold text-amber-400 hover:text-amber-300 transition-colors">
                <Sparkles className="lucide lucide-sparkles text-gold drop-shadow-glow" />
                Reeves
              </Link>
              <div className="w-32 h-1 mt-1 rounded-full bg-gradient-to-r from-gold via-amber-400 to-yellow-300 shadow-amber-400/40 shadow-md"></div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex space-x-8">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    className="relative text-cream hover:text-amber-400 transition-colors duration-300 font-medium"
                  >
                    {item.label}
                    {isActive && (
                      <motion.div 
                        layoutId="navbar-indicator"
                        className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-amber-400" 
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden text-amber-400 hover:text-amber-300 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md z-40 border-t border-amber-800/30">
        <div className="flex justify-around items-center py-3 px-2">
          {navItems.slice(0, 5).map((link) => {
            if (link.path === '/reservations') {
              return (
                <button
                  key={link.path}
                  onClick={handleReservation}
                  className={`flex flex-col items-center justify-center text-xs p-1 rounded-lg transition-colors 
                    ${location.pathname === link.path ? "text-amber-400" : "text-cream/70 hover:text-amber-300"}`}
                >
                  {link.icon}
                  <span className="mt-1">{link.label}</span>
                </button>
              );
            }
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center text-xs p-1 rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? "text-amber-400"
                    : "text-cream/70 hover:text-amber-300"
                }`}
              >
                {link.icon}
                <span className="mt-1">{link.label}</span>
                {location.pathname === link.path && (
                  <motion.div
                    className="absolute bottom-0 h-0.5 w-8 bg-amber-400"
                    layoutId="mobileCaret"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center justify-center text-xs p-1 rounded-lg text-cream/70 hover:text-amber-300"
          >
            <Menu size={20} />
            <span className="mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-amber-800/30">
            <div>
              <Link 
                to="/" 
                onClick={() => setIsOpen(false)}
                className="text-3xl font-serif font-bold text-amber-400"
              >
                Reeves
              </Link>
              <div className="text-sm text-cream/60">Fine Dining</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-amber-400 hover:text-amber-300 rounded-lg p-2"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="grid grid-cols-2 gap-4">
              {navItems.map((link) => {
                if (link.path === '/reservations') {
                  return (
                    <button
                      key={link.path}
                      onClick={handleReservation}
                      className={`flex items-center gap-3 p-4 rounded-lg 
                        ${location.pathname === link.path ? "bg-amber-500/20 text-amber-400" : "text-cream hover:bg-amber-300/10"}`}
                    >
                      {link.icon}
                      <span className="font-medium">{link.label}</span>
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-lg ${
                      location.pathname === link.path
                        ? "bg-amber-500/20 text-amber-400"
                        : "text-cream hover:bg-amber-300/10"
                    }`}
                  >
                    {link.icon}
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleReservation}
                className="col-span-2 mt-4 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-medium py-3 px-4 rounded-lg"
              >
                <Calendar size={18} />
                <span>Make a Reservation</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reservation Modal */}
      <LuxuryReservationModal 
        isOpen={isReservationModalOpen} 
        onClose={() => setIsReservationModalOpen(false)} 
      />
    </>
  );
};

export default Navigation;
