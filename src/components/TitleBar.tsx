import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, LogOut, Sparkles } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

const TitleBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [user] = useAuthState(auth);
  
  // Use media query to detect smaller phones
  const isSmallPhone = useMediaQuery("(max-width: 360px)");
  
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

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
      border-b ${scrolled ? "border-amber-600/20" : "border-transparent"}
      ${scrolled ? "bg-gradient-to-r from-black/95 via-charcoal/95 to-black/95 backdrop-blur-md shadow-lg" : ""}`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <div className="relative flex flex-col items-start">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-2xl sm:text-3xl font-serif font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Sparkles className="lucide lucide-sparkles lucide lucide-sparkles text-gold drop-shadow-glow" />
              Reeves
            </Link>
            <div className="w-24 sm:w-32 h-1 mt-1 rounded-full bg-gradient-to-r from-gold via-amber-400 to-yellow-300 shadow-amber-400/40 shadow-md"></div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-cream hover:text-amber-400 transition-colors duration-300 font-medium touch-target"
              >
                {link.name}
                {location.pathname === link.path && (
                  <div 
                    className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-amber-400"
                    style={{ opacity: 1 }}
                  ></div>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-amber-400 hover:text-amber-300 transition-colors p-2 touch-target"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <Menu size={28} />
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div 
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className={`absolute top-[58px] sm:top-[72px] right-0 bottom-0 left-0 bg-gradient-to-b from-black/95 to-charcoal/95 transform transition-transform duration-300 overflow-y-auto ios-momentum-scroll safe-area-bottom ${
            isMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="container mx-auto px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between py-3 text-lg font-medium border-b border-amber-600/20 touch-target ${
                  location.pathname === link.path
                    ? "text-amber-400" 
                    : "text-cream hover:text-amber-400"
                } tap-highlight`}
              >
                {link.name}
                <div className={`w-2 h-2 rounded-full ${location.pathname === link.path ? "bg-amber-400" : "bg-transparent"}`} />
              </Link>
            ))}
            
            {/* User account options for mobile */}
            {user ? (
              <div className="pt-6 mt-4 border-t border-amber-600/20">
                <div className="flex items-center gap-3 text-cream mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-600/30 rounded-full flex items-center justify-center">
                    <User className="text-amber-400" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.displayName || 'Account'}</div>
                    <div className="text-xs text-cream/70 truncate">{user.email}</div>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-amber-600/30 text-amber-400 hover:bg-amber-600/10 py-6 touch-target"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex justify-center items-center mt-6 pt-6 border-t border-amber-600/20 text-amber-400 font-medium bg-amber-600/20 rounded-lg py-3 hover:bg-amber-600/30 transition-colors touch-target"
              >
                Sign In
              </Link>
            )}
            
            {/* Safe Area Spacer */}
            <div className="h-[var(--safe-area-inset-bottom)]"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TitleBar;
