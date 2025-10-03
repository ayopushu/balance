/**
 * Simple notification system for task reminders
 */

import type { DayItem } from '@/store/types';

// Store scheduled notifications
const notifications = new Map<string, number>();

/**
 * Schedule a notification for a task
 */
export const scheduleNotification = (task: DayItem) => {
  // Cancel existing notification for this task
  cancelNotification(task.id);

  // Don't schedule if no time or already completed
  if (!task.start || !task.date || task.status !== 'pending') {
    return;
  }

  // Check browser support and permission
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    // Parse task time
    const [hours, minutes] = task.start.split(':').map(Number);
    const taskTime = new Date(task.date);
    taskTime.setHours(hours, minutes, 0, 0);

    // Calculate delay
    const now = new Date();
    const delay = taskTime.getTime() - now.getTime();

    // Only schedule future tasks
    if (delay > 0) {
      const timeoutId = window.setTimeout(() => {
        new Notification(`Time for: ${task.title}`, {
          body: 'Your task is starting now',
          icon: '/icon-192.png',
          tag: task.id,
        });
        notifications.delete(task.id);
      }, delay);

      notifications.set(task.id, timeoutId);
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

/**
 * Cancel a notification
 */
export const cancelNotification = (taskId: string) => {
  const timeoutId = notifications.get(taskId);
  if (timeoutId) {
    clearTimeout(timeoutId);
    notifications.delete(taskId);
  }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = () => {
  notifications.forEach(timeoutId => clearTimeout(timeoutId));
  notifications.clear();
};

/**
 * Reschedule all pending tasks
 */
export const rescheduleAll = (tasks: DayItem[], enabled: boolean) => {
  cancelAllNotifications();

  if (!enabled) return;

  const now = new Date();
  tasks.forEach(task => {
    if (task.status === 'pending' && task.start && task.date) {
      const [hours, minutes] = task.start.split(':').map(Number);
      const taskTime = new Date(task.date);
      taskTime.setHours(hours, minutes, 0, 0);

      if (taskTime > now) {
        scheduleNotification(task);
      }
    }
  });
};
