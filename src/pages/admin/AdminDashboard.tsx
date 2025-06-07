
import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { motion } from 'framer-motion';
import MenuManager from './MenuManager';
import GalleryManager from './GalleryManager';
import ReservationManager from './ReservationManager';
import ContactManager from './ContactManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('menu');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const tabs = [
    { id: 'menu', label: 'Menu Management', icon: '🍽️' },
    { id: 'gallery', label: 'Gallery', icon: '📸' },
    { id: 'reservations', label: 'Reservations', icon: '📅' },
    { id: 'contacts', label: 'Contacts', icon: '📧' },
  ];

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <header className="bg-black border-b border-amber-600/20 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-amber-400">Reeves Dining</h1>
            <p className="text-cream/70">Admin Dashboard</p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-black/30 border-r border-amber-600/20 min-h-screen p-6">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-4 px-6 py-4 text-left transition-all duration-300 font-medium ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-black'
                    : 'text-cream hover:bg-amber-600/20 hover:text-amber-400'
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span className="text-lg">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'menu' && <MenuManager />}
            {activeTab === 'gallery' && <GalleryManager />}
            {activeTab === 'reservations' && <ReservationManager />}
            {activeTab === 'contacts' && <ContactManager />}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
