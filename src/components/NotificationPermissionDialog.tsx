/**
 * Notification Permission Dialog - First-time notification setup
 * Shown once after onboarding to request notification permission
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBalanceStore } from '@/store';
import { useToast } from '@/hooks/use-toast';

interface NotificationPermissionDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const NotificationPermissionDialog: React.FC<NotificationPermissionDialogProps> = ({
  isOpen,
  onComplete,
}) => {
  const { updateSettings } = useBalanceStore();
  const { toast } = useToast();

  const handleAllowNotifications = async () => {
    console.log('🔔 Allow Notifications clicked');
    
    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported');
      toast({
        title: "Not supported",
        description: "Notifications are not supported on this device.",
        variant: "destructive",
      });
      updateSettings({ 
        hasSeenNotificationPrompt: true,
        notificationsEnabled: false 
      });
      onComplete();
      return;
    }

    try {
      console.log('📋 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('📋 Permission result:', permission);
      
      if (permission === 'granted') {
        console.log('✅ Permission granted, updating state...');
        updateSettings({ 
          hasSeenNotificationPrompt: true,
          notificationsEnabled: true
        });
        console.log('✅ State updated successfully');
        
        toast({
          title: "Notifications enabled!",
          description: "You'll be reminded about your tasks at their scheduled time.",
        });
      } else if (permission === 'denied') {
        console.log('❌ Permission denied');
        updateSettings({ 
          hasSeenNotificationPrompt: true,
          notificationsEnabled: false
        });
        
        toast({
          title: "Notifications blocked",
          description: "You can enable them later in Settings.",
          variant: "destructive",
        });
      } else {
        console.log('⏸️ Permission default (dismissed)');
        updateSettings({ 
          hasSeenNotificationPrompt: true,
          notificationsEnabled: false
        });
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      updateSettings({ 
        hasSeenNotificationPrompt: true,
        notificationsEnabled: false 
      });
      toast({
        title: "Error",
        description: "Failed to enable notifications.",
        variant: "destructive",
      });
    }

    onComplete();
  };

  const handleMaybeLater = () => {
    updateSettings({ 
      hasSeenNotificationPrompt: true,
      notificationsEnabled: false 
    });
    toast({
      title: "No problem",
      description: "You can enable notifications anytime in Settings.",
    });
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-balance-surface/95 backdrop-blur-sm border-balance-surface-elevated">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-16 h-16 bg-health/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Bell className="w-8 h-8 text-health" />
          </motion.div>
          <DialogTitle className="text-xl font-semibold text-balance-text-primary text-center">
            Stay on Track with Task Reminders
          </DialogTitle>
          <DialogDescription className="text-center text-balance-text-secondary pt-2">
            Get notified when your scheduled tasks are ready to start.
            <br />
            <span className="text-xs text-balance-text-muted mt-2 inline-block">
              You can change this anytime in Settings.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-3 pt-4">
          <Button
            onClick={handleAllowNotifications}
            className="w-full bg-health hover:bg-health/90 text-white rounded-balance h-12 text-base font-medium"
          >
            Allow Notifications
          </Button>
          <Button
            variant="ghost"
            onClick={handleMaybeLater}
            className="w-full rounded-balance h-12 text-balance-text-secondary hover:text-balance-text-primary"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
