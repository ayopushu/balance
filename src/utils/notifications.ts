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
    console.log('❌ Task skipped - no time or already completed:', task.title);
    return;
  }

  // Check browser support and permission
  if (!('Notification' in window)) {
    console.log('❌ Browser does not support notifications');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('❌ Notification permission not granted');
    return;
  }

  try {
    // Get current device time
    const now = new Date();
    console.log('📱 Current device time:', now.toLocaleString());

    // Parse task time
    const [hours, minutes] = task.start.split(':').map(Number);
    const taskTime = new Date(task.date);
    taskTime.setHours(hours, minutes, 0, 0);

    console.log('⏰ Task scheduled for:', taskTime.toLocaleString());
    console.log('📋 Task:', task.title);

    // Calculate delay
    const delay = taskTime.getTime() - now.getTime();

    console.log('⏱️ Time until notification:');
    console.log('  - Milliseconds:', delay);
    console.log('  - Minutes:', Math.round(delay / 1000 / 60));
    console.log('  - Hours:', Math.round(delay / 1000 / 60 / 60));

    // Only schedule future tasks
    if (delay <= 0) {
      console.log('❌ Task time has already passed');
      return;
    }

    console.log('✅ Scheduling notification...');

    const timeoutId = window.setTimeout(() => {
      console.log('🔔 TIME TO SHOW NOTIFICATION!');
      console.log('📱 Current device time:', new Date().toLocaleString());

      const notification = new Notification(`⏰ ${task.title}`, {
        body: 'Your task is starting now',
        icon: '/icon-192.png',
        tag: task.id,
        requireInteraction: false,
      });

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      notifications.delete(task.id);
    }, delay);

    notifications.set(task.id, timeoutId);
    console.log('✅ Notification scheduled successfully!');
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
  console.log('📅 Rescheduling all notifications...');
  console.log('  - Total tasks:', tasks.length);
  console.log('  - Enabled:', enabled);

  cancelAllNotifications();

  if (!enabled) {
    console.log('❌ Notifications disabled, skipping');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('❌ No notification permission');
    return;
  }

  const now = new Date();
  let scheduledCount = 0;

  tasks.forEach(task => {
    if (task.status === 'pending' && task.start && task.date) {
      const [hours, minutes] = task.start.split(':').map(Number);
      const taskTime = new Date(task.date);
      taskTime.setHours(hours, minutes, 0, 0);

      if (taskTime > now) {
        scheduleNotification(task);
        scheduledCount++;
      }
    }
  });

  console.log(`✅ Scheduled ${scheduledCount} notifications`);
};
