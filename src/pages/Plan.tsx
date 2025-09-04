/**
 * Plan Screen - Weekly planning view with day navigation
 * Shows 7-day week strip and day plan editing capabilities
 */

import React, { useState } from 'react';
import { format, startOfWeek, addDays, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Edit3, Clock, Tag } from 'lucide-react';
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
    <div className="min-h-screen bg-balance-background">
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

      {/* Week strip */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const isSelected = format(date, 'yyyy-MM-dd') === selectedDate;
            const isPast = isDayPast(date);
            const isToday = isDayToday(date);
            const summary = getDaySummary(date);

            return (
              <motion.div
                key={date.toISOString()}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => handleDaySelect(date)}
                  disabled={isPast}
                  className={`w-full h-auto p-3 flex flex-col space-y-2 rounded-balance transition-balance ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : isPast 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-balance-surface-elevated'
                  }`}
                >
                  {/* Day name */}
                  <div className={`body-sm font-medium ${isToday ? 'text-health' : ''}`}>
                    {format(date, 'EEE')}
                  </div>
                  
                  {/* Date */}
                  <div className="text-lg font-semibold">
                    {format(date, 'd')}
                  </div>
                  
                  {/* Progress indicators */}
                  {summary.total > 0 && (
                    <div className="flex space-x-1">
                      {summary.pillars.map((pillar) => (
                        <div
                          key={pillar.pillarId}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: pillar.color,
                            opacity: pillar.completed === pillar.total ? 1 : 0.3,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Completion ratio */}
                  {summary.total > 0 && (
                    <div className="body-sm opacity-70">
                      {summary.completed}/{summary.total}
                    </div>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected day details */}
      <div className="container mx-auto px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-md text-balance-text-primary">
            {format(selectedDateObj, 'EEEE, MMMM d')}
            {isDayToday(selectedDateObj) && (
              <span className="ml-2 px-2 py-1 text-sm bg-health text-white rounded-full">
                Today
              </span>
            )}
          </h2>
          
          {!isDayPast(selectedDateObj) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="text-balance-text-muted hover:text-balance-text-primary border-balance-surface-elevated rounded-balance"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Day
            </Button>
          )}
        </div>

        {/* Day plan content */}
        {selectedDayPlan ? (
          <div className="space-y-4">
            {pillars.map((pillar) => {
              const pillarItems = selectedDayPlan.items.filter(item => item.pillarId === pillar.id);
              
              if (pillarItems.length === 0) return null;

              return (
                <Card key={pillar.id} className="surface p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: pillar.color }}
                    />
                    <h3 className="heading-sm" style={{ color: pillar.color }}>
                      {pillar.name}
                    </h3>
                    <span className="body-sm text-balance-text-muted">
                      {pillarItems.filter(item => item.status === 'done').length}/{pillarItems.length}
                    </span>
                  </div>
                  
                   <div className="space-y-2">
                     {pillarItems.map((item) => (
                       <div 
                         key={item.id}
                         className="flex items-center justify-between p-2 surface-elevated rounded-balance-sm hover:bg-balance-surface-elevated cursor-pointer transition-balance"
                         onClick={() => handleEditItem(item)}
                       >
                         <div className="flex items-center space-x-3">
                           <div 
                             className={`w-3 h-3 rounded-full ${
                               item.status === 'done' ? 'bg-green-500' : 
                               item.status === 'skipped' ? 'bg-red-500' : 
                               'bg-balance-text-muted opacity-30'
                             }`}
                           />
                           <span className={`body-md ${
                             item.status === 'done' ? 'text-balance-text-muted line-through' : 'text-balance-text-primary'
                           }`}>
                             {item.title}
                           </span>
                           {item.isSpecial && (
                             <span className="px-2 py-1 text-xs bg-work text-white rounded-full">
                               Special
                             </span>
                           )}
                         </div>
                         
                         {item.start && item.end && (
                           <span className="body-sm text-balance-text-muted">
                             {item.start}–{item.end}
                           </span>
                         )}
                       </div>
                     ))}
                   </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="heading-md text-balance-text-secondary mb-4">
              No plan for this day
            </h3>
            <p className="body-md text-balance-text-muted mb-6">
              Generate a day plan based on your pillar templates.
            </p>
            <Button
              onClick={() => generateDayPlan(selectedDate)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-balance"
            >
              <Plus className="w-5 h-5 mr-2" />
              Generate Day Plan
            </Button>
           </div>
         )}
       </div>

       {/* Edit Day Dialog */}
       <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
         <DialogContent className="bg-balance-surface border-balance-surface-elevated max-w-md">
           <DialogHeader>
             <DialogTitle className="text-balance-text-primary">Edit Task</DialogTitle>
           </DialogHeader>

           <div className="space-y-4 py-4">
             <div>
               <Label className="body-md text-balance-text-primary">Task Title</Label>
               <Input
                 value={editForm.title}
                 onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                 className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm mt-2"
                 placeholder="Enter task title"
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label className="body-md text-balance-text-primary">Start Time</Label>
                 <Input
                   type="time"
                   value={editForm.start}
                   onChange={(e) => setEditForm({ ...editForm, start: e.target.value })}
                   className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm mt-2"
                 />
               </div>
               <div>
                 <Label className="body-md text-balance-text-primary">End Time</Label>
                 <Input
                   type="time"
                   value={editForm.end}
                   onChange={(e) => setEditForm({ ...editForm, end: e.target.value })}
                   className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm mt-2"
                 />
               </div>
             </div>

             <div>
               <Label className="body-md text-balance-text-primary">Category</Label>
               <Select 
                 value={editForm.categoryId} 
                 onValueChange={(value) => setEditForm({ ...editForm, categoryId: value, subcategoryId: '' })}
               >
                 <SelectTrigger className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm mt-2">
                   <SelectValue placeholder="Select category" />
                 </SelectTrigger>
                 <SelectContent>
                   {categories.map((category) => (
                     <SelectItem key={category.id} value={category.id}>
                       {category.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             <div className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 id="isSpecial"
                 checked={editForm.isSpecial}
                 onChange={(e) => setEditForm({ ...editForm, isSpecial: e.target.checked })}
                 className="rounded"
               />
               <Label htmlFor="isSpecial" className="body-md text-balance-text-primary">
                 Mark as special activity
               </Label>
             </div>
           </div>

           <DialogFooter>
             <Button variant="ghost" onClick={() => setShowEditDialog(false)}>
               Cancel
             </Button>
             <Button 
               onClick={handleSaveEdit}
               className="bg-health hover:bg-health/90 text-white"
               disabled={!editForm.title.trim()}
             >
               Save Changes
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };