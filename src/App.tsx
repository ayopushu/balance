import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Balance } from "./pages/Balance";
import { Plan } from "./pages/Plan";
import { Profile } from "./pages/Profile";
import { initializeApp } from "./store";
import { useEffect } from "react";
import { BottomNavigation } from "./components/BottomNavigation";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-balance-background pb-20">
            <Routes>
              <Route path="/" element={<Balance />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
            <BottomNavigation />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
