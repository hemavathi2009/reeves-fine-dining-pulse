import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import MenuManager from './MenuManager';
import GalleryManager from './GalleryManager';
import ReservationManager from './ReservationManager';
import ContactManager from './ContactManager';
import AboutManager from './AboutManager';
import AdminPreOrders from '../../AdminPreOrders';
import { useScrollTop } from '@/hooks/use-scroll-top';
import { useMediaQuery } from '@/hooks/use-media-query';
import { 
  Menu as MenuIcon, X, LogOut, Utensils, Image, CalendarCheck,
  ShoppingCart, BookOpen, Mail, ChevronRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Apply scroll to top effect when changing tabs
  useScrollTop();

  // Close sidebar when switching tabs on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [activeTab, isMobile]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen, isMobile]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const tabs = [
    { id: 'menu', label: 'Menu Management', icon: <Utensils size={20} /> },
    { id: 'gallery', label: 'Gallery', icon: <Image size={20} /> },
    { id: 'reservations', label: 'Reservations', icon: <CalendarCheck size={20} /> },
    { id: 'preorders', label: 'Pre-Orders', icon: <ShoppingCart size={20} /> },
    { id: 'about', label: 'About Page', icon: <BookOpen size={20} /> },
    { id: 'contacts', label: 'Contacts', icon: <Mail size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <header className="bg-black border-b border-amber-600/20 p-4 md:p-6 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-amber-400 p-1"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-3xl font-serif font-bold text-amber-400">Reeves</h1>
              <p className="text-cream/70 text-sm md:text-base">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 md:px-6 md:py-3 font-medium md:font-semibold transition-colors flex items-center gap-2 text-sm md:text-base"
          >
            <LogOut size={isMobile ? 16 : 20} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobile && isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-10"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside 
          className={`${
            isMobile 
              ? `fixed top-[69px] left-0 bottom-0 z-20 w-[80%] max-w-[300px] transition-transform duration-300 ease-in-out ${
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }` 
              : 'w-72 min-h-[calc(100vh-89px)] sticky top-[89px]'
          } bg-black/30 border-r border-amber-600/20 p-4 md:p-6 overflow-y-auto`}
        >
          <nav className="space-y-1 md:space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 md:px-6 md:py-4 text-left transition-all duration-300 font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-black'
                    : 'text-cream hover:bg-amber-600/20 hover:text-amber-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <span className="text-base md:text-lg">{tab.label}</span>
                </div>
                {isMobile && <ChevronRight size={16} className={activeTab === tab.id ? 'text-black' : 'text-amber-400/50'} />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pb-16" // Add bottom padding for better mobile scrolling
          >
            {activeTab === 'menu' && <MenuManager />}
            {activeTab === 'gallery' && <GalleryManager />}
            {activeTab === 'reservations' && <ReservationManager />}
            {activeTab === 'preorders' && <AdminPreOrders />}
            {activeTab === 'about' && <AboutManager />}
            {activeTab === 'contacts' && <ContactManager />}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
