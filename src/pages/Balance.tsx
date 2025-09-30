/**
 * Balance Screen - Today's To-Do view with task completion flow
 * Main screen showing today's tasks with feedback system
 */

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Settings, Plus, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useBalanceStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { RatingSheet } from '@/components/RatingSheet';
import type { DayItem } from '@/store/types';

export const Balance: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedDate,
    pillars,
    getDayPlan,
    generateDayPlan,
    updateDayItem,
  } = useBalanceStore();

  const [showRatingSheet, setShowRatingSheet] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const displayDate = new Date(selectedDate);
  const isToday = selectedDate === today;

  // Generate day plan if it doesn't exist
  useEffect(() => {
    if (!getDayPlan(selectedDate)) {
      generateDayPlan(selectedDate);
    }
  }, [selectedDate, getDayPlan, generateDayPlan]);

  const dayPlan = getDayPlan(selectedDate);
  const dayItems = dayPlan?.items || [];

  // Filter out completed/skipped tasks for Balance view
  const pendingItems = dayItems.filter(item => item.status === 'pending');

  // Group pending tasks by pillar
  const tasksByPillar = pillars.map(pillar => {
    const pillarTasks = pendingItems.filter(item => item.pillarId === pillar.id);
    return {
      pillar,
      tasks: pillarTasks
    };
  }).filter(group => group.tasks.length > 0);

  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    setShowRatingSheet(taskId);
  };

  // Handle rating selection
  const handleRating = (taskId: string, rating: 'win' | 'good' | 'bad' | 'skip') => {
    const { completeDayItem } = useBalanceStore.getState();
    const task = dayItems.find(item => item.id === taskId);
    
    let minutes = 0;
    if (task?.start && task?.end) {
      const [startHour, startMin] = task.start.split(':').map(Number);
      const [endHour, endMin] = task.end.split(':').map(Number);
      minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    }
    
    completeDayItem(selectedDate, taskId, rating, minutes);
    setShowRatingSheet(null);
  };

  // Format date display
  const formatDateDisplay = () => {
    return format(displayDate, 'EEEE • MMM d');
  };

  return (
    <div className="min-h-screen bg-balance-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-balance-background/95 backdrop-blur-sm border-b border-balance-surface-elevated">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-balance-text-primary">
                {formatDateDisplay()}
              </h1>
              {isToday && (
                <p className="text-sm text-balance-text-secondary mt-1">
                  Today's Balance
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="text-balance-text-muted hover:text-balance-text-primary"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4">
          <div className="space-y-4">
            {tasksByPillar.map((group, groupIndex) => (
              <Card 
                key={group.pillar.id} 
                className="surface p-4"
                style={{ borderLeft: `4px solid ${group.pillar.color}` }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: group.pillar.color }}
                  />
                  <h3 className="text-base font-medium text-balance-text-primary">
                    {group.pillar.name}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-balance-surface-elevated rounded-full text-balance-text-muted">
                    {group.tasks.length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {group.tasks.map((task, taskIndex) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (groupIndex * 0.1) + (taskIndex * 0.05) }}
                      className="relative"
                    >
                      <div className="flex items-center justify-between p-3 bg-balance-surface-elevated/50 rounded-lg border border-balance-surface-elevated hover:bg-balance-surface-elevated transition-all">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-balance-text-primary truncate">
                            {task.title}
                          </h4>
                          {task.start && task.end && (
                            <p className="text-xs text-balance-text-muted mt-1">
                              {task.start} - {task.end}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          onClick={() => handleTaskComplete(task.id)}
                          className="bg-health hover:bg-health/90 text-white rounded-lg px-4 py-2 text-sm font-medium ml-3"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Done
                        </Button>
                      </div>

                    </motion.div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Empty state */}
          {tasksByPillar.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-health via-relationships to-work rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-balance-text-primary mb-2">
                All tasks completed!
              </h3>
              <p className="text-sm text-balance-text-muted mb-4">
                Great job! You've finished all your tasks for {isToday ? 'today' : 'this day'}.
              </p>
              <Button
                onClick={() => navigate('/analytics')}
                className="bg-health hover:bg-health/90 text-white rounded-lg px-6 py-2"
              >
                View Analytics
              </Button>
            </motion.div>
          )}

        </div>
      </ScrollArea>

      {/* Rating Sheet */}
      {showRatingSheet && (
        <RatingSheet
          isOpen={!!showRatingSheet}
          onClose={() => setShowRatingSheet(null)}
          onRate={(rating) => handleRating(showRatingSheet, rating)}
          taskTitle={dayItems.find(item => item.id === showRatingSheet)?.title || ''}
          estimatedMinutes={0}
          hasTimeSet={false}
        />
      )}
    </div>
  );
};