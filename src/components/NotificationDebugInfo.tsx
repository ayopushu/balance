/**
 * Debug component to display device time and scheduled notifications
 */

import React, { useState, useEffect } from 'react';
import { Clock, Bell } from 'lucide-react';
import { useBalanceStore } from '@/store';

export const NotificationDebugInfo: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { dayPlans, settings } = useBalanceStore();

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get all pending tasks with scheduled times
  const scheduledTasks = Object.entries(dayPlans)
    .flatMap(([date, plan]) => 
      plan.items
        .filter(item => item.status === 'pending' && item.start && item.date)
        .map(item => ({
          title: item.title,
          time: item.start,
          date: item.date,
          dateTime: (() => {
            const [hours, minutes] = item.start!.split(':').map(Number);
            const dt = new Date(item.date!);
            dt.setHours(hours, minutes, 0, 0);
            return dt;
          })(),
        }))
    )
    .filter(task => task.dateTime > currentTime)
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
    .slice(0, 5); // Show next 5 tasks

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeUntil = (target: Date) => {
    const diff = target.getTime() - currentTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div className="p-4 surface-elevated rounded-balance space-y-4">
      {/* Current Device Time */}
      <div className="flex items-start space-x-3">
        <Clock className="w-5 h-5 text-balance-text-muted mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-balance-text-primary">
            Device Time
          </p>
          <p className="text-xs text-balance-text-muted mt-1">
            {formatDate(currentTime)}
          </p>
          <p className="text-lg font-mono text-health mt-1">
            {formatTime(currentTime)}
          </p>
        </div>
      </div>

      {/* Permission Status */}
      <div className="flex items-center justify-between pt-2 border-t border-balance-surface">
        <span className="text-xs text-balance-text-muted">Permission:</span>
        <span className={`text-xs font-medium ${
          'Notification' in window && Notification.permission === 'granted'
            ? 'text-health'
            : 'text-red-500'
        }`}>
          {'Notification' in window 
            ? Notification.permission === 'granted' ? '✓ Granted' : '✗ ' + Notification.permission
            : '✗ Not supported'
          }
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-balance-surface pt-2">
        <span className="text-xs text-balance-text-muted">Toggle Status:</span>
        <span className={`text-xs font-medium ${
          settings.notificationsEnabled ? 'text-health' : 'text-gray-500'
        }`}>
          {settings.notificationsEnabled ? '✓ Enabled' : '○ Disabled'}
        </span>
      </div>

      {/* Scheduled Notifications */}
      {settings.notificationsEnabled && Notification.permission === 'granted' && (
        <div className="pt-2 border-t border-balance-surface">
          <div className="flex items-start space-x-3 mb-2">
            <Bell className="w-4 h-4 text-balance-text-muted mt-0.5" />
            <p className="text-xs font-medium text-balance-text-primary">
              Next Scheduled Tasks
            </p>
          </div>
          
          {scheduledTasks.length === 0 ? (
            <p className="text-xs text-balance-text-muted ml-7">
              No upcoming tasks with times
            </p>
          ) : (
            <div className="space-y-2 ml-7">
              {scheduledTasks.map((task, idx) => (
                <div key={idx} className="flex items-start justify-between text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="text-balance-text-primary truncate">
                      {task.title}
                    </p>
                    <p className="text-balance-text-muted">
                      {formatDate(task.dateTime)} at {task.time}
                    </p>
                  </div>
                  <span className="text-health font-mono ml-2 whitespace-nowrap">
                    {getTimeUntil(task.dateTime)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
