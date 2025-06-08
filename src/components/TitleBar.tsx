import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, LogOut, Sparkles } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const TitleBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [user] = useAuthState(auth);

  // Navigation links
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "Gallery", path: "/gallery" },
    { name: "Reservations", path: "/reservations" },
    { name: "Pre-Orders", path: "/preorders" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Detect scroll to add background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 
      border-b ${scrolled ? "border-amber-600/20" : "border-transparent"}
      ${scrolled 
          ? "bg-gradient-to-r from-black/95 via-charcoal/90 to-black/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.3)]" 
          : "bg-gradient-to-r from-black/10 to-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="relative flex flex-col items-start">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-3xl font-serif font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Sparkles className="text-gold drop-shadow-[0_0_8px_rgba(255,194,70,0.5)]" />
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 text-transparent bg-clip-text">Reeves</span>
            </Link>
            <div className="w-32 h-1 mt-1 rounded-full bg-gradient-to-r from-gold/80 via-amber-400 to-yellow-300 shadow-amber-400/40 shadow-md"></div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-cream hover:text-amber-400 transition-colors duration-300 font-medium group"
              >
                {link.name}
                <motion.div 
                  className={`absolute bottom-[-4px] left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 transform origin-left ${
                    location.pathname === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-75"
                  } transition-transform duration-300`}
                ></motion.div>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu (only shown when isMenuOpen is true) */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden bg-gradient-to-b from-black/95 via-charcoal/95 to-black/90 backdrop-blur-md border-t border-amber-600/20"
        >
          <div className="container mx-auto px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 text-lg font-medium ${
                  location.pathname === link.path
                    ? "text-gradient bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent" 
                    : "text-cream hover:text-amber-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* User account options for mobile */}
            {user ? (
              <div className="pt-4 mt-4 border-t border-amber-600/20">
                <div className="flex items-center gap-3 text-cream mb-4">
                  <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-1.5 rounded-full">
                    <User className="text-black" size={18} />
                  </div>
                  <div>
                    <div className="font-medium">{user.displayName || 'Account'}</div>
                    <div className="text-xs text-cream/70">{user.email}</div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-amber-600/30 bg-gradient-to-r from-amber-600/10 to-transparent text-amber-400 hover:bg-amber-600/20"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block mt-4 pt-4 border-t border-amber-600/20 text-amber-400 font-medium hover:text-gradient hover:bg-gradient-to-r from-amber-400 to-yellow-300 hover:bg-clip-text hover:text-transparent transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default TitleBar;
