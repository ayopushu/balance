/**
 * Balance App - Zustand Store Implementation
 * Complete store with all functionality as specified
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, addDays } from 'date-fns';
import type { 
  AppState, 
  Pillar, 
  Category, 
  Subcategory, 
  DayItem, 
  DayPlan, 
  LogEntry,
  Settings 
} from './types';

// Default data
const DEFAULT_PILLARS: Pillar[] = [
  { id: 'health', name: 'Health', color: '#00bf63', order: 0 },
  { id: 'relationships', name: 'Relationships', color: '#ff66c4', order: 1 },
  { id: 'work', name: 'Work', color: '#ffde59', order: 2 },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'exercise', pillarId: 'health', name: 'Exercise', recurrence: 'daily', defaultStart: '07:00', defaultEnd: '08:00' },
  { id: 'meditation', pillarId: 'health', name: 'Meditation', recurrence: 'daily', defaultStart: '06:30', defaultEnd: '07:00' },
  { id: 'family-time', pillarId: 'relationships', name: 'Family Time', recurrence: 'daily', defaultStart: '18:00', defaultEnd: '19:00' },
  { id: 'deep-work', pillarId: 'work', name: 'Deep Work', recurrence: 'daily', defaultStart: '09:00', defaultEnd: '11:00' },
];

const DEFAULT_SETTINGS: Settings = {
  userName: 'User',
  specialRollOver: true,
  chartType: 'donut',
  notificationsEnabled: false,
  hapticFeedback: true,
  isFirstTime: true,
  hasSeenNotificationPrompt: false,
};

export const useBalanceStore = create<AppState>()(
  persist(
    (set, get) => ({
      // State
      pillars: DEFAULT_PILLARS,
      categories: DEFAULT_CATEGORIES,
      subcategories: [],
      dayPlans: {},
      logs: [],
      settings: DEFAULT_SETTINGS,
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      expandedPillars: ['health', 'relationships', 'work'],
      expandedCategories: [],
      isLoading: false,
      lastSync: Date.now(),

      // Pillar actions
      addPillar: (pillar) => set((state) => ({
        pillars: [...state.pillars, { ...pillar, id: crypto.randomUUID() }],
      })),

      updatePillar: (id, updates) => set((state) => ({
        pillars: state.pillars.map(p => p.id === id ? { ...p, ...updates } : p),
      })),

      deletePillar: (id) => set((state) => ({
        pillars: state.pillars.filter(p => p.id !== id),
        categories: state.categories.filter(c => c.pillarId !== id),
      })),

      // Category actions
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, { ...category, id: crypto.randomUUID() }],
      })),

      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c),
      })),

      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
        subcategories: state.subcategories.filter(s => s.categoryId !== id),
      })),

      // Subcategory actions  
      addSubcategory: (subcategory) => set((state) => ({
        subcategories: [...state.subcategories, { ...subcategory, id: crypto.randomUUID() }],
      })),

      updateSubcategory: (id, updates) => set((state) => ({
        subcategories: state.subcategories.map(s => s.id === id ? { ...s, ...updates } : s),
      })),

      deleteSubcategory: (id) => set((state) => ({
        subcategories: state.subcategories.filter(s => s.id !== id),
      })),

      // Day plan generation
      generateDayPlan: (date) => set((state) => {
        if (state.dayPlans[date]) return state; // Don't overwrite existing plans

        const items: DayItem[] = [];
        
        // Generate items from categories
        state.categories.forEach(category => {
          if (category.recurrence === 'daily' || 
              (category.recurrence === 'weekly' && new Date(date).getDay() === category.weeklyDay)) {
            
            const subcategories = state.subcategories.filter(s => s.categoryId === category.id);
            
            if (subcategories.length > 0) {
              // Create items for each subcategory
              subcategories.forEach(subcategory => {
                items.push({
                  id: crypto.randomUUID(),
                  date,
                  pillarId: category.pillarId,
                  categoryId: category.id,
                  subcategoryId: subcategory.id,
                  title: subcategory.name,
                  start: subcategory.defaultStart || category.defaultStart,
                  end: subcategory.defaultEnd || category.defaultEnd,
                  status: 'pending',
                  isSpecial: category.isSpecial,
                });
              });
            } else {
              // Create item for category
              items.push({
                id: crypto.randomUUID(),
                date,
                pillarId: category.pillarId,
                categoryId: category.id,
                title: category.name,
                start: category.defaultStart,
                end: category.defaultEnd,
                status: 'pending',
                isSpecial: category.isSpecial,
              });
            }
          }
        });

        const newDayPlan: DayPlan = { date, items };

        return {
          ...state,
          dayPlans: {
            ...state.dayPlans,
            [date]: newDayPlan,
          },
        };
      }),

      // Day item actions
      updateDayItem: (date, itemId, updates) => set((state) => {
        const dayPlan = state.dayPlans[date];
        if (!dayPlan) return state;

        return {
          ...state,
          dayPlans: {
            ...state.dayPlans,
            [date]: {
              ...dayPlan,
              items: dayPlan.items.map(item => 
                item.id === itemId ? { ...item, ...updates } : item
              ),
            },
          },
        };
      }),

      // Add day item
      addDayItem: (date, itemData) => set((state) => {
        const dayPlan = state.dayPlans[date];
        const newItem: DayItem = {
          id: crypto.randomUUID(),
          date,
          ...itemData,
        };

        if (dayPlan) {
          return {
            ...state,
            dayPlans: {
              ...state.dayPlans,
              [date]: {
                ...dayPlan,
                items: [...dayPlan.items, newItem],
              },
            },
          };
        } else {
          // Create new day plan if it doesn't exist
          return {
            ...state,
            dayPlans: {
              ...state.dayPlans,
              [date]: {
                date,
                items: [newItem],
              },
            },
          };
        }
      }),

      // Complete day item with rating
      completeDayItem: (date, itemId, rating, minutes) => set((state) => {
        const dayPlan = state.dayPlans[date];
        if (!dayPlan) return state;
        
        const item = dayPlan.items.find(i => i.id === itemId);
        if (!item) return state;
        
        // Calculate minutes if not provided
        let finalMinutes = minutes;
        if (!finalMinutes && item.start && item.end) {
          const [startHour, startMin] = item.start.split(':').map(Number);
          const [endHour, endMin] = item.end.split(':').map(Number);
          finalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        }
        
        const updatedItems = dayPlan.items.map(i => 
          i.id === itemId 
            ? { 
                ...i, 
                status: rating === 'skip' ? 'skipped' : 'done',
                rating,
                minutes: finalMinutes 
              } as DayItem
            : i
        );
        
        // Create log entry
        const logEntry: LogEntry = {
          id: crypto.randomUUID(),
          date,
          pillarId: item.pillarId,
          categoryId: item.categoryId,
          subcategoryId: item.subcategoryId,
          rating: rating === 'win' ? 5 : rating === 'good' ? 4 : rating === 'bad' ? 2 : 0,
          minutes: finalMinutes || 0,
          timestamp: Date.now(),
        };

        return {
          ...state,
          dayPlans: {
            ...state.dayPlans,
            [date]: {
              ...dayPlan,
              items: updatedItems,
            },
          },
          logs: [...state.logs, logEntry],
        };
      }),

      // Log actions
      addLogEntry: (entry) => set((state) => ({
        logs: [...state.logs, { 
          ...entry, 
          id: crypto.randomUUID(), 
          timestamp: Date.now() 
        }],
      })),

      // Settings actions
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates },
      })),

      // Complete onboarding
      completeOnboarding: (userName, newPillars) => set((state) => {
        const pillarsWithIds = newPillars.map(pillar => ({
          ...pillar,
          id: crypto.randomUUID(),
        }));
        
        return {
          ...state,
          settings: {
            ...state.settings,
            userName,
            isFirstTime: false,
          },
          pillars: pillarsWithIds,
          categories: [], // Clear default categories
          expandedPillars: pillarsWithIds.map(p => p.id),
        };
      }),

      // UI state actions
      setSelectedDate: (date) => set(() => ({ selectedDate: date })),

      togglePillarExpanded: (pillarId) => set((state) => ({
        expandedPillars: state.expandedPillars.includes(pillarId)
          ? state.expandedPillars.filter(id => id !== pillarId)
          : [...state.expandedPillars, pillarId],
      })),

      toggleCategoryExpanded: (categoryId) => set((state) => ({
        expandedCategories: state.expandedCategories.includes(categoryId)
          ? state.expandedCategories.filter(id => id !== categoryId)
          : [...state.expandedCategories, categoryId],
      })),

      // Data management
      resetData: () => set(() => ({
        pillars: DEFAULT_PILLARS,
        categories: DEFAULT_CATEGORIES,
        subcategories: [],
        dayPlans: {},
        logs: [],
        settings: DEFAULT_SETTINGS,
        selectedDate: format(new Date(), 'yyyy-MM-dd'),
        expandedPillars: ['health', 'relationships', 'work'],
        expandedCategories: [],
      })),

      exportData: () => {
        const state = get();
        return JSON.stringify({
          pillars: state.pillars,
          categories: state.categories,
          subcategories: state.subcategories,
          dayPlans: state.dayPlans,
          logs: state.logs,
          settings: state.settings,
        }, null, 2);
      },

      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          set((state) => ({
            ...state,
            ...data,
            selectedDate: format(new Date(), 'yyyy-MM-dd'),
            isLoading: false,
            lastSync: Date.now(),
          }));
          return true;
        } catch {
          return false;
        }
      },

      // Getters
      getPillarById: (id) => get().pillars.find(p => p.id === id),
      getCategoryById: (id) => get().categories.find(c => c.id === id),
      getSubcategoryById: (id) => get().subcategories.find(s => s.id === id),
      getCategoriesByPillar: (pillarId) => get().categories.filter(c => c.pillarId === pillarId),
      getSubcategoriesByCategory: (categoryId) => get().subcategories.filter(s => s.categoryId === categoryId),
      getDayPlan: (date) => get().dayPlans[date],
      getLogsByDateRange: (startDate, endDate) => 
        get().logs.filter(log => log.date >= startDate && log.date <= endDate),
    }),
    {
      name: 'balance-store',
      version: 1,
    }
  )
);