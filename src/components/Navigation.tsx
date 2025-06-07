import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reservations', path: '/reservations' },
    { name: 'Pre-Orders', path: '/preorders' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-amber-600/20 shadow-lg shadow-amber-900/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Brand with icon and accent */}
          <div className="relative flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 text-3xl font-serif font-bold text-amber-400 hover:text-amber-300 transition-colors">
              <Sparkles size={32} className="text-gold drop-shadow-glow" />
              Reeves Dining
            </Link>
            {/* Gold gradient accent bar */}
            <div className="w-32 h-1 mt-1 rounded-full bg-gradient-to-r from-gold via-amber-400 to-yellow-300 shadow-amber-400/40 shadow-md" />
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

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden text-amber-400 hover:text-amber-300 transition-colors"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="pt-4 pb-2 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 px-4 text-lg font-medium transition-all duration-300 border-l-4 ${
                  location.pathname === item.path
                    ? 'text-amber-400 border-amber-400 bg-amber-400/10'
                    : 'text-cream hover:text-amber-400 border-transparent hover:border-amber-400/50 hover:bg-amber-400/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navigation;
