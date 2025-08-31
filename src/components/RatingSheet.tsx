/**
 * RatingSheet Component - Bottom sheet modal for task rating
 * Four rating buttons: W (Done), Good, Bad, Skip (L) with haptic feedback
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RatingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRate: (rating: 'W' | 'Good' | 'Bad' | 'L', minutes?: number) => void;
  taskTitle: string;
  estimatedMinutes: number;
  hasTimeSet: boolean;
}

export const RatingSheet: React.FC<RatingSheetProps> = ({
  isOpen,
  onClose,
  onRate,
  taskTitle,
  estimatedMinutes,
  hasTimeSet,
}) => {
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [showTimeInput, setShowTimeInput] = useState(false);

  // Handle rating selection with haptic feedback
  const handleRating = (rating: 'W' | 'Good' | 'Bad' | 'L') => {
    // Trigger haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const vibrationPattern = rating === 'W' ? [100] : rating === 'L' ? [50, 50, 50] : [75];
      navigator.vibrate(vibrationPattern);
    }

    // If no time is set and it's not a skip, show time input
    if (!hasTimeSet && rating !== 'L' && estimatedMinutes === 0) {
      setShowTimeInput(true);
      return;
    }

    // Complete with rating
    const finalMinutes = customMinutes ? parseInt(customMinutes, 10) : estimatedMinutes;
    onRate(rating, finalMinutes);
    
    // Reset state
    setCustomMinutes('');
    setShowTimeInput(false);
  };

  // Handle time input submission
  const handleTimeSubmit = (rating: 'W' | 'Good' | 'Bad') => {
    const minutes = customMinutes ? parseInt(customMinutes, 10) : 0;
    onRate(rating, minutes);
    
    // Reset state
    setCustomMinutes('');
    setShowTimeInput(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-balance-surface border-balance-surface-elevated">
        <DialogHeader>
          <DialogTitle className="heading-md text-balance-text-primary text-center">
            How did it go?
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Task title */}
          <div className="text-center mb-6">
            <h4 className="body-lg text-balance-text-primary font-medium mb-2">
              {taskTitle}
            </h4>
            {estimatedMinutes > 0 && (
              <div className="flex items-center justify-center space-x-1 text-balance-text-muted">
                <Clock className="w-4 h-4" />
                <span className="body-sm">{estimatedMinutes} minutes</span>
              </div>
            )}
          </div>

          {/* Time input (if needed) */}
          <AnimatePresence>
            {showTimeInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <Label htmlFor="time-input" className="body-md text-balance-text-secondary">
                  How many minutes did you spend?
                </Label>
                <Input
                  id="time-input"
                  type="number"
                  placeholder="Minutes"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="mt-2 bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rating buttons */}
          {!showTimeInput ? (
            <div className="grid grid-cols-2 gap-3">
              {/* Done (W) - Green */}
              <Button
                onClick={() => handleRating('W')}
                className="rating-w h-16 text-lg font-semibold rounded-balance transition-balance hover:scale-105"
              >
                W<br />
                <span className="text-sm font-normal">Done</span>
              </Button>

              {/* Good - Light Green */}
              <Button
                onClick={() => handleRating('Good')}
                className="rating-good h-16 text-lg font-semibold rounded-balance transition-balance hover:scale-105"
              >
                Good<br />
                <span className="text-sm font-normal">Pretty good</span>
              </Button>

              {/* Bad - Yellow */}
              <Button
                onClick={() => handleRating('Bad')}
                className="rating-bad h-16 text-lg font-semibold rounded-balance transition-balance hover:scale-105"
              >
                Bad<br />
                <span className="text-sm font-normal">Could be better</span>
              </Button>

              {/* Skip (L) - Red */}
              <Button
                onClick={() => handleRating('L')}
                className="rating-skip h-16 text-lg font-semibold rounded-balance transition-balance hover:scale-105"
              >
                L<br />
                <span className="text-sm font-normal">Skip</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleTimeSubmit('W')}
                disabled={!customMinutes}
                className="rating-w h-12 text-sm font-semibold rounded-balance transition-balance hover:scale-105"
              >
                Done
              </Button>

              <Button
                onClick={() => handleTimeSubmit('Good')}
                disabled={!customMinutes}
                className="rating-good h-12 text-sm font-semibold rounded-balance transition-balance hover:scale-105"
              >
                Good
              </Button>

              <Button
                onClick={() => handleTimeSubmit('Bad')}
                disabled={!customMinutes}
                className="rating-bad h-12 text-sm font-semibold rounded-balance transition-balance hover:scale-105"
              >
                Bad
              </Button>
            </div>
          )}

          {/* Cancel button */}
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full mt-4 text-balance-text-muted hover:text-balance-text-primary"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};