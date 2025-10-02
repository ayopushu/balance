import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Balance } from "./pages/Balance";
import { Plan } from "./pages/Plan";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Analytics } from "./pages/Analytics";
import { BottomNavigation } from "./components/BottomNavigation";
import { OnboardingDialog } from "./components/OnboardingDialog";
import { NotificationPermissionDialog } from "./components/NotificationPermissionDialog";
import { useBalanceStore } from "./store";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const { settings, completeOnboarding } = useBalanceStore();
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  // Show notification permission dialog after onboarding is complete
  useEffect(() => {
    if (!settings.isFirstTime) {
      // Check if we should show notification dialog
      const hasAskedForNotifications = localStorage.getItem('hasAskedForNotifications');
      
      if (!hasAskedForNotifications) {
        // Small delay to let the UI settle after onboarding
        const timer = setTimeout(() => {
          setShowNotificationDialog(true);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [settings.isFirstTime]);

  const handleNotificationDialogClose = () => {
    setShowNotificationDialog(false);
    localStorage.setItem('hasAskedForNotifications', 'true');
  };

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
              <Route path="/settings" element={<Settings />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
            <BottomNavigation />
            
            {/* Onboarding Dialog */}
            <OnboardingDialog
              isOpen={settings.isFirstTime}
              onComplete={completeOnboarding}
            />
            
            {/* Notification Permission Dialog */}
            <NotificationPermissionDialog 
              isOpen={showNotificationDialog}
              onClose={handleNotificationDialogClose}
            />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;