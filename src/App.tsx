import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
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

const queryClient = new QueryClient();

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
          <Routes>
            <Route path="/admin" element={
              user ? <AdminDashboard /> : <AdminLogin />
            } />
            <Route path="/*" element={
              <>
                <Navigation />
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
