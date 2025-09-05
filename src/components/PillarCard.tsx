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
      case 'health': return 'text-health';
      case 'relationships': return 'text-relationships';
      case 'work': return 'text-work';
      default: return 'text-primary';
    }
  };

  const getBgPillarColorClass = (pillarId: string) => {
    switch (pillarId) {
      case 'health': return 'bg-health/20';
      case 'relationships': return 'bg-relationships/20';
      case 'work': return 'bg-work/20';
      default: return 'bg-primary/20';
    }
  };

  const getBorderPillarColorClass = (pillarId: string) => {
    switch (pillarId) {
      case 'health': return 'border-health/30';
      case 'relationships': return 'border-relationships/30';
      case 'work': return 'border-work/30';
      default: return 'border-primary/30';
    }
  };

  // Simple sparkline data (last 7 days simulation)
  const sparklineData = [20, 35, 25, 45, 30, 40, totalMinutesToday];
  const maxValue = Math.max(...sparklineData);

  return (
    <Card className={`surface p-0 border-2 ${getBorderPillarColorClass(pillar.id)} ${getBgPillarColorClass(pillar.id)} transition-balance overflow-hidden`}>
      {/* Pillar Header */}
      <div className="p-4 border-b border-balance-surface-elevated">
        <div className="flex items-center space-x-4">
          {/* Color indicator */}
          <div className={`w-6 h-6 rounded-full ${pillar.id === 'health' ? 'bg-health' : pillar.id === 'relationships' ? 'bg-relationships' : 'bg-work'} shadow-lg`} />
          
          {/* Pillar info */}
          <div className="flex-1 text-left min-w-0">
            <h3 className={`heading-md ${getPillarColorClass(pillar.id)} font-semibold truncate`}>
              {pillar.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="body-md text-balance-text-secondary">
                {totalMinutesToday}min today
              </span>
            </div>
          </div>

          {/* Mini sparkline */}
          <div className="flex items-end space-x-1 h-10 flex-shrink-0">
            {sparklineData.map((value, index) => (
              <div
                key={index}
                className={`w-2 ${pillar.id === 'health' ? 'bg-health' : pillar.id === 'relationships' ? 'bg-relationships' : 'bg-work'} rounded-full shadow-sm`}
                style={{
                  height: `${Math.max(6, (value / maxValue) * 40)}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Always visible categories */}
      <div className="p-4 space-y-3">
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
      </div>
    </Card>
  );
};