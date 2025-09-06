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
      <DialogContent className="sm:max-w-md bg-balance-surface border-balance-surface-elevated">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-balance-text-primary text-center">
            How did it go?
          </DialogTitle>
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

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onRate('win')}
              className="h-16 text-lg font-semibold rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30"
            >
              W<br />
              <span className="text-sm font-normal">Win</span>
            </Button>

            <Button
              onClick={() => onRate('good')}
              className="h-16 text-lg font-semibold rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
            >
              Good<br />
              <span className="text-sm font-normal">Good</span>
            </Button>

            <Button
              onClick={() => onRate('bad')}
              className="h-16 text-lg font-semibold rounded-lg bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30 border border-yellow-600/30"
            >
              Bad<br />
              <span className="text-sm font-normal">Bad</span>
            </Button>

            <Button
              onClick={() => onRate('skip')}
              className="h-16 text-lg font-semibold rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
            >
              L<br />
              <span className="text-sm font-normal">Skip</span>
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