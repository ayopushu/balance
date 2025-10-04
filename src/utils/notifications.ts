/**
 * Mobile-friendly notification system using Capacitor Local Notifications
 */

import type { DayItem } from '@/store/types';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Store scheduled notification IDs
const notifications = new Map<string, number>();
let notificationIdCounter = 1;

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Mobile: Use Capacitor Local Notifications
      const result = await LocalNotifications.requestPermissions();
      console.log('📱 Mobile notification permission:', result.display);
      return result.display === 'granted';
    } else {
      // Web: Use Web Notification API
      if (!('Notification' in window)) {
        console.error('❌ Browser does not support notifications');
        return false;
      }
      
      const permission = await Notification.requestPermission();
      console.log('🌐 Web notification permission:', permission);
      return permission === 'granted';
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Check if notifications are permitted
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } else {
      return 'Notification' in window && Notification.permission === 'granted';
    }
  } catch (error) {
    console.error('❌ Error checking notification permission:', error);
    return false;
  }
};

/**
 * Schedule a notification for a task
 */
export const scheduleNotification = async (task: DayItem) => {
  // Cancel existing notification for this task
  await cancelNotification(task.id);

  // Don't schedule if no time or already completed
  if (!task.start || !task.date || task.status !== 'pending') {
    console.log('❌ Task skipped - no time or already completed:', task.title);
    return;
  }

  // Check permission
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
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

    if (Capacitor.isNativePlatform()) {
      // Mobile: Use Capacitor Local Notifications
      const notificationId = notificationIdCounter++;
      
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: `⏰ ${task.title}`,
            body: 'Your task is starting now',
            schedule: { at: taskTime },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: { taskId: task.id }
          }
        ]
      });

      notifications.set(task.id, notificationId);
      console.log('✅ Mobile notification scheduled with ID:', notificationId);
    } else {
      // Web: Use setTimeout with Web Notification API
      const timeoutId = window.setTimeout(async () => {
        console.log('🔔 TIME TO SHOW NOTIFICATION!');
        console.log('📱 Current device time:', new Date().toLocaleString());
        console.log('📋 Task:', task.title);

        try {
          const notification = new Notification(`⏰ ${task.title}`, {
            body: 'Your task is starting now',
            icon: '/icon-192.png',
            tag: task.id,
            requireInteraction: true,
            silent: false,
          });

          console.log('✅ Web notification created successfully!');

          notification.onclick = () => {
            console.log('🖱️ Notification clicked');
            window.focus();
            notification.close();
          };
        } catch (error) {
          console.error('❌ Failed to create web notification:', error);
        }
      }, delay);

      notifications.set(task.id, timeoutId);
      console.log('✅ Web notification scheduled with timeout ID:', timeoutId);
    }
  } catch (error) {
    console.error('❌ Error scheduling notification:', error);
  }
};

/**
 * Cancel a notification
 */
export const cancelNotification = async (taskId: string) => {
  const notificationId = notifications.get(taskId);
  if (!notificationId) return;

  try {
    if (Capacitor.isNativePlatform()) {
      // Mobile: Cancel Capacitor notification
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      });
      console.log('🗑️ Cancelled mobile notification ID:', notificationId);
    } else {
      // Web: Clear timeout
      clearTimeout(notificationId);
      console.log('🗑️ Cancelled web timeout ID:', notificationId);
    }
    
    notifications.delete(taskId);
  } catch (error) {
    console.error('❌ Error cancelling notification:', error);
  }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Mobile: Cancel all pending notifications
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications
        });
      }
      console.log('🗑️ Cancelled all mobile notifications');
    } else {
      // Web: Clear all timeouts
      notifications.forEach(timeoutId => clearTimeout(timeoutId));
      console.log('🗑️ Cancelled all web timeouts');
    }
    
    notifications.clear();
  } catch (error) {
    console.error('❌ Error cancelling all notifications:', error);
  }
};

/**
 * Test notification - fires immediately
 */
export const testNotification = async () => {
  console.log('🧪 Testing notification system...');
  
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    console.error('❌ Notification permission not granted');
    alert('Notification permission not granted. Please enable in settings.');
    return;
  }

  try {
    console.log('✅ Creating test notification...');
    
    if (Capacitor.isNativePlatform()) {
      // Mobile: Use Capacitor Local Notifications
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationIdCounter++,
            title: '🧪 Test Notification',
            body: 'If you see this, notifications are working!',
            schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
      console.log('✅ Mobile test notification scheduled!');
      alert('Test notification will appear in 1 second!');
    } else {
      // Web: Use Web Notification API
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

      console.log('✅ Web test notification created successfully!');
    }
  } catch (error) {
    console.error('❌ Failed to create test notification:', error);
    alert('Failed to create notification: ' + error);
  }
};

/**
 * Reschedule all pending tasks
 */
export const rescheduleAll = async (tasks: DayItem[], enabled: boolean) => {
  console.log('📅 Rescheduling all notifications...');
  console.log('  - Total tasks:', tasks.length);
  console.log('  - Enabled:', enabled);

  await cancelAllNotifications();

  if (!enabled) {
    console.log('❌ Notifications disabled, skipping');
    return;
  }

  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    console.log('❌ No notification permission');
    return;
  }

  const now = new Date();
  let scheduledCount = 0;

  for (const task of tasks) {
    if (task.status === 'pending' && task.start && task.date) {
      const [hours, minutes] = task.start.split(':').map(Number);
      const taskTime = new Date(task.date);
      taskTime.setHours(hours, minutes, 0, 0);

      if (taskTime > now) {
        await scheduleNotification(task);
        scheduledCount++;
      }
    }
  }

  console.log(`✅ Scheduled ${scheduledCount} notifications`);
};
