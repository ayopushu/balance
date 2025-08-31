/**
 * Balance Screen - Today's To-Do view with pillars and tasks
 * Main screen showing today's tasks organized by pillars
 */

import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBalanceStore } from '@/store';
import { PillarCard } from '@/components/PillarCard';
import { motion } from 'framer-motion';

export const Balance: React.FC = () => {
  const {
    selectedDate,
    pillars,
    getCategoriesByPillar,
    getDayPlan,
    generateDayPlan,
    expandedPillars,
    expandedCategories,
    togglePillarExpanded,
    toggleCategoryExpanded,
  } = useBalanceStore();

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

  // Calculate stats for each pillar
  const getPillarStats = (pillarId: string) => {
    const pillarItems = dayItems.filter(item => item.pillarId === pillarId);
    const totalMinutes = pillarItems.reduce((sum, item) => {
      if (item.status === 'done' && item.minutes) {
        return sum + item.minutes;
      } else if (item.start && item.end) {
        const [startHour, startMin] = item.start.split(':').map(Number);
        const [endHour, endMin] = item.end.split(':').map(Number);
        return sum + ((endHour * 60 + endMin) - (startHour * 60 + startMin));
      }
      return sum;
    }, 0);

    const percentageOfDay = (totalMinutes / 1440) * 100; // 1440 minutes in a day

    return {
      totalMinutes,
      percentageOfDay,
    };
  };

  // Format date display
  const formatDateDisplay = () => {
    return format(displayDate, 'EEEE • MMM d');
  };

  return (
    <div className="min-h-screen bg-balance-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-balance-background/95 backdrop-blur-sm border-b border-balance-surface-elevated">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-lg text-balance-text-primary">
                {formatDateDisplay()}
              </h1>
              {isToday && (
                <p className="body-md text-balance-text-secondary mt-1">
                  Today's Balance
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-balance-text-muted hover:text-balance-text-primary"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {pillars.map((pillar, index) => {
              const categories = getCategoriesByPillar(pillar.id);
              const pillarItems = dayItems.filter(item => item.pillarId === pillar.id);
              const stats = getPillarStats(pillar.id);
              const isExpanded = expandedPillars.includes(pillar.id);

              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <PillarCard
                    pillar={pillar}
                    categories={categories}
                    dayItems={pillarItems}
                    isExpanded={isExpanded}
                    onToggleExpand={() => togglePillarExpanded(pillar.id)}
                    onCategoryToggle={toggleCategoryExpanded}
                    expandedCategories={expandedCategories}
                    totalMinutesToday={stats.totalMinutes}
                    percentageToday={stats.percentageOfDay}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Empty state */}
          {dayItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <h3 className="heading-md text-balance-text-secondary mb-4">
                No tasks for {isToday ? 'today' : 'this day'}
              </h3>
              <p className="body-md text-balance-text-muted mb-6">
                Your day plan will be generated automatically based on your pillar templates.
              </p>
              <Button
                onClick={() => generateDayPlan(selectedDate)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-balance"
              >
                <Plus className="w-5 h-5 mr-2" />
                Generate Day Plan
              </Button>
            </motion.div>
          )}

          {/* Summary stats */}
          {dayItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 surface rounded-balance"
            >
              <h3 className="heading-sm text-balance-text-primary mb-4">
                Today's Summary
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-health">
                    {dayItems.filter(item => item.status === 'done').length}
                  </div>
                  <div className="body-sm text-balance-text-muted">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-work">
                    {dayItems.filter(item => item.status === 'pending').length}
                  </div>
                  <div className="body-sm text-balance-text-muted">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-relationships">
                    {Math.round(
                      dayItems.reduce((sum, item) => {
                        const stats = getPillarStats(item.pillarId);
                        return sum + stats.totalMinutes;
                      }, 0) / pillars.length
                    )}
                  </div>
                  <div className="body-sm text-balance-text-muted">Avg Minutes</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};