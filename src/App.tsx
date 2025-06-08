import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import { useEffect } from "react";
import TitleBar from "@/components/TitleBar";
import Footer from './components/Footer';
import MobileReservationFAB from './components/MobileReservationFAB';
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery";
import Reservations from "./pages/Reservations";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from "./pages/NotFound";
import PreOrders from "./pages/PreOrders";

// Initialize QueryClient for React Query
const queryClient = new QueryClient();

// ScrollToTop component to handle scroll restoration
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Mobile viewport handling for iOS
const setVPHeightVariable = () => {
  // Set a CSS variable based on the viewport height to handle iOS Safari toolbar behavior
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

const App = () => {
  const [user, loading] = useAuthState(auth);
  
  // Handle viewport height for mobile devices
  useEffect(() => {
    // Initial set
    setVPHeightVariable();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setVPHeightVariable);
    window.addEventListener('orientationchange', setVPHeightVariable);
    
    return () => {
      window.removeEventListener('resize', setVPHeightVariable);
      window.removeEventListener('orientationchange', setVPHeightVariable);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-amber-400 text-2xl font-serif flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-400 rounded-full animate-spin mb-4"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={700}>
        <div className="min-h-screen bg-charcoal text-cream">
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/admin/*" element={
                user ? <AdminDashboard /> : <AdminLogin />
              } />
              <Route path="/*" element={
                <>
                  <TitleBar />
                  <div className="pb-16 md:pb-0 safe-area-bottom"> {/* Add bottom padding for mobile navigation */}
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/menu" element={<Menu />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/reservations" element={<Reservations />} />
                      <Route path="/preorders" element={<PreOrders />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <MobileReservationFAB />
                  <Footer />
                </>
              } />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner position="top-center" />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
