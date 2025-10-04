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
      console.log('📋 Task:', task.title);

      try {
        // Double-check permission before creating
        if (Notification.permission !== 'granted') {
          console.error('❌ Permission lost! Current permission:', Notification.permission);
          notifications.delete(task.id);
          return;
        }

        console.log('✅ Creating notification...');
        const notification = new Notification(`⏰ ${task.title}`, {
          body: 'Your task is starting now',
          icon: '/icon-192.png',
          tag: task.id,
          requireInteraction: true,
          silent: false,
        });

        console.log('✅ Notification created successfully!');

        // Handle click
        notification.onclick = () => {
          console.log('🖱️ Notification clicked');
          window.focus();
          notification.close();
        };

        // Handle errors
        notification.onerror = (error) => {
          console.error('❌ Notification error:', error);
        };

        // Handle close
        notification.onclose = () => {
          console.log('❌ Notification closed');
        };

        notifications.delete(task.id);
      } catch (error) {
        console.error('❌ Failed to create notification:', error);
        notifications.delete(task.id);
      }
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
 * Test notification - fires immediately
 */
export const testNotification = () => {
  console.log('🧪 Testing notification system...');
  
  if (!('Notification' in window)) {
    console.error('❌ Browser does not support notifications');
    alert('Your browser does not support notifications');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.error('❌ Notification permission not granted');
    alert('Notification permission not granted. Please enable in settings.');
    return;
  }

  try {
    console.log('✅ Creating test notification...');
    const notification = new Notification('🧪 Test Notification', {
      body: 'If you see this, notifications are working!',
      icon: '/icon-192.png',
      requireInteraction: true,
      silent: false,
    });

    notification.onclick = () => {
      console.log('🖱️ Test notification clicked');
      window.focus();
      notification.close();
    };

    notification.onerror = (error) => {
      console.error('❌ Test notification error:', error);
    };

    console.log('✅ Test notification created successfully!');
  } catch (error) {
    console.error('❌ Failed to create test notification:', error);
    alert('Failed to create notification: ' + error);
  }
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
