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

  const [showFeedback, setShowFeedback] = useState<string | null>(null);

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
    setShowFeedback(taskId);
  };

  // Handle feedback selection
  const handleFeedback = (taskId: string, rating: 'win' | 'good' | 'bad' | 'skip') => {
    updateDayItem(selectedDate, taskId, { 
      status: rating === 'skip' ? 'skipped' : 'done',
      rating: rating 
    });
    setShowFeedback(null);
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

                      {/* Feedback overlay */}
                      <AnimatePresence>
                        {showFeedback === task.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 bg-balance-surface border border-balance-surface-elevated rounded-lg p-4 shadow-lg z-10"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium text-balance-text-primary">
                                How did it go?
                              </h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFeedback(null)}
                                className="text-balance-text-muted hover:text-balance-text-primary"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => handleFeedback(task.id, 'win')}
                                className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg py-2 text-xs font-medium"
                              >
                                W (Win)
                              </Button>
                              <Button
                                onClick={() => handleFeedback(task.id, 'good')}
                                className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg py-2 text-xs font-medium"
                              >
                                Good
                              </Button>
                              <Button
                                onClick={() => handleFeedback(task.id, 'bad')}
                                className="bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30 border border-yellow-600/30 rounded-lg py-2 text-xs font-medium"
                              >
                                Bad
                              </Button>
                              <Button
                                onClick={() => handleFeedback(task.id, 'skip')}
                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg py-2 text-xs font-medium"
                              >
                                L (Skip)
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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

          {pendingItems.length === 0 && dayItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <h3 className="text-lg font-medium text-balance-text-secondary mb-2">
                No tasks for {isToday ? 'today' : 'this day'}
              </h3>
              <p className="text-sm text-balance-text-muted mb-4">
                Your day plan will be generated automatically.
              </p>
              <Button
                onClick={() => generateDayPlan(selectedDate)}
                className="bg-health hover:bg-health/90 text-white rounded-lg px-6 py-2"
              >
                <Plus className="w-5 h-5 mr-2" />
                Generate Day Plan
              </Button>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};