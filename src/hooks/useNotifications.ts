/**
 * Hook to manage notifications on app load
 */

import { useEffect } from 'react';
import { useBalanceStore } from '@/store';
import { rescheduleAll } from '@/utils/notifications';

export const useNotifications = () => {
  const { dayPlans, settings } = useBalanceStore();

  useEffect(() => {
    const allTasks = Object.values(dayPlans).flatMap(plan => plan.items);
    rescheduleAll(allTasks, settings.notificationsEnabled);
  }, []);
};
