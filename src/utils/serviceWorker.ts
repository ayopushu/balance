/**
 * Service Worker Registration and Management
 */

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('Service Worker registered successfully:', registration);
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('Service Worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
};

export const scheduleNotificationViaServiceWorker = async (
  taskId: string,
  title: string,
  body: string,
  timestamp: number
): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.active) {
      registration.active.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        taskId,
        title,
        body,
        timestamp
      });
    }
  } catch (error) {
    console.error('Failed to schedule notification via Service Worker:', error);
  }
};

export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

export const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration || null;
  } catch (error) {
    console.error('Failed to get Service Worker registration:', error);
    return null;
  }
};
