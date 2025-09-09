/**
 * RatingSheet Component - Bottom sheet modal for task rating
 * Four rating buttons: W (Done), Good, Bad, Skip (L) with haptic feedback
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';

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
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          
          {/* iOS-style popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-balance-surface rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-balance-text-primary mb-2">
                How did it go?
              </h3>
              <p className="text-sm text-balance-text-secondary">
                {taskTitle}
              </p>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={() => onRate('win')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30 text-base font-medium transition-all"
              >
                W - Done
              </motion.button>

              <motion.button
                onClick={() => onRate('good')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 text-base font-medium transition-all"
              >
                Good
              </motion.button>

              <motion.button
                onClick={() => onRate('bad')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 rounded-xl bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30 border border-yellow-600/30 text-base font-medium transition-all"
              >
                Bad
              </motion.button>

              <motion.button
                onClick={() => onRate('skip')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-base font-medium transition-all"
              >
                L - Skip
              </motion.button>
            </div>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 h-12 rounded-xl bg-balance-surface-elevated text-balance-text-muted hover:text-balance-text-primary transition-all"
            >
              Cancel
            </motion.button>
          </motion.div>
        </div>
      )}
    </>
  );
};