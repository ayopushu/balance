/**
 * Notifications Hook - Manages task notifications
 */

import { useEffect } from 'react';
import { useBalanceStore } from '@/store';
import { format } from 'date-fns';

export const useNotifications = () => {
  const { settings, getDayPlan, selectedDate } = useBalanceStore();

  useEffect(() => {
    // Exit if notifications are disabled
    if (!settings.notificationsEnabled) return;

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // If permission is not granted, exit
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Get today's tasks (not selected date - notifications are always for today)
    const today = format(new Date(), 'yyyy-MM-dd');
    const dayPlan = getDayPlan(today);
    
    if (!dayPlan) {
      console.log('No day plan for today');
      return;
    }

    // Schedule notifications for pending tasks
    const timeouts: NodeJS.Timeout[] = [];

    dayPlan.items.forEach(task => {
      if (task.status !== 'pending' || !task.start) return;

      const [hours, minutes] = task.start.split(':').map(Number);
      const now = new Date();
      const taskTime = new Date();
      taskTime.setHours(hours, minutes, 0, 0);

      // Only schedule if task time is in the future
      if (taskTime > now) {
        const delay = taskTime.getTime() - now.getTime();

        console.log(`Scheduling notification for "${task.title}" in ${Math.round(delay/1000/60)} minutes`);

        const timeout = setTimeout(() => {
          console.log(`Showing notification for: ${task.title}`);
          new Notification('Balance - Task Reminder', {
            body: `Time for: ${task.title}`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: task.id,
            requireInteraction: false,
          });
        }, delay);

        timeouts.push(timeout);
      }
    });

    console.log(`Scheduled ${timeouts.length} notifications for today`);

    // Cleanup function to clear all timeouts
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [settings.notificationsEnabled, getDayPlan]);
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};
