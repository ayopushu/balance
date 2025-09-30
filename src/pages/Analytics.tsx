/**
 * Analytics Screen - Comprehensive balance analytics with period-specific insights
 * Shows different meaningful data for each time period with real calculations
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Trophy, AlertCircle, Target, CheckCircle2, Clock, Flame, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useBalanceStore } from '@/store';
import type { DayItem, LogEntry } from '@/store/types';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { 
  format, 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  endOfWeek,
  endOfMonth,
  subDays, 
  subWeeks,
  isWithinInterval, 
  parseISO, 
  isSameDay,
  differenceInDays,
  addDays,
  getWeek,
  isWeekend,
  eachDayOfInterval,
  min,
  max
} from 'date-fns';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { pillars, dayPlans, logs } = useBalanceStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('daily');

  // Helper: Get all tasks for a date range
  const getTasksInRange = (startDate: Date, endDate: Date) => {
    const tasks: (DayItem & { date: string })[] = [];
    Object.entries(dayPlans).forEach(([date, plan]) => {
      const planDate = parseISO(date);
      if (isWithinInterval(planDate, { start: startDate, end: endDate })) {
        plan.items.forEach(item => {
          tasks.push({ ...item, date });
        });
      }
    });
    return tasks;
  };

  // Helper: Get completed tasks (from logs)
  const getCompletedTasksInRange = (startDate: Date, endDate: Date): LogEntry[] => {
    return logs.filter(log => {
      const logDate = parseISO(log.date);
      return isWithinInterval(logDate, { start: startDate, end: endDate });
    });
  };

  // Calculate date ranges
  const ranges = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = subDays(today, 1);
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = subWeeks(thisWeekStart, 1);
    const lastWeekEnd = subDays(thisWeekStart, 1);
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = subDays(thisMonthStart, 30);
    
    // Get first log date for all-time
    const firstLogDate = logs.length > 0 
      ? new Date(Math.min(...logs.map(l => parseISO(l.date).getTime())))
      : today;

    return {
      today: { start: today, end: now },
      yesterday: { start: yesterday, end: subDays(now, 1) },
      thisWeek: { start: thisWeekStart, end: now },
      lastWeek: { start: lastWeekStart, end: lastWeekEnd },
      thisMonth: { start: thisMonthStart, end: now },
      lastMonth: { start: lastMonthStart, end: subDays(thisMonthStart, 1) },
      allTime: { start: firstLogDate, end: now },
    };
  }, [logs]);

  // DAILY VIEW DATA
  const dailyData = useMemo(() => {
    const todayTasks = getTasksInRange(ranges.today.start, ranges.today.end);
    const todayCompleted = getCompletedTasksInRange(ranges.today.start, ranges.today.end);
    const yesterdayTasks = getTasksInRange(ranges.yesterday.start, ranges.yesterday.end);
    const yesterdayCompleted = getCompletedTasksInRange(ranges.yesterday.start, ranges.yesterday.end);

    const totalToday = todayTasks.length;
    const completedToday = todayCompleted.length;
    const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

    const totalYesterday = yesterdayTasks.length;
    const completedYesterday = yesterdayCompleted.length;
    const yesterdayRate = totalYesterday > 0 ? (completedYesterday / totalYesterday) * 100 : 0;

    const taskDiff = completedToday - completedYesterday;
    const rateDiff = completionRate - yesterdayRate;

    // Time invested today
    const totalMinutes = todayCompleted.reduce((sum, log) => sum + (log.minutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Today's rating breakdown
    const ratings = {
      win: todayCompleted.filter(log => log.rating === 5).length,
      good: todayCompleted.filter(log => log.rating === 4).length,
      bad: todayCompleted.filter(log => log.rating === 2).length,
      skip: todayCompleted.filter(log => log.rating === 0).length,
    };

    // Calculate average quality (5=W-Done, 4=Good, 2=Bad, 0=L-Skip)
    const avgRating = completedToday > 0
      ? todayCompleted.reduce((sum, log) => sum + log.rating, 0) / completedToday
      : 0;

    // Pillar distribution for today
    const pillarDist = pillars.map(pillar => {
      const pillarTasks = todayCompleted.filter(log => log.pillarId === pillar.id);
      return {
        pillar: pillar.name,
        count: pillarTasks.length,
        color: pillar.color,
      };
    }).filter(p => p.count > 0);

    return {
      totalToday,
      completedToday,
      completionRate,
      totalMinutes,
      hours,
      minutes,
      ratings,
      avgRating,
      taskDiff,
      rateDiff,
      yesterdayRate,
      pillarDist,
    };
  }, [ranges, pillars, logs, dayPlans]);

  // WEEKLY VIEW DATA
  const weeklyData = useMemo(() => {
    const thisWeekTasks = getTasksInRange(ranges.thisWeek.start, ranges.thisWeek.end);
    const thisWeekCompleted = getCompletedTasksInRange(ranges.thisWeek.start, ranges.thisWeek.end);
    const lastWeekTasks = getTasksInRange(ranges.lastWeek.start, ranges.lastWeek.end);
    const lastWeekCompleted = getCompletedTasksInRange(ranges.lastWeek.start, ranges.lastWeek.end);

    const totalThisWeek = thisWeekTasks.length;
    const completedThisWeek = thisWeekCompleted.length;
    const completionRate = totalThisWeek > 0 ? (completedThisWeek / totalThisWeek) * 100 : 0;

    const totalLastWeek = lastWeekTasks.length;
    const completedLastWeek = lastWeekCompleted.length;
    const lastWeekRate = totalLastWeek > 0 ? (completedLastWeek / totalLastWeek) * 100 : 0;
    const improvement = completionRate - lastWeekRate;

    // Daily breakdown for the week
    const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(ranges.thisWeek.start, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTasks = thisWeekTasks.filter(t => t.date === dateStr);
      const dayCompleted = thisWeekCompleted.filter(log => log.date === dateStr);
      const rate = dayTasks.length > 0 ? (dayCompleted.length / dayTasks.length) * 100 : 0;

      return {
        day: format(date, 'EEE'),
        completed: dayCompleted.length,
        total: dayTasks.length,
        rate: Math.round(rate),
      };
    });

    // Most productive day
    const mostProductiveDay = dailyBreakdown.reduce((best, current) => 
      current.completed > best.completed ? current : best
    , dailyBreakdown[0]);

    // Calculate streak
    let streak = 0;
    const allCompletedDates = [...new Set(logs.map(log => log.date))].sort().reverse();
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (allCompletedDates.length > 0) {
      let currentDate = isSameDay(parseISO(allCompletedDates[0]), new Date()) 
        ? new Date() 
        : addDays(parseISO(allCompletedDates[0]), 1);
      
      for (const dateStr of allCompletedDates) {
        const logDate = parseISO(dateStr);
        const daysDiff = differenceInDays(startOfDay(currentDate), startOfDay(logDate));
        
        if (daysDiff === 0 || daysDiff === 1) {
          streak++;
          currentDate = logDate;
        } else {
          break;
        }
      }
    }

    // Pillar distribution
    const pillarDist = pillars.map(pillar => {
      const pillarLogs = thisWeekCompleted.filter(log => log.pillarId === pillar.id);
      return {
        pillar: pillar.name,
        count: pillarLogs.length,
        color: pillar.color,
      };
    }).filter(p => p.count > 0);

    // Insights
    const weekdayCompleted = thisWeekCompleted.filter(log => !isWeekend(parseISO(log.date)));
    const weekendCompleted = thisWeekCompleted.filter(log => isWeekend(parseISO(log.date)));
    const isWeekdayProductive = weekdayCompleted.length > weekendCompleted.length;

    return {
      totalThisWeek,
      completedThisWeek,
      completionRate,
      lastWeekRate,
      improvement,
      mostProductiveDay,
      streak,
      dailyBreakdown,
      pillarDist,
      isWeekdayProductive,
    };
  }, [ranges, pillars, logs, dayPlans]);

  // MONTHLY VIEW DATA
  const monthlyData = useMemo(() => {
    const thisMonthTasks = getTasksInRange(ranges.thisMonth.start, ranges.thisMonth.end);
    const thisMonthCompleted = getCompletedTasksInRange(ranges.thisMonth.start, ranges.thisMonth.end);

    const totalThisMonth = thisMonthTasks.length;
    const completedThisMonth = thisMonthCompleted.length;
    const completionRate = totalThisMonth > 0 ? (completedThisMonth / totalThisMonth) * 100 : 0;

    const totalMinutes = thisMonthCompleted.reduce((sum, log) => sum + (log.minutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Daily trend for the month (last 30 days)
    const dailyTrend = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayPlan = dayPlans[dateStr];
      const dayLogs = logs.filter(log => log.date === dateStr);
      const dayTotal = dayPlan?.items.length || 0;
      const dayCompleted = dayLogs.length;
      const rate = dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0;

      return {
        date: format(date, 'MMM d'),
        rate: Math.round(rate),
        completed: dayCompleted,
        fullDate: date,
      };
    }).filter(d => d.completed > 0 || d.rate > 0);

    // Week-by-week breakdown
    const currentWeek = getWeek(new Date());
    const weeklyBreakdown = [1, 2, 3, 4].map(weekOffset => {
      const weekStart = addDays(ranges.thisMonth.start, (weekOffset - 1) * 7);
      const weekEnd = min([addDays(weekStart, 6), endOfMonth(ranges.thisMonth.start), new Date()]);
      
      const weekTasks = getTasksInRange(weekStart, weekEnd);
      const weekCompleted = getCompletedTasksInRange(weekStart, weekEnd);
      const rate = weekTasks.length > 0 ? (weekCompleted.length / weekTasks.length) * 100 : 0;

      return {
        week: `Week ${weekOffset}`,
        rate: Math.round(rate),
        total: weekTasks.length,
        completed: weekCompleted.length,
      };
    }).filter(w => w.total > 0);

    // Best week
    const bestWeek = weeklyBreakdown.length > 0
      ? weeklyBreakdown.reduce((best, current) => current.rate > best.rate ? current : best)
      : null;

    // Pillar performance (horizontal bars)
    const pillarPerformance = pillars.map(pillar => {
      const pillarTasks = thisMonthTasks.filter(t => t.pillarId === pillar.id);
      const pillarCompleted = thisMonthCompleted.filter(log => log.pillarId === pillar.id);
      const rate = pillarTasks.length > 0 ? (pillarCompleted.length / pillarTasks.length) * 100 : 0;

      return {
        pillar: pillar.name,
        completed: pillarCompleted.length,
        total: pillarTasks.length,
        rate: Math.round(rate),
        color: pillar.color,
      };
    }).filter(p => p.total > 0).sort((a, b) => b.rate - a.rate);

    return {
      totalThisMonth,
      completedThisMonth,
      completionRate,
      hours,
      minutes,
      dailyTrend,
      weeklyBreakdown,
      bestWeek,
      pillarPerformance,
    };
  }, [ranges, pillars, logs, dayPlans]);

  // ALL TIME VIEW DATA
  const allTimeData = useMemo(() => {
    const allTasks = getTasksInRange(ranges.allTime.start, ranges.allTime.end);
    const allCompleted = getCompletedTasksInRange(ranges.allTime.start, ranges.allTime.end);

    const totalTasks = allCompleted.length;
    
    // Account age
    const accountAge = logs.length > 0
      ? differenceInDays(new Date(), parseISO(logs[0].date))
      : 0;

    // Best streak calculation
    let maxStreak = 0;
    let currentStreak = 1;
    const allDates = [...new Set(logs.map(log => log.date))].sort();
    
    for (let i = 1; i < allDates.length; i++) {
      const diff = differenceInDays(parseISO(allDates[i]), parseISO(allDates[i - 1]));
      if (diff === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    // Favorite pillar
    const pillarCounts = pillars.map(pillar => {
      const count = allCompleted.filter(log => log.pillarId === pillar.id).length;
      const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
      return {
        pillar: pillar.name,
        count,
        percentage: Math.round(percentage),
        color: pillar.color,
      };
    }).sort((a, b) => b.count - a.count);

    const favoritePillar = pillarCounts[0];

    // Pillar distribution
    const pillarDist = pillarCounts.filter(p => p.count > 0);

    // Milestones
    const milestones = [];
    if (totalTasks >= 100) milestones.push({ icon: '🎯', text: `${totalTasks} tasks completed` });
    if (maxStreak >= 7) milestones.push({ icon: '🔥', text: `${maxStreak}-day best streak` });
    if (accountAge >= 30) milestones.push({ icon: '📅', text: `${accountAge} days using Balance` });

    // Monthly historical trend
    const monthlyTrend: { month: string; rate: number; completed: number }[] = [];
    const monthsToShow = Math.min(6, Math.ceil(accountAge / 30));
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthStart = subDays(startOfMonth(new Date()), i * 30);
      const monthEnd = i === 0 ? new Date() : subDays(monthStart, -30);
      
      const monthTasks = getTasksInRange(monthStart, monthEnd);
      const monthCompleted = getCompletedTasksInRange(monthStart, monthEnd);
      const rate = monthTasks.length > 0 ? (monthCompleted.length / monthTasks.length) * 100 : 0;

      if (monthTasks.length > 0) {
        monthlyTrend.push({
          month: format(monthStart, 'MMM'),
          rate: Math.round(rate),
          completed: monthCompleted.length,
        });
      }
    }

    return {
      totalTasks,
      accountAge,
      maxStreak,
      favoritePillar,
      pillarDist,
      milestones,
      monthlyTrend,
    };
  }, [ranges, pillars, logs, dayPlans]);

  // Color mappings
  const RATING_COLORS = {
    'W-Done': 'hsl(142, 76%, 36%)',
    'Good': 'hsl(45, 100%, 60%)',
    'Bad': 'hsl(0, 100%, 67%)',
    'L-Skip': 'hsl(220, 9%, 48%)',
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--md-sys-color-background))]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[hsl(var(--md-sys-color-background))]/95 backdrop-blur-sm border-b border-[hsl(var(--md-sys-color-outline-variant))]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-[hsl(var(--md-sys-color-on-surface-variant))] hover:text-[hsl(var(--md-sys-color-on-surface))]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="headline-medium text-[hsl(var(--md-sys-color-on-surface))]">Analytics</h1>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
          {/* Time Period Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as TimePeriod)} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="daily">Today</TabsTrigger>
                <TabsTrigger value="weekly">Week</TabsTrigger>
                <TabsTrigger value="monthly">Month</TabsTrigger>
                <TabsTrigger value="all-time">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* DAILY VIEW */}
          {selectedPeriod === 'daily' && (
            <>
              {dailyData.totalToday === 0 ? (
                <Card className="surface-container p-12">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">📅</div>
                    <h3 className="headline-small text-[hsl(var(--md-sys-color-on-surface))]">No tasks scheduled today</h3>
                    <p className="body-large text-[hsl(var(--md-sys-color-on-surface-variant))] max-w-md mx-auto">
                      Head to the Plan tab to add tasks for today.
                    </p>
                    <Button onClick={() => navigate('/plan')} className="mt-4">
                      <Target className="w-4 h-4 mr-2" />
                      Plan Your Day
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Today's Metrics */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="surface-container p-6">
                      <h2 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Today's Balance</h2>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--health))]/20 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--health))]" />
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {dailyData.completedToday}/{dailyData.totalToday}
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Tasks ({dailyData.completionRate.toFixed(0)}%)
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--relationships))]/20 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-[hsl(var(--relationships))]" />
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {dailyData.hours}h {dailyData.minutes}m
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Time Invested
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--work))]/20 rounded-full flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-[hsl(var(--work))]" />
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {dailyData.avgRating >= 4.5 ? '🔥' : dailyData.avgRating >= 3.5 ? '😊' : dailyData.avgRating >= 2 ? '😐' : '💔'}
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Today's Rating
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Today's Pillar Distribution */}
                  {dailyData.pillarDist.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Card className="surface-container p-6">
                        <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Today's Pillar Distribution</h3>
                        <div className="h-64 mb-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={dailyData.pillarDist}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="count"
                              >
                                {dailyData.pillarDist.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--md-sys-color-surface-container))',
                                  border: '1px solid hsl(var(--md-sys-color-outline-variant))',
                                  borderRadius: '8px',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2">
                          {dailyData.pillarDist.map(p => (
                            <div key={p.pillar} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="body-medium text-[hsl(var(--md-sys-color-on-surface))]">{p.pillar}</span>
                              </div>
                              <span className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                                {p.count} {p.count === 1 ? 'task' : 'tasks'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Task Breakdown */}
                  {dailyData.completedToday > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Card className="surface-container p-6">
                        <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">How did your tasks go today?</h3>
                        <div className="space-y-4">
                          {dailyData.ratings.win > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-md flex items-center justify-center">
                                  <span className="text-sm font-bold text-green-600">W</span>
                                </div>
                                <span className="body-medium text-[hsl(var(--md-sys-color-on-surface))]">W-Done</span>
                              </div>
                              <span className="body-large font-semibold text-[hsl(var(--md-sys-color-on-surface))]">
                                {dailyData.ratings.win}
                              </span>
                            </div>
                          )}
                          {dailyData.ratings.good > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-yellow-500/20 rounded-md flex items-center justify-center">
                                  <span className="text-sm font-bold text-yellow-600">G</span>
                                </div>
                                <span className="body-medium text-[hsl(var(--md-sys-color-on-surface))]">Good</span>
                              </div>
                              <span className="body-large font-semibold text-[hsl(var(--md-sys-color-on-surface))]">
                                {dailyData.ratings.good}
                              </span>
                            </div>
                          )}
                          {dailyData.ratings.bad > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-500/20 rounded-md flex items-center justify-center">
                                  <span className="text-sm font-bold text-red-600">B</span>
                                </div>
                                <span className="body-medium text-[hsl(var(--md-sys-color-on-surface))]">Bad</span>
                              </div>
                              <span className="body-large font-semibold text-[hsl(var(--md-sys-color-on-surface))]">
                                {dailyData.ratings.bad}
                              </span>
                            </div>
                          )}
                          {dailyData.ratings.skip > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-500/20 rounded-md flex items-center justify-center">
                                  <span className="text-sm font-bold text-gray-600">L</span>
                                </div>
                                <span className="body-medium text-[hsl(var(--md-sys-color-on-surface))]">L-Skip</span>
                              </div>
                              <span className="body-large font-semibold text-[hsl(var(--md-sys-color-on-surface))]">
                                {dailyData.ratings.skip}
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Comparison to Yesterday */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="surface-container p-6">
                      <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Compared to Yesterday</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">Tasks Completed</span>
                          <div className="flex items-center space-x-2">
                            {dailyData.taskDiff > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : dailyData.taskDiff < 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-500" />
                            )}
                            <span className={`body-large font-semibold ${
                              dailyData.taskDiff > 0 ? 'text-green-500' : dailyData.taskDiff < 0 ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {dailyData.taskDiff > 0 ? '+' : ''}{dailyData.taskDiff}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">Completion Rate</span>
                          <div className="flex items-center space-x-2">
                            {dailyData.rateDiff > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : dailyData.rateDiff < 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="body-large font-semibold text-[hsl(var(--md-sys-color-on-surface))]">
                              {dailyData.completionRate.toFixed(0)}% vs {dailyData.yesterdayRate.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </>
              )}
            </>
          )}

          {/* WEEKLY VIEW */}
          {selectedPeriod === 'weekly' && (
            <>
              {weeklyData.totalThisWeek === 0 ? (
                <Card className="surface-container p-12">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">📅</div>
                    <h3 className="headline-small text-[hsl(var(--md-sys-color-on-surface))]">No tasks this week</h3>
                    <p className="body-large text-[hsl(var(--md-sys-color-on-surface-variant))] max-w-md mx-auto">
                      Start planning your week to see analytics here.
                    </p>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Weekly Metrics */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="surface-container p-6">
                      <h2 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">This Week's Overview</h2>
                      <p className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))] mb-4">
                        {format(ranges.thisWeek.start, 'MMM d')} - {format(new Date(), 'MMM d')}
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--health))]/20 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--health))]" />
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {weeklyData.completedThisWeek}/{weeklyData.totalThisWeek}
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Weekly ({weeklyData.completionRate.toFixed(0)}%)
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--work))]/20 rounded-full flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-[hsl(var(--work))]" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {weeklyData.mostProductiveDay.day}
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Most Productive
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--relationships))]/20 rounded-full flex items-center justify-center">
                              <Flame className="w-5 h-5 text-[hsl(var(--relationships))]" />
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {weeklyData.streak}
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Day Streak
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Daily Trend Chart */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="surface-container p-6">
                      <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Daily Completion Trend</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyData.dailyBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-sys-color-outline-variant))" />
                            <XAxis
                              dataKey="day"
                              stroke="hsl(var(--md-sys-color-on-surface-variant))"
                              tick={{ fill: 'hsl(var(--md-sys-color-on-surface-variant))' }}
                            />
                            <YAxis
                              stroke="hsl(var(--md-sys-color-on-surface-variant))"
                              tick={{ fill: 'hsl(var(--md-sys-color-on-surface-variant))' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--md-sys-color-surface-container))',
                                border: '1px solid hsl(var(--md-sys-color-outline-variant))',
                                borderRadius: '8px',
                              }}
                            />
                            <Bar dataKey="completed" fill="hsl(var(--health))" radius={[8, 8, 0, 0]} name="Completed" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Weekly Pillar Distribution */}
                  {weeklyData.pillarDist.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Card className="surface-container p-6">
                        <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Weekly Pillar Analysis</h3>
                        <div className="h-64 mb-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={weeklyData.pillarDist}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="count"
                              >
                                {weeklyData.pillarDist.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--md-sys-color-surface-container))',
                                  border: '1px solid hsl(var(--md-sys-color-outline-variant))',
                                  borderRadius: '8px',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {weeklyData.pillarDist.slice(0, 1).map(p => (
                            <div key={p.pillar} className="surface-container-high rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <Trophy className="w-4 h-4 text-[hsl(var(--work))]" />
                                <span className="body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">Top Pillar</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="body-large font-semibold text-[hsl(var(--md-sys-color-on-surface))]">{p.pillar}</span>
                              </div>
                              <span className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">{p.count} tasks</span>
                            </div>
                          ))}
                          {weeklyData.pillarDist.length > 1 && weeklyData.pillarDist.slice(-1).map(p => (
                            <div key={p.pillar} className="surface-container-high rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-[hsl(var(--md-sys-color-error))]" />
                                <span className="body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">Needs Focus</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="body-large font-semibold text-[hsl(var(--md-sys-color-on-surface))]">{p.pillar}</span>
                              </div>
                              <span className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">{p.count} tasks</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Weekly Insights */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="surface-container p-6">
                      <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Weekly Insights</h3>
                      <div className="space-y-3">
                        {weeklyData.isWeekdayProductive && (
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                              <Target className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                              You're most productive on weekdays
                            </p>
                          </div>
                        )}
                        {weeklyData.improvement > 10 && (
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                              Great improvement from last week (+{weeklyData.improvement.toFixed(0)}%)
                            </p>
                          </div>
                        )}
                        {weeklyData.streak >= 3 && (
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-orange-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                              <Flame className="w-4 h-4 text-orange-600" />
                            </div>
                            <p className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                              Awesome {weeklyData.streak}-day streak! Keep it up!
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                </>
              )}
            </>
          )}

          {/* MONTHLY VIEW */}
          {selectedPeriod === 'monthly' && (
            <>
              {monthlyData.totalThisMonth === 0 ? (
                <Card className="surface-container p-12">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">📅</div>
                    <h3 className="headline-small text-[hsl(var(--md-sys-color-on-surface))]">No tasks this month</h3>
                    <p className="body-large text-[hsl(var(--md-sys-color-on-surface-variant))] max-w-md mx-auto">
                      Start adding tasks to see monthly analytics.
                    </p>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Monthly Metrics */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="surface-container p-6">
                      <h2 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">This Month</h2>
                      <p className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))] mb-4">
                        {format(ranges.thisMonth.start, 'MMMM yyyy')}
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--health))]/20 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--health))]" />
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {monthlyData.completedThisMonth}/{monthlyData.totalThisMonth}
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Monthly ({monthlyData.completionRate.toFixed(0)}%)
                          </div>
                        </div>

                        {monthlyData.bestWeek && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-10 h-10 bg-[hsl(var(--work))]/20 rounded-full flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-[hsl(var(--work))]" />
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                              {monthlyData.bestWeek.week}
                            </div>
                            <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                              Best Week ({monthlyData.bestWeek.rate}%)
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--relationships))]/20 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-[hsl(var(--relationships))]" />
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {monthlyData.hours}h {monthlyData.minutes}m
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Total Time
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Monthly Trend Chart */}
                  {monthlyData.dailyTrend.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Card className="surface-container p-6">
                        <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">30-Day Trend</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData.dailyTrend}>
                              <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--health))" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="hsl(var(--health))" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-sys-color-outline-variant))" />
                              <XAxis
                                dataKey="date"
                                stroke="hsl(var(--md-sys-color-on-surface-variant))"
                                tick={{ fill: 'hsl(var(--md-sys-color-on-surface-variant))', fontSize: 10 }}
                              />
                              <YAxis
                                stroke="hsl(var(--md-sys-color-on-surface-variant))"
                                tick={{ fill: 'hsl(var(--md-sys-color-on-surface-variant))' }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--md-sys-color-surface-container))',
                                  border: '1px solid hsl(var(--md-sys-color-outline-variant))',
                                  borderRadius: '8px',
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="rate"
                                stroke="hsl(var(--health))"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRate)"
                                name="Completion %"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Pillar Performance */}
                  {monthlyData.pillarPerformance.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Card className="surface-container p-6">
                        <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Pillar Performance</h3>
                        <div className="space-y-4">
                          {monthlyData.pillarPerformance.map((pillar) => (
                            <div key={pillar.pillar} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: pillar.color }}
                                  />
                                  <span className="title-medium text-[hsl(var(--md-sys-color-on-surface))]">
                                    {pillar.pillar}
                                  </span>
                                </div>
                                <span className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                                  {pillar.completed}/{pillar.total} ({pillar.rate}%)
                                </span>
                              </div>
                              <Progress
                                value={pillar.rate}
                                className="h-2"
                                style={{
                                  // @ts-ignore
                                  '--progress-background': pillar.color,
                                } as React.CSSProperties}
                              />
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Week-by-Week Breakdown */}
                  {monthlyData.weeklyBreakdown.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <Card className="surface-container p-6">
                        <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Week-by-Week</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {monthlyData.weeklyBreakdown.map((week) => (
                            <div key={week.week} className="surface-container-high rounded-lg p-4 space-y-2">
                              <h4 className="title-small text-[hsl(var(--md-sys-color-on-surface))]">{week.week}</h4>
                              <div className="text-2xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                                {week.rate}%
                              </div>
                              <p className="body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                                {week.completed}/{week.total} tasks
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </>
              )}
            </>
          )}

          {/* ALL TIME VIEW */}
          {selectedPeriod === 'all-time' && (
            <>
              {allTimeData.totalTasks === 0 ? (
                <Card className="surface-container p-12">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🎯</div>
                    <h3 className="headline-small text-[hsl(var(--md-sys-color-on-surface))]">Start Your Journey</h3>
                    <p className="body-large text-[hsl(var(--md-sys-color-on-surface-variant))] max-w-md mx-auto">
                      Complete tasks to build your analytics history and track your progress over time.
                    </p>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Lifetime Metrics */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="surface-container p-6">
                      <h2 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-6">Your Journey So Far</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--health))]/20 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--health))]" />
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {allTimeData.totalTasks}
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Tasks Completed
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--relationships))]/20 rounded-full flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-[hsl(var(--relationships))]" />
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {allTimeData.accountAge}
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Days Active
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-[hsl(var(--work))]/20 rounded-full flex items-center justify-center">
                              <Flame className="w-5 h-5 text-[hsl(var(--work))]" />
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {allTimeData.maxStreak}
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Best Streak
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-purple-500" />
                            </div>
                          </div>
                          <div className="text-xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                            {allTimeData.favoritePillar.pillar}
                          </div>
                          <div className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                            Favorite ({allTimeData.favoritePillar.percentage}%)
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Lifetime Pillar Distribution */}
                  {allTimeData.pillarDist.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Card className="surface-container p-6">
                        <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Lifetime Pillar Distribution</h3>
                        <div className="h-64 mb-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={allTimeData.pillarDist}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="count"
                                label={(entry) => `${entry.percentage}%`}
                              >
                                {allTimeData.pillarDist.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--md-sys-color-surface-container))',
                                  border: '1px solid hsl(var(--md-sys-color-outline-variant))',
                                  borderRadius: '8px',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2">
                          {allTimeData.pillarDist.map(p => (
                            <div key={p.pillar} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="body-medium text-[hsl(var(--md-sys-color-on-surface))]">{p.pillar}</span>
                              </div>
                              <span className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                                {p.count} tasks ({p.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Milestones */}
                  {allTimeData.milestones.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Card className="surface-container p-6">
                        <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Milestones</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {allTimeData.milestones.map((milestone, i) => (
                            <div key={i} className="surface-container-high rounded-lg p-4 space-y-2">
                              <div className="text-3xl">{milestone.icon}</div>
                              <p className="body-medium text-[hsl(var(--md-sys-color-on-surface))]">{milestone.text}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* Historical Trend */}
                  {allTimeData.monthlyTrend.length > 1 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <Card className="surface-container p-6">
                        <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Historical Performance</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={allTimeData.monthlyTrend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-sys-color-outline-variant))" />
                              <XAxis
                                dataKey="month"
                                stroke="hsl(var(--md-sys-color-on-surface-variant))"
                                tick={{ fill: 'hsl(var(--md-sys-color-on-surface-variant))' }}
                              />
                              <YAxis
                                stroke="hsl(var(--md-sys-color-on-surface-variant))"
                                tick={{ fill: 'hsl(var(--md-sys-color-on-surface-variant))' }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--md-sys-color-surface-container))',
                                  border: '1px solid hsl(var(--md-sys-color-outline-variant))',
                                  borderRadius: '8px',
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="rate"
                                stroke="hsl(var(--health))"
                                strokeWidth={3}
                                dot={{ fill: 'hsl(var(--health))', r: 5 }}
                                name="Completion %"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
