/**
 * Simple notification scheduler for task reminders
 */

import type { DayItem } from '@/store/types';

// Store active timeouts
const scheduledNotifications = new Map<string, number>();

/**
 * Schedule a notification for a task
 */
export const scheduleTaskNotification = (task: DayItem, notificationsEnabled: boolean) => {
  // Cancel any existing notification for this task
  cancelTaskNotification(task.id);

  // Don't schedule if notifications are disabled or task has no start time
  if (!notificationsEnabled || !task.start || !task.date) {
    return;
  }

  // Don't schedule if task is already completed or skipped
  if (task.status === 'done' || task.status === 'skipped') {
    return;
  }

  // Check browser support
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    // Parse task time
    const [hours, minutes] = task.start.split(':').map(Number);
    const taskDateTime = new Date(task.date);
    taskDateTime.setHours(hours, minutes, 0, 0);

    // Calculate delay
    const now = new Date();
    const delay = taskDateTime.getTime() - now.getTime();

    // Only schedule if time is in the future
    if (delay > 0) {
      const timeoutId = window.setTimeout(() => {
        // Show notification
        new Notification(`Time for: ${task.title}`, {
          body: 'Your task is starting now',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: task.id,
        });

        // Remove from scheduled map
        scheduledNotifications.delete(task.id);
      }, delay);

      // Store timeout ID
      scheduledNotifications.set(task.id, timeoutId);
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

/**
 * Cancel a scheduled notification
 */
export const cancelTaskNotification = (taskId: string) => {
  const timeoutId = scheduledNotifications.get(taskId);
  if (timeoutId) {
    clearTimeout(timeoutId);
    scheduledNotifications.delete(taskId);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = () => {
  scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId));
  scheduledNotifications.clear();
};

/**
 * Reschedule all pending tasks
 */
export const rescheduleAllTasks = (tasks: DayItem[], notificationsEnabled: boolean) => {
  // Cancel all existing
  cancelAllNotifications();

  // Don't schedule if disabled
  if (!notificationsEnabled) {
    return;
  }

  // Schedule all pending tasks with future times
  const now = new Date();
  tasks.forEach(task => {
    if (task.status === 'pending' && task.start && task.date) {
      const [hours, minutes] = task.start.split(':').map(Number);
      const taskDateTime = new Date(task.date);
      taskDateTime.setHours(hours, minutes, 0, 0);

      // Only schedule future tasks
      if (taskDateTime > now) {
        scheduleTaskNotification(task, notificationsEnabled);
      }
    }
  });
};
