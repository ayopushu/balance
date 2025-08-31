/**
 * RoundedCheckbox Component - Custom rounded checkbox for Balance app
 * Features thick border, smooth animation, and pillar color theming
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoundedCheckboxProps {
  checked: boolean;
  onCheck: () => void;
  pillarColor: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RoundedCheckbox: React.FC<RoundedCheckboxProps> = ({
  checked,
  onCheck,
  pillarColor,
  disabled = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onCheck}
      disabled={disabled}
      className="p-0 hover:bg-transparent"
    >
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-2 flex items-center justify-center transition-balance`}
        style={{
          borderColor: checked ? pillarColor : 'hsl(var(--balance-text-muted))',
          backgroundColor: checked ? pillarColor : 'transparent',
        }}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: checked ? 1 : 0, 
            opacity: checked ? 1 : 0 
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Check className={`${iconSizes[size]} text-white`} strokeWidth={3} />
        </motion.div>
      </motion.div>
    </Button>
  );
};