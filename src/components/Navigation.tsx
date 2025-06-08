import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Sparkles } from 'lucide-react';
import { useScrollTop } from '@/hooks/use-scroll-top';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/reservations', label: 'Reservations' },
    { path: '/preorders', label: 'Pre-Orders' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
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
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-2">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block py-3 px-4 text-lg font-medium transition-all duration-300 border-l-4 
                        ${isActive 
                          ? 'text-amber-400 border-amber-400 bg-amber-400/10' 
                          : 'text-cream hover:text-amber-400 border-transparent hover:border-amber-400/50 hover:bg-amber-400/5'
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
