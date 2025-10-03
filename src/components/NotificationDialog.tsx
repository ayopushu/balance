/**
 * First-time notification permission dialog
 */

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBalanceStore } from '@/store';
import { useToast } from '@/hooks/use-toast';

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDialog = ({ isOpen, onClose }: NotificationDialogProps) => {
  const { updateSettings } = useBalanceStore();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleAllow = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not supported",
        description: "Notifications not available on this browser."
      });
      onClose();
      return;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      updateSettings({ notificationsEnabled: true });
      toast({
        title: "Notifications enabled",
        description: "You'll receive task reminders."
      });
    }

    onClose();
  };

  const handleNotNow = () => {
    updateSettings({ notificationsEnabled: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-balance-surface border border-balance-surface-elevated rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-health/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-health" />
          </div>

          <h2 className="text-xl font-bold text-balance-text-primary mb-2">
            Allow Notifications?
          </h2>

          <p className="text-balance-text-secondary text-sm mb-6">
            Get reminded when your tasks start. You can change this anytime in Settings.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleAllow}
              className="w-full bg-health hover:bg-health/90 text-white rounded-lg py-3"
            >
              Allow
            </Button>

            <Button
              onClick={handleNotNow}
              variant="ghost"
              className="w-full text-balance-text-muted hover:text-balance-text-primary"
            >
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
