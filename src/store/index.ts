/**
 * Balance App - Zustand Store with AsyncStorage persistence
 * Central state management with automatic persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, startOfWeek, addDays } from 'date-fns';
import type { 
  AppState, 
  Pillar, 
  Category, 
  Subcategory, 
  DayPlan, 
  DayItem, 
  LogEntry,
  Settings,
  PILLAR_COLORS 
} from './types';

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default settings
const defaultSettings: Settings = {
  userName: 'User',
  specialRollOver: true,
  chartType: 'donut',
  notificationsEnabled: true,
  hapticFeedback: true,
};

// Seed data - Default pillars, categories, and subcategories
const seedPillars: Pillar[] = [
  { id: 'health', name: 'Health', color: '#00bf63', order: 1 },
  { id: 'relationships', name: 'Relationships', color: '#ff66c4', order: 2 },
  { id: 'work', name: 'Work', color: '#ffde59', order: 3 },
];

const seedCategories: Category[] = [
  // Health categories
  { id: 'workout', pillarId: 'health', name: 'Workout', recurrence: 'daily', defaultStart: '07:00', defaultEnd: '08:00' },
  { id: 'yoga', pillarId: 'health', name: 'Yoga', recurrence: 'daily', defaultStart: '18:00', defaultEnd: '19:00' },
  { id: 'cycling', pillarId: 'health', name: 'Cycling', recurrence: 'special', weeklyDay: 6, isSpecial: true, defaultStart: '09:00', defaultEnd: '11:00' },
  
  // Relationships categories
  { id: 'mindful-call', pillarId: 'relationships', name: 'Mindful Call', recurrence: 'daily', defaultStart: '19:00', defaultEnd: '19:30' },
  { id: 'mindful-texting', pillarId: 'relationships', name: 'Mindful Texting', recurrence: 'daily', defaultStart: '12:00', defaultEnd: '12:15' },
  { id: 'painting-together', pillarId: 'relationships', name: 'Painting Together', recurrence: 'special', weeklyDay: 0, isSpecial: true, defaultStart: '14:00', defaultEnd: '16:00' },
  
  // Work categories
  { id: 'learning-ai', pillarId: 'work', name: 'Learning AI', recurrence: 'daily', defaultStart: '09:00', defaultEnd: '10:30' },
  { id: 'branding-shop', pillarId: 'work', name: 'Branding My Shop', recurrence: 'daily', defaultStart: '10:30', defaultEnd: '12:00' },
  { id: 'movie-night', pillarId: 'work', name: 'Movie Night', recurrence: 'special', weeklyDay: 5, isSpecial: true, defaultStart: '20:00', defaultEnd: '22:00' },
];

const seedSubcategories: Subcategory[] = [
  // Learning AI subcategories
  { id: 'agentic-workflow', categoryId: 'learning-ai', name: 'Make agentic workflow', defaultStart: '09:00', defaultEnd: '09:30' },
  { id: 'make-app-ai', categoryId: 'learning-ai', name: 'Make app with AI', defaultStart: '09:30', defaultEnd: '10:00' },
  { id: 'make-website-ai', categoryId: 'learning-ai', name: 'Make website with AI', defaultStart: '10:00', defaultEnd: '10:30' },
];

// Browser localStorage fallback for persistence
const storage = createJSONStorage(() => localStorage);

export const useBalanceStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      pillars: seedPillars,
      categories: seedCategories,
      subcategories: seedSubcategories,
      dayPlans: {},
      logs: [],
      settings: defaultSettings,
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      expandedPillars: [],
      expandedCategories: [],
      isLoading: false,
      lastSync: Date.now(),

      // Pillar actions
      addPillar: (pillar) => set((state) => ({
        pillars: [...state.pillars, { ...pillar, id: generateId() }],
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
        categories: [...state.categories, { ...category, id: generateId() }],
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
        subcategories: [...state.subcategories, { ...subcategory, id: generateId() }],
      })),

      updateSubcategory: (id, updates) => set((state) => ({
        subcategories: state.subcategories.map(s => s.id === id ? { ...s, ...updates } : s),
      })),

      deleteSubcategory: (id) => set((state) => ({
        subcategories: state.subcategories.filter(s => s.id !== id),
      })),

      // Day plan generation - creates today's plan from templates
      generateDayPlan: (date) => set((state) => {
        if (state.dayPlans[date]) return state; // Already exists
        
        const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
        const items: DayItem[] = [];
        
        // Generate items from categories
        state.categories.forEach(category => {
          const pillar = state.pillars.find(p => p.id === category.pillarId);
          if (!pillar) return;
          
          // Check if category should be included today
          let shouldInclude = false;
          if (category.recurrence === 'daily') {
            shouldInclude = true;
          } else if (category.recurrence === 'special' && category.weeklyDay === dayOfWeek) {
            shouldInclude = true;
          }
          
          if (!shouldInclude) return;
          
          // Get subcategories for this category
          const subcats = state.subcategories.filter(s => s.categoryId === category.id);
          
          if (subcats.length > 0) {
            // Create items for each subcategory
            subcats.forEach(subcat => {
              items.push({
                id: generateId(),
                date,
                pillarId: category.pillarId,
                categoryId: category.id,
                subcategoryId: subcat.id,
                title: subcat.name,
                start: subcat.defaultStart || category.defaultStart,
                end: subcat.defaultEnd || category.defaultEnd,
                status: 'pending',
              });
            });
          } else {
            // Create item for category itself
            items.push({
              id: generateId(),
              date,
              pillarId: category.pillarId,
              categoryId: category.id,
              title: category.name,
              start: category.defaultStart,
              end: category.defaultEnd,
              status: 'pending',
            });
          }
        });
        
        const dayPlan: DayPlan = { date, items };
        
        return {
          dayPlans: {
            ...state.dayPlans,
            [date]: dayPlan,
          },
        };
      }),

      // Update day item
      updateDayItem: (date, itemId, updates) => set((state) => {
        const dayPlan = state.dayPlans[date];
        if (!dayPlan) return state;
        
        return {
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
        finalMinutes = finalMinutes || 0;
        
        // Create log entry
        const logEntry: LogEntry = {
          id: generateId(),
          date,
          pillarId: item.pillarId,
          categoryId: item.categoryId,
          subcategoryId: item.subcategoryId,
          rating,
          minutes: finalMinutes,
          timestamp: Date.now(),
        };
        
        return {
          dayPlans: {
            ...state.dayPlans,
            [date]: {
              ...dayPlan,
              items: dayPlan.items.map(i => 
                i.id === itemId 
                  ? { ...i, status: 'done', rating, minutes: finalMinutes }
                  : i
              ),
            },
          },
          logs: [...state.logs, logEntry],
        };
      }),

      // Add log entry
      addLogEntry: (entry) => set((state) => ({
        logs: [...state.logs, { ...entry, id: generateId(), timestamp: Date.now() }],
      })),

      // Settings
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates },
      })),

      // UI state
      setSelectedDate: (date) => set({ selectedDate: date }),
      
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
      resetData: () => set({
        pillars: seedPillars,
        categories: seedCategories,
        subcategories: seedSubcategories,
        dayPlans: {},
        logs: [],
        settings: defaultSettings,
        expandedPillars: [],
        expandedCategories: [],
      }),

      exportData: () => {
        const state = get();
        return JSON.stringify({
          pillars: state.pillars,
          categories: state.categories,
          subcategories: state.subcategories,
          dayPlans: state.dayPlans,
          logs: state.logs,
          settings: state.settings,
          exportDate: new Date().toISOString(),
        }, null, 2);
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({
            pillars: parsed.pillars || [],
            categories: parsed.categories || [],
            subcategories: parsed.subcategories || [],
            dayPlans: parsed.dayPlans || {},
            logs: parsed.logs || [],
            settings: { ...defaultSettings, ...parsed.settings },
          });
          return true;
        } catch (error) {
          console.error('Failed to import data:', error);
          return false;
        }
      },

      // Computed getters
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
      name: 'balance-app-storage',
      storage,
      partialize: (state) => ({
        pillars: state.pillars,
        categories: state.categories,
        subcategories: state.subcategories,
        dayPlans: state.dayPlans,
        logs: state.logs,
        settings: state.settings,
        lastSync: state.lastSync,
      }),
    }
  )
);

// Initialize today's plan on app start
export const initializeApp = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const store = useBalanceStore.getState();
  
  // Generate today's plan if it doesn't exist
  if (!store.dayPlans[today]) {
    store.generateDayPlan(today);
  }
  
  // Set selected date to today
  store.setSelectedDate(today);
};