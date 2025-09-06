/**
 * SubcategoryTile Component - Individual actionable task with checkbox and rating
 * Handles task completion, time tracking, and rating workflow
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Subcategory, DayItem } from '@/store/types';
import { useBalanceStore } from '@/store';
import { RatingSheet } from './RatingSheet';
import { RoundedCheckbox } from './RoundedCheckbox';

interface SubcategoryTileProps {
  subcategory?: Subcategory;
  dayItem?: DayItem;
  pillarColor: string;
  isDirectCategory?: boolean;
}

export const SubcategoryTile: React.FC<SubcategoryTileProps> = ({
  subcategory,
  dayItem,
  pillarColor,
  isDirectCategory = false,
}) => {
  const { completeDayItem, selectedDate, updateDayItem } = useBalanceStore();
  const [showRatingSheet, setShowRatingSheet] = useState(false);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);

  if (!dayItem) return null;

  // Calculate minutes if start/end times are available
  const calculateMinutes = () => {
    if (!dayItem.start || !dayItem.end) return 0;
    const [startHour, startMin] = dayItem.start.split(':').map(Number);
    const [endHour, endMin] = dayItem.end.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const estimatedMinutes = calculateMinutes();

  // Handle checkbox click - opens rating sheet
  const handleComplete = () => {
    if (dayItem.status === 'done') return; // Already completed
    
    // Trigger haptic feedback (will be handled by Capacitor)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    setShowRatingSheet(true);
  };

  // Handle rating selection
  const handleRating = (rating: 'win' | 'good' | 'bad' | 'skip', minutes?: number) => {
    const finalMinutes = minutes || estimatedMinutes;
    completeDayItem(selectedDate, dayItem.id, rating, finalMinutes);
    setShowRatingSheet(false);
    
    // Show undo timer
    const timer = setTimeout(() => {
      setUndoTimer(null);
    }, 5000);
    setUndoTimer(timer);
  };

  // Handle undo
  const handleUndo = () => {
    if (undoTimer) {
      clearTimeout(undoTimer);
      setUndoTimer(null);
    }
    
    updateDayItem(selectedDate, dayItem.id, {
      status: 'pending',
      rating: undefined,
      minutes: undefined,
    });
  };

  // Get time display
  const getTimeDisplay = () => {
    if (dayItem.start && dayItem.end) {
      return `${dayItem.start}–${dayItem.end}`;
    } else if (dayItem.start) {
      return `from ${dayItem.start}`;
    }
    return null;
  };

  const timeDisplay = getTimeDisplay();

  // Get completion progress (for done tasks)
  const getProgressPercentage = () => {
    if (dayItem.status === 'done') return 100;
    return 0;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: dayItem.status === 'done' ? 0.7 : 1 }}
        className="flex items-center space-x-3 p-3 surface-elevated rounded-balance-sm transition-balance hover:bg-balance-surface-elevated/50"
      >
        {/* Rounded checkbox */}
        <RoundedCheckbox
          checked={dayItem.status === 'done'}
          onCheck={handleComplete}
          pillarColor={pillarColor}
          disabled={dayItem.status === 'done'}
        />

        {/* Task info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className={`body-lg ${
              dayItem.status === 'done' 
                ? 'text-balance-text-muted line-through' 
                : 'text-balance-text-primary'
            } font-medium truncate mr-2`}>
              {dayItem.title}
            </h5>
            
            {/* Undo button (appears after completion) */}
            {undoTimer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                className="text-balance-text-muted hover:text-balance-text-primary flex-shrink-0"
              >
                <X className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Undo</span>
              </Button>
            )}
          </div>

          {/* Time and progress info */}
          <div className="flex items-center space-x-2 mt-1 flex-wrap">
            {timeDisplay && (
              <div className="flex items-center space-x-1 text-balance-text-muted">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="body-sm">{timeDisplay}</span>
              </div>
            )}
            
            {estimatedMinutes > 0 && (
              <span className="body-sm text-balance-text-muted">
                {estimatedMinutes}min
              </span>
            )}

            {/* Rating display */}
            {dayItem.rating && (
              <span className={`body-sm px-2 py-1 rounded-full flex-shrink-0 ${
                dayItem.rating === 'win' ? 'rating-w' :
                dayItem.rating === 'good' ? 'rating-good' :
                dayItem.rating === 'bad' ? 'rating-bad' :
                'rating-skip'
              }`}>
                {dayItem.rating === 'win' ? 'Done' :
                 dayItem.rating === 'skip' ? 'Skip' :
                 dayItem.rating}
              </span>
            )}
          </div>

          {/* Progress bar for partial completion */}
          {progressPercentage > 0 && progressPercentage < 100 && (
            <div className="mt-2">
              <Progress value={progressPercentage} className="h-1" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Rating sheet modal */}
      <RatingSheet
        isOpen={showRatingSheet}
        onClose={() => setShowRatingSheet(false)}
        onRate={handleRating}
        taskTitle={dayItem.title}
        estimatedMinutes={estimatedMinutes}
        hasTimeSet={!!dayItem.start && !!dayItem.end}
      />
    </>
  );
};