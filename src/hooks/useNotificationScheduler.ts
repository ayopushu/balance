/**
 * Hook to reschedule notifications when app loads
 */

import { useEffect } from 'react';
import { useBalanceStore } from '@/store';
import { rescheduleAllTasks } from '@/utils/notifications';

export const useNotificationScheduler = () => {
  const { dayPlans, settings } = useBalanceStore();

  useEffect(() => {
    // Reschedule all pending tasks when app loads
    const allTasks = Object.values(dayPlans).flatMap(plan => plan.items);
    rescheduleAllTasks(allTasks, settings.notificationsEnabled);
  }, []); // Run once on mount

  return null;
};
