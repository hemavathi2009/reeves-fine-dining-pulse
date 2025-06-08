import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import { useEffect } from "react";
import Navigation from './components/Navigation';
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
import TitleBar from "@/components/TitleBar";

const queryClient = new QueryClient();

// ScrollToTop component to handle scroll restoration
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-amber-400 text-2xl font-serif">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-charcoal text-cream">
          <ScrollToTop />
          <TitleBar /> {/* Title Bar appears on all pages */}
          <Routes>
            <Route path="/admin" element={
              user ? <AdminDashboard /> : <AdminLogin />
            } />
            <Route path="/*" element={
              <>
                <Navigation />
                <div className="pb-16 md:pb-0"> {/* Add bottom padding for mobile navigation */}
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
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
