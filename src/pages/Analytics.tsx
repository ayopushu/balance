/**
 * Analytics Screen - Comprehensive balance analytics with insights
 * Shows progress analytics across different time periods with working charts
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Trophy, AlertCircle, Target, CheckCircle2, Clock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useBalanceStore } from '@/store';
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
  Legend,
} from 'recharts';
import { format, startOfDay, startOfWeek, startOfMonth, subDays, isWithinInterval, parseISO } from 'date-fns';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { pillars, dayPlans, logs } = useBalanceStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('daily');

  // Calculate date range based on selected period
  const dateRange = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    
    switch (selectedPeriod) {
      case 'daily':
        return { start: today, end: now };
      case 'weekly':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: now };
      case 'monthly':
        return { start: startOfMonth(now), end: now };
      case 'all-time':
        return { start: new Date(0), end: now };
    }
  }, [selectedPeriod]);

  // Calculate comprehensive analytics data
  const analyticsData = useMemo(() => {
    const filteredLogs = logs.filter(log => {
      const logDate = parseISO(log.date);
      return isWithinInterval(logDate, dateRange);
    });

    const filteredDayPlans = Object.entries(dayPlans).filter(([date]) => {
      const planDate = parseISO(date);
      return isWithinInterval(planDate, dateRange);
    });

    // Calculate basic metrics
    const totalTasks = filteredDayPlans.reduce((sum, [, plan]) => sum + plan.items.length, 0);
    const completedTasks = filteredLogs.length;
    const totalMinutes = filteredLogs.reduce((sum, log) => sum + (log.minutes || 0), 0);

    // Calculate tasks by rating (rating stored as numbers: win=5, good=4, bad=2, skip=0)
    const tasksByRating = {
      'W-Done': filteredLogs.filter(log => log.rating === 5).length,
      'Good': filteredLogs.filter(log => log.rating === 4).length,
      'Bad': filteredLogs.filter(log => log.rating === 2).length,
      'L-Skip': filteredLogs.filter(log => log.rating === 0).length,
    };

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate active streak (consecutive days with at least one completed task)
    const uniqueDates = [...new Set(filteredLogs.map(log => log.date))].sort().reverse();
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (uniqueDates.includes(today) || (uniqueDates.length > 0 && uniqueDates[0] === format(subDays(new Date(), 1), 'yyyy-MM-dd'))) {
      let currentDate = new Date();
      for (let i = 0; i < 365; i++) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        if (uniqueDates.includes(dateStr)) {
          streak++;
          currentDate = subDays(currentDate, 1);
        } else {
          break;
        }
      }
    }

    // Calculate pillar stats
    const pillarStats = pillars.map(pillar => {
      const pillarLogs = filteredLogs.filter(log => log.pillarId === pillar.id);
      const pillarTasks = filteredDayPlans.reduce((sum, [, plan]) => {
        return sum + plan.items.filter(item => item.pillarId === pillar.id).length;
      }, 0);
      
      const completed = pillarLogs.length;
      const percentage = pillarTasks > 0 ? (completed / pillarTasks) * 100 : 0;
      const minutes = pillarLogs.reduce((sum, log) => sum + (log.minutes || 0), 0);

      return {
        id: pillar.id,
        name: pillar.name,
        color: pillar.color,
        completed,
        total: pillarTasks,
        percentage,
        minutes,
      };
    });

    // Calculate trend data for chart (last 7/30 days)
    const days = selectedPeriod === 'weekly' ? 7 : selectedPeriod === 'monthly' ? 30 : 7;
    const trendData = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLogs = logs.filter(log => log.date === dateStr);
      const dayPlanForDate = Object.entries(dayPlans).find(([d]) => d === dateStr);
      const dayTotal = dayPlanForDate ? dayPlanForDate[1].items.length : 0;
      const dayCompleted = dayLogs.length;
      const rate = dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0;

      return {
        date: format(date, selectedPeriod === 'monthly' ? 'MMM d' : 'EEE'),
        rate: Math.round(rate),
        completed: dayCompleted,
      };
    });

    return {
      totalTasks,
      completedTasks,
      totalMinutes,
      completionRate,
      streak,
      tasksByRating,
      pillarStats,
      trendData,
    };
  }, [pillars, dayPlans, logs, dateRange, selectedPeriod]);

  // Prepare data for charts
  const pillarChartData = analyticsData.pillarStats
    .filter(p => p.completed > 0)
    .map(p => ({
      name: p.name,
      value: p.completed,
      color: p.color,
    }));

  const ratingChartData = Object.entries(analyticsData.tasksByRating)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  // Calculate insights
  const bestPillar = analyticsData.pillarStats.reduce((best, current) => 
    current.percentage > best.percentage ? current : best
  , analyticsData.pillarStats[0]);

  const needsAttention = analyticsData.pillarStats
    .filter(p => p.total > 0)
    .reduce((worst, current) => 
      current.percentage < worst.percentage ? current : worst
    , analyticsData.pillarStats.find(p => p.total > 0) || analyticsData.pillarStats[0]);

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

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="surface-container p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[hsl(var(--health))]/20 rounded-md flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[hsl(var(--health))]" />
                    </div>
                    <div className="title-small text-[hsl(var(--md-sys-color-on-surface-variant))]">Tasks</div>
                  </div>
                  <div className="text-2xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                    {analyticsData.completedTasks}/{analyticsData.totalTasks}
                  </div>
                  <div className="body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                    {analyticsData.completionRate.toFixed(0)}% complete
                  </div>
                </div>
              </Card>

              <Card className="surface-container p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[hsl(var(--health))]/20 rounded-md flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-[hsl(var(--work))]" />
                    </div>
                    <div className="title-small text-[hsl(var(--md-sys-color-on-surface-variant))]">W-Done</div>
                  </div>
                  <div className="text-2xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                    {analyticsData.tasksByRating['W-Done']}
                  </div>
                  <div className="body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                    {analyticsData.tasksByRating['Good']} Good, {analyticsData.tasksByRating['Bad']} Bad
                  </div>
                </div>
              </Card>

              <Card className="surface-container p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[hsl(var(--relationships))]/20 rounded-md flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[hsl(var(--relationships))]" />
                    </div>
                    <div className="title-small text-[hsl(var(--md-sys-color-on-surface-variant))]">Time</div>
                  </div>
                  <div className="text-2xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                    {Math.floor(analyticsData.totalMinutes / 60)}h {analyticsData.totalMinutes % 60}m
                  </div>
                  <div className="body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                    {analyticsData.completedTasks > 0 ? Math.round(analyticsData.totalMinutes / analyticsData.completedTasks) : 0} min/task
                  </div>
                </div>
              </Card>

              <Card className="surface-container p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[hsl(var(--work))]/20 rounded-md flex items-center justify-center">
                      <Flame className="w-4 h-4 text-[hsl(var(--work))]" />
                    </div>
                    <div className="title-small text-[hsl(var(--md-sys-color-on-surface-variant))]">Streak</div>
                  </div>
                  <div className="text-2xl font-bold text-[hsl(var(--md-sys-color-on-surface))]">
                    {analyticsData.streak}
                  </div>
                  <div className="body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                    {analyticsData.streak === 0 ? 'Start today!' : analyticsData.streak === 1 ? 'day streak' : 'days streak'}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Pillar Balance Donut Chart */}
          {pillarChartData.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Card className="surface-container p-6">
                <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Pillar Balance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pillarChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pillarChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--md-sys-color-surface-container))',
                          border: '1px solid hsl(var(--md-sys-color-outline-variant))',
                          borderRadius: '8px',
                          color: 'hsl(var(--md-sys-color-on-surface))',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          ) : null}

          {/* Performance Trend Chart */}
          {(selectedPeriod === 'weekly' || selectedPeriod === 'monthly') && analyticsData.trendData.some(d => d.completed > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Card className="surface-container p-6">
                <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Performance Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-sys-color-outline-variant))" />
                      <XAxis
                        dataKey="date"
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
                          color: 'hsl(var(--md-sys-color-on-surface))',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="hsl(var(--health))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--health))' }}
                        name="Completion %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Task Ratings Distribution */}
          {ratingChartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Card className="surface-container p-6">
                <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Task Ratings</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--md-sys-color-outline-variant))" />
                      <XAxis
                        type="number"
                        stroke="hsl(var(--md-sys-color-on-surface-variant))"
                        tick={{ fill: 'hsl(var(--md-sys-color-on-surface-variant))' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="hsl(var(--md-sys-color-on-surface-variant))"
                        tick={{ fill: 'hsl(var(--md-sys-color-on-surface-variant))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--md-sys-color-surface-container))',
                          border: '1px solid hsl(var(--md-sys-color-outline-variant))',
                          borderRadius: '8px',
                          color: 'hsl(var(--md-sys-color-on-surface))',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {ratingChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={RATING_COLORS[entry.name as keyof typeof RATING_COLORS]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Enhanced Pillar Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Card className="surface-container p-6">
              <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Pillar Progress</h3>
              <div className="space-y-4">
                {analyticsData.pillarStats.map((pillar) => (
                  <div key={pillar.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: pillar.color }}
                        />
                        <span className="title-medium text-[hsl(var(--md-sys-color-on-surface))]">
                          {pillar.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                          {pillar.completed}/{pillar.total}
                        </span>
                        <span className="body-small text-[hsl(var(--md-sys-color-on-surface-variant))]">
                          ({pillar.percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={pillar.percentage}
                      className="h-2"
                      style={{
                        // @ts-ignore
                        '--progress-background': pillar.color,
                      } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>

              {analyticsData.pillarStats.every(p => p.total === 0) && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <h4 className="title-large text-[hsl(var(--md-sys-color-on-surface-variant))] mb-2">No Data Yet</h4>
                  <p className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                    Start completing tasks to see your pillar progress breakdown
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Insights & Highlights */}
          {analyticsData.completedTasks > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Card className="surface-container p-6">
                <h3 className="title-large text-[hsl(var(--md-sys-color-on-surface))] mb-4">Insights</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Best Performing Pillar */}
                  {bestPillar && bestPillar.total > 0 && (
                    <div className="surface-container-high rounded-lg p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-[hsl(var(--work))]" />
                        <h4 className="title-medium text-[hsl(var(--md-sys-color-on-surface))]">Best Performing</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bestPillar.color }}
                        />
                        <span className="body-large text-[hsl(var(--md-sys-color-on-surface))]">
                          {bestPillar.name}
                        </span>
                      </div>
                      <p className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                        {bestPillar.percentage.toFixed(0)}% completion rate
                      </p>
                    </div>
                  )}

                  {/* Needs Attention */}
                  {needsAttention && needsAttention.total > 0 && needsAttention.percentage < 100 && (
                    <div className="surface-container-high rounded-lg p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-[hsl(var(--md-sys-color-error))]" />
                        <h4 className="title-medium text-[hsl(var(--md-sys-color-on-surface))]">Needs Attention</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: needsAttention.color }}
                        />
                        <span className="body-large text-[hsl(var(--md-sys-color-on-surface))]">
                          {needsAttention.name}
                        </span>
                      </div>
                      <p className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                        {needsAttention.percentage.toFixed(0)}% completion rate
                      </p>
                    </div>
                  )}

                  {/* Motivational Message */}
                  {analyticsData.streak > 0 && (
                    <div className="surface-container-high rounded-lg p-4 space-y-2 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Flame className="w-5 h-5 text-[hsl(var(--work))]" />
                        <h4 className="title-medium text-[hsl(var(--md-sys-color-on-surface))]">Keep It Up!</h4>
                      </div>
                      <p className="body-medium text-[hsl(var(--md-sys-color-on-surface-variant))]">
                        {analyticsData.streak === 1
                          ? "You've started a streak! Complete tasks today to keep it going."
                          : analyticsData.streak < 7
                          ? `You're on a ${analyticsData.streak}-day streak! Keep the momentum going.`
                          : analyticsData.streak < 30
                          ? `Amazing! ${analyticsData.streak} days of consistency. You're building strong habits!`
                          : `Incredible! ${analyticsData.streak} days and counting. You're a Balance champion!`}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {analyticsData.completedTasks === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Card className="surface-container p-12">
                <div className="text-center space-y-4">
                  <div className="text-6xl">📊</div>
                  <h3 className="headline-small text-[hsl(var(--md-sys-color-on-surface))]">
                    {selectedPeriod === 'daily'
                      ? 'No tasks completed today yet'
                      : selectedPeriod === 'weekly'
                      ? 'No tasks completed this week yet'
                      : selectedPeriod === 'monthly'
                      ? 'No tasks completed this month yet'
                      : 'No tasks completed yet'}
                  </h3>
                  <p className="body-large text-[hsl(var(--md-sys-color-on-surface-variant))] max-w-md mx-auto">
                    Complete some tasks to see your analytics and track your progress across life pillars.
                  </p>
                  <Button
                    onClick={() => navigate('/')}
                    className="mt-4"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Go to Balance
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};