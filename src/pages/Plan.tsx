/**
 * Plan Screen - Weekly planning view with day navigation
 * Shows 7-day week strip and day plan editing capabilities
 */

import React, { useState } from 'react';
import { format, startOfWeek, addDays, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Edit3, Clock, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBalanceStore } from '@/store';
import { motion } from 'framer-motion';
import type { DayItem } from '@/store/types';

export const Plan: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    getDayPlan,
    generateDayPlan,
    updateDayItem,
    pillars,
    getCategoriesByPillar,
    categories,
  } = useBalanceStore();

  const [weekStart, setWeekStart] = useState(() => 
    startOfWeek(new Date(selectedDate), { weekStartsOn: 0 }) // Sunday start
  );

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<DayItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    start: '',
    end: '',
    categoryId: '',
    subcategoryId: '',
    isSpecial: false,
  });

  const today = startOfDay(new Date());

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Navigate weeks
  const goToPreviousWeek = () => {
    setWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setWeekStart(prev => addDays(prev, 7));
  };

  // Handle day selection
  const handleDaySelect = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    if (isBefore(date, today)) return; // Don't allow selection of past days
    
    setSelectedDate(dateString);
    
    // Generate day plan if it doesn't exist
    if (!getDayPlan(dateString)) {
      generateDayPlan(dateString);
    }
  };

  // Check if day is in the past
  const isDayPast = (date: Date) => {
    return isBefore(date, today);
  };

  // Check if day is today
  const isDayToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  // Get day plan summary
  const getDaySummary = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayPlan = getDayPlan(dateString);
    
    if (!dayPlan) return { total: 0, completed: 0, pillars: [] };
    
    const pillarStats = pillars.map(pillar => {
      const pillarItems = dayPlan.items.filter(item => item.pillarId === pillar.id);
      const completed = pillarItems.filter(item => item.status === 'done').length;
      return {
        pillarId: pillar.id,
        color: pillar.color,
        total: pillarItems.length,
        completed,
      };
    });

    return {
      total: dayPlan.items.length,
      completed: dayPlan.items.filter(item => item.status === 'done').length,
      pillars: pillarStats,
    };
  };

  // Handle edit item
  const handleEditItem = (item: DayItem) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      start: item.start || '',
      end: item.end || '',
      categoryId: item.categoryId || '',
      subcategoryId: item.subcategoryId || '',
      isSpecial: item.isSpecial || false,
    });
    setShowEditDialog(true);
  };

  // Save edit changes
  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    updateDayItem(selectedDate, editingItem.id, {
      ...editingItem,
      title: editForm.title,
      start: editForm.start || undefined,
      end: editForm.end || undefined,
      categoryId: editForm.categoryId || undefined,
      subcategoryId: editForm.subcategoryId || undefined,
      isSpecial: editForm.isSpecial,
    });
    
    setShowEditDialog(false);
    setEditingItem(null);
  };

  const selectedDateObj = new Date(selectedDate);
  const selectedDayPlan = getDayPlan(selectedDate);

  return (
    <div className="min-h-screen bg-balance-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-balance-background/95 backdrop-blur-sm border-b border-balance-surface-elevated">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="heading-lg text-balance-text-primary">
              Plan Your Week
            </h1>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousWeek}
                className="text-balance-text-muted hover:text-balance-text-primary"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <span className="body-md text-balance-text-secondary min-w-[120px] text-center">
                {format(weekStart, 'MMM yyyy')}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextWeek}
                className="text-balance-text-muted hover:text-balance-text-primary"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Week strip */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date, index) => {
              const isSelected = format(date, 'yyyy-MM-dd') === selectedDate;
              const isPast = isDayPast(date);
              const isToday = isDayToday(date);
              const summary = getDaySummary(date);

              return (
                <motion.button
                  key={format(date, 'yyyy-MM-dd')}
                  onClick={() => handleDaySelect(date)}
                  disabled={isPast}
                  className={`relative p-3 rounded-balance transition-balance ${
                    isPast
                      ? 'surface opacity-50 cursor-not-allowed text-balance-text-muted'
                      : isSelected
                      ? 'bg-health text-white shadow-lg'
                      : isToday
                      ? 'bg-health/20 text-health border border-health/30'
                      : 'surface hover:bg-balance-surface-elevated text-balance-text-primary'
                  }`}
                  whileHover={!isPast ? { scale: 1.05 } : {}}
                  whileTap={!isPast ? { scale: 0.95 } : {}}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="text-center">
                    <div className="body-sm opacity-70 mb-1">
                      {format(date, 'EEE')}
                    </div>
                    <div className="heading-sm">
                      {format(date, 'd')}
                    </div>
                    
                    {/* Task indicator */}
                    {summary.total > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-health rounded-full" />
                    )}
                    
                    {/* Past day red cross */}
                    {isPast && (
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Selected day content - Pillar Cards */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-medium text-balance-text-primary mb-1">
                {format(selectedDateObj, 'EEEE, MMMM d')}
              </h2>
              {selectedDayPlan && selectedDayPlan.items.length > 0 && (
                <p className="text-sm text-balance-text-secondary">
                  {selectedDayPlan.items.filter(item => item.status === 'done').length} of {selectedDayPlan.items.length} tasks completed
                </p>
              )}
            </div>

            {/* Pillar cards with tasks */}
            {pillars.map((pillar) => {
              const pillarItems = selectedDayPlan?.items.filter(item => item.pillarId === pillar.id) || [];
              if (pillarItems.length === 0) return null;

              return (
                <Card key={pillar.id} className="surface p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-balance-surface-elevated/50 transition-all"
                    style={{ borderLeft: `4px solid ${pillar.color}` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: pillar.color }}
                      />
                      <h3 className="text-base font-medium text-balance-text-primary">
                        {pillar.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-balance-surface-elevated rounded-full text-balance-text-muted">
                        {pillarItems.length} tasks
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {pillarItems.map((item) => (
                      <div 
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          item.status === 'done' 
                            ? 'bg-health/10 border-health/20 line-through opacity-70' 
                            : item.status === 'skipped'
                            ? 'bg-red-500/10 border-red-500/20 line-through opacity-70'
                            : 'bg-balance-surface-elevated/50 border-balance-surface-elevated hover:bg-balance-surface-elevated'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-balance-text-primary truncate">
                              {item.title}
                            </span>
                            {item.rating && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                item.rating === 'win' ? 'bg-yellow-500/20 text-yellow-400' :
                                item.rating === 'good' ? 'bg-green-500/20 text-green-400' :
                                item.rating === 'bad' ? 'bg-yellow-600/20 text-yellow-600' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {item.rating === 'win' ? 'W' : item.rating === 'good' ? 'Good' : item.rating === 'bad' ? 'Bad' : 'L'}
                              </span>
                            )}
                          </div>
                          {item.start && item.end && (
                            <div className="flex items-center space-x-1 text-balance-text-muted mt-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{item.start}–{item.end}</span>
                            </div>
                          )}
                        </div>
                        
                        {!isDayPast(selectedDateObj) && item.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="text-balance-text-muted hover:text-balance-text-primary flex-shrink-0 ml-2"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
            
            {!selectedDayPlan || selectedDayPlan.items.length === 0 ? (
              <Card className="surface p-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-balance-text-secondary mb-2">
                    No tasks planned
                  </h3>
                  <p className="text-sm text-balance-text-muted mb-4">
                    Generate a day plan to get started.
                  </p>
                  {!isDayPast(selectedDateObj) && (
                    <Button
                      onClick={() => generateDayPlan(selectedDate)}
                      className="bg-health hover:bg-health/90 text-white rounded-lg px-6 py-2"
                    >
                      Generate Plan
                    </Button>
                  )}
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md surface rounded-balance">
          <DialogHeader>
            <DialogTitle className="heading-md text-balance-text-primary">
              Edit Task
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="body-md text-balance-text-secondary">
                Task Title
              </Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="surface-elevated border-balance-surface-elevated rounded-balance mt-1"
                placeholder="Enter task title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start" className="body-md text-balance-text-secondary">
                  Start Time
                </Label>
                <Input
                  id="start"
                  type="time"
                  value={editForm.start}
                  onChange={(e) => setEditForm(prev => ({ ...prev, start: e.target.value }))}
                  className="surface-elevated border-balance-surface-elevated rounded-balance mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="end" className="body-md text-balance-text-secondary">
                  End Time
                </Label>
                <Input
                  id="end"
                  type="time"
                  value={editForm.end}
                  onChange={(e) => setEditForm(prev => ({ ...prev, end: e.target.value }))}
                  className="surface-elevated border-balance-surface-elevated rounded-balance mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label className="body-md text-balance-text-secondary">
                Category
              </Label>
              <Select
                value={editForm.categoryId}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger className="surface-elevated border-balance-surface-elevated rounded-balance mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="surface rounded-balance">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-3">
            <Button 
              variant="ghost" 
              onClick={() => setShowEditDialog(false)}
              className="rounded-balance"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="bg-health hover:bg-health/90 text-white rounded-balance"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};