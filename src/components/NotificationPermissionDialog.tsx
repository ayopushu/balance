/**
 * Notification Permission Dialog - First-time notification request
 * Shows once when app is first opened to request notification permission
 */

import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBalanceStore } from '@/store';
import { useToast } from '@/hooks/use-toast';

interface NotificationPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPermissionDialog: React.FC<NotificationPermissionDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { updateSettings } = useBalanceStore();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleAllow = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not supported",
        description: "Notifications are not supported on this browser.",
        variant: "destructive"
      });
      onClose();
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        updateSettings({ notificationsEnabled: true });
        toast({
          title: "Notifications enabled",
          description: "You'll receive task reminders when they're due."
        });
      } else {
        updateSettings({ notificationsEnabled: false });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive"
      });
    }

    onClose();
  };

  const handleMaybeLater = () => {
    updateSettings({ notificationsEnabled: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-balance-surface border border-balance-surface-elevated rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-health/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-health" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-balance-text-primary mb-2">
            Stay on Track with Task Reminders
          </h2>

          {/* Description */}
          <p className="text-balance-text-secondary text-sm mb-6">
            Get notified when your scheduled tasks are ready to start. You can change this anytime in Settings.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAllow}
              className="w-full bg-health hover:bg-health/90 text-white rounded-lg py-3 font-medium"
            >
              Allow Notifications
            </Button>

            <Button
              onClick={handleMaybeLater}
              variant="ghost"
              className="w-full text-balance-text-muted hover:text-balance-text-primary hover:bg-balance-surface-elevated rounded-lg py-3"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
