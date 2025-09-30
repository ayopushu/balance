/**
 * Service Worker for Push Notifications
 * Handles background notifications when app is closed
 */

const CACHE_NAME = 'balance-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/balance') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow('/balance');
      }
    })
  );
});

// Handle push events (for future web push implementation)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (!event.data) {
    console.log('Push event has no data');
    return;
  }
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'You have a task scheduled now',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'balance-task',
      requireInteraction: false,
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Balance - Task Reminder', options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { taskId, title, body, timestamp } = event.data;
    
    // Calculate delay
    const delay = timestamp - Date.now();
    
    if (delay > 0) {
      // Schedule the notification
      setTimeout(() => {
        self.registration.showNotification(title, {
          body: body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: taskId,
          vibrate: [200, 100, 200],
          requireInteraction: false,
          data: { taskId, url: '/balance' }
        });
      }, delay);
      
      console.log(`Notification scheduled for ${new Date(timestamp).toLocaleString()}`);
    }
  }
});
