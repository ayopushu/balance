/**
 * PillarCard Component - Collapsible pillar display with categories
 * Shows pillar stats, sparkline, and expandable categories
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Pillar, Category, DayItem } from '@/store/types';
import { CategoryRow } from './CategoryRow';

interface PillarCardProps {
  pillar: Pillar;
  categories: Category[];
  dayItems: DayItem[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCategoryToggle: (categoryId: string) => void;
  expandedCategories: string[];
  totalMinutesToday: number;
  percentageToday: number;
}

export const PillarCard: React.FC<PillarCardProps> = ({
  pillar,
  categories,
  dayItems,
  isExpanded,
  onToggleExpand,
  onCategoryToggle,
  expandedCategories,
  totalMinutesToday,
  percentageToday,
}) => {
  // Get pillar color class
  const getPillarColorClass = (pillarId: string) => {
    switch (pillarId) {
      case 'health': return 'pillar-health';
      case 'relationships': return 'pillar-relationships';
      case 'work': return 'pillar-work';
      default: return 'text-primary';
    }
  };

  const getBgPillarColorClass = (pillarId: string) => {
    switch (pillarId) {
      case 'health': return 'bg-pillar-health';
      case 'relationships': return 'bg-pillar-relationships';
      case 'work': return 'bg-pillar-work';
      default: return 'bg-primary';
    }
  };

  // Simple sparkline data (last 7 days simulation)
  const sparklineData = [20, 35, 25, 45, 30, 40, totalMinutesToday];
  const maxValue = Math.max(...sparklineData);

  return (
    <Card className="surface p-4 transition-balance">
      {/* Pillar Header */}
      <Button
        variant="ghost"
        onClick={onToggleExpand}
        className="w-full justify-between p-0 h-auto hover:bg-transparent"
      >
        <div className="flex items-center space-x-4">
          {/* Color indicator */}
          <div className={`w-4 h-4 rounded-full ${getBgPillarColorClass(pillar.id)}`} />
          
          {/* Pillar info */}
          <div className="flex-1 text-left">
            <h3 className={`heading-sm ${getPillarColorClass(pillar.id)}`}>
              {pillar.name}
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              <span className="body-md text-balance-text-secondary">
                {totalMinutesToday}min today
              </span>
              <span className="body-md text-balance-text-secondary">
                {percentageToday.toFixed(1)}% of day
              </span>
            </div>
          </div>

          {/* Mini sparkline */}
          <div className="flex items-end space-x-1 h-8">
            {sparklineData.map((value, index) => (
              <div
                key={index}
                className={`w-1 ${getBgPillarColorClass(pillar.id)} rounded-full opacity-60`}
                style={{
                  height: `${Math.max(4, (value / maxValue) * 32)}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Expand/collapse chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-balance-text-muted" />
        </motion.div>
      </Button>

      {/* Expandable categories */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-4 space-y-2"
          >
            {categories.map((category) => {
              const categoryItems = dayItems.filter(item => item.categoryId === category.id);
              const isExpanded = expandedCategories.includes(category.id);
              
              return (
                <CategoryRow
                  key={category.id}
                  category={category}
                  dayItems={categoryItems}
                  isExpanded={isExpanded}
                  onToggleExpand={() => onCategoryToggle(category.id)}
                  pillarColor={pillar.color}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};