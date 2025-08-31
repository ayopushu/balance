/**
 * CategoryRow Component - Shows category with subcategories/tasks
 * Displays recurrence badges, time chips, and expandable subcategories
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Clock, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Category, DayItem } from '@/store/types';
import { SubcategoryTile } from './SubcategoryTile';
import { useBalanceStore } from '@/store';

interface CategoryRowProps {
  category: Category;
  dayItems: DayItem[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  pillarColor: string;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  dayItems,
  isExpanded,
  onToggleExpand,
  pillarColor,
}) => {
  const { getSubcategoriesByCategory } = useBalanceStore();
  const subcategories = getSubcategoriesByCategory(category.id);

  // Get recurrence badge info
  const getRecurrenceBadge = () => {
    if (category.recurrence === 'special') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = category.weeklyDay !== undefined ? days[category.weeklyDay] : '';
      return { text: `Special (${dayName})`, variant: 'secondary' as const, icon: Star };
    } else if (category.recurrence === 'weekly') {
      return { text: 'Weekly', variant: 'outline' as const, icon: Calendar };
    } else {
      return { text: 'Daily', variant: 'default' as const, icon: Calendar };
    }
  };

  const badge = getRecurrenceBadge();

  // Format time display
  const getTimeDisplay = () => {
    if (category.defaultStart && category.defaultEnd) {
      return `${category.defaultStart}–${category.defaultEnd}`;
    } else if (category.defaultStart) {
      return `from ${category.defaultStart}`;
    }
    return null;
  };

  const timeDisplay = getTimeDisplay();

  // Check if category has subcategories
  const hasSubcategories = subcategories.length > 0;

  return (
    <div className="surface-elevated p-3 rounded-balance-sm">
      {/* Category header */}
      <Button
        variant="ghost"
        onClick={onToggleExpand}
        className="w-full justify-between p-0 h-auto hover:bg-transparent"
        disabled={!hasSubcategories}
      >
        <div className="flex items-center space-x-3 flex-1">
          {/* Category name and badges */}
          <div className="flex-1 text-left">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="body-lg text-balance-text-primary font-medium">
                {category.name}
              </h4>
              
              {/* Recurrence badge */}
              <Badge variant={badge.variant} className="body-sm">
                <badge.icon className="w-3 h-3 mr-1" />
                {badge.text}
              </Badge>
            </div>
            
            {/* Time chip */}
            {timeDisplay && (
              <div className="flex items-center space-x-1 text-balance-text-muted">
                <Clock className="w-3 h-3" />
                <span className="body-sm">{timeDisplay}</span>
              </div>
            )}
          </div>

          {/* Completion indicator for categories without subcategories */}
          {!hasSubcategories && dayItems.length > 0 && (
            <div className="flex items-center space-x-2">
              {dayItems.map((item) => (
                <div
                  key={item.id}
                  className={`w-3 h-3 rounded-full ${
                    item.status === 'done' 
                      ? 'bg-green-500' 
                      : item.status === 'skipped'
                      ? 'bg-red-500'
                      : 'bg-balance-text-muted opacity-30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Expand chevron (only if has subcategories) */}
        {hasSubcategories && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4 text-balance-text-muted" />
          </motion.div>
        )}
      </Button>

      {/* Expandable subcategories */}
      <AnimatePresence>
        {isExpanded && hasSubcategories && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-3 space-y-2 pl-4 border-l-2 border-balance-surface-elevated"
          >
            {subcategories.map((subcategory) => {
              const subcatItem = dayItems.find(item => item.subcategoryId === subcategory.id);
              
              return (
                <SubcategoryTile
                  key={subcategory.id}
                  subcategory={subcategory}
                  dayItem={subcatItem}
                  pillarColor={pillarColor}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Direct category action (if no subcategories) */}
      {!hasSubcategories && dayItems.length > 0 && (
        <div className="mt-3">
          {dayItems.map((item) => (
            <SubcategoryTile
              key={item.id}
              dayItem={item}
              pillarColor={pillarColor}
              isDirectCategory
            />
          ))}
        </div>
      )}
    </div>
  );
};