
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import Navigation from './components/Navigation';
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-amber-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
