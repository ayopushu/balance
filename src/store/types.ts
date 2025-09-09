/**
 * Balance App - TypeScript Interfaces
 * Exact data model implementation as specified
 */

export interface Pillar {
  id: string;
  name: string;
  color: string; // hex color
  order: number;
}

export interface Category {
  id: string;
  pillarId: string;
  name: string;
  recurrence: 'daily' | 'weekly' | 'special';
  weeklyDay?: number; // 0-6 for Sunday-Saturday
  defaultStart?: string; // HH:MM format
  defaultEnd?: string; // HH:MM format
  isSpecial?: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  defaultStart?: string; // HH:MM format
  defaultEnd?: string; // HH:MM format
}

export interface DayItem {
  id: string;
  date: string; // YYYY-MM-DD format
  pillarId: string;
  categoryId: string;
  subcategoryId?: string;
  title: string;
  start?: string; // HH:MM format
  end?: string; // HH:MM format
  minutes?: number;
  status: 'pending' | 'done' | 'skipped';
  rating?: 'win' | 'good' | 'bad' | 'skip'; // Rating type for completed items
  isSpecial?: boolean; // special activity flag
}

export interface DayPlan {
  date: string; // YYYY-MM-DD format
  items: DayItem[];
}

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  pillarId: string;
  categoryId: string;
  subcategoryId?: string;
  rating: number;
  minutes: number;
  timestamp: number; // Unix timestamp
}

export interface Settings {
  userName: string;
  specialRollOver: boolean;
  chartType: 'donut' | 'radar' | 'bar' | 'line';
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
  isFirstTime: boolean;
}

export interface AppState {
  // Core data
  pillars: Pillar[];
  categories: Category[];
  subcategories: Subcategory[];
  dayPlans: { [date: string]: DayPlan };
  logs: LogEntry[];
  settings: Settings;
  
  // UI state
  selectedDate: string;
  expandedPillars: string[];
  expandedCategories: string[];
  isLoading: boolean;
  lastSync: number;
  
  // Actions
  addPillar: (pillar: Omit<Pillar, 'id'>) => void;
  updatePillar: (id: string, updates: Partial<Pillar>) => void;
  deletePillar: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>) => void;
  updateSubcategory: (id: string, updates: Partial<Subcategory>) => void;
  deleteSubcategory: (id: string) => void;
  
  generateDayPlan: (date: string) => void;
  updateDayItem: (date: string, itemId: string, updates: Partial<DayItem>) => void;
  addDayItem: (date: string, itemData: Omit<DayItem, 'id' | 'date'>) => void;
  completeDayItem: (date: string, itemId: string, rating: 'win' | 'good' | 'bad' | 'skip', minutes?: number) => void;
  
  addLogEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  
  updateSettings: (updates: Partial<Settings>) => void;
  completeOnboarding: (userName: string, newPillars: Omit<Pillar, 'id'>[]) => void;
  
  setSelectedDate: (date: string) => void;
  togglePillarExpanded: (pillarId: string) => void;
  toggleCategoryExpanded: (categoryId: string) => void;
  
  resetData: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
  
  // Computed getters
  getPillarById: (id: string) => Pillar | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getSubcategoryById: (id: string) => Subcategory | undefined;
  getCategoriesByPillar: (pillarId: string) => Category[];
  getSubcategoriesByCategory: (categoryId: string) => Subcategory[];
  getDayPlan: (date: string) => DayPlan | undefined;
  getLogsByDateRange: (startDate: string, endDate: string) => LogEntry[];
}

// Analytics helper types
export interface PillarStats {
  pillarId: string;
  totalMinutes: number;
  qualityMinutes: number;
  completionRate: number;
  averageRating: number;
}

export interface DayStats {
  date: string;
  totalMinutes: number;
  qualityMinutes: number;
  pillars: PillarStats[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    colors: string[];
  }[];
}

// Rating weights for quality calculations
export const RATING_WEIGHTS: Record<'win' | 'good' | 'bad' | 'skip', number> = {
  win: 1.0,
  good: 0.7,
  bad: 0.3,
  skip: 0.0,
};

// Default pillar colors
export const PILLAR_COLORS = {
  health: '#00bf63',
  relationships: '#ff66c4',
  work: '#ffde59',
} as const;