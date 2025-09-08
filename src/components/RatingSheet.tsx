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
  DialogDescription,
} from '@/components/ui/dialog';

interface RatingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRate: (rating: 'win' | 'good' | 'bad' | 'skip', minutes?: number) => void;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-balance-surface/95 backdrop-blur-sm border-balance-surface-elevated">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-balance-text-primary text-center">
            How did it go?
          </DialogTitle>
          <DialogDescription className="text-sm text-balance-text-muted text-center">
            Rate how well you completed this task
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="text-center mb-6">
            <h4 className="text-base font-medium text-balance-text-primary mb-2">
              {taskTitle}
            </h4>
            {estimatedMinutes > 0 && (
              <div className="flex items-center justify-center space-x-1 text-balance-text-muted">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{estimatedMinutes} minutes</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => onRate('win')}
              className="w-full h-16 text-lg font-semibold rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30"
            >
              W - Win
            </Button>

            <Button
              onClick={() => onRate('good')}
              className="w-full h-16 text-lg font-semibold rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
            >
              Good
            </Button>

            <Button
              onClick={() => onRate('bad')}
              className="w-full h-16 text-lg font-semibold rounded-lg bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30 border border-yellow-600/30"
            >
              Bad
            </Button>

            <Button
              onClick={() => onRate('skip')}
              className="w-full h-16 text-lg font-semibold rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
            >
              L - Skip
            </Button>
          </div>

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