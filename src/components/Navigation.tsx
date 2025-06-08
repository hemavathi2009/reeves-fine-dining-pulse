import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Sparkles, Home, UtensilsCrossed, 
  Image, CalendarCheck, UserCircle, Phone, Clock, Info
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Navigation items
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Menu', path: '/menu', icon: UtensilsCrossed },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'Reservations', path: '/reservations', icon: CalendarCheck },
    { name: 'Pre-Orders', path: '/preorders', icon: Clock },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone }
  ];

  // Mobile bottom nav - fewer items
  const mobileNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Menu', path: '/menu', icon: UtensilsCrossed },
    { name: 'Book', path: '/reservations', icon: CalendarCheck },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'About', path: '/about', icon: Info },
  ];

  // Track scroll for transparent to solid header transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop & Mobile Header Navigation */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-black/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-amber-600/20" 
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Brand with icon and accent */}
            <div className="relative flex flex-col items-start">
              <Link to="/" className="flex items-center gap-2 text-3xl font-serif font-bold text-amber-400 hover:text-amber-300 transition-colors">
                <Sparkles size={32} className="text-gold drop-shadow-glow" />
                Reeves
              </Link>
              {/* Gold gradient accent bar */}
              <div className="w-24 h-1 mt-1 rounded-full bg-gradient-to-r from-gold via-amber-400 to-yellow-300 shadow-amber-400/40 shadow-md" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative text-cream hover:text-amber-400 transition-colors duration-300 font-medium"
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-amber-400"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Toggle - hide on larger screens and when bottom nav is shown */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden text-amber-400 hover:text-amber-300 transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Slide-Down Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="lg:hidden overflow-hidden bg-black/95 backdrop-blur-md rounded-b-xl mt-4 border-t border-amber-600/10"
              >
                <div className="py-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 py-3 px-4 text-lg font-medium transition-all duration-300",
                        location.pathname === item.path
                          ? "text-amber-400 bg-amber-400/10 border-l-2 border-amber-400"
                          : "text-cream hover:text-amber-400 hover:bg-amber-400/5 border-l-2 border-transparent"
                      )}
                    >
                      <item.icon size={18} />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Bottom Tab Navigation */}
      {isMobile && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-amber-600/20 shadow-lg shadow-black/30"
        >
          <div className="flex justify-around items-center h-16">
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center w-full h-full"
                >
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -4 : 0 
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center",
                      isActive ? "text-amber-400" : "text-cream/70"
                    )}
                  >
                    <item.icon size={20} />
                    <span className="text-xs mt-1 font-medium">{item.name}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="mobile-nav-indicator"
                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-amber-400"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </>
  );
};

export default Navigation;
