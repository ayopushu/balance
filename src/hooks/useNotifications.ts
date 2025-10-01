/**
 * Notification Scheduling Hook
 * Manages scheduling and showing of task notifications
 */

import { useEffect, useRef } from 'react';
import { useBalanceStore } from '@/store';
import { format } from 'date-fns';

// Store notification timeouts
const notificationTimeouts = new Map<string, NodeJS.Timeout>();

// Pillar emojis for notifications
const PILLAR_EMOJIS: Record<string, string> = {
  health: '💪',
  relationships: '💕',
  work: '💼',
};

export const useNotifications = () => {
  const { settings, dayPlans, pillars } = useBalanceStore();
  const prevDayPlansRef = useRef(dayPlans);

  // Schedule a notification for a specific task
  const scheduleNotification = (taskId: string, taskDate: string, taskTitle: string, taskTime: string, pillarId: string) => {
    // Check if notifications are enabled and permission granted
    if (!settings.notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Cancel existing notification for this task
    cancelNotification(taskId);

    // Parse task time
    const [hours, minutes] = taskTime.split(':').map(Number);
    const notificationTime = new Date(taskDate);
    notificationTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const timeUntilNotification = notificationTime.getTime() - now.getTime();

    // Don't schedule if time has passed
    if (timeUntilNotification <= 0) {
      return;
    }

    // Schedule notification
    const timeoutId = setTimeout(() => {
      showNotification(taskTitle, pillarId);
      notificationTimeouts.delete(taskId);
    }, timeUntilNotification);

    notificationTimeouts.set(taskId, timeoutId);
  };

  // Show notification
  const showNotification = (taskTitle: string, pillarId: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const pillar = pillars.find(p => p.id === pillarId);
    const emoji = PILLAR_EMOJIS[pillarId] || PILLAR_EMOJIS[pillar?.name.toLowerCase() || ''] || '📋';
    const pillarName = pillar?.name || 'Task';

    const notification = new Notification(`${emoji} ${taskTitle}`, {
      body: `Time to work on your ${pillarName} goal`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: taskTitle,
      requireInteraction: false,
      silent: false,
    });

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  };

  // Cancel a specific notification
  const cancelNotification = (taskId: string) => {
    const timeoutId = notificationTimeouts.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      notificationTimeouts.delete(taskId);
    }
  };

  // Cancel all notifications
  const cancelAllNotifications = () => {
    notificationTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    notificationTimeouts.clear();
  };

  // Reschedule all pending notifications
  const rescheduleAllNotifications = () => {
    cancelAllNotifications();

    if (!settings.notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    // Get all future day plans (today and later)
    Object.entries(dayPlans).forEach(([date, dayPlan]) => {
      if (date >= today) {
        dayPlan.items.forEach((item) => {
          // Only schedule for pending tasks with start time
          if (item.status === 'pending' && item.start) {
            scheduleNotification(item.id, item.date, item.title, item.start, item.pillarId);
          }
        });
      }
    });
  };

  // Effect to handle notification state changes
  useEffect(() => {
    if (settings.notificationsEnabled && Notification.permission === 'granted') {
      rescheduleAllNotifications();
    } else {
      cancelAllNotifications();
    }

    // Cleanup on unmount
    return () => {
      cancelAllNotifications();
    };
  }, [settings.notificationsEnabled]);

  // Effect to handle day plan changes
  useEffect(() => {
    // Check if dayPlans changed
    if (prevDayPlansRef.current !== dayPlans) {
      if (settings.notificationsEnabled && Notification.permission === 'granted') {
        rescheduleAllNotifications();
      }
      prevDayPlansRef.current = dayPlans;
    }
  }, [dayPlans, settings.notificationsEnabled]);

  return {
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    rescheduleAllNotifications,
  };
};
